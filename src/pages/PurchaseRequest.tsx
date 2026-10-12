import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Trash2, 
  Edit, 
  AlertCircle, 
  Printer, 
  Download,
  Sparkles, 
  BookmarkCheck, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Building2,
  ChevronRight,
  FolderOpen,
  Eye,
  FileCheck2,
  UploadCloud
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import type { PurchaseRequest, PRTemplate } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PRFormModal } from '../components/PRFormModal';
import { DetailsModal } from '../components/DetailsModal';
import { StandardPRDocument } from '../components/StandardPRDocument';
import { exportToPDF, printA4Document } from '../lib/pdf';
import { getAllTemplates } from '../data/prTemplates';
import { useLanguage } from '../contexts/LanguageContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { useAuth } from '../contexts/AuthContext';

const INITIAL_MOCK_PRS: PurchaseRequest[] = [
  {
    id: 'pr-1',
    prNumber: 'PR-2025-001',
    requesterName: 'สมชาย ช่างก่อสร้าง',
    requesterPosition: 'วิศวกรสนาม (Site Engineer)',
    department: 'โครงการ คอนโดสุขุมวิท 101',
    projectCode: 'PRJ-SKV101',
    contactPhone: '081-987-6543',
    deliveryLocation: 'ไซต์งานคอนโดสุขุมวิท 101 ประตู 2',
    requestDate: '2025-05-18T10:00:00Z',
    requiredDate: '2025-05-25T00:00:00Z',
    urgency: 'urgent',
    status: 'Pending Approval',
    justification: 'ขอสั่งซื้อวัสดุสำหรับงานเทคอนกรีตฐานรากและเสาตอม่อ ชั้นใต้ดินตามแผนงานงวดที่ 2 อ้างอิง BOQ งานโครงสร้าง',
    suggestedVendor: 'บริษัท ปูนซิเมนต์ไทย จำกัด (มหาชน)',
    includeVat: true,
    vatAmount: 24500,
    totalAmount: 374500,
    items: [
      { id: '1', itemCode: 'MAT-CONC-240', description: 'คอนกรีตผสมเสร็จ 240 ksc Cube', specification: 'Slump 10±2.5 cm ปูนช้าง สำหรับฐานราก', quantity: 35, unitPrice: 1950, unit: 'คิว', remark: 'ส่งวันเสาร์เช้า' },
      { id: '2', itemCode: 'MAT-STEEL-DB16', description: 'เหล็กข้ออ้อย DB16 SD40', specification: 'ความยาว 10 เมตร มอก. 24-2559 มีใบ Mill Cert', quantity: 150, unitPrice: 420, unit: 'เส้น', remark: 'เหล็กเสาตอม่อ' },
      { id: '3', itemCode: 'MAT-STEEL-RB9', description: 'เหล็กเส้นกลม RB9 SR24', specification: 'ความยาว 10 เมตร มอก. 20-2559', quantity: 200, unitPrice: 135, unit: 'เส้น', remark: 'ดัดเหล็กปลอก' },
      { id: '4', itemCode: 'MAT-WIRE-01', description: 'ลวดผูกเหล็กเบอร์ 18', specification: 'น้ำหนัก 2.5 กก./ขด นุ่มเหนียว', quantity: 20, unitPrice: 180, unit: 'ขด', remark: 'ผูกเหล็กโครงสร้าง' },
      { id: '5', itemCode: 'MAT-WOOD-PLY', description: 'ไม้อัดเคลือบฟิล์มดำ 15 มม.', specification: '122x244 ซม. เกรดงานหล่อคอนกรีต 4-6 ครั้ง', quantity: 40, unitPrice: 650, unit: 'แผ่น', remark: 'ทำแบบข้างคาน' }
    ],
    signatures: {
      requestedBy: {
        name: 'สมชาย ช่างก่อสร้าง',
        position: 'วิศวกรสนาม',
        date: '2025-05-18T10:00:00Z',
        signed: true
      },
      checkedBy: {
        name: 'นายอภิสิทธิ์ กลิ่นสุคนธ์',
        position: 'วิศวกรโครงการ (Project Engineer)',
        date: '2025-05-18T14:30:00Z',
        signed: true,
        comments: 'ตรวจสอบสเปกวัสดุตรงตามแบบวิศวกรรมแล้ว'
      },
      budgetCheckedBy: {
        name: 'นางสาวกัญญา พงษ์ศิริ',
        position: 'เจ้าหน้าที่ควบคุมต้นทุน (Cost Control)',
        date: '2025-05-18T16:00:00Z',
        signed: true,
        comments: 'ยอดสั่งซื้ออยู่ในกรอบงบประมาณ BOQ งานโครงสร้าง'
      },
      approvedBy: {
        name: 'นายธีรภัทร บริหารงาน',
        position: 'ผู้อำนวยการสายงานโครงการ (Project Director)',
        signed: false
      }
    }
  },
  {
    id: 'pr-2',
    prNumber: 'PR-2025-002',
    requesterName: 'วิชัย คุมงาน',
    requesterPosition: 'โฟร์แมนอาวุโส (Senior Foreman)',
    department: 'โครงการ หมู่บ้านจัดสรร บางนา',
    projectCode: 'PRJ-BNG02',
    contactPhone: '086-555-4321',
    deliveryLocation: 'ไซต์บางนา กม.14 ซอยจัดสรร 3',
    requestDate: '2025-05-17T14:30:00Z',
    requiredDate: '2025-05-22T00:00:00Z',
    urgency: 'normal',
    status: 'Approved',
    justification: 'สั่งซื้ออิฐมวลเบาและปูนก่อฉาบสำหรับผนังห้องบ้านเดี่ยวเฟส 2 จำนวน 4 ยูนิต',
    suggestedVendor: 'บริษัท คิวคอน อินเตอร์เนชั่นแนล จำกัด',
    includeVat: true,
    vatAmount: 5971,
    totalAmount: 91271,
    items: [
      { id: '1', itemCode: 'MAT-BLOCK-G4', description: 'อิฐมวลเบา Q-Con เกรด G4 หนา 7.5 ซม.', specification: 'ขนาด 20x60 ซม. ได้มาตรฐาน มอก.', quantity: 2400, unitPrice: 19.5, unit: 'ก้อน', remark: 'ส่งรอบแรก 1,200 ก้อน' },
      { id: '2', itemCode: 'MAT-MORT-THIN', description: 'ปูนก่ออิฐมวลเบาสูตรบาง', specification: 'ถุงละ 50 กก. ผสมสารอุ้มน้ำสูง', quantity: 60, unitPrice: 130, unit: 'ถุง', remark: 'ปูนก่อ' },
      { id: '3', itemCode: 'MAT-PLAST-FINE', description: 'ปูนฉาบละเอียดผนังอิฐมวลเบา', specification: 'ถุงละ 50 กก. ฉาบลื่น ผิวเนียน', quantity: 120, unitPrice: 115, unit: 'ถุง', remark: 'งานฉาบ' },
      { id: '4', itemCode: 'MAT-MESH-FIBER', description: 'ตาข่ายไฟเบอร์เสริมแรงฉาบปูน', specification: 'กว้าง 10 ซม. ยาว 50 ม./ม้วน', quantity: 15, unitPrice: 185, unit: 'ม้วน', remark: 'ติดมุมวงกบ' }
    ],
    signatures: {
      requestedBy: {
        name: 'วิชัย คุมงาน',
        position: 'โฟร์แมนอาวุโส',
        date: '2025-05-17T14:30:00Z',
        signed: true
      },
      checkedBy: {
        name: 'นายเกรียงไกร ช่างเอก',
        position: 'วิศวกรประจำโครงการ',
        date: '2025-05-17T16:00:00Z',
        signed: true
      },
      budgetCheckedBy: {
        name: 'ฝ่ายควบคุมต้นทุนโครงการ',
        position: 'Cost Controller',
        date: '2025-05-17T17:00:00Z',
        signed: true
      },
      approvedBy: {
        name: 'นายสิทธิชัย อำนวยการ',
        position: 'ผู้จัดการโครงการ',
        date: '2025-05-18T09:00:00Z',
        signed: true,
        comments: 'อนุมัติสั่งซื้อตามแผนงานก่อสร้าง'
      }
    }
  },
  {
    id: 'pr-3',
    prNumber: 'PR-2025-003',
    requesterName: 'สมปอง จัดซื้อ',
    requesterPosition: 'เจ้าหน้าที่จัดซื้อ (Purchasing Officer)',
    department: 'โครงการ อาคารสำนักงาน พระราม 9',
    projectCode: 'PRJ-RM9-03',
    contactPhone: '089-123-4567',
    deliveryLocation: 'ไซต์อาคารสำนักงาน สี่แยกพระราม 9',
    requestDate: '2025-05-15T09:15:00Z',
    requiredDate: '2025-05-20T00:00:00Z',
    urgency: 'normal',
    status: 'PO Created',
    justification: 'จัดซื้อสายไฟฟ้า THW และท่อร้อยสายไฟ uPVC สำหรับชั้น 3-4',
    suggestedVendor: 'บริษัท ไทยยาซากิ อิเลคทริค จำกัด',
    includeVat: true,
    vatAmount: 2584.4,
    totalAmount: 39504.4,
    items: [
      { id: '1', itemCode: 'ELE-CBL-THW25', description: 'สายไฟฟ้า THW 1x2.5 sq.mm.', specification: 'ทองแดงแท้ 450/750V ม้วนละ 100 ม.', quantity: 12, unitPrice: 1150, unit: 'ม้วน' },
      { id: '2', itemCode: 'ELE-PIPE-UPVC20', description: 'ท่อร้อยสายไฟ uPVC สีขาว 20 มม. (3/4")', specification: 'มาตรฐาน JIS C 8430 ยาว 2.92 ม.', quantity: 180, unitPrice: 48, unit: 'ท่อน' },
      { id: '3', itemCode: 'ELE-BOX-HANDY', description: 'แฮนดี้บ็อกซ์ เหล็กชุบกัลวาไนซ์ 2x4 นิ้ว', specification: 'หนา 1.0 มม. ชุบสังกะสีกันสนิม', quantity: 150, unitPrice: 14, unit: 'ใบ' }
    ]
  },
];

