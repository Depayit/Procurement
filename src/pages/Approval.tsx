import { CheckCircle2, XCircle, Clock, FileText, Printer, Download, Building2 } from 'lucide-react';
import type { ApprovalTask, PurchaseRequest } from '../types';
import { useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DetailsModal } from '../components/DetailsModal';
import { StandardPRDocument } from '../components/StandardPRDocument';
import { exportToPDF, printA4Document } from '../lib/pdf';
import { useLanguage } from '../contexts/LanguageContext';
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
  const [tasks, setTasks] = useState<ApprovalTask[]>(MOCK_APPROVALS);
  const [historyTasks, setHistoryTasks] = useState<Array<ApprovalTask & { actionStatus: 'Approved' | 'Rejected'; actionDate: string }>>([
    {
      id: 'appr-hist-1',
      documentId: 'PR-2025-003',
      documentType: 'PR',
      requester: 'วิศวกรโครงสร้าง (งานงวด 1)',
      requestDate: '2025-05-10T09:00:00Z',
      amount: 450000,
      status: 'Approved',
      level: 1,
      actionStatus: 'Approved',
      actionDate: '2025-05-10T14:30:00Z',
      prData: {
        ...MOCK_PR_1,
        prNumber: 'PR-2025-003',
        department: 'โครงการ อาคารสำนักงานพระราม 9',
        justification: 'สั่งซื้อเหล็กเส้นข้ออ้อย SD40 มอก. สำหรับงานเสาเข็มเจาะงวดที่ 1',
        totalAmount: 450000
      }
    }
  ]);
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

  const handleConfirm = () => {
    if (!confirmState.taskId) return;
    const task = tasks.find(t => t.id === confirmState.taskId);
    if (!task) return;

    if (confirmState.action === 'approve') {
      setTasks(tasks.filter(t => t.id !== confirmState.taskId));
      setHistoryTasks(prev => [{ ...task, actionStatus: 'Approved', actionDate: new Date().toISOString() }, ...prev]);
      alert(isEnglish ? `Document approved successfully` : `อนุมัติเอกสารเรียบร้อยแล้ว`);
    } else {
      setTasks(tasks.filter(t => t.id !== confirmState.taskId));
      setHistoryTasks(prev => [{ ...task, actionStatus: 'Rejected', actionDate: new Date().toISOString() }, ...prev]);
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

      {activeTab === 'pending' ? (
        viewMode === 'table' ? (
          /* Table View for Pending Approvals */
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
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
                        <div className="font-bold text-slate-900 text-sm leading-snug">
                          {task.prData?.department || 'โครงการงานก่อสร้าง'}
                        </div>
                        <div className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2" title={task.prData?.justification}>
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
                          {task.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                            className="inline-flex items-center justify-center px-2.5 py-1.5 border border-slate-300 shadow-2xs text-xs font-semibold rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none transition-colors"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1 text-red-500" />
                            {t('approvals.rejectBtn')}
                          </button>
                          <button 
                            onClick={() => setConfirmState({ isOpen: true, taskId: task.id, action: 'approve' })}
                            className="inline-flex items-center justify-center px-2.5 py-1.5 border border-transparent shadow-2xs text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors"
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
                        className="inline-flex items-center justify-center px-3 py-1.5 border border-slate-300 shadow-2xs text-xs font-semibold rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none transition-colors">
                        <XCircle className="h-4 w-4 mr-1 text-red-500" />
                        {t('approvals.rejectBtn')}
                      </button>
                      <button 
                        onClick={() => setConfirmState({ isOpen: true, taskId: task.id, action: 'approve' })}
                        className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent shadow-2xs text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors">
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
          <div className="overflow-x-auto">
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
                      <div className="font-bold text-slate-900 text-sm leading-snug">
                        {task.prData?.department || 'โครงการก่อสร้าง'}
                      </div>
                      <div className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
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
                className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 shadow-2xs text-xs font-bold rounded-lg text-red-700 bg-white hover:bg-red-50 transition-colors cursor-pointer"
              >
                <XCircle className="h-4 w-4 mr-1 text-red-500" />
                ปฏิเสธคำขอ
              </button>
              <button 
                onClick={() => { const id = viewTask.id; setViewTask(null); setConfirmState({ isOpen: true, taskId: id, action: 'approve' }); }}
                className="inline-flex items-center justify-center px-5 py-2 border border-transparent shadow-sm text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
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
                <div className="flex items-center justify-between mb-3 text-xs text-slate-500 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-slate-700">ขนาดกระดาษมาตรฐาน A4 (210 x 297 มม.)</span>
                    <span className="text-slate-300 hidden sm:inline">|</span>
                    <span className="hidden sm:inline">สเกล 1:1 พร้อมพิมพ์และบันทึก PDF</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">ProcureSync A4 Standard Engine</span>
                </div>
                <div className="bg-slate-200/70 p-3 sm:p-6 rounded-xl overflow-x-auto flex justify-center shadow-inner">
                  <StandardPRDocument pr={viewTask.prData} id="standard-pr-doc-approval" />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">ผู้ขอ/ผู้ออกเอกสาร</p>
                    <p className="font-medium text-slate-800">{viewTask.requester}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">วันที่เอกสาร</p>
                    <p className="font-medium text-slate-800">{new Date(viewTask.requestDate).toLocaleString('th-TH')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">ประเภทเอกสาร</p>
                    <p className="font-medium text-slate-800">{viewTask.documentType === 'PR' ? 'ใบขอซื้อ (Purchase Request)' : 'ใบสั่งซื้อ (Purchase Order)'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">มูลค่ารวม</p>
                    <p className="font-bold text-indigo-700 text-lg font-mono">{viewTask.amount.toLocaleString()} บาท</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden p-6 text-center text-slate-500">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-700">พรีวิวเอกสาร {viewTask.documentType}</h3>
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
