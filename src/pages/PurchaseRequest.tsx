import { useState, useMemo } from 'react';
import { Plus, Search, Filter, FileText, Trash2, Edit, AlertCircle, Printer } from 'lucide-react';
import { cn } from '../lib/utils';
import type { PurchaseRequest } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PRFormModal } from '../components/PRFormModal';
import { DetailsModal } from '../components/DetailsModal';
import { exportToPDF } from '../lib/pdf';

const INITIAL_MOCK_PRS: PurchaseRequest[] = [
  {
    id: '1',
    prNumber: 'PR-2025-001',
    requesterName: 'สมชาย ช่างก่อสร้าง',
    department: 'โครงการ คอนโดสุขุมวิท 101',
    requestDate: '2025-05-18T10:00:00Z',
    status: 'Pending Approval',
    totalAmount: 350000,
    items: [
      { id: '1', description: 'ปูนซีเมนต์ปอร์ตแลนด์ ประเภท 1', quantity: 500, unitPrice: 150, unit: 'ถุง' },
      { id: '2', description: 'เหล็กเส้นกลม SR24 ขนาด 9 มม.', quantity: 200, unitPrice: 120, unit: 'เส้น' },
      { id: '3', description: 'อิฐมอญแดง', quantity: 5000, unitPrice: 2.5, unit: 'ก้อน' },
      { id: '4', description: 'ทรายหยาบ', quantity: 10, unitPrice: 450, unit: 'คิว' }
    ],
  },
  {
    id: '2',
    prNumber: 'PR-2025-002',
    requesterName: 'วิชัย คุมงาน',
    department: 'โครงการ หมู่บ้านจัดสรร บางนา',
    requestDate: '2025-05-17T14:30:00Z',
    status: 'Approved',
    totalAmount: 245000,
    items: [
      { id: '2', description: 'เหล็กเส้นกลม SR24 ขนาด 9 มม.', quantity: 2041, unitPrice: 120, unit: 'เส้น' },
    ],
  },
  {
    id: '3',
    prNumber: 'PR-2025-003',
    requesterName: 'สมปอง จัดซื้อ',
    department: 'งานซ่อมบำรุง ส่วนกลาง',
    requestDate: '2025-05-15T09:15:00Z',
    status: 'PO Created',
    totalAmount: 12500,
    items: [],
  },
];

const statusColors: Record<string, string> = {
  'Draft': 'bg-slate-100 text-slate-800',
  'Pending Approval': 'bg-amber-100 text-amber-800',
  'Approved': 'bg-indigo-100 text-indigo-800',
  'Rejected': 'bg-red-100 text-red-800',
  'PO Created': 'bg-emerald-100 text-emerald-800',
};

const statusLabels: Record<string, string> = {
  'Draft': 'ร่าง',
  'Pending Approval': 'รออนุมัติ',
  'Approved': 'อนุมัติแล้ว',
  'Rejected': 'ถูกปฏิเสธ',
  'PO Created': 'สร้าง PO แล้ว',
};

