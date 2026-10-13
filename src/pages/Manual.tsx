import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Compass,
  Search, 
  Printer, 
  ArrowRight, 
  CheckCircle2, 
  ShoppingCart, 
  ClipboardCheck, 
  Package, 
  FileText, 
  Store, 
  BarChart3, 
  Users, 
  Settings, 
  QrCode, 
  Barcode,
  Camera, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  ArrowDownUp, 
  CheckSquare, 
  ShieldCheck, 
  HelpCircle, 
  Layers, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Maximize2,
  FileCheck,
  RefreshCw,
  Plus,
  Eye,
  X,
  UploadCloud,
  Cloud,
  BellRing,
  FileCode,
  History,
  FolderKanban,
  FileStack,
  Bookmark,
  Bot,
  Wrench
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { StandardManualDocument } from '../components/StandardManualDocument';
import { printA4Document } from '../lib/pdf';
import { useProcurement } from '../contexts/ProcurementContext';

interface ButtonGuideItem {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  location: string;
  action: string;
  linkage: string;
}

interface ModuleSection {
  id: string;
  partId: 'part-1' | 'part-2' | 'part-3' | 'part-4' | 'part-5' | 'part-6';
  partNumber: number;
  partTitleTh: string;
  partTitleEn: string;
  title: string;
  titleEn: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  role: string;
  summary: string;
  summaryEn: string;
  route: string;
  linkages: {
    from: string;
    to: string;
    description: string;
  }[];
  statuses?: {
    status: string;
    color: string;
    desc: string;
  }[];
  buttons: ButtonGuideItem[];
  tips: string[];
}

export interface ManualPartConfig {
  id: string;
  partNumber: number;
  titleTh: string;
  titleEn: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badgeClass: string;
  summaryTh: string;
  summaryEn: string;
  moduleCount: number;
}

export const MANUAL_PARTS: ManualPartConfig[] = [
  {
    id: 'part-1',
    partNumber: 1,
    titleTh: 'ส่วนที่ 1: ภาพรวมระบบและผังเชื่อมโยงทั้งวงจร',
    titleEn: 'Part 1: Architecture & Lifecycle Flow',
    icon: Layers,
    color: 'bg-black text-white',
    badgeClass: 'bg-zinc-100 text-black border-zinc-300',
    summaryTh: 'สถาปัตยกรรมระบบ ผังเชื่อมโยงข้อมูล 7 ขั้นตอน และมาตรฐานการควบคุมต้นทุนโครงการ',
    summaryEn: 'Core architecture, 7-step lifecycle map, and project cost governance',
    moduleCount: 1
  },
  {
    id: 'part-2',
    partNumber: 2,
    titleTh: 'ส่วนที่ 2: งานจัดซื้อและการพิจารณาอนุมัติ',
    titleEn: 'Part 2: Procurement & Approval Pipeline',
    icon: ShoppingCart,
    color: 'bg-black text-white',
    badgeClass: 'bg-zinc-100 text-black border-zinc-300',
    summaryTh: 'การเปิดใบขอซื้อ (PR), ตรวจสอบงบประมาณ BOQ, สายการอนุมัติ 3 ระดับ และการออกใบสั่งซื้อ (PO)',
    summaryEn: 'Purchase requests, BOQ verification, multi-tier approvals, and PO generation',
    moduleCount: 3
  },
  {
    id: 'part-3',
    partNumber: 3,
    titleTh: 'ส่วนที่ 3: คลังพัสดุก่อสร้างกลางและการตรวจรับ',
    titleEn: 'Part 3: Inventory Control & Suppliers',
    icon: Package,
    color: 'bg-black text-white',
    badgeClass: 'bg-zinc-100 text-black border-zinc-300',
    summaryTh: 'ตรวจรับสินค้าหน้างาน (GR), คลังพัสดุก่อสร้างกลาง (Hub), Master SKU Barcode, กล้องสแกนสด และทะเบียนคู่ค้า',
    summaryEn: 'Goods receiving, Central Material Hub, Master SKU barcode scanning, and vendor rating',
    moduleCount: 2
  },
  {
    id: 'part-4',
    partNumber: 4,
    titleTh: 'ส่วนที่ 4: ศูนย์ข้อมูลและการเชื่อมต่อคลาวด์',
    titleEn: 'Part 4: Smart Data Hub & Cloud Integrations',
    icon: UploadCloud,
    color: 'bg-black text-white',
    badgeClass: 'bg-zinc-100 text-black border-zinc-300',
    summaryTh: 'นำเข้าไฟล์ Excel, CSV, CAD DXF พร้อมระบบซิงก์ Google Sheets, Cloud Storage และแจ้งเตือน LINE Notify',
    summaryEn: 'Bulk import of Excel, CSV, CAD DXF with Google Sheets sync and automated LINE alerts',
    moduleCount: 2
  },
  {
    id: 'part-5',
    partNumber: 5,
    titleTh: 'ส่วนที่ 5: การบริหารสิทธิ์, การตั้งค่าและรายงาน',
    titleEn: 'Part 5: Administration, Settings & Reports',
    icon: ShieldCheck,
    color: 'bg-black text-white',
    badgeClass: 'bg-zinc-100 text-black border-zinc-300',
    summaryTh: 'โครงสร้างสิทธิ์ RBAC 25 สิทธิ์, บันทึกการตรวจสอบ (Audit Log), ติดตั้งแอป PWA และรายงานวิเคราะห์งบประมาณ',
    summaryEn: 'RBAC 25 permission keys, audit trail logging, PWA settings, and executive cost analytics',
    moduleCount: 3
  },
  {
    id: 'part-6',
    partNumber: 6,
    titleTh: 'ส่วนที่ 6: AI ผู้ช่วยและศูนย์ซ่อมแซมระบบตนเอง',
    titleEn: 'Part 6: AI Copilot & 1-Click Auto-Repair',
    icon: Bot,
    color: 'bg-black text-white',
    badgeClass: 'bg-zinc-100 text-black border-zinc-300',
    summaryTh: 'AI Copilot 24 ชม., การตรวจเช็คฮาร์ดแวร์ 5 จุด, แก้ปัญหากล้องและแคชค้าง 1-Click โดยไม่ต้องพึ่งพาแอดมิน',
    summaryEn: '24/7 AI Copilot troubleshooting, 5-point hardware diagnostics, and 1-click self-healing repair without waiting for IT admin',
    moduleCount: 1
  }
];

