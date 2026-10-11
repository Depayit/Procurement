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
  Plus
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

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
          name: 'บันทึก PDF A4 (Export PDF)',
          icon: Download,
          color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          location: 'ด้านล่างของหน้าต่างพรีวิวเอกสาร',
          action: 'ดาวน์โหลดไฟล์ PDF ขนาด A4 100% สัดส่วนมาตรฐานลงเครื่อง',
          linkage: 'ใช้ส่งต่อทางอีเมลหรือเก็บเข้าแฟ้มโครงการ'
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
      title: '4. คลังสินค้าและสแกนเนอร์กล้องสด (Inventory & Live QR/Barcode)',
      titleEn: '4. Inventory & Live QR/Barcode Scanner',
      icon: Package,
      badge: 'จัดการสต็อก & กล้องสด',
      role: 'เจ้าหน้าที่สโตร์ / เจ้าหน้าที่คลังสินค้า / วิศวกรเบิกจ่าย',
      summary: 'ควบคุมจำนวนสต็อกคงเหลือ จุดสั่งซื้อซ้ำ (Min Stock) การเบิกจ่าย โอนย้ายไซต์งาน พร้อมระบบสแกน QR Code/Barcode ด้วยกล้องจริง และระบบพิมพ์ป้ายสติกเกอร์สต็อก',
      summaryEn: 'Real-time inventory control, low-stock alerts, live camera barcode/QR scanner, physical count, and printable QR sticker labels.',
      route: '/inventory',
      linkages: [
        {
          from: 'ตรวจรับของจาก PO',
          to: 'คลังสินค้า (Inventory)',
          description: 'สต็อกจะเพิ่มขึ้นอัตโนมัติตามจำนวนที่ตรวจรับ'
        },
        {
          from: 'สแกน QR สินค้า',
          to: 'หน้าต่างรับเข้า / เบิกออก / ตรวจนับ',
          description: 'สแกนป้ายเพื่อเลือกทำรายการรับเข้า เบิกออก หรือตรวจนับได้ทันที'
        },
        {
          from: 'สต็อกต่ำกว่าระดับขั้นต่ำ (Low Stock)',
          to: 'ระบบขอซื้อ (PR)',
          description: 'แจ้งเตือนบนแดชบอร์ดเพื่อให้วิศวกรเปิด PR สั่งซื้อเติมสต็อก'
        }
      ],
      buttons: [
        {
          name: '📷 สแกน QR (Scan QR)',
          icon: QrCode,
          color: 'bg-white border-slate-300 text-slate-700',
          location: 'แถบเครื่องมือด้านบนหน้าคลังสินค้า',
          action: 'เปิดหน้าต่างสแกนเนอร์กล้องจริง (Webcam & มือถือ) มีระบบเสียง Beep และสั่นเตือน รองรับ QR Code และ Barcode ทุกประเภท',
          linkage: 'ตรวจพบสินค้าและเปิดเมนูดำเนินการด่วนทันที'
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
          name: 'อัปโหลดรูปภาพ QR (Upload Image Tab)',
          icon: Upload,
          color: 'bg-slate-100 text-slate-700',
          location: 'แท็บในหน้าต่างสแกนเนอร์',
          action: 'เลือกรูปถ่ายหรือแคปหน้าจอ QR Code เพื่อให้ระบบถอดรหัสทันที',
          linkage: 'ใช้งานได้แม้ไม่มีกล้องเชื่อมต่อ'
        },
        {
          name: 'กรอกรหัส / ทดสอบตัวอย่าง (Manual Code Tab)',
          color: 'bg-slate-100 text-slate-700',
          location: 'แท็บในหน้าต่างสแกนเนอร์',
          action: 'พิมพ์รหัส SKU ด้วยตนเอง หรือคลิกปุ่มตัวอย่างรหัสสินค้าในสต็อกเพื่อทดสอบในคลิกเดียว',
          linkage: 'ทดสอบระบบได้สะดวกรวดเร็ว'
        },
        {
          name: 'รับเข้า / เบิกออก (Receive / Issue)',
          icon: ArrowDownUp,
          color: 'bg-indigo-600 text-white',
          location: 'แถบเครื่องมือ / ปุ่มหลังสแกน QR',
          action: 'บันทึกการรับเข้าสต็อก, เบิกออกไปใช้ในไซต์งาน หรือโอนย้ายระหว่างสถานที่จัดเก็บ',
          linkage: 'ปรับปรุงยอดสต็อกและบันทึกประวัติการเคลื่อนไหว'
        },
        {
          name: 'ตรวจนับสต็อก (Physical Count)',
          icon: CheckSquare,
          color: 'bg-emerald-600 text-white',
          location: 'คอลัมน์การจัดการในตารางสินค้า / ปุ่มหลังสแกน QR',
          action: 'บันทึกยอดนับจริงหน้างาน คำนวณผลต่าง (+ / -) อัตโนมัติ พร้อมระบุหมายเหตุสาเหตุส่วนต่าง',
          linkage: 'ปรับยอดคงเหลือให้ตรงกับความเป็นจริง'
        },
        {
          name: 'พิมพ์ป้าย QR (Print QR Sticker Label)',
          icon: Printer,
          color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
          location: 'หน้าต่างรายละเอียดสินค้า (Details Modal)',
          action: 'เปิดตัวอย่างป้ายสติกเกอร์คลังสินค้าขนาดมาตรฐาน สั่งพิมพ์ผ่านเครื่องพิมพ์สติกเกอร์ หรือดาวน์โหลดเป็นไฟล์ภาพ PNG',
          linkage: 'นำป้ายไปแปะที่กล่องหรือชั้นวางเพื่อนำมาสแกนได้จริง'
        },
        {
          name: 'นำเข้า Excel (Import Spreadsheet)',
          icon: FileSpreadsheet,
          color: 'bg-white border-slate-300 text-slate-700',
          location: 'แถบเครื่องมือด้านบนหน้าคลังสินค้า',
          action: 'เลือกไฟล์ .xlsx หรือ .csv เพื่อนำเข้ารายการสินค้าหลายสิบรายการเข้าสู่ระบบพร้อมกัน',
          linkage: 'เพิ่มรายการสินค้าในสต็อกเป็นชุด'
        }
      ],
      tips: [
        'สามารถใช้สมาร์ทโฟนเปิดระบบผ่านเบราว์เซอร์ แล้วกด "สแกน QR" เพื่อเดินสแกนป้ายพัสดุในโกดังหรือหน้างานก่อสร้างได้แบบเรียลไทม์',
        'หากต้องการสแกนต่อเนื่องหลายรายการ เมื่อสแกนพบชิ้นแรกแล้ว ให้กดปุ่ม "สแกนชิ้นถัดไป (Scan Next Item)" กล้องจะเปิดทำงานต่อทันที'
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
      title: '7. ผู้ใช้งานและสิทธิ์การเข้าถึง (Users & Roles)',
      titleEn: '7. Users & Role-Based Permissions',
      icon: Users,
      badge: 'ความปลอดภัยระบบ',
      role: 'ผู้ดูแลระบบ (System Administrator)',
      summary: 'จัดการบัญชีผู้ใช้งาน กำหนดบทบาทหน้าที่ (Roles) และขอบเขตการเข้าถึงข้อมูลตามไซต์งาน เพื่อรักษาความปลอดภัยและความถูกต้องของข้อมูลองค์กร',
      summaryEn: 'User administration, role-based access control (RBAC), and site permissions.',
      route: '/users',
      linkages: [
        {
          from: 'สิทธิ์ของผู้ใช้งาน (User Role)',
          to: 'ทุกฟังก์ชันในระบบ',
          description: 'ควบคุมว่าใครสามารถสร้าง PR, อนุมัติเอกสาร, ออก PO หรือจัดการคลังสินค้าได้'
        }
      ],
      statuses: [
        { status: 'Admin', color: 'bg-purple-100 text-purple-800', desc: 'ผู้ดูแลระบบ มีสิทธิ์เข้าถึงและจัดการทุกส่วนของระบบ' },
        { status: 'Approver', color: 'bg-indigo-100 text-indigo-800', desc: 'ผู้มีอำนาจอนุมัติเอกสาร (ผู้จัดการโครงการ / ผู้บริหาร)' },
        { status: 'Purchaser', color: 'bg-blue-100 text-blue-800', desc: 'เจ้าหน้าที่จัดซื้อ สามารถออก PO และจัดการคู่ค้า' },
        { status: 'Requester', color: 'bg-slate-100 text-slate-800', desc: 'ผู้ขอซื้อหน้างาน สามารถสร้างและติดตามสถานะ PR ของตนเอง' }
      ],
      buttons: [
        {
          name: '+ เพิ่มผู้ใช้งานใหม่ (Add User)',
          icon: Plus,
          color: 'bg-indigo-600 text-white',
          location: 'มุมบนขวาของหน้า Users',
          action: 'สร้างบัญชีผู้ใช้งานใหม่ กำหนดชื่อ อีเมล บทบาท และแผนก/ไซต์งานที่สังกัด',
          linkage: 'สร้างบัญชีเข้าใช้งานระบบ'
        },
        {
          name: 'แก้ไขสิทธิ์ / บทบาท (Edit Role)',
          color: 'text-indigo-600 hover:text-indigo-800',
          location: 'ตารางรายชื่อผู้ใช้งาน',
          action: 'ปรับเปลี่ยนบทบาท เช่น เลื่อนระดับจาก Requester เป็น Approver',
          linkage: 'อัปเดตสิทธิ์การใช้งานทันที'
        }
      ],
      tips: [
        'ควรกำหนดสิทธิ์ให้ตรงตามหน้าที่จริงในหน้างาน เพื่อป้องกันการอนุมัติเอกสารข้ามสายงานโดยไม่ได้รับอนุญาต'
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
          name: 'ติดตั้งแอป ProcureSync (Install PWA)',
          icon: Download,
          color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
          location: 'เมนูด้านล่างของแถบข้าง (Sidebar)',
          action: 'ติดตั้งเว็บแอปพลิเคชันลงบนเครื่องคอมพิวเตอร์หรือสมาร์ทโฟน เพื่อเปิดใช้งานแบบเต็มหน้าจอและเร็วขึ้น',
          linkage: 'เพิ่มไอคอนแอปบนเดสก์ท็อป / หน้าจอมือถือ'
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
        'บนมือถือ iPhone หรือ Android สามารถกด "ติดตั้งแอป" หรือ "Add to Home Screen" เพื่อใช้งานเสมือนแอปจริงได้โดยไม่ต้องดาวน์โหลดจาก App Store'
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

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
              title="สั่งพิมพ์คู่มือหรือบันทึกเป็น PDF"
            >
              <Printer className="w-4 h-4 mr-2 text-indigo-600" />
              <span>{isEnglish ? 'Print / Export PDF' : 'พิมพ์คู่มือ / บันทึก PDF'}</span>
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
        </div>
      </div>

    </div>
  );
}
