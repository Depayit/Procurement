import { CheckCircle2, XCircle, Clock, FileText, Printer, Download, Building2, ZoomIn, ZoomOut, Maximize2, ShieldCheck, Check, FileCheck, ShieldAlert, Lock } from 'lucide-react';
import type { ApprovalTask, PurchaseRequest } from '../types';
import { useState, useMemo } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DetailsModal } from '../components/DetailsModal';
import { StandardPRDocument } from '../components/StandardPRDocument';
import { exportToPDF, printA4Document } from '../lib/pdf';
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

export function ApprovalPage() {
  const { t, isThai, isEnglish } = useLanguage();
  const { addNotification } = useNotifications();
  const { approvalTasks, approvePR, rejectPR, prs } = useProcurement();
  const { currentUser, canApprove } = useAuth();
  const tasks = approvalTasks;
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">{t('approvals.title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('approvals.subtitle')}</p>
        </div>

        {/* View Mode Toggle */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-2xs">
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
              viewMode === 'table' ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            )}
          >
            {isEnglish ? 'Table View' : 'มุมมองตาราง'}
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
              viewMode === 'card' ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            )}
          >
            {isEnglish ? 'Card View' : 'มุมมองการ์ด'}
          </button>
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
            <div className="md:hidden divide-y divide-slate-100">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
                  {/* Top Row: Level & Document */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wide font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        {isEnglish ? `L${task.level}` : `ระดับ ${task.level}`}
                      </span>
                      <span className="font-mono text-indigo-700 font-bold text-sm block leading-tight whitespace-nowrap">
                        {task.documentType} {task.documentId}
                      </span>
                    </div>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 font-medium whitespace-nowrap">
                      แบบฟอร์มมาตรฐาน
                    </span>
                  </div>

                  {/* Project & Justification */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug break-words">
                      {task.prData?.department || 'โครงการงานก่อสร้าง'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2 break-words">
                      {task.prData?.justification || 'คำขอวัสดุก่อสร้างตามงบประมาณ BOQ งานงวดที่ 2'}
                    </p>
                  </div>

                  {/* Requester & Amount Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">ผู้ขอซื้อ</span>
                      <span className="font-semibold text-slate-800 text-xs block truncate">
                        {task.requester}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 whitespace-nowrap">
                        {new Date(task.requestDate).toLocaleDateString(isThai ? 'th-TH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="border-l border-slate-200/80 pl-2.5 text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">ยอดเงินขออนุมัติ</span>
                      <span className="font-bold text-slate-900 font-mono tabular-nums text-sm block whitespace-nowrap">
                        ฿{(task.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5 whitespace-nowrap">
                        บาท (THB)
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <button 
                      onClick={() => setViewTask(task)}
                      className="py-1.5 px-3 text-xs font-bold text-indigo-700 hover:text-white hover:bg-indigo-600 bg-indigo-50/80 border border-indigo-200 rounded-lg transition-colors shadow-2xs"
                    >
                      ดูฟอร์ม A4
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setConfirmState({ isOpen: true, taskId: task.id, action: 'reject' })}
                        disabled={!canApprove}
                        className={cn(
                          "inline-flex items-center justify-center px-3 py-1.5 border shadow-2xs text-xs font-semibold rounded-lg transition-colors",
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
                          "inline-flex items-center justify-center px-3 py-1.5 border shadow-2xs text-xs font-bold rounded-lg transition-colors",
                          canApprove 
                            ? "border-transparent text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer" 
                            : "border-transparent text-white bg-slate-300 cursor-not-allowed opacity-60"
                        )}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        {t('approvals.approveBtn')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <h3 className="font-bold text-slate-800">ไม่มีเอกสารที่รอการอนุมัติ</h3>
                  <p className="text-xs text-slate-500 mt-1">คุณได้ดำเนินการกับเอกสารทั้งหมดเรียบร้อยแล้ว</p>
                </div>
              )}
            </div>

            {/* Desktop Table (Visible on >= md) */}
            <div className="hidden md:block overflow-x-auto smooth-scroll">
              <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[960px]">
                <thead className="text-[11px] text-slate-600 font-bold uppercase bg-slate-100/90 border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 whitespace-nowrap w-[150px]">ระดับ & เอกสาร</th>
                    <th className="px-4 py-3.5 min-w-[240px]">โครงการ / วัตถุประสงค์</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[170px]">ผู้ขอซื้อและวันที่</th>
                    <th className="px-4 py-3.5 text-right whitespace-nowrap w-[130px]">ยอดเงิน (บาท)</th>
                    <th className="px-3 py-3.5 text-center whitespace-nowrap w-[100px]">ตรวจสอบ</th>
                    <th className="px-4 py-3.5 text-right whitespace-nowrap w-[170px]">การพิจารณา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm bg-white">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Document & Level */}
                      <td className="px-4 py-3.5 align-top whitespace-nowrap">
                        <div className="flex items-start gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wide font-bold bg-amber-100 text-amber-800 border border-amber-300 mt-0.5">
                            {isEnglish ? `L${task.level}` : `ระดับ ${task.level}`}
                          </span>
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
                      <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
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
          <div className="grid gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white border text-left border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wide font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        {isEnglish ? `Level ${task.level}` : `ระดับ ${task.level}`}
                      </span>
                      <h3 className="text-lg font-bold text-slate-800">
                        {task.documentType} {task.documentId}
                      </h3>
                      {task.documentType === 'PR' && (
                        <span className="text-xs px-2 py-0.5 rounded font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {isEnglish ? 'Standard Form' : 'แบบฟอร์มมาตรฐาน'}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-slate-600 flex flex-wrap items-center gap-4">
                      <p>{isEnglish ? 'Requested by' : 'ขอโดย'} <span className="font-semibold text-slate-800">{task.requester}</span></p>
                      <p className="flex items-center text-slate-500">
                        <Clock className="h-4 w-4 mr-1.5" />
                        {new Date(task.requestDate).toLocaleString(isThai ? 'th-TH' : 'en-US')}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                    <p className="text-xl font-bold font-mono text-slate-800">
                      {task.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {isEnglish ? 'THB' : 'บาท'}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button 
                        onClick={() => setConfirmState({ isOpen: true, taskId: task.id, action: 'reject' })}
                        disabled={!canApprove}
                        className={cn(
                          "inline-flex items-center justify-center px-3 py-1.5 border shadow-2xs text-xs font-semibold rounded-lg transition-colors",
                          canApprove 
                            ? "border-slate-300 text-red-700 bg-white hover:bg-red-50 cursor-pointer" 
                            : "border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed opacity-60"
                        )}
                      >
                        <XCircle className="h-4 w-4 mr-1 text-red-500" />
                        {t('approvals.rejectBtn')}
                      </button>
                      <button 
                        onClick={() => setConfirmState({ isOpen: true, taskId: task.id, action: 'approve' })}
                        disabled={!canApprove}
                        className={cn(
                          "inline-flex items-center justify-center px-3 py-1.5 border shadow-2xs text-xs font-bold rounded-lg transition-colors",
                          canApprove 
                            ? "border-transparent text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer" 
                            : "border-transparent text-white bg-slate-300 cursor-not-allowed opacity-60"
                        )}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        {t('approvals.approveBtn')}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Context preview */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-600 line-clamp-1">
                    <span className="font-bold text-slate-700">เหตุผล:</span> {task.prData?.justification || 'คำขอวัสดุก่อสร้างตามงบประมาณ BOQ งานงวดที่ 2'}
                  </p>
                  <button 
                    onClick={() => setViewTask(task)}
                    className="text-xs font-bold uppercase tracking-wide text-indigo-600 hover:text-indigo-800 transition-colors ml-4 whitespace-nowrap"
                  >
                    ดูเอกสารมาตรฐาน &rarr;
                  </button>
                </div>
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800">ไม่มีเอกสารที่รอการอนุมัติ</h3>
                <p className="text-xs text-slate-500 mt-1">คุณได้ดำเนินการกับเอกสารทั้งหมดเรียบร้อยแล้ว</p>
              </div>
            )}
          </div>
        )
      ) : (
        /* History Table View */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Mobile History Cards (Visible on < md) */}
          <div className="md:hidden divide-y divide-slate-100">
            {historyTasks.map((task) => (
              <div key={task.id} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-indigo-700 font-bold text-sm block leading-tight whitespace-nowrap">
                      {task.documentType} {task.documentId}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      ระดับ {task.level}
                    </span>
                  </div>
                  {task.actionStatus === 'Approved' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                      <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                      อนุมัติแล้ว
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
                      <XCircle className="w-2.5 h-2.5 mr-1" />
                      ปฏิเสธ
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug break-words">
                    {task.prData?.department || 'โครงการก่อสร้าง'}
                  </h4>
                  {task.prData?.justification && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 break-words">
                      {task.prData.justification}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">ผู้ขอซื้อ</span>
                    <span className="font-semibold text-slate-800 text-xs block truncate">
                      {task.requester}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 whitespace-nowrap">
                      {new Date(task.actionDate).toLocaleDateString(isThai ? 'th-TH' : 'en-US')}
                    </span>
                  </div>
                  <div className="border-l border-slate-200/80 pl-2.5 text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">ยอดเงิน</span>
                    <span className="font-bold text-slate-900 font-mono tabular-nums text-sm block whitespace-nowrap">
                      ฿{task.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">บาท (THB)</span>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1 border-t border-slate-100">
                  <button 
                    onClick={() => setViewTask(task)}
                    className="w-full py-1.5 px-3 text-xs font-bold text-indigo-700 hover:text-white hover:bg-indigo-600 bg-indigo-50/80 border border-indigo-200 rounded-lg transition-colors shadow-2xs text-center"
                  >
                    ดูฟอร์ม A4
                  </button>
                </div>
              </div>
            ))}
            {historyTasks.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">
                ไม่มีประวัติการอนุมัติ
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
                        className="px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:text-white hover:bg-indigo-600 bg-indigo-50/70 border border-indigo-200 rounded-lg transition-colors shadow-2xs"
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
                title="พิมพ์เอกสารขนาด A4 มาตราฐานโดยตรง"
              >
                <Printer className="h-4 w-4 mr-1.5 text-indigo-600" />
                พิมพ์เอกสาร A4
              </button>
              <button 
                onClick={() => exportToPDF('standard-pr-doc-approval', `Approval_${viewTask.documentId}`)}
                className="inline-flex items-center px-3.5 py-2 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
                title="บันทึกไฟล์เป็น PDF ขนาด A4 100% สัดส่วนมาตรฐาน"
              >
                <Download className="h-4 w-4 mr-1.5 text-emerald-600" />
                บันทึก PDF A4
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
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2 text-xs bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span className="font-bold text-slate-800">
                      {isEnglish ? `Standard Document: ${viewTask.documentType}` : `เอกสารมาตรฐาน: ${viewTask.documentType}`}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-indigo-700 font-bold">{viewTask.documentId}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-xs">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">ผู้ออกเอกสาร</p>
                    <p className="font-bold text-slate-900 mt-0.5">{viewTask.requester}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">วันที่เอกสาร</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{new Date(viewTask.requestDate).toLocaleDateString(isThai ? 'th-TH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">ประเภทเอกสาร</p>
                    <p className="font-semibold text-indigo-700 mt-0.5">{viewTask.documentType === 'PR' ? 'ใบขอซื้อ (PR)' : 'ใบสั่งซื้อ (PO)'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">มูลค่ารวม</p>
                    <p className="font-black text-slate-950 text-sm font-mono mt-0.5">{(viewTask.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</p>
                  </div>
                </div>

                <div className="bg-slate-200/80 p-4 sm:p-8 rounded-2xl flex justify-center shadow-inner">
                  <div className="bg-white w-[794px] min-h-[600px] p-8 shadow-md border border-slate-300 text-slate-900">
                    <div className="border-b-2 border-slate-800 pb-3 mb-4 flex justify-between items-start">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">บริษัท พรอคเคียวซิงค์ คอนสตรัคชั่น แอนด์ เอ็นจิเนียริ่ง จำกัด</h2>
                        <p className="text-xs text-slate-600 font-bold uppercase mt-0.5">PROCURESYNC CONSTRUCTION & ENGINEERING CO., LTD.</p>
                      </div>
                      <div className="text-right">
                        <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded uppercase">
                          {viewTask.documentType === 'PO' ? 'ใบสั่งซื้อ / PURCHASE ORDER' : 'ใบขอซื้อ / PURCHASE REQUISITION'}
                        </span>
                        <p className="font-mono font-bold text-indigo-700 text-sm mt-1">{viewTask.documentId}</p>
                      </div>
                    </div>

                    <div className="border border-slate-300 p-4 rounded bg-slate-50 mb-4 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block">ผู้จัดทำ / ออกเอกสาร:</span>
                        <span className="font-bold text-slate-900">{viewTask.requester}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">วันที่ออกเอกสาร:</span>
                        <span className="font-semibold text-slate-800">{new Date(viewTask.requestDate).toLocaleString('th-TH')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">ระดับการพิจารณา:</span>
                        <span className="font-bold text-indigo-700">ลำดับขั้นที่ {viewTask.level} (Level {viewTask.level})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">ยอดรวมสุทธิทั้งสิ้น:</span>
                        <span className="font-black text-slate-950 font-mono text-base">{(viewTask.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</span>
                      </div>
                    </div>

                    <div className="border border-slate-300 p-6 rounded-lg text-center text-slate-500 bg-white">
                      <FileCheck className="w-12 h-12 text-indigo-500 mx-auto mb-2" />
                      <h4 className="font-bold text-slate-800 text-sm">เอกสารพร้อมสำหรับการพิจารณาอนุมัติ</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        ท่านสามารถคลิก &ldquo;อนุมัติคำขอ&rdquo; เพื่อลงลายมือชื่อดิจิทัลและส่งต่อในระบบ หรือคลิก &ldquo;ปฏิเสธคำขอ&rdquo; หากต้องการส่งกลับแก้ไข
                      </p>
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