export function PurchaseRequestPage() {
  const [prs, setPrs] = useState<PurchaseRequest[]>(INITIAL_MOCK_PRS);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPR, setEditingPR] = useState<PurchaseRequest | null>(null);
  const [viewPR, setViewPR] = useState<PurchaseRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPRs = useMemo(() => {
    if (!searchQuery.trim()) return prs;
    const lowerQuery = searchQuery.toLowerCase();
    return prs.filter(pr => 
      pr.prNumber.toLowerCase().includes(lowerQuery) || 
      pr.requesterName.toLowerCase().includes(lowerQuery) ||
      pr.department.toLowerCase().includes(lowerQuery)
    );
  }, [prs, searchQuery]);

  const handleCreateNew = () => {
    setEditingPR(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pr: PurchaseRequest) => {
    setEditingPR(pr);
    setIsModalOpen(true);
  };

  const handleSavePR = (data: any) => {
    if (editingPR) {
      // Update
      setPrs(prs.map(p => p.id === editingPR.id ? { ...p, department: data.department, totalAmount: data.totalAmount, items: data.items } : p));
      alert(`แก้ไข PR สำเร็จ (Mock)`);
    } else {
      // Create
      const newPR: PurchaseRequest = {
        id: Math.random().toString(),
        prNumber: `PR-2025-00${prs.length + 1}`,
        requesterName: 'สมปอง จัดซื้อ',
        department: data.department,
        requestDate: new Date().toISOString(),
        status: 'Draft',
        totalAmount: data.totalAmount,
        items: data.items,
      };
      setPrs([newPR, ...prs]);
      alert(`บันทึก PR สำเร็จ (Mock) วางไว้ในสถานะ ร่าง`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      setPrs(prs.filter(p => p.id !== deleteId));
      alert('ลบเอกสารเรียบร้อย');
    }
    setDeleteId(null);
  };

  const handleCancel = () => {
    if (cancelId) {
       setPrs(prs.map(p => p.id === cancelId ? { ...p, status: 'Rejected' } : p));
       alert('ยกเลิกเอกสารเรียบร้อย');
    }
    setCancelId(null);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">ระบบขอซื้อ (PR) และโครงการ</h1>
          <p className="text-sm text-slate-500 mt-1">จัดการคำขอสั่งซื้อ ตรวจสอบงบประมาณ (BOQ) ตามโครงการ</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2 shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          สร้าง PR
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตามเลขที่ PR, ผู้ขอ, โครงการ..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            />
          </div>
          <button className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 border border-slate-200 rounded bg-white shadow-sm hover:bg-slate-50 transition-colors">
            <Filter className="mr-2 h-4 w-4" /> กรอง
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 font-bold uppercase bg-slate-50 border-b border-slate-200 tracking-wide">
              <tr>
                <th className="px-6 py-3">เลขที่ PR</th>
                <th className="px-6 py-3">ผู้ขอ</th>
                <th className="px-6 py-3">โครงการ/ไซต์งาน</th>
                <th className="px-6 py-3">วันที่</th>
                <th className="px-6 py-3">จำนวนเงิน (บาท)</th>
                <th className="px-6 py-3">สถานะ</th>
                <th className="px-6 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPRs.map((pr) => (
                <tr key={pr.id} className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-slate-400" />
                    {pr.prNumber}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{pr.requesterName}</td>
                  <td className="px-6 py-4 text-slate-600">{pr.department}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(pr.requestDate).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-6 py-4 text-slate-800 font-bold">
                    {pr.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide",
                      statusColors[pr.status] || "bg-slate-100 text-slate-800"
                    )}>
                      {statusLabels[pr.status] || pr.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {(pr.status === 'Draft' || pr.status === 'Pending Approval') && (
                        <button 
                          onClick={() => handleEdit(pr)}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors"
                          title="แก้ไขเอกสาร"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {(pr.status === 'Draft') && (
                        <button 
                          onClick={() => setDeleteId(pr.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="ลบเอกสาร"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                       {(pr.status === 'Pending Approval') && (
                         <button 
                         onClick={() => setCancelId(pr.id)}
                         className="text-slate-500 hover:text-slate-700 font-bold text-xs uppercase transition-colors"
                         title="ยกเลิกเอกสาร"
                       >
                         ยกเลิก
                       </button>
                       )}
                       
                       <button 
                         onClick={() => setViewPR(pr)}
                         className="text-slate-600 hover:text-slate-800 font-bold text-xs uppercase tracking-wide transition-colors"
                       >
                        ดูรายละเอียด
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPRs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    ไม่พบข้อมูลที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DetailsModal 
        isOpen={!!viewPR} 
        onClose={() => setViewPR(null)} 
        title={`รายละเอียดใบขอซื้อ: ${viewPR?.prNumber}`}
        footer={
          <div className="flex gap-2 w-full justify-end">
            <button 
              onClick={() => exportToPDF('pdf-content', `${viewPR?.prNumber}`)}
              className="inline-flex items-center px-4 py-2 border border-slate-200 rounded text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Printer className="h-4 w-4 mr-2" />
              Export PDF / พิมพ์
            </button>
            <button 
              onClick={() => setViewPR(null)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              ปิด
            </button>
          </div>
        }
      >
        {viewPR && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">ผู้ขอ</p>
                <p className="font-medium text-slate-800">{viewPR.requesterName}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">โครงการ/ไซต์งาน</p>
                <p className="font-medium text-slate-800">{viewPR.department}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">วันที่</p>
                <p className="font-medium text-slate-800">{new Date(viewPR.requestDate).toLocaleDateString('th-TH')}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">สถานะ</p>
                <span className={cn(
                  "inline-flex px-2 py-0.5 mt-1 rounded text-[10px] font-bold uppercase tracking-wide",
                  statusColors[viewPR.status] || "bg-slate-100 text-slate-800"
                )}>
                  {statusLabels[viewPR.status] || viewPR.status}
                </span>
              </div>
              {viewPR.department.includes('โครงการ') && (
                <div className="col-span-2 pt-3 border-t border-slate-200 mt-2 flex justify-between items-center">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center">การตรวจสอบงบประมาณ (BOQ)</p>
                  <p className="font-medium text-emerald-600 text-sm">ยอดเงินอยู่ในกรอบงบประมาณ</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 block border-b border-slate-200 pb-2">รายการที่ขอซื้อ</h3>
              {viewPR.items && viewPR.items.length > 0 ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-bold uppercase tracking-wide">
                      <tr>
                        <th className="px-4 py-2">รายละเอียด</th>
                        <th className="px-4 py-2 text-right">จำนวน</th>
                        <th className="px-4 py-2 text-center">หน่วย</th>
                        <th className="px-4 py-2 text-right">ราคา/หน่วย</th>
                        <th className="px-4 py-2 text-right">รวมเป็นเงิน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewPR.items.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="px-4 py-2 text-slate-800">{item.description}</td>
                          <td className="px-4 py-2 text-right text-slate-800">{item.quantity}</td>
                          <td className="px-4 py-2 text-center text-slate-600">{item.unit}</td>
                          <td className="px-4 py-2 text-right text-slate-800">{item.unitPrice.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right text-slate-800 font-bold">{(item.quantity * item.unitPrice).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-right font-bold text-slate-600 uppercase text-xs tracking-wide">มูลค่ารวมทั้งหมด</td>
                        <td className="px-4 py-3 text-right font-bold text-indigo-700">{viewPR.totalAmount.toLocaleString()} บาท</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic">ไม่มีรายการที่ระบุไว้ในแบบร่างนี้</p>
              )}
            </div>
          </div>
        )}
      </DetailsModal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="ยืนยันการลบแบบร่าง"
        message="คุณแน่ใจหรือไม่ที่จะลบเอกสารแบบร่างนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
        confirmText="ลบ"
        isDestructive={true}
      />
      
      <ConfirmDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancel}
        title="ยืนยันการยกเลิกคำขอ"
        message="คุณแน่ใจหรือไม่ที่จะยกเลิกคำขอ PR นี้? การดำเนินการนี้จะทำให้สถานะเปลี่ยนเป็นถูกปฏิเสธ/ยกเลิก"
        confirmText="ยกเลิกคำขอ"
        isDestructive={true}
      />

      <PRFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePR}
        initialData={editingPR}
      />
    </div>
  );
}
