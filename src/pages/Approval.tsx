import React, { useState, useMemo } from 'react';
import { CheckCircle2, XCircle, Clock, FileText, Printer, Building2, ZoomIn, ZoomOut, Maximize2, ShieldCheck, Check, FileCheck, ShieldAlert, Lock, User, Eye, AlertCircle } from 'lucide-react';
import type { ApprovalTask, PurchaseRequest, ApprovalMatrixStep } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DetailsModal } from '../components/DetailsModal';
import { StandardPRDocument } from '../components/StandardPRDocument';
import { StandardPODocument } from '../components/StandardPODocument';
import { ApprovalMatrixDocumentTable } from '../components/ApprovalMatrixDocumentTable';
import { printA4Document } from '../lib/pdf';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';


const MOCK_PR_1: PurchaseRequest = {
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
};

const MOCK_APPROVALS: ApprovalTask[] = [
  {
    id: 'a1',
    documentId: 'PR-2025-001',
    documentType: 'PR',
    requester: 'สมชาย ช่างก่อสร้าง (ไซต์งาน สุขุมวิท 101)',
    requestDate: '2025-05-18T10:00:00Z',
    amount: 374500,
    status: 'Pending',
    level: 1,
    prData: MOCK_PR_1
  },
  {
    id: 'a2',
    documentId: 'PO-2025-089',
    documentType: 'PO',
    requester: 'ฝ่ายจัดซื้อ (ส่วนกลาง)',
    requestDate: '2025-05-18T13:20:00Z',
    amount: 120000,
    status: 'Pending',
    level: 2,
  }
];

interface PendingApprovalCardProps {
  task: ApprovalTask;
  canApprove: boolean;
  onView: (task: ApprovalTask) => void;
  onApprove: (task: ApprovalTask) => void;
  onReject: (task: ApprovalTask) => void;
  isEnglish: boolean;
  t: (key: string) => string;
  formatRequestDateTime: (dateStr?: string) => string;
  step?: ApprovalMatrixStep;
}

