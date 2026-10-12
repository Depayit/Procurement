import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
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
  History
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { StandardManualDocument } from '../components/StandardManualDocument';
import { printA4Document } from '../lib/pdf';

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

export function ManualPage() {
  const { isEnglish, isThai } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'interactive' | 'official-document'>('interactive');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const handlePrint = (docId = 'standard-manual-doc') => {
    printA4Document(docId, 'ProcureSync_คู่มือมาตรฐานการปฏิบัติงาน_SOP');
  };

  const modules: ModuleSection[] = [
    {
      id: 'flow-overview',
      title: 'แผนผังการเชื่อมโยงระบบทั้งวงจร',
      titleEn: 'End-to-End System Workflow Map',
      icon: Layers,
      badge: 'Core Workflow',
      role: 'ผู้ใช้งานทุกบทบาทในองค์กร (All Roles)',
      summary: 'ภาพรวมกระบวนการจัดซื้อและบริหารคลังสินค้าของ ProcureSync ตั้งแต่การเปิดคำขอซื้อหน้างาน การอนุมัติ การออกใบสั่งซื้อ การตรวจรับของ จนถึงการจัดการสต็อกและสแกน QR Code',
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
          description: 'เพิ่มไอคอน ProcureSync บนหน้าจอหลัก เข้าใช้งานได้เสมือนแอปเนทีฟ'
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
          name: 'ติดตั้งแอป ProcureSync (Install PWA)',
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
          action: 'ระบบจะวิเคราะห์ชื่อหัวตารางในไฟล์และจับคู่เข้ากับฐานข้อมูลของ ProcureSync โดยอัตโนมัติ ผู้ใช้สามารถปรับเปลี่ยนการจับคู่ได้ตามต้องการ',
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
      title: '10. การเชื่อมต่อคลาวด์และแจ้งเตือน (Cloud Sync, Integrations & Webhooks)',
      titleEn: '10. Cloud Sync, Enterprise Integrations & Webhooks',
      icon: Cloud,
      badge: 'Enterprise Connectivity',
      role: 'ผู้ดูแลระบบ (Admin) / เจ้าหน้าที่ไอที / ผู้จัดการโครงการ',
      summary: 'เชื่อมต่อและซิงก์ข้อมูลระหว่าง ProcureSync กับคลาวด์สตอเรจและแพลตฟอร์มภายนอก รองรับการซิงก์ข้อมูลสองทางกับ Google Sheets ด้วย Google Apps Script, สำรองฐานข้อมูลบน Google Drive และ Dropbox, ระบบแจ้งเตือนอัตโนมัติผ่าน LINE Notify / LINE Alert เข้ากลุ่มไลน์โครงการเมื่อมีเอกสารรออนุมัติหรือตรวจรับสินค้า และสภาพแวดล้อมจำลอง (MVP Presentation Sandbox)',
      summaryEn: 'Enterprise cloud connectivity featuring two-way Google Sheets synchronization, Google Apps Script webhooks, Google Drive/Dropbox system backups, automated LINE Notify alerts, and interactive MVP presentation sandbox.',
      route: '/integrations',
      linkages: [
        {
          from: 'Google Sheets สองทาง (Two-Way Sync)',
          to: 'คลังพัสดุและรายการขอซื้อ (ProcureSync)',
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
    }
  ];

  const filteredModules = useMemo(() => {
    return modules.filter(m => {
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
  }, [modules, selectedModule, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isEnglish ? 'ProcureSync System Documentation & SOP' : 'คู่มือการปฏิบัติงานมาตรฐานระบบจัดซื้อและคลังสินค้า (SOP)'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              {isEnglish ? 'Complete System User Manual' : 'คู่มือการใช้งานระบบฉบับสมบูรณ์'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isEnglish 
                ? 'Comprehensive guide detailing every module, button action, status workflow, and feature integration across the ProcureSync Enterprise platform.'
                : 'รวบรวมคำอธิบายทุกฟีเจอร์ ทุกปุ่มการทำงาน ผังการเชื่อมโยงข้อมูลระหว่างโมดูล (PR -> PO -> คลัง -> สแกน QR) และมาตรฐานการปฏิบัติงาน'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsPreviewModalOpen(true)}
              className="inline-flex items-center px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-xs border border-indigo-400/40 cursor-pointer"
              title="ดูตัวอย่างเอกสารคู่มือฉบับจริง A4"
            >
              <Eye className="w-4 h-4 mr-1.5" />
              <span>{isEnglish ? 'Preview A4 Document' : 'ดูตัวอย่างเอกสาร A4'}</span>
            </button>

            <button
              onClick={() => handlePrint('standard-manual-doc')}
              className="inline-flex items-center px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
              title="สั่งพิมพ์คู่มือฉบับมาตรฐาน A4 (8 หน้า)"
            >
              <Printer className="w-4 h-4 mr-1.5 text-indigo-600" />
              <span>{isEnglish ? 'Print Standard A4' : 'พิมพ์คู่มือมาตรฐาน A4'}</span>
            </button>
          </div>
        </div>

        {/* Search bar inside banner */}
        <div className="relative mt-6 max-w-xl">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEnglish ? 'Search any button, feature, or workflow (e.g. Scan QR, Approve, BOQ)...' : 'ค้นหาชื่อปุ่ม, ฟีเจอร์ หรือขั้นตอนการทำงาน (เช่น สแกน QR, อนุมัติ, ออก PO, ตรวจนับ)...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-inner"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white"
            >
              ล้างคำค้นหา
            </button>
          )}
        </div>
      </div>

      {/* View Mode Toggle Bar: Interactive vs Official SOP Document */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs print:hidden">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('interactive')}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              viewMode === 'interactive' 
                ? "bg-white text-slate-900 shadow-xs" 
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isEnglish ? 'Interactive Web View' : 'มุมมองหน้าเว็บแบบโต้ตอบ'}</span>
          </button>
          <button
            onClick={() => setViewMode('official-document')}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              viewMode === 'official-document' 
                ? "bg-white text-indigo-900 shadow-xs" 
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isEnglish ? 'Official A4 Document (8 Pages)' : 'เอกสารคู่มือมาตรฐาน A4 (8 หน้า)'}</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">
            SOP-PROC-2026-001 (Rev. 3.0)
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            มาตรฐาน ISO 9001:2015
          </span>
        </div>
      </div>

      {/* Content Rendering Branch: Official A4 Document vs Interactive Web Guide */}
      {viewMode === 'official-document' ? (
        <div className="space-y-4">
          <div className="bg-indigo-50/80 border border-indigo-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-950 shadow-2xs print:hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-900 font-bold text-sm">
                  {isEnglish ? 'Official Standard Operating Procedure (SOP) Manual' : 'เอกสารคู่มือมาตรฐานการปฏิบัติงานระบบจัดซื้อและคลังสินค้า (ฉบับจริง)'}
                </strong>
                <p className="text-slate-600 text-[11.5px] mt-0.5">
                  จัดหน้ากระดาษตามมาตรฐาน A4 Portrait (210 x 297 มม.) ทั้ง 8 หน้า พร้อมผังกระบวนการ สิทธิ์การใช้งาน และตารางสรุปปุ่ม เหมาะสำหรับการสั่งพิมพ์หรือบันทึก PDF
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handlePrint('standard-manual-doc')}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="พิมพ์คู่มือมาตรฐานขนาด A4 (หรือเลือกบันทึกเป็น PDF ผ่านเมนูพิมพ์)"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์เอกสารนี้</span>
              </button>
            </div>
          </div>

          <StandardManualDocument id="standard-manual-doc" />
        </div>
      ) : (
        <>
          {/* 2. Quick Navigation Tabs */}
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 overflow-x-auto smooth-scroll text-xs">
            <button
              onClick={() => setSelectedModule('all')}
          className={cn(
            "px-3.5 py-2 rounded-lg font-bold whitespace-nowrap transition-colors",
            selectedModule === 'all'
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          {isEnglish ? 'All Modules (View All)' : 'ดูทุกโมดูล (ทั้งหมด)'}
        </button>
        {modules.map(m => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedModule(m.id)}
              className={cn(
                "px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-colors flex items-center gap-1.5",
                selectedModule === m.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{isEnglish ? m.titleEn : m.title}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Visual Workflow Diagram (Always prominent) */}
      {(selectedModule === 'all' || selectedModule === 'flow-overview') && !searchQuery && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Layers className="w-4 h-4" />
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  {isEnglish ? 'Visual Lifecycle Flowchart & Linkages' : 'ผังภาพแสดงลำดับขั้นตอนการเชื่อมโยงระบบ (End-to-End Workflow)'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isEnglish 
                  ? 'Visual flowchart mapping data relationships between PR, Approval, PO, Inventory, and Reports.'
                  : 'แสดงความสัมพันธ์และการไหลของข้อมูลจากต้นทางสู่ปลายทางใน 7 ลำดับขั้นหลัก'}
              </p>
            </div>
          </div>

          {/* Interactive Flow Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            
            {/* Step 1 */}
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 relative space-y-2">
              <span className="inline-block px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold">
                ขั้นตอนที่ 1
              </span>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-indigo-600" />
                เปิดคำขอซื้อ (PR)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                วิศวกรสนามสร้างคำขอซื้อ ระบุโครงการ สเปกวัสดุ หรือเลือกเทมเพลต BOQ แล้วกด <strong>&ldquo;ส่งขออนุมัติ&rdquo;</strong>
              </p>
              <div className="pt-2 text-[11px] text-indigo-700 font-bold flex items-center gap-1 border-t border-indigo-100">
                <span>ส่งต่อไปยังการอนุมัติ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 relative space-y-2">
              <span className="inline-block px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">
                ขั้นตอนที่ 2
              </span>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-blue-600" />
                พิจารณาอนุมัติ (Approval)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ผู้อนุมัติตรวจเอกสาร A4 เช็กกรอบงบประมาณ BOQ แล้วกด <strong>&ldquo;อนุมัติคำขอ&rdquo;</strong> ลงนามดิจิทัล
              </p>
              <div className="pt-2 text-[11px] text-blue-700 font-bold flex items-center gap-1 border-t border-blue-100">
                <span>ส่งต่อไปยังฝ่ายจัดซื้อ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 relative space-y-2">
              <span className="inline-block px-2 py-0.5 rounded bg-purple-600 text-white text-[10px] font-bold">
                ขั้นตอนที่ 3
              </span>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-600" />
                ออกใบสั่งซื้อ (PO)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ฝ่ายจัดซื้อกด <strong>&ldquo;สร้าง PO จาก PR ที่อนุมัติแล้ว&rdquo;</strong> เลือกผู้ขาย และส่งเอกสารสั่งของ
              </p>
              <div className="pt-2 text-[11px] text-purple-700 font-bold flex items-center gap-1 border-t border-purple-100">
                <span>รอผู้ขายส่งมอบสินค้า</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 relative space-y-2">
              <span className="inline-block px-2 py-0.5 rounded bg-amber-600 text-white text-[10px] font-bold">
                ขั้นตอนที่ 4
              </span>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-600" />
                ตรวจรับของหน้างาน
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ของมาส่งหน้างาน เจ้าหน้าที่กด <strong>&ldquo;ตรวจรับสินค้า&rdquo;</strong> ในหน้า PO บันทึกจำนวนที่รับจริง
              </p>
              <div className="pt-2 text-[11px] text-amber-700 font-bold flex items-center gap-1 border-t border-amber-100">
                <span>อัปเดตสต็อกคลังทันที</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 relative space-y-2">
              <span className="inline-block px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                ขั้นตอนที่ 5
              </span>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
                เข้าสต็อกคลัง (Inventory)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ยอดสต็อกเพิ่มอัตโนมัติ เจ้าหน้าที่กด <strong>&ldquo;พิมพ์ป้าย QR&rdquo;</strong> ติดสติกเกอร์ที่กล่องสินค้า
              </p>
              <div className="pt-2 text-[11px] text-emerald-700 font-bold flex items-center gap-1 border-t border-emerald-100">
                <span>พร้อมสแกนใช้งาน</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 6 */}
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 relative space-y-2">
              <span className="inline-block px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold">
                ขั้นตอนที่ 6
              </span>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-600" />
                สแกนกล้องสด & เบิกจ่าย
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                กด <strong>&ldquo;สแกน QR&rdquo;</strong> ส่องกล้องมือถือ/เว็บแคม เพื่อเบิกของไปไซต์งาน หรือตรวจนับยอดจริง
              </p>
              <div className="pt-2 text-[11px] text-indigo-700 font-bold flex items-center gap-1 border-t border-indigo-100">
                <span>ตัดยอดสต็อกแบบ Real-time</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Step 7 */}
            <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 relative space-y-2 md:col-span-2">
              <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-white text-[10px] font-bold">
                ขั้นตอนที่ 7
              </span>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-slate-800" />
                วิเคราะห์ต้นทุนและสรุปผู้บริหาร (Reports & Analytics)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ข้อมูลทุกกระบวนการจะถูกประมวลผลเป็นสถิติเปรียบเทียบงบประมาณ วิเคราะห์ผู้ขาย และส่งออกเป็น Excel / PDF สำหรับรายงานที่ประชุม
              </p>
              <div className="pt-2 text-[11px] text-slate-700 font-bold flex items-center gap-1 border-t border-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>วงจรจัดซื้อและบริหารคลังสมบูรณ์แบบ</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. Detailed Module Sections */}
      <div className="space-y-6">
        {filteredModules.map((m) => {
          const Icon = m.icon;
          return (
            <div 
              key={m.id} 
              id={m.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs scroll-mt-20"
            >
              {/* Module Header */}
              <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        {isEnglish ? m.titleEn : m.title}
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                      <span className="font-bold text-slate-700">ผู้รับผิดชอบหลัก:</span> {m.role}
                    </p>
                  </div>
                </div>

                {m.route && (
                  <Link
                    to={m.route}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-indigo-400 bg-white hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 text-xs font-bold transition-all self-start sm:self-auto shrink-0 shadow-2xs"
                  >
                    <span>ไปยังหน้านี้</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* Module Description & Linkages */}
              <div className="p-5 sm:p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    วัตถุประสงค์และการทำงาน (Objective)
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {isEnglish ? m.summaryEn : m.summary}
                  </p>
                </div>

                {/* Workflow Linkages */}
                {m.linkages.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      การเชื่อมโยงกับฟีเจอร์อื่นในระบบ (Feature Linkages)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {m.linkages.map((link, lIdx) => (
                        <div key={lIdx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                            <span className="text-indigo-600">{link.from}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-800">{link.to}</span>
                          </div>
                          <p className="text-slate-600 text-[11.5px] leading-relaxed">
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
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      ความหมายของสถานะเอกสาร (Document Statuses)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {m.statuses.map((st, sIdx) => (
                        <div key={sIdx} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-start gap-2 text-xs">
                          <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border shrink-0", st.color)}>
                            {st.status}
                          </span>
                          <span className="text-[11.5px] text-slate-600 leading-snug">
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
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      คู่มือคำอธิบายปุ่มและการกดใช้งาน (Button & Action Guide)
                    </h4>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                            <th className="py-2.5 px-3 w-48">ชื่อปุ่ม / การสั่งการ</th>
                            <th className="py-2.5 px-3 w-40">ตำแหน่งในหน้าจอ</th>
                            <th className="py-2.5 px-3">การทำงานเมื่อกด (Action)</th>
                            <th className="py-2.5 px-3 w-56">ผลลัพธ์และการเชื่อมโยง</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11.5px]">
                          {m.buttons.map((btn, bIdx) => {
                            const BtnIcon = btn.icon;
                            return (
                              <tr key={bIdx} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-2.5 px-3 align-top">
                                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                    {BtnIcon && <BtnIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                                    <span className={cn("px-2 py-0.5 rounded text-[11px] font-semibold border", btn.color || 'bg-slate-100 text-slate-700 border-slate-200')}>
                                      {btn.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 align-top text-slate-500 font-medium">
                                  {btn.location}
                                </td>
                                <td className="py-2.5 px-3 align-top text-slate-700 leading-relaxed">
                                  {btn.action}
                                </td>
                                <td className="py-2.5 px-3 align-top text-indigo-700 font-medium leading-relaxed">
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
                  <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 text-xs text-amber-900 space-y-1">
                    <span className="font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      เคล็ดลับและข้อควรระวังในการปฏิบัติงาน (Best Practices)
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-amber-800 text-[11.5px] pl-1">
                      {m.tips.map((tip, tIdx) => (
                        <li key={tIdx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            </div>
          );
        })}

        {filteredModules.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-base">ไม่พบข้อมูลที่ตรงกับคำค้นหา</h3>
            <p className="text-xs text-slate-500 mt-1">โปรดลองพิมพ์คำค้นอื่น เช่น &ldquo;สแกน QR&rdquo;, &ldquo;อนุมัติ&rdquo;, &ldquo;PO&rdquo; หรือล้างการค้นหา</p>
          </div>
        )}
      </div>

      {/* 5. Frequently Asked Questions (FAQ) Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">
            {isEnglish ? 'Frequently Asked Questions (FAQ)' : 'คำถามที่พบบ่อยและการแก้ปัญหา (FAQ & Troubleshooting)'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              1. สแกน QR Code แล้วกล้องไม่เปิด หรือขึ้นข้อความแจ้งเตือน?
            </h4>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              ตรวจสอบสิทธิ์การใช้งานกล้องในเบราว์เซอร์ (คลิกที่ไอคอนแม่กุญแจหน้ารายการ URL) แล้วเลือกอนุญาต (Allow) การใช้กล้อง หรือสามารถสลับไปใช้แท็บ <strong>&ldquo;อัปโหลดรูปภาพ&rdquo;</strong> หรือ <strong>&ldquo;กรอกรหัสด้วยตนเอง&rdquo;</strong> ได้ทันที
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              2. ใบขอซื้อ (PR) ได้รับอนุมัติแล้ว แต่ทำไมยังไม่มีสินค้ามาส่ง?
            </h4>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              เมื่อ PR อนุมัติแล้ว ฝ่ายจัดซื้อจะต้องไปที่เมนู <strong>&ldquo;ระบบจัดซื้อ (PO)&rdquo;</strong> แล้วกดปุ่ม <strong>&ldquo;สร้าง PO จาก PR ที่อนุมัติแล้ว&rdquo;</strong> เพื่อออกใบสั่งซื้อและส่งไปยังคู่ค้าอย่างเป็นทางการก่อน
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              3. สินค้ามาส่งหน้างานไม่ครบตามจำนวนใน PO ทำอย่างไร?
            </h4>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              สามารถกด <strong>&ldquo;ตรวจรับสินค้า&rdquo;</strong> ในหน้า PO แล้วกรอกเฉพาะจำนวนที่มาส่งจริงในงวดนั้น ระบบจะปรับสถานะเป็น <strong>Partially Received (รับบางส่วน)</strong> และบันทึกยอดค้างส่งไว้รอรับในงวดถัดไป
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              4. ต้องการนำระบบไปใช้งานในสมาร์ทโฟนโดยไม่ต้องโหลดแอป?
            </h4>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              เปิดเบราว์เซอร์บนมือถือ แล้วกดปุ่ม <strong>&ldquo;ติดตั้งแอป ProcureSync&rdquo;</strong> ที่แถบเมนูข้าง หรือกด Share &gt; &ldquo;Add to Home Screen&rdquo; บน Safari / Chrome ระบบจะติดตั้งเป็น PWA บนหน้าจอหลัก ใช้งานได้รวดเร็วเสมือนแอปจริง
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              5. นำเข้าไฟล์ Excel หรือ BOQ แล้วหัวคอลัมน์ไม่ตรงกับระบบ ทำอย่างไร?
            </h4>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              ในหน้า <strong>&ldquo;ศูนย์นำเข้าข้อมูล (Data Import Hub)&rdquo;</strong> หลังจากอัปโหลดไฟล์ ระบบจะมีขั้นตอน <strong>&ldquo;จับคู่คอลัมน์ (Auto-Map Columns)&rdquo;</strong> ให้ท่านเลือกแมปหัวตารางจากไฟล์ของท่านเข้ากับฟิลด์ของระบบได้อย่างอิสระ หรือสามารถกด <strong>&ldquo;ดาวน์โหลดเทมเพลตมาตรฐาน&rdquo;</strong> ไปใช้เป็นต้นแบบได้
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              6. ขนาดตัวหนังสือและตารางบนหน้าจอคอมพิวเตอร์ใหญ่หรือเล็กเกินไป?
            </h4>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              ไปที่เมนู <strong>&ldquo;ตั้งค่า (Settings)&rdquo;</strong> ในส่วน <strong>&ldquo;ความละเอียดการแสดงผล (Display Density)&rdquo;</strong> สามารถเลือกปรับสเกลเป็น <strong>80% (กะทัดรัดสมดุล เหมาะกับโน้ตบุ๊ก)</strong>, 90%, 100% หรือ 110% ระบบจะปรับขนาด UI ทันทีและจดจำค่าไว้ตลอดการใช้งาน
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              7. ป้ายบาร์โค้ด Master SKU รองรับเครื่องพิมพ์และเครื่องยิงแบบใดบ้าง?
            </h4>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              รองรับเครื่องยิงบาร์โค้ดไร้สายทั่วไป (Wireless / USB Barcode Scanner Gun) และกล้องมือถือ สำหรับการพิมพ์ป้าย รองรับทั้งเครื่องพิมพ์สติกเกอร์ความร้อน (Direct Thermal Label Printer เช่น Xprinter, Zebra) ขนาด 50x30 มม., 75x50 มม., ป้ายติดชั้นวาง (Shelf Tag) และเครื่องพิมพ์ A4
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              8. การตั้งค่าแจ้งเตือนการขออนุมัติเข้ากลุ่ม LINE (LINE Notify)?
            </h4>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:hidden">
      <div className="bg-slate-100 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-white px-5 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                ตัวอย่างเอกสารคู่มือมาตรฐานการปฏิบัติงาน (Standard A4 SOP Preview)
              </h3>
              <p className="text-[11px] text-slate-500">
                เอกสารทางการ 8 หน้า • รหัส SOP-PROC-2026-001 (Rev. 3.0)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePrint('standard-manual-doc-modal')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
              title="พิมพ์เอกสารมาตรฐาน A4 (หรือเลือกบันทึกเป็น PDF ผ่านเมนูพิมพ์)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์เอกสาร</span>
            </button>
            <button
              onClick={() => setIsPreviewModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 ml-2 cursor-pointer transition-colors"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Document View */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-slate-200/80 flex-1">
          <StandardManualDocument id="standard-manual-doc-modal" className="py-0" />
        </div>
      </div>
    </div>
  )}

</div>
);
}