const statusColors: Record<string, string> = {
  'Draft': 'bg-slate-100 text-slate-800 border-slate-300',
  'Pending Approval': 'bg-amber-100 text-amber-800 border-amber-300',
  'Approved': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  'Rejected': 'bg-red-100 text-red-800 border-red-300',
  'PO Created': 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

const statusLabels: Record<string, string> = {
  'Draft': 'ร่างเอกสาร',
  'Pending Approval': 'รออนุมัติ',
  'Approved': 'อนุมัติแล้ว',
  'Rejected': 'ถูกปฏิเสธ',
  'PO Created': 'ออก PO แล้ว',
};

const urgencyBadges: Record<string, { label: string; color: string }> = {
  'normal': { label: 'ปกติ', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  'urgent': { label: 'ด่วน', color: 'bg-amber-100 text-amber-800 border-amber-300 font-bold' },
  'emergency': { label: 'ด่วนที่สุด', color: 'bg-red-100 text-red-800 border-red-300 font-bold' },
};

export function PurchaseRequestPage() {
  const { t, isThai, isEnglish } = useLanguage();
  const { prs, createPR, updatePR, deletePR } = useProcurement();
  const { currentUser, canCreatePR } = useAuth();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPR, setEditingPR] = useState<PurchaseRequest | null>(null);
  const [viewPR, setViewPR] = useState<PurchaseRequest | null>(null);
  const [viewFormat, setViewFormat] = useState<'standard' | 'summary'>('standard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showTemplatesGallery, setShowTemplatesGallery] = useState(false);
  const [docZoom, setDocZoom] = useState<'fit' | 'actual'>('actual');

  const statusLabels: Record<string, string> = useMemo(() => ({
    'Draft': isEnglish ? 'Draft' : 'ร่างเอกสาร',
    'Pending Approval': isEnglish ? 'Pending Approval' : 'รออนุมัติ',
    'Approved': isEnglish ? 'Approved' : 'อนุมัติแล้ว',
    'Rejected': isEnglish ? 'Rejected' : 'ถูกปฏิเสธ',
    'PO Created': isEnglish ? 'PO Created' : 'ออก PO แล้ว',
  }), [isEnglish]);

  const urgencyBadges: Record<string, { label: string; color: string }> = useMemo(() => ({
    'normal': { label: isEnglish ? 'Normal' : 'ปกติ', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    'urgent': { label: isEnglish ? 'Urgent' : 'ด่วน', color: 'bg-amber-100 text-amber-800 border-amber-300 font-bold' },
    'emergency': { label: isEnglish ? 'Emergency' : 'ด่วนที่สุด', color: 'bg-red-100 text-red-800 border-red-300 font-bold' },
  }), [isEnglish]);

  const standardTemplates = useMemo(() => getAllTemplates(), []);

  const filteredPRs = useMemo(() => {
    return prs.filter(pr => {
      const matchesSearch = !searchQuery.trim() || 
        pr.prNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
        pr.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pr.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || pr.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [prs, searchQuery, statusFilter]);

  const handleCreateNew = () => {
    setEditingPR(null);
    setIsModalOpen(true);
  };

  const handleCreateFromTemplate = (tpl: PRTemplate) => {
    // Open modal prefilled with template
    const templatePR: Partial<PurchaseRequest> = {
      department: tpl.defaultDepartment || 'โครงการ คอนโดสุขุมวิท 101',
      justification: tpl.defaultJustification || '',
      urgency: tpl.defaultUrgency || 'normal',
      items: tpl.items.map((it, idx) => ({
        ...it,
        id: `tpl-${Date.now()}-${idx}`
      })),
      includeVat: true,
      status: 'Draft',
    };
    setEditingPR(templatePR as PurchaseRequest);
    setShowTemplatesGallery(false);
    setIsModalOpen(true);
  };

  const handleEdit = (pr: PurchaseRequest) => {
    setEditingPR(pr);
    setIsModalOpen(true);
  };

  const handleSavePR = (data: any) => {
    if (editingPR && editingPR.id && !editingPR.id.startsWith('tpl-')) {
      // Update existing
      updatePR(editingPR.id, {
        department: data.department, 
        projectCode: data.projectCode,
        requesterName: data.requesterName || editingPR.requesterName,
        requesterPosition: data.requesterPosition || editingPR.requesterPosition,
        contactPhone: data.contactPhone,
        deliveryLocation: data.deliveryLocation,
        requiredDate: data.requiredDate,
        urgency: data.urgency,
        justification: data.justification,
        suggestedVendor: data.suggestedVendor,
        includeVat: data.includeVat,
        vatAmount: data.vatAmount,
        totalAmount: data.totalAmount, 
        items: data.items 
      });
      alert(`แก้ไขใบขอซื้อ ${editingPR.prNumber} เรียบร้อยแล้ว`);
    } else {
      // Create new through unified store
      const created = createPR({
        ...data,
        requesterName: data.requesterName || currentUser.name || 'สมชาย ช่างก่อสร้าง',
        requesterPosition: data.requesterPosition || currentUser.role || 'วิศวกรสนาม',
        status: data.status || 'Draft',
      });
      alert(`สร้างใบขอซื้อมาตรฐานเลขที่ ${created.prNumber} สำเร็จ (บันทึกในสถานะ ${created.status === 'Pending Approval' ? 'รออนุมัติ' : 'ร่าง'})`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deletePR(deleteId);
      alert('ลบเอกสารเรียบร้อยแล้ว');
    }
    setDeleteId(null);
  };

  const handleCancel = () => {
    if (cancelId) {
      updatePR(cancelId, { status: 'Rejected' });
      alert('ยกเลิกเอกสารเรียบร้อยแล้ว');
    }
    setCancelId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">{t('pr.title')}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
              {isEnglish ? 'Construction ERP Standard' : 'มาตรฐาน ERP ก่อสร้าง'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {isEnglish 
              ? 'Create standard purchase requisitions, track project BOQ budgets, and multi-tier approvals' 
              : 'สร้างใบขอซื้อตามแบบฟอร์มมาตรฐาน ตรวจสอบงบประมาณ BOQ รายโครงการ และระบบอนุมัติหลายระดับ'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2.5 w-full sm:w-auto">
          <Link
            to="/import?target=pr"
            className="inline-flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold transition-colors border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 h-9 sm:h-10 px-2 sm:px-3.5 py-2 shadow-2xs text-center w-full sm:w-auto"
            title="นำเข้าไฟล์ Excel, CSV, CAD (.dxf) ถอดแบบ หรือ BOQ PDF เพื่อสร้าง PR"
          >
            <UploadCloud className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600 shrink-0" />
            <span className="truncate">{isEnglish ? 'Import BOQ' : 'นำเข้า BOQ'}</span>
          </Link>

          <button 
            onClick={() => setShowTemplatesGallery(!showTemplatesGallery)}
            className="inline-flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold transition-colors border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 h-9 sm:h-10 px-2 sm:px-4 py-2 shadow-2xs text-center w-full sm:w-auto"
          >
            <Sparkles className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600 shrink-0" />
            <span className="truncate">
              {showTemplatesGallery 
                ? (isEnglish ? 'Hide' : 'ซ่อนแบบ') 
                : (isEnglish ? 'Templates' : 'เทมเพลต')}
            </span>
          </button>

          <button 
            onClick={() => {
              if (!canCreatePR) {
                alert(isEnglish 
                  ? `Permission Denied: Your current role (${currentUser.role}) does not have permission to create PRs.` 
                  : `ไม่มีสิทธิ์: ตำแหน่งปัจจุบันของคุณ (${currentUser.role}) ไม่ได้รับอนุญาตให้สร้างใบขอซื้อ`);
                return;
              }
              handleCreateNew();
            }}
            disabled={!canCreatePR}
            className={cn(
              "inline-flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold transition-colors h-9 sm:h-10 px-2 sm:px-4 py-2 shadow-sm text-center w-full sm:w-auto",
              canCreatePR 
                ? "bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer" 
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
            )}
            title={!canCreatePR ? (isEnglish ? 'Requires PR Create permission' : 'ต้องได้รับสิทธิ์สร้างใบขอซื้อ') : undefined}
          >
            <Plus className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">{isEnglish ? 'New PR' : 'สร้าง PR'}</span>
          </button>
        </div>
      </div>

      {/* Templates Gallery Section (When opened) */}
      {showTemplatesGallery && (
        <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50/50 border border-indigo-200 rounded-xl p-5 shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-indigo-600" />
                {isEnglish ? 'Standard Construction PR Templates' : 'เทมเพลตมาตรฐานสำหรับระบบขอซื้อ (Standard PR Templates)'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEnglish 
                  ? 'Select preloaded construction & MEP standard templates to create a PR in 1 click' 
                  : 'เลือกใช้เทมเพลตมาตรฐานสำเร็จรูปที่จัดเตรียมรายการพัสดุ สเปก และหน่วยนับไว้ครบถ้วน เพื่อสร้าง PR ได้ใน 1 คลิก'}
              </p>
            </div>
            <button
              onClick={() => setShowTemplatesGallery(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              {t('common.close')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {standardTemplates.map((tpl) => (
              <div 
                key={tpl.id}
                className="bg-white rounded-lg border border-slate-200 p-4 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                      {tpl.category}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {tpl.items.length} {isEnglish ? 'items' : 'รายการ'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-800 mt-2 group-hover:text-indigo-600 transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {tpl.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1">
                    <div className="text-[11px] font-medium text-slate-600 line-clamp-1">
                      {isEnglish ? 'Sample items: ' : 'ตัวอย่างรายการ: '}{tpl.items.slice(0, 2).map(i => i.description).join(', ')} ...
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2">
                  <button
                    onClick={() => handleCreateFromTemplate(tpl)}
                    className="w-full py-1.5 px-3 bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white rounded font-semibold text-xs transition-all border border-slate-200 hover:border-indigo-600 flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <span>{isEnglish ? 'Use Template' : 'สร้าง PR จากเทมเพลตนี้'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main PR List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filter and Search Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between bg-slate-50">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('pr.searchPlaceholder')} 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-slate-600 font-medium shrink-0">{isEnglish ? 'Status:' : 'สถานะ:'}</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">{isEnglish ? 'All Statuses' : 'ทั้งหมด'} ({prs.length})</option>
              <option value="Draft">{statusLabels['Draft']}</option>
              <option value="Pending Approval">{statusLabels['Pending Approval']}</option>
              <option value="Approved">{statusLabels['Approved']}</option>
              <option value="PO Created">{statusLabels['PO Created']}</option>
              <option value="Rejected">{statusLabels['Rejected']}</option>
            </select>
          </div>
        </div>

        {/* Mobile PR Cards List (Visible on < md screens) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredPRs.map((pr) => {
            const urgency = urgencyBadges[pr.urgency || 'normal'] || urgencyBadges.normal;
            return (
              <div key={pr.id} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
                {/* PR Top: Number, Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 flex-shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-mono text-indigo-700 text-sm font-bold block leading-tight whitespace-nowrap">
                        {pr.prNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                        {pr.items?.length || 0} {isEnglish ? 'items' : 'รายการ'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <span className={cn("inline-block px-2 py-0.5 rounded text-[10px] border font-semibold whitespace-nowrap", urgency.color)}>
                      {urgency.label}
                    </span>
                    <span className={cn(
                      "inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border leading-none whitespace-nowrap",
                      statusColors[pr.status] || "bg-slate-100 text-slate-800"
                    )}>
                      {statusLabels[pr.status] || pr.status}
                    </span>
                  </div>
                </div>

                {/* Project & Requester */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug break-words">
                    {pr.department}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-600">
                    <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                      {pr.projectCode || 'PRJ-MAIN-01'}
                    </span>
                    <span className="text-slate-500 truncate">
                      • ผู้ขอ: {pr.requesterName}
                    </span>
                  </div>
                </div>

                {/* Schedule & Amount Grid */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">ต้องการสินค้า</span>
                    <span className="font-semibold text-indigo-700 text-xs block whitespace-nowrap">
                      {new Date(pr.requiredDate || pr.requestDate).toLocaleDateString(isThai ? 'th-TH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 whitespace-nowrap">
                      ขอเมื่อ: {new Date(pr.requestDate).toLocaleDateString(isThai ? 'th-TH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="border-l border-slate-200/80 pl-2.5 text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">ยอดรวมสุทธิ</span>
                    <span className="font-bold text-slate-900 font-mono tabular-nums text-sm block whitespace-nowrap">
                      ฿{(pr.totalAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 whitespace-nowrap">
                      {pr.includeVat ? 'รวม VAT 7%' : 'ไม่รวม VAT'}
                    </span>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                  <button 
                    onClick={() => setViewPR(pr)}
                    className="flex-1 py-1.5 px-3 text-xs font-bold text-indigo-700 hover:text-white hover:bg-indigo-600 bg-indigo-50/80 border border-indigo-200 rounded-lg transition-all flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isEnglish ? 'View Form' : 'ดูฟอร์ม A4'}</span>
                  </button>

                  {(pr.status === 'Draft' || pr.status === 'Pending Approval') && (
                    <button 
                      onClick={() => handleEdit(pr)}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                      title={isEnglish ? "Edit document" : "แก้ไขเอกสาร"}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  {pr.status === 'Draft' && (
                    <button 
                      onClick={() => setDeleteId(pr.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
                      title="ลบเอกสารร่าง"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  {pr.status === 'Pending Approval' && (
                    <button 
                      onClick={() => setCancelId(pr.id)}
                      className="px-2 py-1 text-slate-500 hover:text-slate-700 font-bold text-xs transition-colors rounded hover:bg-slate-100 border border-slate-200"
                      title="ยกเลิกคำขอ"
                    >
                      ยกเลิก
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filteredPRs.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              ไม่พบรายการใบขอซื้อที่ตรงกับเงื่อนไขการค้นหา
            </div>
          )}
        </div>

        {/* Desktop Table View (Visible on >= md screens) */}
        <div className="hidden md:block overflow-x-auto smooth-scroll">
          <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[840px]">
            <thead className="text-[11px] text-slate-600 font-bold uppercase bg-slate-100/90 border-b border-slate-200 tracking-wider">
              <tr>
                <th className="px-3.5 py-3.5 whitespace-nowrap w-[145px]">{t('pr.colPrNumber')}</th>
                <th className="px-3.5 py-3.5 min-w-[190px]">{t('pr.colProject')}</th>
                <th className="px-3.5 py-3.5 whitespace-nowrap w-[155px]">{isEnglish ? 'Requester & Due Date' : 'ผู้ขอซื้อ & กำหนดส่ง'}</th>
                <th className="px-3.5 py-3.5 text-right whitespace-nowrap w-[120px]">{isEnglish ? 'Total (THB)' : 'ยอดรวม (บาท)'}</th>
                <th className="px-2.5 py-3.5 text-center whitespace-nowrap w-[95px]">{t('pr.colStatus')}</th>
                <th className="px-3.5 py-3.5 text-right whitespace-nowrap w-[125px] sticky right-0 bg-slate-100/95 backdrop-blur-xs shadow-[-4px_0_8px_rgba(0,0,0,0.03)]">{t('pr.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm bg-white">
              {filteredPRs.map((pr) => {
                const urgency = urgencyBadges[pr.urgency || 'normal'] || urgencyBadges.normal;
                return (
                  <tr key={pr.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* PR Number & Urgency */}
                    <td className="px-3.5 py-3.5 align-top whitespace-nowrap">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 mt-0.5 flex-shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-indigo-700 text-sm font-bold leading-tight">{pr.prNumber}</span>
                            <span className={cn("inline-block px-1.5 py-0.5 rounded text-[10px] border font-bold leading-none", urgency.color)}>
                              {urgency.label}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">
                            {pr.items?.length || 0} {isEnglish ? 'items' : 'รายการพัสดุ'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Project / Site */}
                    <td className="px-3.5 py-3.5 align-top text-slate-700">
                      <div className="font-bold text-slate-900 text-sm leading-snug break-words">{pr.department}</div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs">
                        <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                          {pr.projectCode || 'PRJ-MAIN-01'}
                        </span>
                        {pr.deliveryLocation && (
                          <span className="text-slate-500 leading-normal line-clamp-1" title={pr.deliveryLocation}>
                            • {pr.deliveryLocation}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Requester & Due Date */}
                    <td className="px-3.5 py-3.5 align-top text-slate-700 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 text-sm leading-snug">{pr.requesterName}</div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="text-slate-400 font-normal">ส่งมอบ:</span>
                        <span className="font-semibold text-indigo-700">{new Date(pr.requiredDate || pr.requestDate).toLocaleDateString(isThai ? 'th-TH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-3.5 py-3.5 align-top text-right whitespace-nowrap">
                      <div className="text-slate-900 font-bold font-mono tabular-nums text-sm leading-tight">
                        {(pr.totalAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-1">
                        {pr.includeVat ? 'รวม VAT 7%' : 'ไม่รวม VAT'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-2.5 py-3.5 align-top text-center whitespace-nowrap">
                      <span className={cn(
                        "inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border leading-none whitespace-nowrap",
                        statusColors[pr.status] || "bg-slate-100 text-slate-800"
                      )}>
                        {statusLabels[pr.status] || pr.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-3.5 py-3.5 align-top text-right whitespace-nowrap sticky right-0 bg-white/95 backdrop-blur-xs shadow-[-4px_0_8px_rgba(0,0,0,0.03)]">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => setViewPR(pr)}
                          className="px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:text-white hover:bg-indigo-600 bg-indigo-50/70 border border-indigo-200 rounded-lg transition-all flex items-center gap-1 shadow-2xs"
                          title={isEnglish ? "View Standard PR Form" : "ดูแบบฟอร์มมาตรฐาน"}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isEnglish ? 'View' : 'ดูฟอร์ม'}</span>
                        </button>

                        {(pr.status === 'Draft' || pr.status === 'Pending Approval') && (
                          <button 
                            onClick={() => handleEdit(pr)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                            title={isEnglish ? "Edit document" : "แก้ไขเอกสาร"}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {(pr.status === 'Draft') && (
                          <button 
                            onClick={() => setDeleteId(pr.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="ลบเอกสารร่าง"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        {(pr.status === 'Pending Approval') && (
                          <button 
                            onClick={() => setCancelId(pr.id)}
                            className="text-slate-400 hover:text-slate-600 font-bold text-xs transition-colors px-1.5 py-1 rounded hover:bg-slate-100"
                            title="ยกเลิกคำขอ"
                          >
                            ยกเลิก
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPRs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    ไม่พบรายการใบขอซื้อที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal with Standard Official PR Document */}
      <DetailsModal 
        isOpen={!!viewPR} 
        onClose={() => setViewPR(null)} 
        maxWidth="max-w-5xl"
        title={`เอกสารใบขอซื้อมาตรฐาน: ${viewPR?.prNumber}`}
        footer={
          <div className="flex flex-col sm:flex-row gap-2.5 w-full justify-between items-center">
            {/* View switcher */}
            <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setViewFormat('standard')}
                className={cn(
                  "px-3 py-1.5 rounded-md transition-colors",
                  viewFormat === 'standard' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                แบบฟอร์มทางการ (Official PR - A4)
              </button>
              <button
                onClick={() => setViewFormat('summary')}
                className={cn(
                  "px-3 py-1.5 rounded-md transition-colors",
                  viewFormat === 'summary' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                มุมมองสรุปทั่วไป
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => printA4Document('standard-pr-doc', `ใบขอซื้อ_${viewPR?.prNumber}`)}
                className="inline-flex items-center px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                title="พิมพ์เอกสารขนาด A4 มาตราฐานโดยตรง ไม่ผ่านการย่อส่วน"
              >
                <Printer className="h-4 w-4 mr-1.5 text-indigo-600" />
                พิมพ์เอกสาร A4
              </button>
              <button 
                onClick={() => exportToPDF('standard-pr-doc', `${viewPR?.prNumber}_Standard_PR`)}
                className="inline-flex items-center px-3.5 py-2 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
                title="บันทึกไฟล์เป็น PDF ขนาด A4 100% สัดส่วนมาตรฐาน"
              >
                <Download className="h-4 w-4 mr-1.5 text-emerald-600" />
                บันทึก PDF A4
              </button>
              <button 
                onClick={() => setViewPR(null)}
                className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        }
      >
        {viewPR && (
          <div>
            {viewFormat === 'standard' ? (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 text-xs text-slate-500 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-slate-700">ขนาดกระดาษมาตรฐาน A4 (210 x 297 มม.)</span>
                    <span className="text-slate-300 hidden sm:inline">|</span>
                    <span className="hidden sm:inline">สเกล 1:1 พร้อมพิมพ์และดาวน์โหลด PDF ไม่ย่อส่วน</span>
                  </div>
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setDocZoom(docZoom === 'fit' ? 'actual' : 'fit')}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 rounded-md shadow-2xs hover:bg-slate-50 text-indigo-700 transition-colors"
                    >
                      {docZoom === 'fit' ? '🔍 ซูม 100% (ขนาดจริง)' : '📱 ย่อพอดีหน้าจอ'}
                    </button>
                    <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">ProcureSync Engine</span>
                  </div>
                </div>
                <div className="bg-slate-200/70 p-2 sm:p-6 rounded-xl overflow-x-auto flex justify-center shadow-inner smooth-scroll">
                  <div className={cn(
                    "transition-all duration-200",
                    docZoom === 'fit' ? "scale-[0.45] xs:scale-[0.55] sm:scale-100 origin-top h-[540px] sm:h-auto" : ""
                  )}>
                    <StandardPRDocument pr={viewPR} id="standard-pr-doc" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">เลขที่ PR</p>
                    <p className="font-bold text-slate-800 font-mono">{viewPR.prNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">ผู้ขอซื้อ</p>
                    <p className="font-medium text-slate-800">{viewPR.requesterName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">โครงการ</p>
                    <p className="font-medium text-slate-800">{viewPR.department}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">สถานะ</p>
                    <span className={cn(
                      "inline-flex px-2 py-0.5 rounded text-[10px] font-bold border",
                      statusColors[viewPR.status]
                    )}>
                      {statusLabels[viewPR.status] || viewPR.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">รายการที่ขอซื้อ ({viewPR.items.length})</h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100/80 border-b border-slate-200 font-bold text-slate-700">
                        <tr>
                          <th className="px-4 py-2.5 w-24">รหัสพัสดุ</th>
                          <th className="px-4 py-2.5">รายการและสเปก</th>
                          <th className="px-3 py-2.5 text-right w-20">จำนวน</th>
                          <th className="px-3 py-2.5 text-center w-16">หน่วย</th>
                          <th className="px-4 py-2.5 text-right w-28">ราคา/หน่วย</th>
                          <th className="px-4 py-2.5 text-right w-32">รวมเป็นเงิน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {viewPR.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60">
                            <td className="px-4 py-3 font-mono text-slate-600 font-semibold">{item.itemCode || '-'}</td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900 leading-snug">{item.description}</div>
                              {item.specification && (
                                <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">{item.specification}</div>
                              )}
                            </td>
                            <td className="px-3 py-3 text-right font-mono tabular-nums font-semibold text-slate-800">{Number(item.quantity).toLocaleString()}</td>
                            <td className="px-3 py-3 text-center text-slate-600">{item.unit}</td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">{Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums font-bold text-slate-900">{((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50/80 border-t border-slate-200">
                        <tr>
                          <td colSpan={5} className="px-4 py-2.5 text-right font-bold text-slate-700">ยอดรวมสุทธิ:</td>
                          <td className="px-4 py-2.5 text-right font-bold font-mono tabular-nums text-indigo-700 text-sm">{(viewPR.totalAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DetailsModal>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="ยืนยันการลบแบบร่าง"
        message="คุณแน่ใจหรือไม่ที่จะลบเอกสารแบบร่างนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
        confirmText="ลบเอกสาร"
        isDestructive={true}
      />
      
      <ConfirmDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancel}
        title="ยืนยันการยกเลิกคำขอ"
        message="คุณแน่ใจหรือไม่ที่จะยกเลิกคำขอ PR นี้? สถานะจะเปลี่ยนเป็นถูกปฏิเสธ"
        confirmText="ยกเลิกคำขอ"
        isDestructive={true}
      />

      {/* PR Form Modal */}
      <PRFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePR}
        initialData={editingPR}
      />
    </div>
  );
}