export function ManualPage() {
  const { isEnglish, isThai } = useLanguage();
  const { companyProfile } = useProcurement();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPart, setSelectedPart] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'interactive' | 'official-document'>('interactive');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'flow-overview': true,
    'pr': true,
    'approvals': true
  });

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    modules.forEach(m => { all[m.id] = true; });
    setExpandedModules(all);
  };

  const collapseAll = () => {
    setExpandedModules({});
  };

  const handlePrint = (docId = 'standard-manual-doc') => {
    const rawName = companyProfile?.nameTh || companyProfile?.nameEn || 'Conerage_store';
    const cleanName = rawName.replace(/[\s\(\)\/]+/g, '_');
    printA4Document(docId, `${cleanName}_คู่มือมาตรฐานการปฏิบัติงาน_SOP`);
  };

  const modules: ModuleSection[] = [
    {
      id: 'flow-overview',
      partId: 'part-1',
      partNumber: 1,
      partTitleTh: 'ส่วนที่ 1: ภาพรวมระบบและวงจรการทำงาน',
      partTitleEn: 'Part 1: Architecture & Lifecycle Flow',
      title: 'แผนผังการเชื่อมโยงระบบทั้งวงจร',
      titleEn: 'End-to-End System Workflow Map',
      icon: Layers,
      badge: 'Core Workflow',
      role: 'ผู้ใช้งานทุกบทบาทในองค์กร (All Roles)',
      summary: 'ภาพรวมกระบวนการจัดซื้อและบริหารคลังสินค้าของ Conerage store ตั้งแต่การเปิดคำขอซื้อหน้างาน การอนุมัติ การออกใบสั่งซื้อ การตรวจรับของ จนถึงการจัดการสต็อกและสแกน QR Code',
      summaryEn: 'Complete end-to-end procurement and inventory lifecycle from site requisition to approval, PO issuance, receiving, stock auto-increment, and QR scanning.',
      route: '/',
      linkages: [
        {
          from: '1. ระบบขอซื้อ (PR)',
          to: '2. การอนุมัติ (Approval)',
          description: 'วิศวกรส่งคำขอซื้อ -> ระบบแจ้งเตือนผู้มีอำนาจอนุมัติ (Level 1-3) เข้าตรวจสอบ'
        },
        {
          from: '2. การอนุมัติ (Approval)',
          to: '3. ระบบสั่งซื้อ (PO)',
          description: 'เมื่ออนุมัติผ่าน -> ฝ่ายจัดซื้อกดปุ่ม "สร้าง PO จาก PR ที่อนุมัติแล้ว" ข้อมูลจะถ่ายโอนทันที'
        },
        {
          from: '3. ระบบสั่งซื้อ (PO)',
          to: '4. ตรวจรับสินค้า (Receive)',
          description: 'ส่ง PO ให้ผู้ขาย -> เมื่อสินค้ามาส่งหน้างาน กด "ตรวจรับสินค้า (Receive Goods)"'
        },
        {
          from: '4. ตรวจรับสินค้า (Receive)',
          to: '5. คลังสินค้า (Inventory)',
          description: 'ตรวจรับของสำเร็จ -> ยอดสต็อกในคลังสินค้าจะเพิ่มขึ้นอัตโนมัติ พร้อมบันทึกประวัติ'
        },
        {
          from: '5. คลังสินค้า (Inventory)',
          to: '6. พิมพ์ป้าย & สแกนกล้อง (QR)',
          description: 'พิมพ์ป้าย QR ติดกล่อง/ชั้นวาง -> สแกนด้วยกล้องมือถือเพื่อเบิกจ่ายไปยังไซต์งาน'
        },
        {
          from: '6. คลังสินค้า (Inventory)',
          to: '7. รายงาน (Reports)',
          description: 'ข้อมูลการเคลื่อนไหวทั้งหมดถูกสรุปเข้าแดชบอร์ดและรายงานวิเคราะห์ต้นทุนโครงการ'
        }
      ],
      buttons: [],
      tips: [
        'ข้อมูลในระบบจะเชื่อมต่อกันแบบไร้รอยต่อโดยไม่ต้องคีย์ข้อมูลซ้ำซ้อน เช่น รายการใน PR จะไหลไปยัง PO และคลังสินค้าโดยอัตโนมัติ',
        'สามารถตรวจสอบประวัติย้อนหลัง (Audit Trail) ได้ในทุกขั้นตอนว่าใครเป็นผู้ขอ ผู้อนุมัติ และผู้ตรวจรับสินค้า'
      ]
    },
    {
      id: 'pr',
      partId: 'part-2',
      partNumber: 2,
      partTitleTh: 'ส่วนที่ 2: งานจัดซื้อและการพิจารณาอนุมัติ',
      partTitleEn: 'Part 2: Procurement & Approval Pipeline',
      title: '1. ระบบขอซื้อ (Purchase Requisition - PR)',
      titleEn: '1. Purchase Requisitions (PR)',
      icon: ShoppingCart,
      badge: 'ต้นทางเอกสาร',
      role: 'วิศวกรสนาม (Site Engineer) / ผู้จัดการโครงการ (PM) / เจ้าหน้าที่จัดซื้อ',
      summary: 'ฟังก์ชันจัดทำใบขอซื้อพัสดุและวัสดุก่อสร้าง อ้างอิงตามโครงการและรหัสต้นทุน BOQ รองรับการใช้เทมเพลตมาตรฐานงานก่อสร้างและการดูตัวอย่างเอกสารทางการขนาด A4',
      summaryEn: 'Create and manage purchase requisitions with BOQ category templates and standard A4 document preview.',
      route: '/pr',
      linkages: [
        {
          from: 'สร้าง PR สำเร็จ',
          to: 'หน้าอนุมัติ (Approvals)',
          description: 'เอกสารจะถูกส่งเข้าคิวพิจารณาอนุมัติทันที พร้อมส่งแจ้งเตือนในระบบ'
        },
        {
          from: 'PR ที่ได้รับอนุมัติ',
          to: 'หน้าระบบสั่งซื้อ (PO)',
          description: 'ฝ่ายจัดซื้อสามารถดึง PR นี้ไปออกใบสั่งซื้อ PO ได้ในคลิกเดียว'
        }
      ],
      statuses: [
        { status: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-300', desc: 'แบบร่าง ยังไม่ได้ส่งขออนุมัติ สามารถแก้ไขหรือลบได้' },
        { status: 'Pending Approval', color: 'bg-amber-100 text-amber-800 border-amber-300', desc: 'อยู่ระหว่างรอการพิจารณาอนุมัติจากผู้มีอำนาจ' },
        { status: 'Approved', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', desc: 'อนุมัติเรียบร้อยแล้ว พร้อมนำไปออกใบสั่งซื้อ (PO)' },
        { status: 'Rejected', color: 'bg-red-100 text-red-800 border-red-300', desc: 'ถูกปฏิเสธหรือส่งกลับแก้ไข ผู้ขอสามารถดูเหตุผลและแก้ไขได้' },
        { status: 'PO Created', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', desc: 'ออกใบสั่งซื้อ (PO) เรียบร้อยแล้ว สิ้นสุดกระบวนการขอซื้อ' }
      ],
      buttons: [
        {
          name: '+ สร้างใบขอซื้อใหม่ (Create PR)',
          icon: Plus,
          color: 'bg-indigo-600 text-white',
          location: 'มุมบนขวาของหน้า PR',
          action: 'เปิดหน้าต่างแบบฟอร์มขอซื้อ เลือกโครงการ กำหนดความเร่งด่วน กรอกรายการพัสดุ ราคา และวัตถุประสงค์',
          linkage: 'ส่งข้อมูลเข้าระบบเพื่อรอการอนุมัติ'
        },
        {
          name: 'เลือกจากเทมเพลตมาตรฐาน (BOQ Templates)',
          icon: Layers,
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          location: 'ในหน้าต่างสร้าง PR',
          action: 'ดึงชุดรายการพัสดุก่อสร้างมาตรฐาน เช่น งานโครงสร้างฐานราก, งานเหล็ก, งานระบบไฟฟ้า, งานสี มาใส่ในแบบฟอร์มทันที',
          linkage: 'ประหยัดเวลาและลดข้อผิดพลาดในการพิมพ์สเปกวัสดุ'
        },
        {
          name: 'บันทึกเป็นแบบร่าง (Save Draft)',
          color: 'bg-white border-slate-300 text-slate-700',
          location: 'ด้านล่างของหน้าต่างสร้าง PR',
          action: 'บันทึกข้อมูลไว้โดยยังไม่ส่งเข้าระบบอนุมัติ เพื่อกลับมาแก้ไขเพิ่มเติมภายหลัง',
          linkage: 'เอกสารอยู่ในสถานะ Draft'
        },
        {
          name: 'ส่งขออนุมัติ (Submit for Approval)',
          icon: ArrowRight,
          color: 'bg-indigo-600 text-white',
          location: 'ด้านล่างของหน้าต่างสร้าง PR',
          action: 'ตรวจสอบความถูกต้องและส่งเอกสารเข้าสู่กระบวนการอนุมัติตามระดับสิทธิ์',
          linkage: 'ส่งรายการไปยังหน้า Approvals และแจ้งเตือนผู้อนุมัติ'
        },
        {
          name: 'ดูเอกสารมาตรฐาน A4 (View Standard Doc)',
          icon: FileText,
          color: 'text-indigo-600 hover:text-indigo-800',
          location: 'ตารางรายการ PR / การ์ดเอกสาร',
          action: 'เปิดหน้าต่างพรีวิวใบขอซื้อทางการ (FM-PUR-001) ขนาดกระดาษ A4 สัดส่วน 1:1',
          linkage: 'สามารถสั่งพิมพ์ (Print) หรือบันทึกเป็น PDF ได้ทันที'
        },
        {
          name: 'พิมพ์เอกสาร A4 (Print A4)',
          icon: Printer,
          color: 'bg-white border-slate-300 text-slate-700',
          location: 'ด้านล่างของหน้าต่างพรีวิวเอกสาร',
          action: 'สั่งพิมพ์เอกสารผ่านเครื่องพิมพ์โดยจัดหน้ากระดาษ A4 อัตโนมัติ',
          linkage: 'ได้เอกสารตัวจริงพร้อมลงนามหากจำเป็น'
        },
        {
          name: 'พิมพ์เอกสาร A4 (Print / บันทึก PDF)',
          icon: Printer,
          color: 'bg-white text-slate-800 border-slate-300',
          location: 'ด้านล่างของหน้าต่างพรีวิวเอกสาร',
          action: 'สั่งพิมพ์เอกสารขนาด A4 หรือเลือกบันทึกเป็น PDF (Save as PDF) ผ่านระบบพิมพ์ของเบราว์เซอร์',
          linkage: 'ได้เอกสารทางการขนาด A4 มาตรฐาน พร้อมใช้งานทั้งบน Desktop และ Mobile'
        }
      ],
      tips: [
        'ควรระบุรหัสโครงการ (Project Code) และสถานที่จัดส่งหน้างานให้ชัดเจน เพื่อให้ฝ่ายจัดซื้อและผู้ขายส่งของได้ถูกต้อง',
        'หากต้องการใช้รายการเดิมซ้ำในอนาคต สามารถติ๊ก "บันทึกเป็นเทมเพลตของคุณ" ในหน้าต่างสร้าง PR ได้'
      ]
    },
    {
      id: 'approvals',
      partId: 'part-2',
      partNumber: 2,
      partTitleTh: 'ส่วนที่ 2: งานจัดซื้อและการพิจารณาอนุมัติ',
      partTitleEn: 'Part 2: Procurement & Approval Pipeline',
      title: '2. การอนุมัติเอกสาร (Approvals & Inspection)',
      titleEn: '2. Document Approvals & Inspection',
      icon: ClipboardCheck,
      badge: 'ควบคุมงบประมาณ',
      role: 'วิศวกรโครงการ (PM) / ฝ่ายควบคุมต้นทุน (Cost Control) / ผู้อำนวยการ (Director/MD)',
      summary: 'ศูนย์กลางการพิจารณาอนุมัติเอกสารขอซื้อ (PR) และสั่งซื้อ (PO) แบบลำดับขั้น มีระบบตรวจสอบเอกสารมาตรฐาน A4 แบบซูมปรับขนาดได้ พร้อมการลงนามดิจิทัล',
      summaryEn: 'Multi-level approval workflows with interactive A4 document inspection, digital signatures, and rejection feedback.',
      route: '/approvals',
      linkages: [
        {
          from: 'อนุมัติเอกสาร (Approve)',
          to: 'ระบบขอซื้อ (PR) & ระบบสั่งซื้อ (PO)',
          description: 'สถานะเปลี่ยนเป็น "Approved" บันทึกลายมือชื่อ และส่งแจ้งเตือนไปยังผู้ขอซื้อและฝ่ายจัดซื้อ'
        },
        {
          from: 'ปฏิเสธคำขอ (Reject)',
          to: 'ระบบขอซื้อ (PR)',
          description: 'สถานะเปลี่ยนเป็น "Rejected" ผู้ขอซื้อจะได้รับการแจ้งเตือนพร้อมเหตุผลที่ถูกส่งกลับ'
        }
      ],
      statuses: [
        { status: 'Level 1', color: 'bg-slate-100 text-slate-800', desc: 'วิศวกรโครงการตรวจสอบคุณลักษณะเฉพาะและสเปกวัสดุ' },
        { status: 'Level 2', color: 'bg-blue-100 text-blue-800', desc: 'ฝ่ายควบคุมงบประมาณตรวจสอบยอดเงินเทียบกับ BOQ คงเหลือ' },
        { status: 'Level 3', color: 'bg-purple-100 text-purple-800', desc: 'ผู้อำนวยการโครงการ / ผู้บริหารระดับสูงอนุมัติการสั่งซื้อ' }
      ],
      buttons: [
        {
          name: 'ดูเอกสารมาตรฐาน → (Inspect Document)',
          icon: FileCheck,
          color: 'text-indigo-600 font-bold',
          location: 'ด้านล่างของการ์ดคำขออนุมัติ',
          action: 'เปิดหน้าต่างตรวจสอบเอกสารทางการขนาด A4 แสดงรายละเอียดครบถ้วนทั้งตารางวัสดุและตารางอนุมัติ',
          linkage: 'เข้าสู่หน้าจอตรวจสอบเอกสารมาตรฐาน'
        },
        {
          name: '📱 ย่อพอดีหน้าจอ / 🔍 ซูม 100% (Zoom Controls)',
          icon: Maximize2,
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          location: 'แถบเครื่องมือด้านบนของหน้าต่างตรวจเอกสาร',
          action: 'สลับระหว่างโหมดพอดีหน้าจอ (ไม่ต้องเลื่อนหน้าจอแนวนอน) กับโหมดขนาดจริง 100%',
          linkage: 'ช่วยให้ตรวจสอบบนมือถือ โน้ตบุ๊ก หรือจอใหญ่ได้อย่างสะดวก'
        },
        {
          name: 'อนุมัติคำขอ (Approve)',
          icon: CheckCircle2,
          color: 'bg-indigo-600 text-white',
          location: 'การ์ดคำขอ / ด้านล่างหน้าต่างตรวจสอบ',
          action: 'เปิดหน้าต่างยืนยันการอนุมัติ ระบบจะลงบันทึกลายมือชื่อดิจิทัลและวันเวลาอนุมัติ',
          linkage: 'ส่งต่อเอกสารไปยังขั้นตอนการออกใบสั่งซื้อ (PO)'
        },
        {
          name: 'ปฏิเสธคำขอ / ส่งกลับแก้ไข (Reject)',
          color: 'bg-white border-slate-300 text-red-700',
          location: 'การ์ดคำขอ / ด้านล่างหน้าต่างตรวจสอบ',
          action: 'เปิดหน้าต่างยืนยันการปฏิเสธ เพื่อส่งกลับให้ผู้ขอซื้อแก้ไข',
          linkage: 'ส่งการแจ้งเตือนไปยังผู้ขอซื้อและปรับสถานะเป็น Rejected'
        },
        {
          name: 'แท็บประวัติการอนุมัติ (History Tab)',
          location: 'ด้านบนของหน้า Approvals',
          action: 'ดูรายการเอกสารที่ตนเองเคยอนุมัติหรือปฏิเสธไปแล้วในอดีต ย้อนหลังได้ตลอดเวลา',
          linkage: 'ใช้ตรวจสอบความโปร่งใสและสอบทานงาน'
        }
      ],
      tips: [
        'ควรตรวจสอบช่อง "ตรวจสอบงบประมาณ (Cost Control)" ในเอกสาร A4 เพื่อให้แน่ใจว่างบประมาณ BOQ ของโครงการไม่เกินวงเงินที่กำหนด',
        'การอนุมัติผ่านระบบถือเป็นการลงนามดิจิทัลที่มีผลผูกพันตามระเบียบจัดซื้อของบริษัท'
      ]
    },
    {
      id: 'po',
      partId: 'part-2',
      partNumber: 2,
      partTitleTh: 'ส่วนที่ 2: งานจัดซื้อและการพิจารณาอนุมัติ',
      partTitleEn: 'Part 2: Procurement & Approval Pipeline',
      title: '3. ระบบสั่งซื้อ (Purchase Order - PO) & การตรวจรับ',
      titleEn: '3. Purchase Orders (PO) & Receiving',
      icon: FileText,
      badge: 'ผูกพันทางการค้า',
      role: 'เจ้าหน้าที่จัดซื้อ (Purchaser) / เจ้าหน้าที่สโตร์ / ผู้ตรวจรับหน้างาน',
      summary: 'ออกใบสั่งซื้อไปยังคู่ค้าและผู้จัดจำหน่าย ดึงข้อมูลจาก PR ที่อนุมัติแล้วได้ทันที และมีระบบตรวจรับสินค้าหน้างาน (Goods Receipt) อัปเดตสต็อกอัตโนมัติ',
      summaryEn: 'Issue purchase orders directly or convert from approved PRs, track supplier delivery, and record goods receipts.',
      route: '/po',
      linkages: [
        {
          from: 'สร้าง PO จาก PR',
          to: 'ระบบขอซื้อ (PR)',
          description: 'PR ต้นทางจะเปลี่ยนสถานะเป็น "PO Created" ป้องกันการสั่งซื้อซ้ำ'
        },
        {
          from: 'ตรวจรับสินค้า (Receive Goods)',
          to: 'คลังสินค้า (Inventory)',
          description: 'เมื่อบันทึกรับของ ยอดสต็อกในคลังจะเพิ่มขึ้นทันที พร้อมบันทึกประวัติการรับเข้า'
        }
      ],
      statuses: [
        { status: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-300', desc: 'ใบสั่งซื้อแบบร่าง ยังไม่ได้ส่งหาคู่ค้า' },
        { status: 'Issued', color: 'bg-blue-100 text-blue-800 border-blue-300', desc: 'ออกใบสั่งซื้อและส่งไปยังคู่ค้าเรียบร้อยแล้ว รอการจัดส่ง' },
        { status: 'Partially Received', color: 'bg-amber-100 text-amber-800 border-amber-300', desc: 'รับสินค้าบางส่วน (เช่น สั่ง 100 ส่งมา 50) สต็อกจะเพิ่มตามจริง' },
        { status: 'Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', desc: 'ตรวจรับสินค้าครบถ้วนตามใบสั่งซื้อ 100% เรียบร้อยแล้ว' },
        { status: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-300', desc: 'ยกเลิกคำสั่งซื้อ' }
      ],
      buttons: [
        {
          name: 'สร้าง PO จาก PR ที่อนุมัติแล้ว (Create PO from PR)',
          icon: Layers,
          color: 'bg-emerald-600 text-white',
          location: 'มุมบนขวาของหน้า PO',
          action: 'แสดงรายการ PR ทั้งหมดที่ผ่านการอนุมัติแล้ว คลิกเลือก PR ที่ต้องการเพื่อสร้าง PO ได้ทันทีโดยไม่ต้องกรอกข้อมูลใหม่',
          linkage: 'เชื่อมโยงข้อมูล PR เข้าสู่ PO อย่างสมบูรณ์'
        },
        {
          name: '+ ออกใบสั่งซื้อใหม่ (Direct Create PO)',
          icon: Plus,
          color: 'bg-indigo-600 text-white',
          location: 'มุมบนขวาของหน้า PO',
          action: 'สร้างใบสั่งซื้อแบบระบุคู่ค้าและรายการสินค้าด้วยตนเองโดยตรง',
          linkage: 'สร้างเอกสาร PO ฉบับใหม่'
        },
        {
          name: 'ตรวจรับสินค้า (Receive Goods)',
          icon: Package,
          color: 'bg-amber-500 text-white hover:bg-amber-600',
          location: 'ตารางรายการ PO (เฉพาะสถานะ Issued / Partially Received)',
          action: 'เปิดหน้าต่างบันทึกการรับของหน้างาน กรอกจำนวนที่ตรวจรับจริงในงวดนั้น และระบุชื่อผู้รับของ',
          linkage: 'เพิ่มยอดสต็อกในหน้าคลังสินค้าทันที หากรับครบจะปรับสถานะเป็น Completed'
        },
        {
          name: 'ดูรายละเอียด PO / ประวัติการรับของ',
          icon: FileText,
          color: 'text-slate-600 hover:text-slate-900',
          location: 'ตารางรายการ PO',
          action: 'ดูข้อมูลใบสั่งซื้อ รายการพัสดุ ยอดรวม และตารางบันทึกการส่งของในแต่ละงวด',
          linkage: 'แสดงประวัติการรับสินค้าแบบละเอียด'
        }
      ],
      tips: [
        'หากสินค้าจัดส่งมาหลายรอบ (เช่น ปูนซีเมนต์ส่งรอบละ 50 คิว) สามารถกด "ตรวจรับสินค้า" หลายครั้งได้ ระบบจะคำนวณยอดค้างส่งที่เหลือให้อัตโนมัติ',
        'เมื่อตรวจรับสินค้าแล้ว ระบบจะบันทึกเลขอ้างอิง PO ลงในประวัติคลังสินค้า เพื่อให้ตรวจสอบย้อนกลับได้'
      ]
    },
    {
      id: 'inventory',
      partId: 'part-3',
      partNumber: 3,
      partTitleTh: 'ส่วนที่ 3: คลังพัสดุก่อสร้างกลางและการตรวจรับ',
      partTitleEn: 'Part 3: Inventory Control & Suppliers',
      title: '4. คลังพัสดุและวัสดุก่อสร้างกลางและระบบบาร์โค้ด SKU (Central Construction Material Hub & SKU Barcode)',
      titleEn: '4. Central Construction Material Hub & Master SKU Barcode Scanner',
      icon: Package,
      badge: 'คลังพัสดุก่อสร้างกลาง & บาร์โค้ด SKU',
      role: 'เจ้าหน้าที่สโตร์ / ผู้จัดการคลังพัสดุ / โฟร์แมนหน้างาน / วิศวกรโครงการ',
      summary: 'ควบคุมจำนวนสต็อกคงเหลือของคลังพัสดุและวัสดุก่อสร้างกลาง (Central Construction Material Hub) สำหรับจัดเก็บ รับเข้า และเบิกจ่ายวัสดุอุปกรณ์ไปยังโครงการและไซต์งานก่อสร้างต่างๆ ด้วยระบบ Master SKU Barcode (1D Code 128) รองรับทั้งเครื่องยิงบาร์โค้ดไร้สาย กล้องสด และระบบพิมพ์ป้ายสติกเกอร์ความร้อนติดพัสดุ/ชั้นวาง',
      summaryEn: 'Centralized inventory control for construction contractor central material hub, managing site requisitions, project allocations, and receipts using 1D Master SKU Barcodes, wireless barcode guns, and printable thermal labels.',
      route: '/inventory',
      linkages: [
        {
          from: 'ตรวจรับของจาก PO',
          to: 'คลังพัสดุก่อสร้างกลาง (Central Material Hub)',
          description: 'สต็อกจะเพิ่มขึ้นอัตโนมัติตามจำนวนที่ตรวจรับเข้าคลังกลาง'
        },
        {
          from: 'สแกน SKU Barcode',
          to: 'หน้าต่างรับเข้า / เบิกจ่ายไปหน้างาน / ตรวจนับ',
          description: 'ยิงบาร์โค้ดวัสดุเพื่อยืนยันการรับเข้า หรือตัดสต็อกเบิกจ่ายไปยังไซต์งานก่อสร้างได้ทันที'
        },
        {
          from: 'สต็อกต่ำกว่าระดับขั้นต่ำ (Low Stock)',
          to: 'ระบบขอซื้อ (PR)',
          description: 'แจ้งเตือนบนแดชบอร์ดเพื่อให้จัดซื้อเปิด PR สั่งซื้อเติมสต็อกคลังกลาง'
        }
      ],
      buttons: [
        {
          name: '📷 สแกนบาร์โค้ด SKU (Scan Barcode)',
          icon: Barcode,
          color: 'bg-white border-slate-300 text-slate-700',
          location: 'แถบเครื่องมือด้านบนหน้าคลังสินค้า',
          action: 'เปิดหน้าต่างสแกนเนอร์ รองรับทั้งเครื่องยิงบาร์โค้ดจริง (USB/Bluetooth Scanner Gun) และกล้องสมาร์ตโฟน/Webcam รองรับบาร์โค้ด 1D Code 128, EAN-13 และ QR Code',
          linkage: 'ตรวจพบสินค้าด้วย Master SKU และเปิดเมนูดำเนินการด่วนทันที'
        },
        {
          name: 'สลับกล้อง / เปิดไฟฉาย (Camera Tools)',
          icon: Camera,
          color: 'bg-slate-100 text-slate-700',
          location: 'มุมบนของกล่องสแกนกล้องสด',
          action: 'สลับกล้องหน้า/กล้องหลัง (บนมือถือ) หรือเปิดไฟฉาย Flashlight ในโกดังที่แสงน้อย',
          linkage: 'เพิ่มความแม่นยำในการสแกน'
        },
        {
          name: 'อัปโหลดรูปภาพบาร์โค้ด (Upload Image Tab)',
          icon: Upload,
          color: 'bg-slate-100 text-slate-700',
          location: 'แท็บในหน้าต่างสแกนเนอร์',
          action: 'เลือกรูปถ่ายบาร์โค้ดสินค้าหรือแคปหน้าจอเพื่อให้ระบบถอดรหัสทันที',
          linkage: 'ใช้งานได้แม้ไม่มีกล้องเชื่อมต่อ'
        },
        {
          name: 'ค้นหา Master SKU (Manual Search Tab)',
          color: 'bg-slate-100 text-slate-700',
          location: 'แท็บในหน้าต่างสแกนเนอร์',
          action: 'พิมพ์รหัส Master SKU หรือเลขบาร์โค้ดด้วยตนเองเพื่อค้นหาสินค้าในคลังกลางทันที',
          linkage: 'ค้นหาสินค้าได้รวดเร็ว'
        },
        {
          name: 'รับเข้า / เบิกออก (Receive / Issue)',
          icon: ArrowDownUp,
          color: 'bg-indigo-600 text-white',
          location: 'แถบเครื่องมือ / ปุ่มหลังสแกนบาร์โค้ด',
          action: 'บันทึกการรับเข้าสต็อก, เบิกจ่ายพัสดุไปหน้างานก่อสร้าง หรือโอนย้ายระหว่างจุดจัดเก็บในคลังกลาง',
          linkage: 'ปรับปรุงยอดสต็อกกลางและบันทึกประวัติการเบิกจ่ายโครงการ'
        },
        {
          name: 'ตรวจนับสต็อก (Physical Count)',
          icon: CheckSquare,
          color: 'bg-emerald-600 text-white',
          location: 'คอลัมน์การจัดการในตารางสินค้า / ปุ่มหลังสแกนบาร์โค้ด',
          action: 'บันทึกยอดนับจริงหน้างาน คำนวณผลต่าง (+ / -) อัตโนมัติ พร้อมระบุหมายเหตุสาเหตุส่วนต่าง',
          linkage: 'ปรับยอดคงเหลือให้ตรงกับความเป็นจริง'
        },
        {
          name: 'พิมพ์ป้ายบาร์โค้ด SKU (Print SKU Barcode Label)',
          icon: Printer,
          color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
          location: 'คอลัมน์การจัดการในตารางสินค้า / หน้าต่างรายละเอียดสินค้า',
          action: 'เปิดตัวออกแบบและพิมพ์ป้ายบาร์โค้ด SKU รองรับขนาดสติกเกอร์ความร้อน (50x30 mm), ป้ายคลังกลาง (75x50 mm), ป้ายติดชั้นวาง (Shelf Tag) และชุดพิมพ์แผ่น A4 พร้อมระบุจำนวนดวงตามสต็อกจริง',
          linkage: 'นำสติกเกอร์ไปแปะที่ตัวสินค้า กล่อง หรือชั้นวางในคลังกลาง'
        },
        {
          name: 'นำเข้า Excel (Import Spreadsheet)',
          icon: FileSpreadsheet,
          color: 'bg-white border-slate-300 text-slate-700',
          location: 'แถบเครื่องมือด้านบนหน้าคลังสินค้า',
          action: 'เลือกไฟล์ .xlsx หรือ .csv เพื่อนำเข้ารายการสินค้าพร้อมระบุ Master SKU และบาร์โค้ดเข้าสู่ระบบพร้อมกัน',
          linkage: 'เพิ่มรายการสินค้าในสต็อกเป็นชุด'
        }
      ],
      tips: [
        'เจ้าหน้าที่สโตร์หรือโฟร์แมนสามารถเสียบเครื่องยิงบาร์โค้ดไร้สาย (Wireless Barcode Gun) แล้วยิงบาร์โค้ดบนวัสดุหรือกล่องพัสดุได้ทันที ระบบจะค้นหา Master SKU และแสดงยอดสต็อกพร้อมโครงการที่เบิกใช้โดยอัตโนมัติ',
        'ป้ายบาร์โค้ด SKU รองรับการพิมพ์ผ่านเครื่องพิมพ์สติกเกอร์ความร้อนความเร็วสูง (Direct Thermal Printers เช่น Xprinter, Zebra) สำหรับแปะพัสดุ พาเลท หรือชั้นวางก่อนส่งมอบไปยังหน้างานโครงการ'
      ]
    },
    {
      id: 'vendors',
      partId: 'part-3',
      partNumber: 3,
      partTitleTh: 'ส่วนที่ 3: คลังพัสดุก่อสร้างกลางและการตรวจรับ',
      partTitleEn: 'Part 3: Inventory Control & Suppliers',
      title: '5. ทะเบียนคู่ค้าและประเมินผู้ขาย (Vendors & Evaluation)',
      titleEn: '5. Vendor Management & Evaluation',
      icon: Store,
      badge: 'จัดการผู้จัดจำหน่าย',
      role: 'เจ้าหน้าที่จัดซื้อ (Purchaser) / ผู้จัดการฝ่ายจัดซื้อ',
      summary: 'บันทึกประวัติคู่ค้า ผู้รับเหมาช่วง เลขประจำตัวผู้เสียภาษี เงื่อนไขการชำระเงิน (Credit Term) และระบบให้คะแนนประเมินคุณภาพคู่ค้า (Vendor Rating)',
      summaryEn: 'Manage suppliers, tax IDs, credit terms, and performance ratings.',
      route: '/vendors',
      linkages: [
        {
          from: 'ข้อมูลคู่ค้า',
          to: 'ระบบขอซื้อ (PR) & ระบบสั่งซื้อ (PO)',
          description: 'รายชื่อคู่ค้าจะปรากฏในช่องเลือกผู้จัดจำหน่ายในใบสั่งซื้อและใบขอซื้อ'
        }
      ],
      buttons: [
        {
          name: '+ เพิ่มคู่ค้าใหม่ (Add Vendor)',
          icon: Plus,
          color: 'bg-indigo-600 text-white',
          location: 'มุมบนขวาของหน้า Vendors',
          action: 'บันทึกชื่อบริษัท, ที่อยู่, เบอร์โทร, ผู้ติดต่อ, เครดิตเทอม, และหมวดหมู่สินค้าที่จัดจำหน่าย',
          linkage: 'เพิ่มคู่ค้าเข้าสู่ฐานข้อมูลระบบ'
        },
        {
          name: 'ประเมินคู่ค้า (Evaluate Vendor)',
          icon: Sparkles,
          color: 'text-amber-600 hover:text-amber-800',
          location: 'ตารางรายชื่อคู่ค้า',
          action: 'ให้คะแนนเกรด (A, B, C) ด้านคุณภาพสินค้า ความตรงต่อเวลาในการส่งมอบ และการบริการ',
          linkage: 'ช่วยให้ฝ่ายจัดซื้อตัดสินใจเลือกคู่ค้าที่ดีที่สุดในโครงการถัดไป'
        }
      ],
      tips: [
        'ควรระบุเงื่อนไขเครดิตเทอมและข้อมูลบัญชีธนาคารให้ถูกต้อง เพื่อความสะดวกรวดเร็วในการออกใบสั่งซื้อและวางบิล'
      ]
    },
    {
      id: 'reports',
      partId: 'part-5',
      partNumber: 5,
      partTitleTh: 'ส่วนที่ 5: การบริหารสิทธิ์, การตั้งค่าและรายงาน',
      partTitleEn: 'Part 5: Administration, Settings & Reports',
      title: '6. รายงานและสถิติ (Reports & Analytics)',
      titleEn: '6. Reports & Analytics',
      icon: BarChart3,
      badge: 'วิเคราะห์ข้อมูลเชิงลึก',
      role: 'ผู้บริหาร (Executives) / ผู้จัดการฝ่ายบัญชี-การเงิน / ผู้จัดการโครงการ',
      summary: 'วิเคราะห์สรุปค่าใช้จ่ายจัดซื้อแยกตามโครงการและหมวดหมู่งาน ประสิทธิภาพการส่งมอบ และแนวโน้มราคาวัสดุก่อสร้าง สามารถส่งออกเป็น Excel และ PDF',
      summaryEn: 'Comprehensive cost analytics, project spend distribution, and Excel/PDF report export.',
      route: '/reports',
      linkages: [
        {
          from: 'ข้อมูลการสั่งซื้อและคลัง',
          to: 'รายงาน (Reports)',
          description: 'ประมวลผลข้อมูลจาก PR, PO และ Inventory แบบอัตโนมัติ ไม่ต้องทำสรุปรายเดือนด้วยตนเอง'
        }
      ],
      buttons: [
        {
          name: 'ส่งออกรายงาน Excel (Export Excel)',
          icon: FileSpreadsheet,
          color: 'bg-emerald-600 text-white',
          location: 'มุมบนขวาของหน้ารายงาน',
          action: 'ดาวน์โหลดไฟล์สรุปตัวเลขและรายการจัดซื้อทั้งหมดไปวิเคราะห์ต่อใน Microsoft Excel',
          linkage: 'ได้ไฟล์สเปรดชีตที่พร้อมประมวลผลต่อ'
        },
        {
          name: 'พิมพ์รายงาน / บันทึก PDF (Print / PDF)',
          icon: Printer,
          color: 'bg-white border-slate-300 text-slate-700',
          location: 'มุมบนขวาของหน้ารายงาน',
          action: 'สร้างรายงานสรุปในรูปแบบเอกสารเพื่อสั่งพิมพ์หรือบันทึกเป็น PDF ส่งให้ที่ประชุม',
          linkage: 'ได้รายงานผู้บริหารฉบับมาตรฐาน'
        },
        {
          name: 'ตัวกรองช่วงเวลา (Date Filter)',
          location: 'แถบตัวกรองด้านบน',
          action: 'เลือกช่วงเวลาที่ต้องการดูข้อมูล เช่น เดือนนี้, ไตรมาสนี้, หรือทั้งปี',
          linkage: 'อัปเดตข้อมูลกราฟและสถิติให้ตรงตามช่วงเวลา'
        }
      ],
      tips: [
        'ใช้กราฟวิเคราะห์หมวดหมู่การใช้จ่าย (Spend by Category) เพื่อตรวจสอบว่าโครงการใช้งบกับวัสดุประเภทใดมากที่สุด'
      ]
    },
    {
      id: 'users',
      partId: 'part-5',
      partNumber: 5,
      partTitleTh: 'ส่วนที่ 5: การบริหารสิทธิ์, การตั้งค่าและรายงาน',
      partTitleEn: 'Part 5: Administration, Settings & Reports',
      title: '7. ผู้ใช้งานและสิทธิ์การเข้าถึง (Users & Role-Based Permissions)',
      titleEn: '7. Users & Role-Based Permission Matrix (RBAC)',
      icon: Users,
      badge: 'ความปลอดภัยระบบ (RBAC Enterprise)',
      role: 'ผู้ดูแลระบบ (System Administrator)',
      summary: 'จัดการบัญชีผู้ใช้งาน กำหนดบทบาทหน้าที่แต่ละตำแหน่ง (Site Engineer, Buyer, PM, Approver, Storekeeper, Admin) และเครื่องมือกำหนดสิทธิ์ Role Matrix 25 สิทธิ์ระดับ Granular พร้อมระบบตรวจสอบประวัติ Audit Trail',
      summaryEn: 'Enterprise user management, role-based access control (RBAC), granular 25-point permission matrix, and full audit trail monitoring.',
      route: '/users',
      linkages: [
        {
          from: 'การกำหนดสิทธิ์ของแอดมิน (Admin Role Matrix)',
          to: 'ทุกโมดูลในระบบ (PR, PO, Approvals, Inventory, Reports)',
          description: 'ควบคุมและล็อกปุ่มฟังก์ชันต่างๆ ตามบทบาทจริง เช่น บังคับให้เฉพาะ Approver/Manager ที่มีสิทธิ์อนุมัติเอกสารได้ และซ่อน/ล็อกเมนูที่ไม่มีสิทธิ์'
        },
        {
          from: 'การสลับ Persona (Persona Switcher)',
          to: 'แถบส่วนหัวด้านบน (Header User Menu)',
          description: 'จำลองสลับเข้าสู่บทบาทตำแหน่งต่างๆ ได้ทันที เพื่อทดสอบการมองเห็นและสิทธิ์การเข้าถึงของแต่ละตำแหน่ง'
        }
      ],
      statuses: [
        { status: 'Admin (ผู้ดูแลระบบสูงสุด)', color: 'bg-purple-100 text-purple-800', desc: 'มีสิทธิ์สูงสุด 100% ดูแลผู้ใช้งาน กำหนด Permission Matrix ปรับแต่งระบบ และได้รับการคุ้มครองด้วยกลไก Self-Protection' },
        { status: 'Purchasing Manager (ผู้จัดการจัดซื้อ)', color: 'bg-amber-100 text-amber-800', desc: 'อนุมัติ PR/PO, สร้างและควบคุม PO, ดูแลทะเบียนคู่ค้า และเข้าถึงรายงานงบประมาณทั้งหมด' },
        { status: 'Purchasing Staff (เจ้าหน้าที่จัดซื้อ)', color: 'bg-blue-100 text-blue-800', desc: 'สร้าง PR, ออกใบสั่งซื้อ PO จาก PR ที่อนุมัติแล้ว, บันทึกส่ง PO ให้คู่ค้า และประสานงานรับพัสดุ' },
        { status: 'Approver (ผู้อนุมัติโครงการ)', color: 'bg-violet-100 text-violet-800', desc: 'พิจารณาอนุมัติ/ปฏิเสธ PR และ PO ตามวงเงินอำนาจดำเนินการ ตรวจสอบงบประมาณและดูรายงานวิเคราะห์' },
        { status: 'Site Engineer (วิศวกรสนาม)', color: 'bg-cyan-100 text-cyan-800', desc: 'เปิดใบขอซื้อ (PR) ระบุสเปกวัสดุหน้างาน ตรวจสอบสต็อกพัสดุ และสแกน QR Code ตรวจสอบของ' },
        { status: 'Inventory Control (คลังพัสดุ)', color: 'bg-emerald-100 text-emerald-800', desc: 'บันทึกตรวจรับสินค้า (Goods Receipt - GR), สแกน QR ตรวจรับ และปรับปรุงยอดสต็อกคงเหลือ' }
      ],
      buttons: [
        {
          name: 'กำหนดสิทธิ์บทบาทนี้ (Configure Permissions)',
          color: 'bg-indigo-50 text-indigo-700',
          location: 'การ์ดบทบาท ในแท็บ Roles & Permissions',
          action: 'เปิดหน้าต่าง Permission Matrix Editor เพื่อเลือกเปิด/ปิดสิทธิ์ย่อยทั้ง 25 สิทธิ์แยกตาม 9 โมดูลงานของแต่ละบทบาท',
          linkage: 'บันทึกสิทธิ์ลงระบบและมีผลทันที'
        },
        {
          name: 'ตารางเปรียบเทียบสิทธิ์ (Matrix Table View)',
          color: 'bg-white border-slate-200 text-slate-700',
          location: 'แถบเครื่องมือแท็บ Roles & Permissions',
          action: 'เปิดมุมมองตาราง Matrix ภาพรวม เปรียบเทียบสิทธิ์ของทุกตำแหน่งพร้อมกันในหน้าเดียวเพื่อการตรวจสอบของฝ่ายบริหาร',
          linkage: 'แสดงตาราง Matrix และสั่งพิมพ์ได้'
        },
        {
          name: '+ เพิ่มผู้ใช้งานใหม่ (Add User)',
          icon: Plus,
          color: 'bg-indigo-600 text-white',
          location: 'มุมบนขวาของแท็บ Users',
          action: 'สร้างบัญชีผู้ใช้งานใหม่ กำหนดชื่อ อีเมล แผนก/ไซต์งาน และมอบหมายบทบาท (Role)',
          linkage: 'บันทึกผู้ใช้ลงระบบพร้อมใช้งาน'
        },
        {
          name: '+ สร้างบทบาทใหม่ (Create Custom Role)',
          icon: Plus,
          color: 'bg-indigo-600 text-white',
          location: 'แถบเครื่องมือแท็บ Roles & Permissions',
          action: 'สร้างบทบาทเฉพาะขององค์กร เช่น ผู้ตรวจสอบคุณภาพ (QA) หรือ นักบัญชี พร้อมกำหนดสิทธิ์อย่างอิสระ',
          linkage: 'เพิ่มบทบาทใหม่ในระบบ'
        }
      ],
      tips: [
        'บทบาท Admin มีกลไกความปลอดภัยพิเศษ (Self-Protection) ล็อกไม่ให้ลบตัวเองหรือปิดสิทธิ์หลัก เพื่อป้องกันระบบล็อกเอาท์ถาวร',
        'สามารถใช้ปุ่ม "สลับใช้" หรือเมนูมุมบนขวา เพื่อทดสอบดูว่าพนักงานตำแหน่งนั้นๆ เห็นเมนูและปุ่มใดได้บ้าง'
      ]
    },
    {
      id: 'settings',
      partId: 'part-5',
      partNumber: 5,
      partTitleTh: 'ส่วนที่ 5: การบริหารสิทธิ์, การตั้งค่าและรายงาน',
      partTitleEn: 'Part 5: Administration, Settings & Reports',
      title: '8. ตั้งค่าระบบ, PWA & การใช้งานออฟไลน์ (Settings & PWA)',
      titleEn: '8. Settings, PWA & Offline Support',
      icon: Settings,
      badge: 'การตั้งค่าระบบ',
      role: 'ผู้ใช้งานทุกคน (All Users)',
      summary: 'สลับภาษาไทย/อังกฤษ ปรับแต่งการแจ้งเตือน ติดตั้งแอปบนมือถือและเดสก์ท็อป (PWA Install) และระบบตรวจสอบการทำงานแบบออฟไลน์',
      summaryEn: 'Language toggling (TH/EN), notification settings, PWA home screen installation, and offline capability.',
      route: '/settings',
      linkages: [
        {
          from: 'ติดตั้ง PWA (Install App)',
          to: 'หน้าจออุปกรณ์ (Desktop & Mobile)',
          description: 'เพิ่มไอคอน Conerage store บนหน้าจอหลัก เข้าใช้งานได้เสมือนแอปเนทีฟ'
        }
      ],
      buttons: [
        {
          name: 'สลับภาษาไทย / English (Language Toggle)',
          color: 'bg-white border-slate-300 text-slate-700',
          location: 'แถบส่วนหัวด้านบน / เมนูด้านข้าง',
          action: 'สลับการแสดงผลภาษาของระบบทั้งหมดระหว่างภาษาไทยและภาษาอังกฤษได้ทันทีโดยไม่ต้องโหลดหน้าใหม่',
          linkage: 'เปลี่ยนภาษาทั้งระบบ'
        },
        {
          name: 'ปรับความละเอียดหน้าจอ (Display Density Scale)',
          icon: Maximize2,
          color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
          location: 'หน้าการตั้งค่า / แถบสเกล',
          action: 'ปรับขนาด UI ทั้งระบบเป็น 80% (กะทัดรัดสมดุล), 90%, 100% (มาตรฐาน), หรือ 110% ให้พอดีกับขนาดจอโน้ตบุ๊ก จอแสดงผลกว้าง และสมาร์ตโฟน',
          linkage: 'ปรับสเกลแสดงผลทั้งแอปพลิเคชันและจำค่าไว้ในเครื่อง'
        },
        {
          name: 'ติดตั้งแอป Conerage store (Install PWA)',
          icon: Download,
          color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
          location: 'เมนูด้านล่างของแถบข้าง (Sidebar)',
          action: 'ติดตั้งเว็บแอปพลิเคชันลงบนเครื่องคอมพิวเตอร์หรือสมาร์ทโฟน เพื่อเปิดใช้งานแบบเต็มหน้าจอและเร็วขึ้น',
          linkage: 'เพิ่มไอคอนแอปบนเดสก์ท็อป / หน้าจอมือถือ'
        },
        {
          name: 'โหมดนำเสนอ & ลายน้ำ (MVP Presentation Mode)',
          color: 'bg-slate-100 text-slate-700',
          location: 'แท็บการแสดงผล ในหน้า Settings',
          action: 'เปิด/ปิดลายน้ำตัวอย่างระบบและเปิดใช้งานสภาพแวดล้อมจำลอง (Sandbox) สำหรับการนำเสนองานผู้บริหาร',
          linkage: 'แสดงตราสัญลักษณ์ Demo Watermark'
        },
        {
          name: 'แถบสถานะออฟไลน์ (Offline Indicator)',
          color: 'bg-amber-500 text-white',
          location: 'ด้านล่างสุดของหน้าจอ (แสดงเมื่อเน็ตหลุด)',
          action: 'แจ้งเตือนเมื่อสัญญาณอินเทอร์เน็ตขาดหาย ระบบจะยังคงเปิดอ่านข้อมูลที่โหลดไว้แล้วได้ตามมาตรฐาน PWA',
          linkage: 'แจ้งเตือนสถานะการเชื่อมต่อเครือข่าย'
        }
      ],
      tips: [
        'บนมือถือ iPhone หรือ Android สามารถกด "ติดตั้งแอป" หรือ "Add to Home Screen" เพื่อใช้งานเสมือนแอปจริงได้โดยไม่ต้องดาวน์โหลดจาก App Store',
        'หากใช้งานบนจอโน้ตบุ๊ก 13-14 นิ้ว สามารถเลือก Display Scale เป็น 80% เพื่อให้เห็นมุมมองตารางและแดชบอร์ดครบถ้วนโดยไม่ต้องเลื่อนหน้าจอด้านข้าง'
      ]
    },
    {
      id: 'data-import',
      partId: 'part-4',
      partNumber: 4,
      partTitleTh: 'ส่วนที่ 4: ศูนย์ข้อมูลและการเชื่อมต่อคลาวด์',
      partTitleEn: 'Part 4: Smart Data Hub & Cloud Integrations',
      title: '9. ศูนย์นำเข้าข้อมูลอัจฉริยะ (Smart Data Import Hub - Excel, CSV & CAD)',
      titleEn: '9. Smart Data Import Hub (Excel, CSV, JSON & CAD)',
      icon: UploadCloud,
      badge: 'นำเข้าข้อมูลความเร็วสูง',
      role: 'เจ้าหน้าที่สโตร์ / เจ้าหน้าที่จัดซื้อ / ผู้ดูแลระบบ / วิศวกร BOQ',
      summary: 'ศูนย์กลางนำเข้าข้อมูลปริมาณมาก (Bulk Data Import) รองรับไฟล์ Excel (.xlsx, .xls), CSV, JSON, และแบบจำลอง CAD/DXF สำหรับแปลงข้อมูลปริมาณงานก่อสร้าง พร้อมระบบตรวจจับและจับคู่คอลัมน์อัตโนมัติ (AI Column Mapping) เลือกระบบผสานข้อมูลแบบ Upsert, Overwrite หรือ Append สู่ 5 โมดูลเป้าหมาย (คลังสินค้า, PR, PO, คู่ค้า, CAD) และมีระบบตรวจสอบประวัติการนำเข้าย้อนหลัง (Import Audit History)',
      summaryEn: 'Smart bulk data import hub supporting Excel (.xlsx, .xls), CSV, JSON, and CAD/DXF files with automatic column mapping, flexible merge modes (Upsert, Overwrite, Append), sample templates, and comprehensive audit history.',
      route: '/import',
      linkages: [
        {
          from: 'นำเข้าไฟล์ Excel / CSV',
          to: 'คลังพัสดุก่อสร้างกลาง (Inventory)',
          description: 'เพิ่มหรืออัปเดตสต็อกพัสดุ รหัส Master SKU บาร์โค้ด และราคากลางเป็นชุดหลายร้อยรายการในไม่กี่วินาที'
        },
        {
          from: 'นำเข้าไฟล์ BOQ Estimate / CAD',
          to: 'ระบบขอซื้อ (PR) & คำสั่งซื้อ (PO)',
          description: 'แปลงรายการถอดแบบวัสดุและปริมาณงานเป็นเอกสาร PR หรือ PO ได้ทันทีโดยไม่ต้องพิมพ์ซ้ำ'
        },
        {
          from: 'ประวัติการนำเข้า (Import History)',
          to: 'ระบบตรวจสอบย้อนหลัง (Audit Log)',
          description: 'เก็บบันทึกประวัติ วันเวลา ผู้ดำเนินการ จำนวนแถวที่เพิ่ม/อัปเดต เพื่อความโปร่งใส'
        }
      ],
      statuses: [
        { status: 'Merge (ผสานข้อมูล / Upsert)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', desc: 'หากพบรหัสเดิมจะทำการอัปเดตข้อมูล และเพิ่มรายการใหม่ต่อท้ายโดยไม่ลบข้อมูลเก่า (แนะนำ)' },
        { status: 'Append (เพิ่มต่อท้าย)', color: 'bg-blue-100 text-blue-800 border-blue-300', desc: 'เพิ่มข้อมูลใหม่ทั้งหมดต่อท้ายข้อมูลเดิม เหมาะสำหรับการบันทึกประวัติการส่งมอบหรือเอกสารใหม่' },
        { status: 'Overwrite (เขียนทับทั้งหมด)', color: 'bg-red-100 text-red-800 border-red-300', desc: 'ลบข้อมูลเดิมในโมดูลนั้นทั้งหมดแล้วแทนที่ด้วยข้อมูลจากไฟล์ใหม่ ใช้เฉพาะเมื่อขึ้นรอบบัญชีใหม่' }
      ],
      buttons: [
        {
          name: 'ดาวน์โหลดเทมเพลตตัวอย่าง (Download Template)',
          icon: Download,
          color: 'bg-emerald-600 text-white',
          location: 'แท็บเทมเพลตตัวอย่าง (Templates Tab)',
          action: 'ดาวน์โหลดไฟล์ตัวอย่าง Excel (.xlsx) ที่มีหัวคอลัมน์มาตรฐานครบถ้วน เช่น เทมเพลตพัสดุคลังกลาง, รายการ PR BOQ, หรือรายชื่อคู่ค้า',
          linkage: 'นำไฟล์ไปกรอกข้อมูลก่อนอัปโหลดเข้าระบบ'
        },
        {
          name: 'เลือกไฟล์หรือลากวาง (Drag & Drop / Browse)',
          icon: Upload,
          color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
          location: 'ขั้นตอนที่ 1: อัปโหลดไฟล์',
          action: 'เลือกไฟล์ Excel, CSV, JSON หรือ CAD/DXF จากคอมพิวเตอร์ ระบบจะอ่านข้อมูลและแสดงจำนวนแถวทันที',
          linkage: 'เข้าสู่ขั้นตอนตรวจสอบและจับคู่คอลัมน์'
        },
        {
          name: 'จับคู่คอลัมน์อัตโนมัติ (Auto-Map Columns)',
          icon: Sparkles,
          color: 'bg-indigo-600 text-white',
          location: 'ขั้นตอนที่ 2: จับคู่ฟิลด์ข้อมูล',
          action: 'ระบบจะวิเคราะห์ชื่อหัวตารางในไฟล์และจับคู่เข้ากับฐานข้อมูลของ Conerage store โดยอัตโนมัติ ผู้ใช้สามารถปรับเปลี่ยนการจับคู่ได้ตามต้องการ',
          linkage: 'จัดระเบียบโครงสร้างข้อมูลให้ตรงกับระบบ'
        },
        {
          name: 'ยืนยันและนำเข้าข้อมูล (Execute Import)',
          icon: CheckCircle2,
          color: 'bg-emerald-600 text-white',
          location: 'ขั้นตอนที่ 3: ตรวจสอบและบันทึก',
          action: 'ประมวลผลนำเข้าข้อมูลจริงเข้าสู่ฐานข้อมูล ระบบจะสรุปจำนวนแถวที่เพิ่มใหม่ (Added) และแถวที่อัปเดต (Updated)',
          linkage: 'ข้อมูลจะปรากฏในหน้านั้นๆ ทันทีแบบ Real-time'
        },
        {
          name: 'ประวัติการนำเข้า (Import History Tab)',
          icon: History,
          color: 'bg-white border-slate-300 text-slate-700',
          location: 'ด้านบนของหน้า Data Import Hub',
          action: 'ตรวจสอบประวัติย้อนหลังว่าใครเป็นผู้นำเข้าไฟล์ใด วันที่เท่าไร และมีจำนวนรายการสำเร็จกี่แถว',
          linkage: 'ใช้สำหรับการสอบทานและตรวจสอบการนำเข้า'
        }
      ],
      tips: [
        'ควรใช้ปุ่ม "ดาวน์โหลดเทมเพลตตัวอย่าง" มาเป็นต้นแบบในการกรอกข้อมูล จะช่วยให้ระบบสามารถตรวจจับหัวตารางและจับคู่อัตโนมัติได้ 100%',
        'สำหรับโมดูลคลังสินค้า แนะนำให้เลือกโหมด "ผสานข้อมูล (Merge / Upsert)" เพื่อให้อัปเดตราคากลางและยอดสต็อกตามรหัส Master SKU เดิมโดยที่ข้อมูลอื่นไม่สูญหาย'
      ]
    },
    {
      id: 'integrations',
      partId: 'part-4',
      partNumber: 4,
      partTitleTh: 'ส่วนที่ 4: ศูนย์ข้อมูลและการเชื่อมต่อคลาวด์',
      partTitleEn: 'Part 4: Smart Data Hub & Cloud Integrations',
      title: '10. การเชื่อมต่อคลาวด์และแจ้งเตือน (Cloud Sync, Integrations & Webhooks)',
      titleEn: '10. Cloud Sync, Enterprise Integrations & Webhooks',
      icon: Cloud,
      badge: 'Enterprise Connectivity',
      role: 'ผู้ดูแลระบบ (Admin) / เจ้าหน้าที่ไอที / ผู้จัดการโครงการ',
      summary: 'เชื่อมต่อและซิงก์ข้อมูลระหว่าง Conerage store กับคลาวด์สตอเรจและแพลตฟอร์มภายนอก รองรับการซิงก์ข้อมูลสองทางกับ Google Sheets ด้วย Google Apps Script, สำรองฐานข้อมูลบน Google Drive และ Dropbox, ระบบแจ้งเตือนอัตโนมัติผ่าน LINE Notify / LINE Alert เข้ากลุ่มไลน์โครงการเมื่อมีเอกสารรออนุมัติหรือตรวจรับสินค้า และสภาพแวดล้อมจำลอง (MVP Presentation Sandbox)',
      summaryEn: 'Enterprise cloud connectivity featuring two-way Google Sheets synchronization, Google Apps Script webhooks, Google Drive/Dropbox system backups, automated LINE Notify alerts, and interactive MVP presentation sandbox.',
      route: '/integrations',
      linkages: [
        {
          from: 'Google Sheets สองทาง (Two-Way Sync)',
          to: 'คลังพัสดุและรายการขอซื้อ (Conerage store)',
          description: 'ดึงข้อมูลรายการวัสดุและราคาจาก Google Sheets เข้าสู่ระบบ หรือส่งออกข้อมูลสต็อกไปอัปเดตในชีตแบบ Real-time'
        },
        {
          from: 'ระบบขอซื้อ (PR) & สั่งซื้อ (PO)',
          to: 'LINE Notify / LINE Alert',
          description: 'เมื่อมีการเปิด PR หรือสร้าง PO ระบบจะส่งข้อความแจ้งเตือนเข้ากลุ่มแชท LINE ของผู้มีอำนาจอนุมัติทันที'
        },
        {
          from: 'สำรองข้อมูลคลาวด์ (Cloud Backup)',
          to: 'Google Drive & Dropbox',
          description: 'ส่งออกไฟล์สำรองฐานข้อมูลระบบฉุกเฉิน (.json) และสร้างลิงก์สำหรับจัดเก็บสำรองบน Cloud Storage'
        }
      ],
      buttons: [
        {
          name: 'คัดลอกสคริปต์ Google Apps Script (Copy Script)',
          icon: FileCode,
          color: 'bg-indigo-600 text-white',
          location: 'การ์ด Google Sheets Integration',
          action: 'คัดลอกโค้ดสคริปต์อัตโนมัติสำหรับนำไปติดตั้งในส่วนขยาย Extensions > Apps Script ใน Google Sheets เพื่อเปิดรับการเชื่อมต่อแบบ Real-time',
          linkage: 'เชื่อมโยง Google Sheets กับฐานข้อมูลระบบ'
        },
        {
          name: 'ซิงก์ข้อมูล Google Sheets (Sync Now)',
          icon: RefreshCw,
          color: 'bg-emerald-600 text-white',
          location: 'การ์ด Google Sheets Integration',
          action: 'ดึงข้อมูลล่าสุดจาก Google Sheets ที่ระบุ URL เข้าสู่คลังสินค้าหรือรายการจัดซื้อของระบบทันที',
          linkage: 'อัปเดตข้อมูลให้ตรงกันทั้งสองฝั่ง'
        },
        {
          name: 'ส่งข้อความทดสอบ LINE (Test LINE Alert)',
          icon: BellRing,
          color: 'bg-emerald-500 text-white hover:bg-emerald-600',
          location: 'การ์ด LINE Notify Integration',
          action: 'ระบุ Token หรือชื่อกลุ่ม LINE แล้วกดทดสอบ ระบบจะส่งข้อความทดสอบเข้าห้องแชททันที',
          linkage: 'ยืนยันความพร้อมของระบบแจ้งเตือน'
        },
        {
          name: 'สำรองข้อมูลระบบ (Cloud Backup)',
          icon: Download,
          color: 'bg-slate-800 text-white',
          location: 'การ์ด Google Drive & Dropbox Backup',
          action: 'สร้างไฟล์ข้อมูลสำรองฉบับสมบูรณ์ (Full JSON Data Snapshot) พร้อมดาวน์โหลดลงเครื่องและเตรียมส่งเข้า Cloud Drive',
          linkage: 'ป้องกันข้อมูลสูญหายในกรณีฉุกเฉิน'
        },
        {
          name: 'สลับโหมดจำลองนำเสนอ (Toggle MVP Mock Sandbox)',
          color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
          location: 'แถบสถานะด้านบนของหน้า Integrations',
          action: 'เปิดโหมดการจำลองแบบ Sandbox เพื่อสาธิตการเชื่อมต่อและดึงข้อมูลเสมือนจริงให้แก่ผู้บริหารหรือลูกค้าดูได้โดยไม่ต้องเชื่อมต่อระบบจริง',
          linkage: 'แสดงตัวอย่างผลลัพธ์การซิงก์และป้ายกำกับ Preview'
        }
      ],
      tips: [
        'ในการสร้าง LINE Notify Token ให้ไปที่ notify-bot.line.me ล็อกอินด้วยบัญชี LINE แล้วกด "Generate Token" เลือกห้องแชทหรือกลุ่มโครงการที่ต้องการรับการแจ้งเตือน แล้วนำ Token มาวางในช่องตั้งค่า',
        'สามารถใช้ Google Sheets เป็นตัวกลางในการนำเข้าข้อมูลร่วมกับทีมงานภาคสนามที่ไม่สะดวกเข้าใช้ระบบโดยตรง แล้วกด "ซิงก์ข้อมูล" เพื่อดึงเข้าระบบได้ทันที'
      ]
    },
    {
      id: 'ai-copilot-hub',
      partId: 'part-6',
      partNumber: 6,
      partTitleTh: 'ส่วนที่ 6: AI ผู้ช่วยและศูนย์ซ่อมแซมระบบตนเอง',
      partTitleEn: 'Part 6: AI Copilot & 1-Click Auto-Repair',
      title: '11. AI ผู้ช่วยจัดการระบบและศูนย์ซ่อมแซมตัวเอง (AI Copilot & Auto-Repair)',
      titleEn: '11. AI Copilot Operational Assistant & 1-Click Self-Healing Diagnostics',
      icon: Bot,
      badge: '24/7 AI Empowerment',
      role: 'พนักงานทุกแผนก (All Roles) / ไม่ต้องรอแอดมิน',
      summary: 'ศูนย์รวมปัญญาประดิษฐ์ (AI Copilot) ให้คำแนะนำและแก้ปัญหาการใช้งานระบบตลอด 24 ชั่วโมง พร้อมระบบตรวจสภาพฮาร์ดแวร์ 5 จุด (กล้องสแกนเนอร์, แคชระบบ, เครือข่าย, พื้นที่จัดเก็บ, ระบบแจ้งเตือน) และปุ่มคำสั่งซ่อมแซมตัวเอง 1-Click เพื่อให้ผู้ใช้งานแก้ไขปัญหาหน้างานได้ด้วยตนเองทันที',
      summaryEn: '24/7 AI-driven operational copilot and self-healing diagnostics hub capable of automated camera permission recovery, PWA cache flushing, storage cleanup, and low-stock reorder automation without relying solely on IT administrators.',
      route: '/ai-tools',
      linkages: [
        {
          from: 'ปุ่ม AI Copilot (ลอยตัวมุมขวาล่าง)',
          to: 'กล่องสนทนา AI และแท็บตรวจสุขภาพระบบ',
          description: 'เรียกเปิดแถบช่วยเหลือได้จากทุกหน้าจอในระบบ พร้อมปุ่มลัดคำถามยอดนิยม'
        },
        {
          from: 'ระบบตรวจสภาพ 5 จุด (Diagnostics Engine)',
          to: 'คำสั่งซ่อมแซม 1-Click Auto-Repair',
          description: 'ตรวจสอบสิทธิ์กล้อง, แคช PWA, ความเร็วเน็ต และพื้นที่จัดเก็บ พร้อมปุ่มสั่งแก้ไขทันที'
        },
        {
          from: 'ตัวช่วยคำนวณและจำลองสายอนุมัติ',
          to: 'ระบบขอซื้อ (PR) & อนุมัติ (Approvals)',
          description: 'จำลองระดับผู้อนุมัติตามยอดเงินล่วงหน้า และตรวจจับพัสดุใกล้หมดสต็อกส่งเข้า PR อัตโนมัติ'
        }
      ],
      buttons: [
        {
          name: 'ซ่อมแซมระบบทั้งหมดอัตโนมัติ (1-Click Auto-Repair)',
          icon: Wrench,
          color: 'bg-emerald-600 text-white',
          location: 'การ์ดสถานะในแท็บตรวจ & ซ่อมระบบ',
          action: 'รันคำสั่งแก้ไขปัญหาหลักพร้อมกัน: ขอสิทธิ์กล้องใหม่, ล้างแคชปลอดภัย, และทดสอบการเชื่อมต่อเซิร์ฟเวอร์',
          linkage: 'ฟื้นฟูการทำงานของระบบให้พร้อมใช้งาน 100%'
        },
        {
          name: 'ทดสอบและขอสิทธิ์กล้องใหม่ (Test & Request Camera)',
          icon: Camera,
          color: 'bg-indigo-600 text-white',
          location: 'รายการกล้องและระบบสแกน Barcode/QR',
          action: 'กระตุ้นหน้าต่างขอสิทธิ์กล้องของเบราว์เซอร์ เพื่อปลดล็อกให้ระบบสแกนบาร์โค้ดทำงานได้',
          linkage: 'เปิดใช้งานกล้องในหน้าคลังสินค้าและตรวจรับ PO'
        },
        {
          name: 'ล้างแคชและอัปเดตระบบ (Flush Cache & Reload)',
          icon: RefreshCw,
          color: 'bg-amber-600 text-white',
          location: 'รายการแคชระบบและการทำงานออฟไลน์',
          action: 'ล้าง CacheStorage เก่าและสั่งโหลดโค้ดเวอร์ชันล่าสุดจากเซิร์ฟเวอร์ โดยที่ข้อมูลผู้ใช้และรหัสผ่านไม่สูญหาย',
          linkage: 'แก้ปัญหาหน้าจอค้างหรือข้อมูลไม่อัปเดต'
        },
        {
          name: 'จำลองสายการอนุมัติ (Approval Matrix Simulator)',
          icon: ShieldCheck,
          color: 'bg-purple-600 text-white',
          location: 'แท็บเครื่องมือด่วน (Quick Tools)',
          action: 'กรอกยอดเงินขอซื้อเพื่อดูว่าเอกสารจะถูกส่งไปให้ผู้จัดการระดับใดอนุมัติตามระเบียบบริษัท',
          linkage: 'ช่วยวางแผนและติดตามเอกสารได้ล่วงหน้า'
        }
      ],
      tips: [
        'หากกล้องสแกนบาร์โค้ดไม่เปิด ให้กดปุ่ม "AI Copilot" มุมขวาล่าง แล้วเลือก "ทดสอบและขอสิทธิ์กล้องใหม่" ได้ทันที ไม่ต้องโทรตามแอดมิน',
        'ระบบ AI Copilot มีสมองกลอัจฉริยะแบบ Local Offline Fallback สามารถตอบคำถามและแนะนำวิธีแก้ปัญหาได้แม้ไม่มีสัญญาณอินเทอร์เน็ต'
      ]
    }
  ];

  const filteredModules = useMemo(() => {
    return modules.filter(m => {
      if (selectedPart !== 'all' && m.partId !== selectedPart) {
        return false;
      }
      if (selectedModule !== 'all' && m.id !== selectedModule) {
        return false;
      }
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q) || m.titleEn.toLowerCase().includes(q);
      const matchSummary = m.summary.toLowerCase().includes(q) || m.summaryEn.toLowerCase().includes(q);
      const matchButtons = m.buttons.some(b => 
        b.name.toLowerCase().includes(q) || 
        b.action.toLowerCase().includes(q) || 
        b.location.toLowerCase().includes(q)
      );
      const matchLinkages = m.linkages.some(l => 
        l.from.toLowerCase().includes(q) || 
        l.to.toLowerCase().includes(q) || 
        l.description.toLowerCase().includes(q)
      );

      return matchTitle || matchSummary || matchButtons || matchLinkages;
    });
  }, [modules, selectedPart, selectedModule, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* 1. Header Banner */}
      <div className="bg-black text-white rounded-3xl p-6 sm:p-8 shadow-xs border-2 border-black relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold tracking-wide">
              <BookOpen className="w-3.5 h-3.5 text-white" />
              <span>{isEnglish ? 'Conerage store System Documentation & SOP' : 'คู่มือการปฏิบัติงานมาตรฐานระบบจัดซื้อและคลังสินค้า (SOP)'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              {isEnglish ? 'Complete System User Manual' : 'คู่มือการใช้งานระบบฉบับสมบูรณ์'}
            </h1>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {isEnglish 
                ? 'Comprehensive guide detailing every module, button action, status workflow, and feature integration across the Conerage store platform.'
                : 'รวบรวมคำอธิบายทุกฟีเจอร์ ทุกปุ่มการทำงาน ผังการเชื่อมโยงข้อมูลระหว่างโมดูล (PR -> PO -> คลัง -> สแกน QR) และมาตรฐานการปฏิบัติงาน'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsPreviewModalOpen(true)}
              className="inline-flex items-center px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-white hover:bg-zinc-200 text-black transition-all shadow-xs cursor-pointer"
              title="ดูตัวอย่างเอกสารคู่มือฉบับจริง A4"
            >
              <Eye className="w-4 h-4 mr-1.5 text-black" />
              <span>{isEnglish ? 'Preview A4 Document' : 'ดูตัวอย่างเอกสาร A4'}</span>
            </button>

            <button
              onClick={() => handlePrint('standard-manual-doc')}
              className="inline-flex items-center px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 transition-colors shadow-xs cursor-pointer"
              title="สั่งพิมพ์คู่มือฉบับมาตรฐาน A4 (8 หน้า)"
            >
              <Printer className="w-4 h-4 mr-1.5 text-white" />
              <span>{isEnglish ? 'Print Standard A4' : 'พิมพ์คู่มือมาตรฐาน A4'}</span>
            </button>
          </div>
        </div>

        {/* Search bar inside banner */}
        <div className="relative mt-6 max-w-xl">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEnglish ? 'Search any button, feature, or workflow (e.g. Scan QR, Approve, BOQ)...' : 'ค้นหาชื่อปุ่ม, ฟีเจอร์ หรือขั้นตอนการทำงาน (เช่น สแกน QR, อนุมัติ, ออก PO, ตรวจนับ)...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-xs sm:text-sm font-medium focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all shadow-inner"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-2.5 text-xs text-zinc-400 hover:text-white"
            >
              ล้างคำค้นหา
            </button>
          )}
        </div>
      </div>

      {/* View Mode Toggle Bar: Interactive vs Official SOP Document */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border-2 border-zinc-200 shadow-xs print:hidden">
        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
          <button
            onClick={() => setViewMode('interactive')}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              viewMode === 'interactive' 
                ? "bg-black text-white shadow-xs" 
                : "text-zinc-600 hover:text-black"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isEnglish ? 'Interactive Web View' : 'มุมมองหน้าเว็บแบบโต้ตอบ'}</span>
          </button>
          <button
            onClick={() => setViewMode('official-document')}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              viewMode === 'official-document' 
                ? "bg-black text-white shadow-xs" 
                : "text-zinc-600 hover:text-black"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isEnglish ? 'Official A4 Document (8 Pages)' : 'เอกสารคู่มือมาตรฐาน A4 (8 หน้า)'}</span>
          </button>
        </div>

        <div className="text-xs text-zinc-600 flex items-center gap-2">
          <span className="font-mono bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded text-[11px] font-semibold text-black">
            SOP-PROC-2026-001 (Rev. 3.0)
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="text-[11px] text-black font-semibold flex items-center gap-1 border border-zinc-300 px-2 py-0.5 rounded bg-zinc-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-black" />
            มาตรฐาน ISO 9001:2015
          </span>
        </div>
      </div>

      {/* Content Rendering Branch: Official A4 Document vs Interactive Web Guide */}
      {viewMode === 'official-document' ? (
        <div className="space-y-4">
          <div className="bg-zinc-100 border-2 border-zinc-300 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-black shadow-xs print:hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <strong className="block text-black font-bold text-sm">
                  {isEnglish ? 'Official Standard Operating Procedure (SOP) Manual' : 'เอกสารคู่มือมาตรฐานการปฏิบัติงานระบบจัดซื้อและคลังสินค้า (ฉบับจริง)'}
                </strong>
                <p className="text-zinc-600 text-[11.5px] mt-0.5">
                  จัดหน้ากระดาษตามมาตรฐาน A4 Portrait (210 x 297 มม.) ทั้ง 8 หน้า พร้อมผังกระบวนการ สิทธิ์การใช้งาน และตารางสรุปปุ่ม เหมาะสำหรับการสั่งพิมพ์หรือบันทึก PDF
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handlePrint('standard-manual-doc')}
                className="px-4 py-2 rounded-full bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="พิมพ์คู่มือมาตรฐานขนาด A4 (หรือเลือกบันทึกเป็น PDF ผ่านเมนูพิมพ์)"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>พิมพ์เอกสารนี้</span>
              </button>
            </div>
          </div>

          <StandardManualDocument id="standard-manual-doc" />
        </div>
      ) : (
        <>
          {/* 2. Structured Section / Part Selection Deck */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-black" />
                <h2 className="text-sm font-bold text-black">
                  {isEnglish ? 'Organized by System Parts & Workflow Chapters' : 'จัดหมวดหมู่คู่มือตามส่วนงาน (6 ส่วนหลัก)'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={expandAll}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-600 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  {isEnglish ? 'Expand All' : 'ขยายทั้งหมด'}
                </button>
                <span className="text-zinc-300">|</span>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-600 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  {isEnglish ? 'Collapse All' : 'ย่อทั้งหมด'}
                </button>
              </div>
            </div>

            {/* Part Cards Deck */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedPart('all');
                  setSelectedModule('all');
                }}
                className={cn(
                  "p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between",
                  selectedPart === 'all'
                    ? "bg-black text-white border-black shadow-xs"
                    : "bg-white hover:bg-zinc-50 border-zinc-200 hover:border-black text-black shadow-xs"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded",
                      selectedPart === 'all' ? "bg-zinc-800 text-white" : "bg-zinc-100 text-black border border-zinc-300"
                    )}>
                      ALL
                    </span>
                    <span className="text-[10px] opacity-75 font-mono">12 โมดูล</span>
                  </div>
                  <p className="font-bold text-xs leading-tight">
                    {isEnglish ? 'All Parts' : 'ดูทุกส่วนงาน'}
                  </p>
                </div>
                <p className="text-[10px] opacity-75 mt-1 truncate">
                  {isEnglish ? 'Complete Guide' : 'คู่มือฉบับสมบูรณ์'}
                </p>
              </button>

              {MANUAL_PARTS.map((p) => {
                const isSelected = selectedPart === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPart(p.id);
                      setSelectedModule('all');
                    }}
                    className={cn(
                      "p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between group",
                      isSelected
                        ? "bg-black text-white border-black shadow-xs"
                        : "bg-white hover:bg-zinc-50 border-zinc-200 hover:border-black text-black shadow-xs"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={cn(
                          "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold border",
                          isSelected ? "bg-white text-black border-white" : "bg-zinc-100 text-black border-zinc-300"
                        )}>
                          {p.partNumber}
                        </span>
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                          isSelected ? "bg-zinc-800 text-white border-zinc-700" : "bg-zinc-100 text-zinc-800 border-zinc-200"
                        )}>
                          {p.moduleCount} โมดูล
                        </span>
                      </div>
                      <p className="font-bold text-xs leading-tight line-clamp-1">
                        {isEnglish ? p.titleEn.split(':')[1] || p.titleEn : p.titleTh.split(':')[1] || p.titleTh}
                      </p>
                    </div>
                    <p className={cn(
                      "text-[10px] mt-1.5 line-clamp-1 leading-normal",
                      isSelected ? "text-zinc-300" : "text-zinc-500 group-hover:text-black"
                    )}>
                      {isEnglish ? p.summaryEn : p.summaryTh}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Quick In-Page Anchor Jump Pills */}
            <div className="bg-white p-2 rounded-2xl border-2 border-zinc-200 shadow-xs flex items-center gap-1.5 overflow-x-auto smooth-scroll text-xs">
              <span className="text-[11px] font-bold text-zinc-500 px-2 shrink-0 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-black" />
                {isEnglish ? 'Jump to:' : 'ข้ามไปที่:'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedModule('all')}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer",
                  selectedModule === 'all'
                    ? "bg-black text-white shadow-xs"
                    : "text-zinc-700 hover:bg-zinc-100 hover:text-black"
                )}
              >
                {isEnglish ? 'All In Part' : 'ทั้งหมดในส่วนนี้'}
              </button>
              {(selectedPart === 'all' ? modules : modules.filter(m => m.partId === selectedPart)).map(m => {
                const MIcon = m.icon;
                const isCurrent = selectedModule === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedModule(m.id);
                      setExpandedModules(prev => ({ ...prev, [m.id]: true }));
                      const el = document.getElementById(m.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer",
                      isCurrent
                        ? "bg-black text-white shadow-xs font-bold"
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-black"
                    )}
                  >
                    <MIcon className="w-3 h-3 shrink-0" />
                    <span>{isEnglish ? m.titleEn.split('.')[1] || m.titleEn : m.title.split('.')[1] || m.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

      {/* 3. Visual Workflow Diagram (Always prominent) */}
      {(selectedModule === 'all' || selectedModule === 'flow-overview') && !searchQuery && (
        <div className="bg-white rounded-3xl border-2 border-zinc-200 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-zinc-100 text-black border border-zinc-300">
                  <Layers className="w-4 h-4 text-black" />
                </span>
                <h2 className="text-lg font-bold text-black">
                  {isEnglish ? 'Visual Lifecycle Flowchart & Linkages' : 'ผังภาพแสดงลำดับขั้นตอนการเชื่อมโยงระบบ (End-to-End Workflow)'}
                </h2>
              </div>
              <p className="text-xs text-zinc-600 mt-1">
                {isEnglish 
                  ? 'Visual flowchart mapping data relationships between PR, Approval, PO, Inventory, and Reports.'
                  : 'แสดงความสัมพันธ์และการไหลของข้อมูลจากต้นทางสู่ปลายทางใน 7 ลำดับขั้นหลัก'}
              </p>
            </div>
          </div>

          {/* Interactive Flow Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            
            {/* Step 1 */}
            <div className="p-4 rounded-2xl border-2 border-zinc-200 hover:border-black transition-colors bg-white relative space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-bold">
                ขั้นตอนที่ 1
              </span>
              <h3 className="font-bold text-black text-sm flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-black" />
                เปิดคำขอซื้อ (PR)
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                วิศวกรสนามสร้างคำขอซื้อ ระบุโครงการ สเปกวัสดุ หรือเลือกเทมเพลต BOQ แล้วกด <strong>&ldquo;ส่งขออนุมัติ&rdquo;</strong>
              </p>
              <div className="pt-2 text-[11px] text-black font-bold flex items-center gap-1 border-t border-zinc-200">
                <span>ส่งต่อไปยังการอนุมัติ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl border-2 border-zinc-200 hover:border-black transition-colors bg-white relative space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-bold">
                ขั้นตอนที่ 2
              </span>
              <h3 className="font-bold text-black text-sm flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-black" />
                พิจารณาอนุมัติ (Approval)
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                ผู้อนุมัติตรวจเอกสาร A4 เช็กกรอบงบประมาณ BOQ แล้วกด <strong>&ldquo;อนุมัติคำขอ&rdquo;</strong> ลงนามดิจิทัล
              </p>
              <div className="pt-2 text-[11px] text-black font-bold flex items-center gap-1 border-t border-zinc-200">
                <span>ส่งต่อไปยังฝ่ายจัดซื้อ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl border-2 border-zinc-200 hover:border-black transition-colors bg-white relative space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-bold">
                ขั้นตอนที่ 3
              </span>
              <h3 className="font-bold text-black text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-black" />
                ออกใบสั่งซื้อ (PO)
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                ฝ่ายจัดซื้อกด <strong>&ldquo;สร้าง PO จาก PR ที่อนุมัติแล้ว&rdquo;</strong> เลือกผู้ขาย และส่งเอกสารสั่งของ
              </p>
              <div className="pt-2 text-[11px] text-black font-bold flex items-center gap-1 border-t border-zinc-200">
                <span>รอผู้ขายส่งมอบสินค้า</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-2xl border-2 border-zinc-200 hover:border-black transition-colors bg-white relative space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-bold">
                ขั้นตอนที่ 4
              </span>
              <h3 className="font-bold text-black text-sm flex items-center gap-1.5">
                <Package className="w-4 h-4 text-black" />
                ตรวจรับของหน้างาน
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                ของมาส่งหน้างาน เจ้าหน้าที่กด <strong>&ldquo;ตรวจรับสินค้า&rdquo;</strong> ในหน้า PO บันทึกจำนวนที่รับจริง
              </p>
              <div className="pt-2 text-[11px] text-black font-bold flex items-center gap-1 border-t border-zinc-200">
                <span>อัปเดตสต็อกคลังทันที</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-2xl border-2 border-zinc-200 hover:border-black transition-colors bg-white relative space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-bold">
                ขั้นตอนที่ 5
              </span>
              <h3 className="font-bold text-black text-sm flex items-center gap-1.5">
                <Package className="w-4 h-4 text-black" />
                เข้าสต็อกคลัง (Inventory)
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                ยอดสต็อกเพิ่มอัตโนมัติ เจ้าหน้าที่กด <strong>&ldquo;พิมพ์ป้าย QR&rdquo;</strong> ติดสติกเกอร์ที่กล่องสินค้า
              </p>
              <div className="pt-2 text-[11px] text-black font-bold flex items-center gap-1 border-t border-zinc-200">
                <span>พร้อมสแกนใช้งาน</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 6 */}
            <div className="p-4 rounded-2xl border-2 border-zinc-200 hover:border-black transition-colors bg-white relative space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-bold">
                ขั้นตอนที่ 6
              </span>
              <h3 className="font-bold text-black text-sm flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-black" />
                สแกนกล้องสด & เบิกจ่าย
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                กด <strong>&ldquo;สแกน QR&rdquo;</strong> ส่องกล้องมือถือ/เว็บแคม เพื่อเบิกของไปไซต์งาน หรือตรวจนับยอดจริง
              </p>
              <div className="pt-2 text-[11px] text-black font-bold flex items-center gap-1 border-t border-zinc-200">
                <span>ตัดยอดสต็อกแบบ Real-time</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 7 */}
            <div className="p-4 rounded-2xl border-2 border-zinc-200 hover:border-black transition-colors bg-white relative space-y-2 md:col-span-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-bold">
                ขั้นตอนที่ 7
              </span>
              <h3 className="font-bold text-black text-sm flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-black" />
                วิเคราะห์ต้นทุนและสรุปผู้บริหาร (Reports & Analytics)
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                ข้อมูลทุกกระบวนการจะถูกประมวลผลเป็นสถิติเปรียบเทียบงบประมาณ วิเคราะห์ผู้ขาย และส่งออกเป็น Excel / PDF สำหรับรายงานที่ประชุม
              </p>
              <div className="pt-2 text-[11px] text-black font-bold flex items-center gap-1 border-t border-zinc-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                <span>วงจรจัดซื้อและบริหารคลังสมบูรณ์แบบ</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. Detailed Module Sections */}
      <div className="space-y-6">
        {filteredModules.map((m, idx) => {
          const Icon = m.icon;
          const isExpanded = Boolean(expandedModules[m.id]);
          const isNewPart = idx === 0 || m.partId !== filteredModules[idx - 1]?.partId;
          const partInfo = MANUAL_PARTS.find(p => p.id === m.partId);

          return (
            <React.Fragment key={m.id}>
              {/* Part Section Header Banner */}
              {isNewPart && (
                <div className="bg-black text-white rounded-2xl p-5 sm:p-6 shadow-xs border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 first:mt-0">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      {m.partNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                          {isEnglish ? `Part ${m.partNumber}` : `ส่วนที่ ${m.partNumber}`}
                        </span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-[11px] text-zinc-300">
                          {modules.filter(item => item.partId === m.partId).length} {isEnglish ? 'Modules' : 'โมดูลงาน'}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                        {isEnglish ? m.partTitleEn : m.partTitleTh}
                      </h3>
                    </div>
                  </div>

                  {partInfo && (
                    <div className="text-xs text-zinc-300 font-medium bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-xl max-w-md self-start sm:self-auto leading-relaxed">
                      {isEnglish ? partInfo.summaryEn : partInfo.summaryTh}
                    </div>
                  )}
                </div>
              )}

              {/* Module Card */}
              <div 
                id={m.id}
                className="bg-white rounded-2xl border-2 border-zinc-200 hover:border-zinc-400 overflow-hidden shadow-xs scroll-mt-24 transition-all"
              >
                {/* Module Header Bar */}
                <div 
                  onClick={() => toggleModule(m.id)}
                  className="p-4 sm:p-5 bg-zinc-50 hover:bg-zinc-100/80 border-b-2 border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors select-none"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-800">
                          {isEnglish ? `Part ${m.partNumber}` : `ส่วนที่ ${m.partNumber}`}
                        </span>
                        <h2 className="text-base sm:text-lg font-bold text-black leading-snug">
                          {isEnglish ? m.titleEn : m.title}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-black border border-zinc-300">
                          {m.badge}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 font-medium mt-1 flex items-center gap-1.5">
                        <span className="font-bold text-black">ผู้รับผิดชอบหลัก:</span> 
                        <span className="text-zinc-600">{m.role}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {m.route && (
                      <Link
                        to={m.route}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-zinc-300 hover:border-black bg-white hover:bg-zinc-100 text-black text-xs font-bold transition-all shadow-2xs"
                      >
                        <span>{isEnglish ? 'Open Module' : 'ไปยังหน้านี้'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleModule(m.id);
                      }}
                      className="p-1.5 rounded-full bg-white border-2 border-zinc-200 hover:border-black text-black transition-colors cursor-pointer shadow-2xs"
                      title={isExpanded ? 'ย่อเนื้อหา' : 'ขยายเนื้อหาทั้งหมด'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-black" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-black" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsed Preview Strip */}
                {!isExpanded && (
                  <div 
                    onClick={() => toggleModule(m.id)}
                    className="p-4 bg-white hover:bg-zinc-50/50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <p className="text-zinc-600 line-clamp-2 leading-relaxed flex-1">
                      {isEnglish ? m.summaryEn : m.summary}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-zinc-700 font-medium px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50">
                        🔗 {m.linkages.length} จุดเชื่อมต่อ
                      </span>
                      <span className="text-[11px] text-black font-medium px-2 py-0.5 rounded border border-zinc-300 bg-zinc-100">
                        🕹️ {m.buttons.length} ปุ่มคำสั่ง
                      </span>
                      <span className="text-[11px] text-zinc-800 font-medium px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50">
                        💡 {m.tips.length} ข้อควรปฏิบัติ
                      </span>
                      <span className="text-xs text-black font-bold hover:underline ml-1">
                        {isEnglish ? 'Read details &darr;' : 'อ่านรายละเอียด &darr;'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Expanded Detailed Module Sections */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 space-y-6 bg-white animate-in fade-in duration-200">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-black" />
                        วัตถุประสงค์และการทำงาน (Objective & Scope)
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed bg-zinc-50 p-3.5 rounded-xl border-2 border-zinc-200">
                        {isEnglish ? m.summaryEn : m.summary}
                      </p>
                    </div>

                    {/* Workflow Linkages */}
                    {m.linkages.length > 0 && (
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-black" />
                          การเชื่อมโยงกับฟีเจอร์อื่นในระบบ (Feature Linkages)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {m.linkages.map((link, lIdx) => (
                            <div key={lIdx} className="p-3 rounded-xl border-2 border-zinc-200 bg-zinc-50/60 text-xs space-y-1">
                              <div className="flex items-center gap-1.5 font-bold text-black">
                                <span className="text-black">{link.from}</span>
                                <ArrowRight className="w-3 h-3 text-zinc-400" />
                                <span className="text-zinc-700">{link.to}</span>
                              </div>
                              <p className="text-zinc-600 text-[11.5px] leading-relaxed">
                                {link.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Glossary if any */}
                    {m.statuses && m.statuses.length > 0 && (
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-black" />
                          ความหมายของสถานะเอกสาร (Document Statuses)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {m.statuses.map((st, sIdx) => (
                            <div key={sIdx} className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 flex items-start gap-2 text-xs">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-zinc-300 bg-white text-black shrink-0">
                                {st.status}
                              </span>
                              <span className="text-[11.5px] text-zinc-700 leading-snug">
                                {st.desc}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Buttons Dictionary */}
                    {m.buttons.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-black" />
                            คู่มือคำอธิบายปุ่มและการกดใช้งาน (Button & Action Guide)
                          </h4>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {m.buttons.length} รายการคำสั่ง
                          </span>
                        </div>
                        <div className="overflow-x-auto border-2 border-zinc-200 rounded-xl">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-zinc-100 border-b-2 border-zinc-200 text-black font-bold">
                                <th className="py-2.5 px-3 w-48">ชื่อปุ่ม / การสั่งการ</th>
                                <th className="py-2.5 px-3 w-40">ตำแหน่งในหน้าจอ</th>
                                <th className="py-2.5 px-3">การทำงานเมื่อกด (Action)</th>
                                <th className="py-2.5 px-3 w-56">ผลลัพธ์และการเชื่อมโยง</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 text-[11.5px]">
                              {m.buttons.map((btn, bIdx) => {
                                const BtnIcon = btn.icon;
                                return (
                                  <tr key={bIdx} className="hover:bg-zinc-50 transition-colors">
                                    <td className="py-2.5 px-3 align-top">
                                      <div className="flex items-center gap-1.5 font-bold text-black">
                                        {BtnIcon && <BtnIcon className="w-3.5 h-3.5 text-black shrink-0" />}
                                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold border border-zinc-300 bg-zinc-100 text-black">
                                          {btn.name}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3 align-top text-zinc-600 font-medium">
                                      {btn.location}
                                    </td>
                                    <td className="py-2.5 px-3 align-top text-zinc-800 leading-relaxed">
                                      {btn.action}
                                    </td>
                                    <td className="py-2.5 px-3 align-top text-black font-medium leading-relaxed">
                                      {btn.linkage}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Practical Tips */}
                    {m.tips.length > 0 && (
                      <div className="p-3.5 rounded-xl border-2 border-zinc-300 bg-zinc-100 text-xs text-black space-y-1">
                        <span className="font-bold flex items-center gap-1 text-black">
                          <Sparkles className="w-3.5 h-3.5 text-black" />
                          เคล็ดลับและข้อควรระวังในการปฏิบัติงาน (Best Practices)
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-zinc-700 text-[11.5px] pl-1">
                          {m.tips.map((tip, tIdx) => (
                            <li key={tIdx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}

        {filteredModules.length === 0 && (
          <div className="bg-white rounded-2xl border-2 border-zinc-200 p-12 text-center text-zinc-500">
            <HelpCircle className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
            <h3 className="font-bold text-black text-base">ไม่พบข้อมูลที่ตรงกับคำค้นหา</h3>
            <p className="text-xs text-zinc-500 mt-1">โปรดลองพิมพ์คำค้นอื่น เช่น &ldquo;สแกน QR&rdquo;, &ldquo;อนุมัติ&rdquo;, &ldquo;PO&rdquo; หรือล้างการค้นหา</p>
          </div>
        )}
      </div>

      {/* 5. Frequently Asked Questions (FAQ) Section */}
      <div className="bg-white rounded-3xl border-2 border-zinc-200 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
          <HelpCircle className="w-5 h-5 text-black" />
          <h3 className="text-base font-bold text-black">
            {isEnglish ? 'Frequently Asked Questions (FAQ)' : 'คำถามที่พบบ่อยและการแก้ปัญหา (FAQ & Troubleshooting)'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1.5">
            <h4 className="font-bold text-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black" />
              1. สแกน QR Code แล้วกล้องไม่เปิด หรือขึ้นข้อความแจ้งเตือน?
            </h4>
            <p className="text-zinc-600 leading-relaxed text-[11.5px]">
              ตรวจสอบสิทธิ์การใช้งานกล้องในเบราว์เซอร์ (คลิกที่ไอคอนแม่กุญแจหน้ารายการ URL) แล้วเลือกอนุญาต (Allow) การใช้กล้อง หรือสามารถสลับไปใช้แท็บ <strong>&ldquo;อัปโหลดรูปภาพ&rdquo;</strong> หรือ <strong>&ldquo;กรอกรหัสด้วยตนเอง&rdquo;</strong> ได้ทันที
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1.5">
            <h4 className="font-bold text-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black" />
              2. ใบขอซื้อ (PR) ได้รับอนุมัติแล้ว แต่ทำไมยังไม่มีสินค้ามาส่ง?
            </h4>
            <p className="text-zinc-600 leading-relaxed text-[11.5px]">
              เมื่อ PR อนุมัติแล้ว ฝ่ายจัดซื้อจะต้องไปที่เมนู <strong>&ldquo;ระบบจัดซื้อ (PO)&rdquo;</strong> แล้วกดปุ่ม <strong>&ldquo;สร้าง PO จาก PR ที่อนุมัติแล้ว&rdquo;</strong> เพื่อออกใบสั่งซื้อและส่งไปยังคู่ค้าอย่างเป็นทางการก่อน
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1.5">
            <h4 className="font-bold text-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black" />
              3. สินค้ามาส่งหน้างานไม่ครบตามจำนวนใน PO ทำอย่างไร?
            </h4>
            <p className="text-zinc-600 leading-relaxed text-[11.5px]">
              สามารถกด <strong>&ldquo;ตรวจรับสินค้า&rdquo;</strong> ในหน้า PO แล้วกรอกเฉพาะจำนวนที่มาส่งจริงในงวดนั้น ระบบจะปรับสถานะเป็น <strong>Partially Received (รับบางส่วน)</strong> และบันทึกยอดค้างส่งไว้รอรับในงวดถัดไป
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1.5">
            <h4 className="font-bold text-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black" />
              4. ต้องการนำระบบไปใช้งานในสมาร์ทโฟนโดยไม่ต้องโหลดแอป?
            </h4>
            <p className="text-zinc-600 leading-relaxed text-[11.5px]">
              เปิดเบราว์เซอร์บนมือถือ แล้วกดปุ่ม <strong>&ldquo;ติดตั้งแอป Conerage store&rdquo;</strong> ที่แถบเมนูข้าง หรือกด Share &gt; &ldquo;Add to Home Screen&rdquo; บน Safari / Chrome ระบบจะติดตั้งเป็น PWA บนหน้าจอหลัก ใช้งานได้รวดเร็วเสมือนแอปจริง
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1.5">
            <h4 className="font-bold text-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black" />
              5. นำเข้าไฟล์ Excel หรือ BOQ แล้วหัวคอลัมน์ไม่ตรงกับระบบ ทำอย่างไร?
            </h4>
            <p className="text-zinc-600 leading-relaxed text-[11.5px]">
              ในหน้า <strong>&ldquo;ศูนย์นำเข้าข้อมูล (Data Import Hub)&rdquo;</strong> หลังจากอัปโหลดไฟล์ ระบบจะมีขั้นตอน <strong>&ldquo;จับคู่คอลัมน์ (Auto-Map Columns)&rdquo;</strong> ให้ท่านเลือกแมปหัวตารางจากไฟล์ของท่านเข้ากับฟิลด์ของระบบได้อย่างอิสระ หรือสามารถกด <strong>&ldquo;ดาวน์โหลดเทมเพลตมาตรฐาน&rdquo;</strong> ไปใช้เป็นต้นแบบได้
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1.5">
            <h4 className="font-bold text-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black" />
              6. ขนาดตัวหนังสือและตารางบนหน้าจอคอมพิวเตอร์ใหญ่หรือเล็กเกินไป?
            </h4>
            <p className="text-zinc-600 leading-relaxed text-[11.5px]">
              ไปที่เมนู <strong>&ldquo;ตั้งค่า (Settings)&rdquo;</strong> ในส่วน <strong>&ldquo;ความละเอียดการแสดงผล (Display Density)&rdquo;</strong> สามารถเลือกปรับสเกลเป็น <strong>80% (กะทัดรัดสมดุล เหมาะกับโน้ตบุ๊ก)</strong>, 90%, 100% หรือ 110% ระบบจะปรับขนาด UI ทันทีและจดจำค่าไว้ตลอดการใช้งาน
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1.5">
            <h4 className="font-bold text-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black" />
              7. ป้ายบาร์โค้ด Master SKU รองรับเครื่องพิมพ์และเครื่องยิงแบบใดบ้าง?
            </h4>
            <p className="text-zinc-600 leading-relaxed text-[11.5px]">
              รองรับเครื่องยิงบาร์โค้ดไร้สายทั่วไป (Wireless / USB Barcode Scanner Gun) และกล้องมือถือ สำหรับการพิมพ์ป้าย รองรับทั้งเครื่องพิมพ์สติกเกอร์ความร้อน (Direct Thermal Label Printer เช่น Xprinter, Zebra) ขนาด 50x30 มม., 75x50 มม., ป้ายติดชั้นวาง (Shelf Tag) และเครื่องพิมพ์ A4
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1.5">
            <h4 className="font-bold text-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black" />
              8. การตั้งค่าแจ้งเตือนการขออนุมัติเข้ากลุ่ม LINE (LINE Notify)?
            </h4>
            <p className="text-zinc-600 leading-relaxed text-[11.5px]">
              ไปที่เมนู <strong>&ldquo;เชื่อมต่อคลาวด์/API (Cloud Sync)&rdquo;</strong> ในการ์ด LINE Notify นำ Token จาก notify-bot.line.me มาวางและระบุชื่อกลุ่ม จากนั้นกด <strong>&ldquo;ทดสอบส่งข้อความ&rdquo;</strong> ระบบจะส่งแจ้งเตือนข้อความพร้อมลิงก์เอกสารเข้ากลุ่มไลน์ทันทีที่มีคำขออนุมัติใหม่
            </p>
          </div>
        </div>
      </div>

      {/* Hidden print container for standard A4 printing in interactive mode */}
      <div className="hidden print:block">
        <StandardManualDocument id="standard-manual-doc" />
      </div>
    </>
  )}

  {/* Official A4 Document Preview Modal */}
  {isPreviewModalOpen && (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:hidden">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border-2 border-black overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-white px-5 py-3.5 border-b-2 border-zinc-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-black text-sm">
                ตัวอย่างเอกสารคู่มือมาตรฐานการปฏิบัติงาน (Standard A4 SOP Preview)
              </h3>
              <p className="text-[11px] text-zinc-500">
                เอกสารทางการ 8 หน้า • รหัส SOP-PROC-2026-001 (Rev. 3.0)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePrint('standard-manual-doc-modal')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black hover:bg-zinc-800 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
              title="พิมพ์เอกสารมาตรฐาน A4 (หรือเลือกบันทึกเป็น PDF ผ่านเมนูพิมพ์)"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>พิมพ์เอกสาร</span>
            </button>
            <button
              onClick={() => setIsPreviewModalOpen(false)}
              className="p-1.5 rounded-full text-zinc-400 hover:text-black hover:bg-zinc-100 ml-2 cursor-pointer transition-colors"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Document View */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-zinc-100 flex-1">
          <StandardManualDocument id="standard-manual-doc-modal" className="py-0" />
        </div>
      </div>
    </div>
  )}

</div>
);
}
