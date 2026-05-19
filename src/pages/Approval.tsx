import { CheckCircle2, XCircle, Clock, FileText, Printer } from 'lucide-react';
import type { ApprovalTask } from '../types';
import { useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DetailsModal } from '../components/DetailsModal';
import { exportToPDF } from '../lib/pdf';

const MOCK_APPROVALS: ApprovalTask[] = [
  {
    id: 'a1',
    documentId: 'PR-2025-001',
    documentType: 'PR',
    requester: 'สมชาย ช่างก่อสร้าง (ไซต์งาน สุขุมวิท)',
    requestDate: '2025-05-18T10:00:00Z',
    amount: 350000,
    status: 'Pending',
    level: 1,
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
    // In a real app we'd dispatch an action here
    if (confirmState.action === 'approve') {
      alert(`ดำเนินการอนุมัติเรียบร้อย`);
    } else {
      alert(`ดำเนินการปฏิเสธเรียบร้อย`);
    }
    setConfirmState({ isOpen: false, taskId: null, action: null });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">อนุมัติ</h1>
        <p className="text-sm text-slate-500 mt-1">ตรวจสอบและดำเนินการกับเอกสารที่รอการอนุมัติของคุณ</p>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button className="px-4 py-2 border-b-2 border-indigo-600 text-indigo-600 font-semibold text-sm">
          รออนุมัติ (2)
        </button>
        <button className="px-4 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors">
          ประวัติ
        </button>
      </div>

      <div className="grid gap-4">
        {MOCK_APPROVALS.map((task) => (
          <div key={task.id} className="bg-white border text-left border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wide font-bold bg-amber-100 text-amber-800">
                    ระดับ {task.level}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800">
                    {task.documentType} {task.documentId}
                  </h3>
                </div>
                <div className="mt-2 text-sm text-slate-600 flex items-center gap-4">
                  <p>ขอโดย <span className="font-semibold text-slate-800">{task.requester}</span></p>
                  <p className="flex items-center text-slate-500">
                    <Clock className="h-4 w-4 mr-1.5" />
                    {new Date(task.requestDate).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                <p className="text-xl font-bold text-slate-800">
                  THB {task.amount.toLocaleString()}
                </p>
                <div className="mt-2 flex gap-2">
                  <button 
                    onClick={() => setConfirmState({ isOpen: true, taskId: task.id, action: 'reject' })}
                    className="inline-flex items-center justify-center px-3 py-1.5 border border-slate-200 shadow-sm text-sm font-medium rounded text-red-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                    <XCircle className="h-4 w-4 mr-1.5 text-red-500" />
                    ปฏิเสธ
                  </button>
                  <button 
                    onClick={() => setConfirmState({ isOpen: true, taskId: task.id, action: 'approve' })}
                    className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    อนุมัติ
                  </button>
                </div>
              </div>
            </div>
            
            {/* Context preview (simplified) */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500 line-clamp-1">
                <span className="font-bold text-slate-700">เหตุผล:</span> คำขอเร่งด่วนสำหรับวัสดุก่อสร้างในโครงการที่กำลังจะเริ่มเทปูนสัปดาห์หน้า...
              </p>
              <button 
                onClick={() => setViewTask(task)}
                className="mt-2 text-xs font-bold uppercase tracking-wide text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                ดูเอกสารเต็ม &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      <DetailsModal 
        isOpen={!!viewTask} 
        onClose={() => setViewTask(null)} 
        title={`รายละเอียดการอนุมัติ: ${viewTask?.documentType} ${viewTask?.documentId}`}
        footer={viewTask && (
          <div className="flex gap-2 w-full justify-end">
            <button 
              onClick={() => exportToPDF('pdf-content', `Approval_${viewTask?.documentId}`)}
              className="inline-flex items-center px-4 py-2 border border-slate-200 rounded text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm mr-auto"
            >
              <Printer className="h-4 w-4 mr-2" />
              Export PDF
            </button>
            <button 
              onClick={() => { setViewTask(null); setConfirmState({ isOpen: true, taskId: viewTask.id, action: 'reject' }); }}
              className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded text-red-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <XCircle className="h-4 w-4 mr-1.5 text-red-500" />
              ปฏิเสธ
            </button>
            <button 
              onClick={() => { setViewTask(null); setConfirmState({ isOpen: true, taskId: viewTask.id, action: 'approve' }); }}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              อนุมัติ
            </button>
          </div>
        )}
      >
        {viewTask && (
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
                <p className="font-bold text-indigo-700 text-lg">{viewTask.amount.toLocaleString()} บาท</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden p-6 text-center text-slate-500">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">พรีวิวเอกสาร</h3>
              <p className="text-xs mt-1">(ในระบบจริงจะแสดงรายละเอียดรายการสินค้า หรือ PDF เอกสารที่นี่)</p>
            </div>
          </div>
        )}
      </DetailsModal>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(s => ({ ...s, isOpen: false }))}
        onConfirm={handleConfirm}
        title={confirmState.action === 'approve' ? 'ยืนยันการอนุมัติ' : 'ยืนยันการปฏิเสธ'}
        message={confirmState.action === 'approve' 
          ? 'คุณแน่ใจหรือไม่ที่จะอนุมัติรายการนี้? การดำเนินการนี้จะถูกบันทึกในระบบ' 
          : 'คุณแน่ใจหรือไม่ที่จะปฏิเสธรายการนี้? ผู้ขอจะได้รับการแจ้งเตือน'}
        confirmText={confirmState.action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}
        isDestructive={confirmState.action === 'reject'}
      />
    </div>
  );
}