function PendingApprovalCard({
  task,
  canApprove,
  onView,
  onApprove,
  onReject,
  isEnglish,
  t,
  formatRequestDateTime,
  step
}: PendingApprovalCardProps) {
  const isPR = task.documentType === 'PR';
  const urgency = task.prData?.urgency;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between space-y-3.5 text-left">
      {/* 1. Header: Badges & Document ID */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {/* Level Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs whitespace-nowrap">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{isEnglish ? `Tier ${task.level}` : `ระดับ ${task.level}`}</span>
            {step && (
              <span className="text-amber-800/80 font-medium hidden xs:inline">• {isEnglish ? (step.titleEn || step.titleTh) : step.titleTh}</span>
            )}
          </span>

          {/* Document Type Badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-2xs whitespace-nowrap">
            <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{isPR ? (isEnglish ? 'PR Requisition' : 'ใบขอซื้อ PR') : (isEnglish ? 'PO Order' : 'ใบสั่งซื้อ PO')}</span>
          </span>

          {/* Urgency Badge */}
          {urgency === 'urgent' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-500 text-white shadow-2xs whitespace-nowrap">
              <AlertCircle className="w-3 h-3" />
              {isEnglish ? 'Urgent' : 'ด่วน'}
            </span>
          )}
          {urgency === 'emergency' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-rose-600 text-white shadow-2xs whitespace-nowrap animate-pulse">
              <AlertCircle className="w-3 h-3" />
              {isEnglish ? 'Emergency' : 'ด่วนที่สุด'}
            </span>
          )}
        </div>

        {/* Clean Document ID (No PR PR- duplication!) */}
        <div className="shrink-0 text-right">
          <span className="font-mono font-extrabold text-slate-900 text-sm sm:text-base tracking-tight block">
            {task.documentId}
          </span>
        </div>
      </div>

      {/* 2. Project Name & Site */}
      <div className="min-w-0">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug break-words">
          {task.prData?.department || (isEnglish ? 'Construction Project' : 'โครงการงานก่อสร้าง')}
        </h3>
        {task.prData?.projectCode && (
          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs">
            <span className="font-mono text-[10.5px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
              {task.prData.projectCode}
            </span>
            {task.prData?.deliveryLocation && (
              <span className="text-slate-500 text-[11px] truncate max-w-[240px]" title={task.prData.deliveryLocation}>
                • {task.prData.deliveryLocation}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Requester & Timestamp */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-0.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-500 font-medium">{isEnglish ? 'Requester:' : 'ผู้ขอซื้อ:'}</span>
          <span className="text-slate-800 font-semibold truncate">{task.requester}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 whitespace-nowrap font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{formatRequestDateTime(task.requestDate)}</span>
        </div>
      </div>

      {/* 4. Purpose / Justification Box */}
      <div className="bg-slate-50/90 border border-slate-200/70 rounded-xl p-3 text-xs text-slate-700 leading-relaxed">
        <span className="font-bold text-slate-800 mr-1.5">
          {isEnglish ? 'Purpose / Justification:' : 'วัตถุประสงค์ / เหตุผล:'}
        </span>
        <span className="line-clamp-2 text-slate-600">
          {task.prData?.justification || (isEnglish ? 'Materials procurement according to project schedule' : 'จัดซื้อวัสดุอุปกรณ์ตามแผนดำเนินงานโครงการ')}
        </span>
      </div>

      {/* 5. Financial Amount Banner */}
      <div className="flex items-center justify-between p-3 sm:px-4 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-indigo-50/40 border border-indigo-100/90 rounded-xl shadow-2xs">
        <div>
          <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block leading-none">
            {isEnglish ? 'Requested Amount' : 'ยอดเงินขออนุมัติ'}
          </span>
          <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-none">
            {task.prData?.includeVat !== false 
              ? (isEnglish ? 'Incl. 7% VAT' : 'รวมภาษีมูลค่าเพิ่ม 7%') 
              : (isEnglish ? 'Excl. VAT' : 'ไม่รวมภาษีมูลค่าเพิ่ม')}
          </span>
        </div>
        <div className="text-right">
          <div className="font-mono font-black text-slate-900 text-lg sm:text-xl tabular-nums leading-tight">
            ฿{(task.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider leading-none block mt-0.5">
            {isEnglish ? 'THB' : 'บาท'}
          </span>
        </div>
      </div>

      {/* 6. Action Buttons Bar (Comfortable, Touch-friendly, Never wraps words into 3 lines) */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={() => onView(task)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-indigo-700 border border-slate-200 hover:border-indigo-300 font-bold text-xs rounded-xl transition-all shadow-2xs cursor-pointer order-2 sm:order-1"
          title={isEnglish ? 'View Standard Official A4 Document' : 'ดูแบบฟอร์มเอกสารทางการ A4'}
        >
          <Eye className="w-4 h-4 text-indigo-600" />
          <span>{isEnglish ? 'View Standard Form (A4)' : 'ดูแบบฟอร์มมาตรฐาน (A4)'}</span>
        </button>

        <div className="flex items-center gap-2 order-1 sm:order-2 flex-1 sm:flex-initial">
          <button
            type="button"
            onClick={() => onReject(task)}
            disabled={!canApprove}
            className={cn(
              "flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border text-xs font-bold rounded-xl transition-all shadow-2xs",
              canApprove
                ? "border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700 cursor-pointer active:scale-95"
                : "border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed opacity-60"
            )}
          >
            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="whitespace-nowrap">{t('approvals.rejectBtn')}</span>
          </button>

          <button
            type="button"
            onClick={() => onApprove(task)}
            disabled={!canApprove}
            className={cn(
              "flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 border text-xs font-bold rounded-xl transition-all shadow-xs",
              canApprove
                ? "border-transparent bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-95"
                : "border-transparent bg-slate-300 text-white cursor-not-allowed opacity-60"
            )}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">{t('approvals.approveBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface HistoryApprovalCardProps {
  task: {
    id: string;
    documentId: string;
    documentType: 'PR' | 'PO';
    requester: string;
    requestDate: string;
    amount: number;
    status: 'Approved' | 'Rejected';
    level: number;
    actionStatus: 'Approved' | 'Rejected';
    actionDate: string;
    prData?: PurchaseRequest;
  };
  onView: (task: any) => void;
  isEnglish: boolean;
  formatRequestDateTime: (dateStr?: string) => string;
}

function HistoryApprovalCard({
  task,
  onView,
  isEnglish,
  formatRequestDateTime
}: HistoryApprovalCardProps) {
  const isApproved = task.actionStatus === 'Approved';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between space-y-3.5 text-left">
      {/* 1. Header: Status Badge & Document ID */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2">
          {isApproved ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{isEnglish ? 'Approved' : 'อนุมัติแล้ว'}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs whitespace-nowrap">
              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{isEnglish ? 'Rejected' : 'ไม่อนุมัติ / ปฏิเสธ'}</span>
            </span>
          )}

          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {isEnglish ? `Tier ${task.level}` : `ระดับ ${task.level}`}
          </span>
        </div>

        <span className="font-mono font-extrabold text-slate-900 text-sm sm:text-base tracking-tight shrink-0">
          {task.documentId}
        </span>
      </div>

      {/* 2. Project Name */}
      <div>
        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug break-words">
          {task.prData?.department || (isEnglish ? 'Construction Project' : 'โครงการงานก่อสร้าง')}
        </h3>
        {task.prData?.justification && (
          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {task.prData.justification}
          </p>
        )}
      </div>

      {/* 3. Requester & Action Date */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 min-w-0">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-500">{isEnglish ? 'Requester:' : 'ผู้ขอซื้อ:'}</span>
          <span className="text-slate-800 font-semibold truncate">{task.requester}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{isEnglish ? 'Processed on ' : 'ดำเนินการเมื่อ '}{formatRequestDateTime(task.actionDate)}</span>
        </div>
      </div>

      {/* 4. Financial Banner */}
      <div className="flex items-center justify-between p-3 sm:px-4 bg-slate-50/90 border border-slate-200/80 rounded-xl">
        <div>
          <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block leading-none">
            {isEnglish ? 'Document Amount' : 'ยอดเงินในเอกสาร'}
          </span>
          <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-none">
            {isEnglish ? 'Official Record' : 'บันทึกในระบบบัญชี'}
          </span>
        </div>
        <div className="text-right">
          <div className="font-mono font-black text-slate-900 text-lg sm:text-xl tabular-nums leading-tight">
            ฿{task.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none block mt-0.5">
            {isEnglish ? 'THB' : 'บาท'}
          </span>
        </div>
      </div>

      {/* 5. View Form Action Button */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
        <button
          type="button"
          onClick={() => onView(task)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-indigo-700 border border-slate-200 hover:border-indigo-300 font-bold text-xs rounded-xl transition-all shadow-2xs cursor-pointer"
        >
          <Eye className="w-4 h-4 text-indigo-600" />
          <span>{isEnglish ? 'View Standard Form (A4)' : 'ดูแบบฟอร์มมาตรฐาน (A4)'}</span>
        </button>
      </div>
    </div>
  );
}

export function ApprovalPage() {
  const { t, isThai, isEnglish } = useLanguage();
  const { addNotification } = useNotifications();
  const { approvalTasks, approvePR, rejectPR, prs, pos, approvalMatrix, companyProfile } = useProcurement();
  const { currentUser, canApprove } = useAuth();
  const tasks = approvalTasks;

  const formatRequestDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(isThai ? 'th-TH' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getStepInfo = (level: number) => {
    return approvalMatrix.find(s => s.stepNumber === level) || 
           approvalMatrix[Math.min(Math.max(0, level - 1), approvalMatrix.length - 1)];
  };
  const historyTasks = useMemo(() => {
    return prs
      .filter(p => p.status === 'Approved' || p.status === 'Rejected' || p.status === 'PO Created')
      .map(p => ({
        id: `appr-hist-${p.id}`,
        documentId: p.prNumber,
        documentType: 'PR' as const,
        requester: `${p.requesterName} (${p.department})`,
        requestDate: p.requestDate,
        amount: p.totalAmount,
        status: (p.status === 'Rejected' ? 'Rejected' : 'Approved') as 'Approved' | 'Rejected',
        level: 1,
        actionStatus: (p.status === 'Rejected' ? 'Rejected' : 'Approved') as 'Approved' | 'Rejected',
        actionDate: p.signatures?.approvedBy?.date || p.requestDate,
        prData: p
      }));
  }, [prs]);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    taskId: string | null;
    action: 'approve' | 'reject' | null;
  }>({
    isOpen: false,
    taskId: null,
    action: null
  });
  const [viewTask, setViewTask] = useState<ApprovalTask | null>(null);
  const [docZoom, setDocZoom] = useState<'fit' | 'actual'>('fit');

  const handleConfirm = () => {
    if (!confirmState.taskId) return;
    const task = tasks.find(t => t.id === confirmState.taskId);
    if (!task) return;

    if (confirmState.action === 'approve') {
      if (task.documentType === 'PR' && task.prData) {
        approvePR(
          task.prData.id,
          currentUser.name || 'ผู้อำนวยการสายงานโครงการ',
          currentUser.role || 'Project Director',
          'อนุมัติผ่านระบบเรียบร้อยตาม BOQ'
        );
      }
      addNotification({
        title: isEnglish ? `PR Approved: ${task.documentId}` : `อนุมัติสำเร็จ: ${task.documentId}`,
        message: isEnglish ? `Purchase request for ${(task.amount ?? 0).toLocaleString()} THB has been approved.` : `ใบขอซื้อมูลค่า ${(task.amount ?? 0).toLocaleString()} บาท ได้รับการอนุมัติแล้ว`,
        type: 'approval',
        link: '/approvals'
      });
      alert(isEnglish ? `Document approved successfully` : `อนุมัติเอกสารเรียบร้อยแล้ว`);
    } else {
      if (task.documentType === 'PR' && task.prData) {
        rejectPR(
          task.prData.id,
          currentUser.name || 'ผู้อำนวยการสายงานโครงการ',
          currentUser.role || 'Project Director',
          'ปฏิเสธเอกสาร'
        );
      }
      addNotification({
        title: isEnglish ? `PR Rejected: ${task.documentId}` : `ปฏิเสธเอกสาร: ${task.documentId}`,
        message: isEnglish ? `Purchase request ${task.documentId} was rejected.` : `ใบขอซื้อ ${task.documentId} ถูกปฏิเสธ`,
        type: 'approval',
        link: '/approvals'
      });
      alert(isEnglish ? `Document rejected` : `ปฏิเสธเอกสารเรียบร้อยแล้ว`);
    }
    setConfirmState({ isOpen: false, taskId: null, action: null });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-28 sm:pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {t('approvals.title')}
            </h1>
            <span className="heading-badge heading-badge-amber shadow-2xs">
              {isEnglish ? 'Multi-Tier Approvals' : 'ระบบอนุมัติหลายระดับ'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            {t('approvals.subtitle')}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer",
              viewMode === 'table' ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            )}
          >
            {isEnglish ? 'Table View' : 'มุมมองตาราง'}
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer",
              viewMode === 'card' ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            )}
          >
            {isEnglish ? 'Card View' : 'มุมมองการ์ด'}
          </button>
        </div>
      </div>

      {/* Approval Matrix Progression Bar - Responsive Scrollable Strip on Mobile */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>{isEnglish ? 'CORPORATE APPROVAL MATRIX WORKFLOW' : 'สายการอนุมัติมาตรฐานขององค์กร (APPROVAL MATRIX)'}</span>
          </div>
          <span className="text-[11px] text-indigo-600 font-medium">
            {approvalMatrix.length} {isEnglish ? 'threshold tiers' : 'ขั้นตอนตามเกณฑ์วงเงิน'}
          </span>
        </div>
        <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs pb-1 sm:pb-0 scrollbar-none snap-x">
          {approvalMatrix.map((step, idx) => (
            <div key={step.id} className="min-w-[210px] sm:min-w-0 flex-shrink-0 snap-start flex items-start gap-2.5 p-2.5 bg-slate-50/90 border border-slate-200/80 rounded-xl">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-800 text-[11px] leading-tight truncate">
                  {isEnglish ? (step.titleEn || step.titleTh) : step.titleTh}
                </div>
                <div className="text-[9.5px] text-slate-500 leading-tight mt-0.5 truncate" title={step.defaultPosition || step.titleEn}>
                  {step.defaultPosition || step.titleEn}
                </div>
                {step.minAmount ? (
                  <span className="inline-block mt-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    &ge; {step.minAmount.toLocaleString()} {isEnglish ? 'THB' : 'บ.'}
                  </span>
                ) : (
                  <span className="inline-block mt-1 text-[9px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {isEnglish ? 'All Amounts' : 'ทุกวงเงิน'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('pending')}
          className={cn(
            "px-4 py-2 border-b-2 font-semibold text-sm transition-colors",
            activeTab === 'pending' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          {t('approvals.tabPending')} ({tasks.length})
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={cn(
            "px-4 py-2 border-b-2 font-semibold text-sm transition-colors",
            activeTab === 'history' ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          {isEnglish ? 'Approval History' : 'ประวัติการอนุมัติ'} ({historyTasks.length})
        </button>
      </div>

      {!canApprove && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {isEnglish 
                ? `Read-only mode: Your current position (${currentUser.role}) does not have approval authority. Document approval is restricted by Administrator.` 
                : `โหมดดูข้อมูลเท่านั้น: ตำแหน่งปัจจุบันของคุณ (${currentUser.role}) ไม่มีสิทธิ์อนุมัติเอกสาร (จำกัดสิทธิ์เฉพาะ Approver / Purchasing Manager / Admin)`}
            </span>
          </div>
        </div>
      )}

      {activeTab === 'pending' ? (
        viewMode === 'table' ? (
          /* Table View for Pending Approvals */
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Mobile Cards for Pending Approvals (Visible on < md) */}
            <div className="md:hidden p-3 space-y-3 bg-slate-50/60">
              {tasks.map((task) => (
                <PendingApprovalCard
                  key={task.id}
                  task={task}
                  canApprove={canApprove}
                  onView={(t) => setViewTask(t)}
                  onApprove={(t) => setConfirmState({ isOpen: true, taskId: t.id, action: 'approve' })}
                  onReject={(t) => setConfirmState({ isOpen: true, taskId: t.id, action: 'reject' })}
                  isEnglish={isEnglish}
                  t={t}
                  formatRequestDateTime={formatRequestDateTime}
                  step={getStepInfo(task.level)}
                />
              ))}
              {tasks.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <h3 className="font-bold text-slate-800">ไม่มีเอกสารที่รอการอนุมัติ</h3>
                  <p className="text-xs text-slate-500 mt-1">คุณได้ดำเนินการกับเอกสารทั้งหมดเรียบร้อยแล้ว</p>
                </div>
              )}
            </div>

            {/* Desktop Table (Visible on >= md) */}
            <div className="hidden md:block overflow-x-auto smooth-scroll">
              <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[880px]">
                <thead className="text-[11px] text-slate-600 font-bold uppercase bg-slate-100/90 border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="px-3.5 py-3.5 whitespace-nowrap w-[140px]">ระดับ & เอกสาร</th>
                    <th className="px-3.5 py-3.5 min-w-[200px]">โครงการ / วัตถุประสงค์</th>
                    <th className="px-3.5 py-3.5 whitespace-nowrap min-w-[140px]">ผู้ขอซื้อและวันที่</th>
                    <th className="px-3.5 py-3.5 text-right whitespace-nowrap w-[120px]">ยอดเงิน (บาท)</th>
                    <th className="px-3 py-3.5 text-center whitespace-nowrap w-[90px]">เอกสาร</th>
                    <th className="px-4 py-3.5 text-right whitespace-nowrap w-[180px] sticky right-0 bg-slate-100/95 backdrop-blur-xs shadow-[-4px_0_8px_rgba(0,0,0,0.03)]">การพิจารณา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm bg-white">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Document & Level */}
                      <td className="px-4 py-3.5 align-top whitespace-nowrap">
                        <div className="flex items-start gap-2">
                          {(() => {
                            const step = approvalMatrix.find(s => s.stepNumber === task.level) || approvalMatrix[Math.min(task.level - 1, approvalMatrix.length - 1)];
                            return (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wide font-bold bg-amber-100 text-amber-800 border border-amber-300 mt-0.5" title={step?.defaultPosition}>
                                {step ? step.titleTh : (isEnglish ? `L${task.level}` : `ระดับ ${task.level}`)}
                              </span>
                            );
                          })()}
                          <div>
                            <span className="font-mono text-indigo-700 font-bold text-sm block leading-tight">
                              {task.documentType} {task.documentId}
                            </span>
                            <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100 mt-1 inline-block">
                              แบบฟอร์มมาตรฐาน
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Project / Justification */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="font-bold text-slate-900 text-sm leading-snug break-words">
                          {task.prData?.department || 'โครงการงานก่อสร้าง'}
                        </div>
                        <div className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2 break-words" title={task.prData?.justification}>
                          {task.prData?.justification || 'คำขอวัสดุก่อสร้างตามงบประมาณ BOQ งานงวดที่ 2'}
                        </div>
                      </td>

                      {/* Requester & Date */}
                      <td className="px-4 py-3.5 align-top text-slate-600 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 text-sm leading-snug">
                          {task.requester}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{new Date(task.requestDate).toLocaleDateString(isThai ? 'th-TH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                        <div className="text-slate-900 font-bold font-mono tabular-nums text-sm leading-tight">
                          {(task.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-1">
                          บาท (THB)
                        </div>
                      </td>

                      {/* View document */}
                      <td className="px-3 py-3.5 align-top text-center whitespace-nowrap">
                        <button 
                          onClick={() => setViewTask(task)}
                          className="px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:text-white hover:bg-indigo-600 bg-indigo-50/70 border border-indigo-200 rounded-lg transition-colors shadow-2xs"
                        >
                          ดูฟอร์ม A4
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 align-top text-right whitespace-nowrap sticky right-0 bg-white/95 backdrop-blur-xs shadow-[-4px_0_8px_rgba(0,0,0,0.03)]">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => setConfirmState({ isOpen: true, taskId: task.id, action: 'reject' })}
                            disabled={!canApprove}
                            className={cn(
                              "inline-flex items-center justify-center px-2.5 py-1.5 border shadow-2xs text-xs font-semibold rounded-lg transition-colors",
                              canApprove 
                                ? "border-slate-300 text-red-700 bg-white hover:bg-red-50 cursor-pointer" 
                                : "border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed opacity-60"
                            )}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1 text-red-500" />
                            {t('approvals.rejectBtn')}
                          </button>
                          <button 
                            onClick={() => setConfirmState({ isOpen: true, taskId: task.id, action: 'approve' })}
                            disabled={!canApprove}
                            className={cn(
                              "inline-flex items-center justify-center px-2.5 py-1.5 border shadow-2xs text-xs font-bold rounded-lg transition-colors",
                              canApprove 
                                ? "border-transparent text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer" 
                                : "border-transparent text-white bg-slate-300 cursor-not-allowed opacity-60"
                            )}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            {t('approvals.approveBtn')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                        <h3 className="font-bold text-slate-800">ไม่มีเอกสารที่รอการอนุมัติ</h3>
                        <p className="text-xs text-slate-500 mt-1">คุณได้ดำเนินการกับเอกสารทั้งหมดเรียบร้อยแล้ว</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Card View for Pending Approvals */
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {tasks.map((task) => (
              <PendingApprovalCard
                key={task.id}
                task={task}
                canApprove={canApprove}
                onView={(t) => setViewTask(t)}
                onApprove={(t) => setConfirmState({ isOpen: true, taskId: t.id, action: 'approve' })}
                onReject={(t) => setConfirmState({ isOpen: true, taskId: t.id, action: 'reject' })}
                isEnglish={isEnglish}
                t={t}
                formatRequestDateTime={formatRequestDateTime}
                step={getStepInfo(task.level)}
              />
            ))}

            {tasks.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 col-span-full">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800">ไม่มีเอกสารที่รอการอนุมัติ</h3>
                <p className="text-xs text-slate-500 mt-1">คุณได้ดำเนินการกับเอกสารทั้งหมดเรียบร้อยแล้ว</p>
              </div>
            )}
          </div>
        )
      ) : (
        /* History Section */
        viewMode === 'table' ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Mobile History Cards (Visible on < md) */}
            <div className="md:hidden p-3 space-y-3 bg-slate-50/60">
              {historyTasks.map((task) => (
                <HistoryApprovalCard
                  key={task.id}
                  task={task}
                  onView={(t) => setViewTask(t)}
                  isEnglish={isEnglish}
                  formatRequestDateTime={formatRequestDateTime}
                />
              ))}
              {historyTasks.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-xl border border-slate-200">
                  {isEnglish ? 'No approval history records' : 'ไม่มีประวัติการอนุมัติ'}
                </div>
              )}
            </div>

            {/* Desktop History Table (Visible on >= md) */}
            <div className="hidden md:block overflow-x-auto smooth-scroll">
              <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[960px]">
                <thead className="text-[11px] text-slate-600 font-bold uppercase bg-slate-100/90 border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 whitespace-nowrap w-[150px]">เอกสาร</th>
                    <th className="px-4 py-3.5 min-w-[240px]">โครงการ / วัตถุประสงค์</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[170px]">ผู้ขอซื้อ</th>
                    <th className="px-4 py-3.5 text-right whitespace-nowrap w-[130px]">ยอดเงิน (บาท)</th>
                    <th className="px-3 py-3.5 text-center whitespace-nowrap w-[120px]">ผลการพิจารณา</th>
                    <th className="px-4 py-3.5 text-right whitespace-nowrap w-[110px]">เอกสาร</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm bg-white">
                  {historyTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 align-top whitespace-nowrap">
                        <span className="font-mono text-indigo-700 font-bold text-sm block leading-tight">
                          {task.documentType} {task.documentId}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">
                          ระดับ {task.level}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <div className="font-bold text-slate-900 text-sm leading-snug break-words">
                          {task.prData?.department || 'โครงการก่อสร้าง'}
                        </div>
                        <div className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2 break-words">
                          {task.prData?.justification}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-top text-slate-600 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 text-sm leading-snug">
                          {task.requester}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          ดำเนินการเมื่อ {new Date(task.actionDate).toLocaleDateString(isThai ? 'th-TH' : 'en-US')}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                        <div className="text-slate-900 font-bold font-mono tabular-nums text-sm leading-tight">
                          {task.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">บาท</div>
                      </td>
                      <td className="px-3 py-3.5 align-top text-center whitespace-nowrap">
                        {task.actionStatus === 'Approved' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            อนุมัติแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            ปฏิเสธ
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                        <button 
                          onClick={() => setViewTask(task)}
                          className="px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:text-white hover:bg-indigo-600 bg-indigo-50/70 border border-indigo-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
                        >
                          ดูฟอร์ม A4
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Card View for History */
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {historyTasks.map((task) => (
              <HistoryApprovalCard
                key={task.id}
                task={task}
                onView={(t) => setViewTask(t)}
                isEnglish={isEnglish}
                formatRequestDateTime={formatRequestDateTime}
              />
            ))}
            {historyTasks.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 col-span-full">
                {isEnglish ? 'No approval history records' : 'ไม่มีประวัติการอนุมัติ'}
              </div>
            )}
          </div>
        )
      )}

      {/* Details modal with official standard PR document */}
      <DetailsModal 
        isOpen={!!viewTask} 
        onClose={() => setViewTask(null)} 
        maxWidth="max-w-5xl"
        title={`ตรวจสอบเอกสารมาตรฐาน: ${viewTask?.documentType} ${viewTask?.documentId}`}
        footer={viewTask && (
          <div className="flex flex-col sm:flex-row gap-2.5 w-full justify-between items-center">
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => printA4Document('standard-pr-doc-approval', `ใบขอซื้อ_${viewTask.documentId}`)}
                className="inline-flex items-center px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                title="พิมพ์เอกสารขนาด A4 มาตราฐานโดยตรง (หรือเลือกบันทึกเป็น PDF ผ่านเมนูพิมพ์)"
              >
                <Printer className="h-4 w-4 mr-1.5 text-indigo-600" />
                พิมพ์เอกสาร A4
              </button>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => { const id = viewTask.id; setViewTask(null); setConfirmState({ isOpen: true, taskId: id, action: 'reject' }); }}
                disabled={!canApprove}
                className={cn(
                  "inline-flex items-center justify-center px-4 py-2 border shadow-2xs text-xs font-bold rounded-lg transition-colors",
                  canApprove 
                    ? "border-slate-300 text-red-700 bg-white hover:bg-red-50 cursor-pointer" 
                    : "border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed opacity-60"
                )}
              >
                <XCircle className="h-4 w-4 mr-1 text-red-500" />
                ปฏิเสธคำขอ
              </button>
              <button 
                onClick={() => { const id = viewTask.id; setViewTask(null); setConfirmState({ isOpen: true, taskId: id, action: 'approve' }); }}
                disabled={!canApprove}
                className={cn(
                  "inline-flex items-center justify-center px-5 py-2 border shadow-sm text-xs font-bold rounded-lg transition-colors",
                  canApprove 
                    ? "border-transparent text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer" 
                    : "border-transparent text-white bg-slate-300 cursor-not-allowed opacity-60"
                )}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                อนุมัติคำขอ
              </button>
            </div>
          </div>
        )}
      >
        {viewTask && (
          <div>
            {viewTask.prData ? (
              <div>
                {/* Document Inspection Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 text-xs bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-slate-800">
                      {isEnglish ? 'Standard A4 Sheet (210 x 297 mm)' : 'ขนาดกระดาษมาตรฐาน A4 (210 x 297 มม.)'}
                    </span>
                    <span className="text-slate-300 hidden sm:inline">|</span>
                    <span className="text-slate-500 hidden sm:inline">
                      {isEnglish ? 'Official Requisition Form (FM-PUR-001)' : 'แบบฟอร์มขอซื้อทางการ (FM-PUR-001)'}
                    </span>
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setDocZoom(docZoom === 'fit' ? 'actual' : 'fit')}
                      className={cn(
                        "px-2.5 py-1 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer",
                        docZoom === 'fit'
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                          : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                      )}
                      title={docZoom === 'fit' ? 'สลับเป็นขนาดจริง 100%' : 'สลับเป็นย่อพอดีจอ'}
                    >
                      {docZoom === 'fit' ? (
                        <>
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>{isEnglish ? 'Actual Size (100%)' : 'ซูม 100% (ขนาดจริง)'}</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>{isEnglish ? 'Fit Width' : '📱 ย่อพอดีหน้าจอ'}</span>
                        </>
                      )}
                    </button>
                    <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">ProcureSync Engine</span>
                  </div>
                </div>

                {/* Desk Paper Canvas */}
                <div className="bg-slate-200/80 p-2 sm:p-6 rounded-2xl overflow-x-auto flex justify-center shadow-inner smooth-scroll">
                  <div className={cn(
                    "transition-all duration-200 origin-top",
                    docZoom === 'fit' 
                      ? "scale-[0.52] xs:scale-[0.62] sm:scale-[0.78] md:scale-[0.9] lg:scale-100 h-[620px] xs:h-[720px] sm:h-[900px] md:h-[1050px] lg:h-auto"
                      : "scale-100 h-auto"
                  )}>
                    <StandardPRDocument pr={viewTask.prData} id="standard-pr-doc-approval" />
                  </div>
                </div>
              </div>
            ) : viewTask.documentType === 'PO' && pos.find(p => p.poNumber === viewTask.documentId || p.id === viewTask.documentId) ? (
              <div className="bg-slate-200/80 p-2 sm:p-6 rounded-2xl overflow-x-auto flex justify-center shadow-inner smooth-scroll">
                <div className={cn(
                  "transition-all duration-200 origin-top",
                  docZoom === 'fit' 
                    ? "scale-[0.52] xs:scale-[0.62] sm:scale-[0.78] md:scale-[0.9] lg:scale-100 h-[620px] xs:h-[720px] sm:h-[900px] md:h-[1050px] lg:h-auto"
                    : "scale-100 h-auto"
                )}>
                  <StandardPODocument 
                    po={pos.find(p => p.poNumber === viewTask.documentId || p.id === viewTask.documentId)!} 
                    id="standard-pr-doc-approval" 
                  />
                </div>
              </div>
            ) : (
              <div className="bg-slate-200/80 p-2 sm:p-6 rounded-2xl overflow-x-auto flex justify-center shadow-inner smooth-scroll">
                <div className={cn(
                  "transition-all duration-200 origin-top",
                  docZoom === 'fit' 
                    ? "scale-[0.52] xs:scale-[0.62] sm:scale-[0.78] md:scale-[0.9] lg:scale-100 h-[620px] xs:h-[720px] sm:h-[900px] md:h-[1050px] lg:h-auto"
                    : "scale-100 h-auto"
                )}>
                  <div 
                    id="standard-pr-doc-approval" 
                    className="standard-a4-doc bg-white text-slate-900 w-[794px] min-h-[1123px] p-8 shadow-sm border border-slate-300 rounded-sm flex flex-col justify-between"
                    style={{
                      boxSizing: 'border-box',
                      colorScheme: 'light',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      fontFamily: "'Sarabun', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      lineHeight: 1.42,
                      wordBreak: 'normal',
                      overflowWrap: 'break-word',
                    }}
                  >
                    <div>
                      {/* Corporate Header */}
                      <div className="border-b border-slate-300 pb-3 mb-4 bg-white flex justify-between items-start gap-4">
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          {companyProfile?.logoUrl ? (
                            <div className="w-14 h-14 rounded-sm bg-white flex items-center justify-center flex-shrink-0 border border-slate-200 p-1 overflow-hidden shadow-2xs">
                              <img 
                                src={companyProfile.logoUrl} 
                                alt="Company Logo" 
                                className="max-h-full max-w-full object-contain" 
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-sm bg-slate-900 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 font-mono shadow-2xs">
                              PS
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h2 className="text-[15px] font-bold text-slate-900 leading-snug tracking-tight">
                              {companyProfile?.nameTh || 'บริษัท พรอคเคียวซิงค์ คอนสตรัคชั่น แอนด์ เอ็นจิเนียริ่ง จำกัด'}
                            </h2>
                            <p className="text-[10.5px] text-slate-500 font-bold tracking-wider uppercase mt-0.5">
                              {companyProfile?.nameEn || 'PROCURESYNC CONSTRUCTION & ENGINEERING CO., LTD.'}
                            </p>
                            <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                              {companyProfile?.address || '888 อาคารเอ็มไพร์ทาวเวอร์ ชั้น 24 ถนนสาทรใต้ แขวงยานนาวา เขตสาทร กรุงเทพฯ 10120'}
                            </p>
                            <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                              เลขประจำตัวผู้เสียภาษี: <span className="font-semibold text-slate-800 font-mono">{companyProfile?.taxId || '0105566012345'}</span> • โทร: {companyProfile?.phone || '02-123-4567'} • อีเมล: {companyProfile?.email || 'admin@procuresync.co.th'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end flex-shrink-0 w-64 shadow-2xs">
                          <div className="w-full bg-slate-900 text-white py-1 px-3 rounded-t-sm text-center tracking-wider font-bold text-xs uppercase">
                            {viewTask.documentType === 'PO' ? 'ใบสั่งซื้อ / PURCHASE ORDER (PO)' : 'ใบขอซื้อ / PURCHASE REQUISITION (PR)'}
                          </div>
                          <div className="w-full border-x border-b border-slate-300 bg-white p-2 text-xs space-y-1 rounded-b-sm">
                            <div className="flex justify-between items-baseline font-mono font-bold text-slate-900">
                              <span className="text-[11px] font-bold text-slate-700">เลขที่เอกสาร:</span>
                              <span className="text-sm">{viewTask.documentId}</span>
                            </div>
                            <div className="flex justify-between items-baseline border-t border-slate-100 pt-1 text-[11px]">
                              <span className="text-slate-500">วันที่:</span>
                              <span className="font-semibold text-slate-800">{new Date(viewTask.requestDate).toLocaleDateString(isThai ? 'th-TH' : 'en-US')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Information Matrix */}
                      <div className="border border-slate-300 rounded-sm mb-4 bg-white text-xs overflow-hidden shadow-2xs">
                        <table className="w-full border-collapse table-fixed text-left bg-white">
                          <tbody>
                            <tr className="border-b border-slate-200">
                              <th className="w-[140px] py-2 px-3 bg-slate-50/90 border-r border-slate-200 font-bold text-slate-800 text-[10.5px]">ผู้ออกเอกสาร</th>
                              <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-200">{viewTask.requester}</td>
                              <th className="w-[140px] py-2 px-3 bg-slate-50/90 border-r border-slate-200 font-bold text-slate-800 text-[10.5px]">ระดับการพิจารณา</th>
                              <td className="py-2 px-3 font-bold text-slate-900">ลำดับขั้นที่ {viewTask.level} (Level {viewTask.level})</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                              <th className="py-2 px-3 bg-slate-50/90 border-r border-slate-200 font-bold text-slate-800 text-[10.5px]">ประเภทเอกสาร</th>
                              <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-200">{viewTask.documentType === 'PR' ? 'ใบขอซื้อ (PR)' : 'ใบสั่งซื้อ (PO)'}</td>
                              <th className="py-2 px-3 bg-slate-50/90 border-r border-slate-200 font-bold text-slate-800 text-[10.5px]">สถานะเอกสาร</th>
                              <td className="py-2 px-3 align-middle">
                                {viewTask.status === 'Approved' ? (
                                  <span className="stamp-approved inline-flex items-center gap-1 px-2.5 py-0.5 border border-emerald-600 bg-emerald-50 text-emerald-800 font-bold rounded-sm text-[10px] shadow-2xs">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> อนุมัติแล้ว (Approved)
                                  </span>
                                ) : viewTask.status === 'Rejected' ? (
                                  <span className="stamp-rejected inline-flex items-center gap-1 px-2.5 py-0.5 border border-red-600 bg-red-50 text-red-800 font-bold rounded-sm text-[10px] shadow-2xs">
                                    <XCircle className="w-3.5 h-3.5 text-red-600" /> ไม่อนุมัติ (Rejected)
                                  </span>
                                ) : (
                                  <span className="stamp-pending inline-flex items-center gap-1 px-2.5 py-0.5 border border-amber-600 bg-amber-50 text-amber-800 font-bold rounded-sm text-[10px] shadow-2xs">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" /> รอการพิจารณา
                                  </span>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <th className="py-2.5 px-3 bg-slate-50/90 border-r border-slate-200 font-bold text-slate-800 text-[10.5px]">ยอดเงินรวมสุทธิ</th>
                              <td colSpan={3} className="py-2.5 px-3 font-bold font-mono text-slate-950 text-sm">
                                {(viewTask.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="border border-slate-200 rounded-sm p-3 mb-4 bg-slate-50/80 text-center flex items-center justify-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <p className="text-[11px] font-medium text-slate-700">
                          เอกสารทางการผ่านการตรวจสอบความถูกต้องตามกระบวนการจัดซื้อและระบบควบคุมภายในมาตรฐานสากล
                        </p>
                      </div>
                    </div>

                    <div>
                      {/* Approval Matrix */}
                      <ApprovalMatrixDocumentTable
                        steps={approvalMatrix}
                        documentType={viewTask.documentType}
                        documentTotalAmount={viewTask.amount}
                        isApproved={viewTask.status === 'Approved'}
                        isRejected={viewTask.status === 'Rejected'}
                        fallbackRequester={{
                          name: viewTask.requester,
                          position: 'ผู้จัดทำเอกสาร',
                          date: viewTask.requestDate
                        }}
                      />

                      {/* Footer */}
                      <div className="flex justify-between items-center text-[9.5px] text-slate-500 pt-2 mt-2 border-t border-slate-300 bg-white">
                        <div>พิมพ์เมื่อ: {new Date().toLocaleString(isThai ? 'th-TH' : 'en-US')} • ระบบจัดซื้อ ProcureSync ERP</div>
                        <div className="font-semibold text-slate-600">หน้า 1 จาก 1 • เอกสารควบคุมภายใน</div>
                        <div className="font-mono text-slate-600 font-semibold">DOC ID: {viewTask.documentId} • FM-PUR-APP</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DetailsModal>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(s => ({ ...s, isOpen: false }))}
        onConfirm={handleConfirm}
        title={confirmState.action === 'approve' ? 'ยืนยันการอนุมัติคำขอ' : 'ยืนยันการปฏิเสธคำขอ'}
        message={confirmState.action === 'approve' 
          ? 'คุณแน่ใจหรือไม่ที่จะอนุมัติรายการนี้? ระบบจะบันทึกลายมือชื่ออนุมัติและส่งต่อไปยังฝ่ายจัดซื้อเพื่อออก PO' 
          : 'คุณแน่ใจหรือไม่ที่จะปฏิเสธรายการนี้? ผู้ขอซื้อจะได้รับการแจ้งเตือนพร้อมเหตุผล'}
        confirmText={confirmState.action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}
        isDestructive={confirmState.action === 'reject'}
      />
    </div>
  );
}
