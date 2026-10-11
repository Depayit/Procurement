import { FileText, Plus, Wand2, Loader2, Check, Search, Truck, Store, Edit, Trash2, Printer, Download, ChevronDown, ChevronUp, Bell, AlertTriangle, Calendar, Settings2 } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DetailsModal } from '../components/DetailsModal';
import { exportToPDF, printA4Document } from '../lib/pdf';
import { cn } from '../lib/utils';
import type { PRItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

// Mock PR items to use as context for PO creation
const MOCK_AVAILABLE_PRS = [
  { id: 'pr1', prNumber: 'PR-2025-001', department: 'โครงการ คอนโดสุขุมวิท 101', totalAmount: 350000, date: '2025-05-18', items: [
    { id: '1', description: 'ปูนซีเมนต์ปอร์ตแลนด์ ประเภท 1', quantity: 500, unitPrice: 150, unit: 'ถุง' },
    { id: '2', description: 'เหล็กเส้นกลม SR24 ขนาด 9 มม.', quantity: 200, unitPrice: 120, unit: 'เส้น' },
    { id: '3', description: 'อิฐมอญแดง', quantity: 5000, unitPrice: 2.5, unit: 'ก้อน' },
    { id: '4', description: 'ทรายหยาบ', quantity: 10, unitPrice: 450, unit: 'คิว' }
  ] },
  { id: 'pr3', prNumber: 'PR-2025-003', department: 'โครงการ หมู่บ้านจัดสรร พระราม 2', totalAmount: 85000, date: '2025-05-19', items: [
    { id: '5', description: 'กระเบื้องแกรนิตโต้ 60x60', quantity: 200, unitPrice: 425, unit: 'กล่อง' }
  ] }
];

const MOCK_VENDORS = [
  { id: 'v1', name: 'บริษัท วัสดุก่อสร้างไทย จำกัด' },
  { id: 'v2', name: 'โฮมสแควร์ เซ็นเตอร์' },
  { id: 'v3', name: 'ดีดี อินเตอร์เทรดวัสดุ' }
];

type POStatus = 'Draft' | 'Issued' | 'Partially Received' | 'Completed' | 'Cancelled';

interface POItem extends PRItem {
  receivedQuantity: number;
  receipts?: { 
    id: string; 
    date: string; 
    quantity: number; 
    receivedBy: string;
    isDirectToSite?: boolean;
    deliveryNotes?: string[];
  }[];
}

interface PO {
  id: string;
  poNumber: string;
  prNumber: string;
  vendorName: string;
  poDescription: string;
  totalAmount: number;
  status: POStatus;
  date: string;
  expectedDeliveryDate?: string;
  items: POItem[];
}

const INITIAL_POS: PO[] = [
  {
    id: 'po1',
    poNumber: 'PO-2025-089',
    prNumber: 'PR-2025-001',
    vendorName: 'บริษัท วัสดุก่อสร้างไทย จำกัด',
    poDescription: 'สั่งซื้อวัสดุก่อสร้างหลักสำหรับไซต์งานสุขุมวิท',
    totalAmount: 120000,
    status: 'Issued',
    date: '2025-05-18',
    expectedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: MOCK_AVAILABLE_PRS[0].items.map(i => ({ ...i, receivedQuantity: 0 })),
  },
  {
    id: 'po2',
    poNumber: 'PO-2025-090',
    prNumber: 'PR-2025-002',
    vendorName: 'โฮมสแควร์ เซ็นเตอร์',
    poDescription: 'เหล็กเส้นเพิ่มเติมสำหรับลานจอดรถ',
    totalAmount: 45000,
    status: 'Partially Received',
    date: '2025-05-17',
    expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [MOCK_AVAILABLE_PRS[0].items[1]].map(i => ({ 
      ...i, 
      receivedQuantity: 50,
      receipts: [{ id: 'rcpt1', date: '2025-05-18T09:00:00Z', quantity: 50, receivedBy: 'วิชัย คลังสินค้า' }]
    })),
  },
];

const statusColors: Record<string, string> = {
  'Draft': 'bg-slate-100 text-slate-800',
  'Issued': 'bg-blue-100 text-blue-800',
  'Partially Received': 'bg-amber-100 text-amber-800',
  'Completed': 'bg-emerald-100 text-emerald-800',
  'Cancelled': 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  'Draft': 'ร่าง',
  'Issued': 'ออกคำสั่งซื้อแล้ว',
  'Partially Received': 'รับของบางส่วน',
  'Completed': 'รับของครบแล้ว',
  'Cancelled': 'ยกเลิก',
};

export function PurchaseOrderPage() {
  const { t, isEnglish } = useLanguage();
  const [pos, setPos] = useState<PO[]>(INITIAL_POS);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPRId, setSelectedPRId] = useState<string | null>(null);
  
  const currentPR = useMemo(() => MOCK_AVAILABLE_PRS.find(pr => pr.id === selectedPRId) || null, [selectedPRId]);
  const currentItems = currentPR?.items || [];

  const [receivingPO, setReceivingPO] = useState<PO | null>(null);
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({});
  const [isDirectToSite, setIsDirectToSite] = useState(false);
  const [deliveryNoteFiles, setDeliveryNoteFiles] = useState<File[]>([]);
  
  const [poDescription, setPoDescription] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(MOCK_VENDORS[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirmCreateOpen, setIsConfirmCreateOpen] = useState(false);
  const [viewPO, setViewPO] = useState<PO | null>(null);
  const [cancelPO, setCancelPO] = useState<PO | null>(null);
  const [expandedGR, setExpandedGR] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryThresholdDays, setDeliveryThresholdDays] = useState(3);
  const [showConfigThreshold, setShowConfigThreshold] = useState(false);

  const upcomingDeliveries = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thresholdDate = new Date(today.getTime() + deliveryThresholdDays * 24 * 60 * 60 * 1000);
    
    return pos.filter(po => {
      if (!po.expectedDeliveryDate || po.status === 'Completed' || po.status === 'Cancelled') return false;
      const deliveryDate = new Date(po.expectedDeliveryDate);
      deliveryDate.setHours(0, 0, 0, 0);
      return deliveryDate >= today && deliveryDate <= thresholdDate;
    });
  }, [pos, deliveryThresholdDays]);

  const filteredPOs = useMemo(() => {
    if (!searchQuery.trim()) return pos;
    const lowerQuery = searchQuery.toLowerCase();
    return pos.filter(po => 
      po.poNumber.toLowerCase().includes(lowerQuery) || 
      po.vendorName.toLowerCase().includes(lowerQuery) ||
      po.prNumber.toLowerCase().includes(lowerQuery)
    );
  }, [pos, searchQuery]);

  const handleCancelPO = () => {
    if (!cancelPO) return;
    setPos(pos.map(po => po.id === cancelPO.id ? { ...po, status: 'Cancelled' } : po));
    setCancelPO(null);
    alert(`ใบสั่งซื้อ ${cancelPO.poNumber} ถูกยกเลิกเรียบร้อยแล้ว แจ้งเตือนไปยังผู้ขายและทีมจัดซื้อแล้ว`);
  };

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-po-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: currentItems }),
      });
      const data = await response.json();
      if (data.description) {
        setPoDescription(data.description);
      } else if (data.error) {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to generate description', err);
      // Fallback for demo
      setPoDescription(`อ้างอิง ${currentPR?.prNumber || ''}: จัดซื้อวัสดุก่อสร้างตามรายการแนบ สำหรับโครงการ จัดส่งด่วนภายใน 3 วัน`);
    } finally {
      setIsGenerating(false);
    }
  };

  const createPO = () => {
    const vendor = MOCK_VENDORS.find(v => v.id === selectedVendor);
    // Set expected delivery to some random future date for demo (e.g. 2 days from now)
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + 2);

    const newPO: PO = {
      id: Math.random().toString(),
      poNumber: `PO-2025-0${pos.length + 91}`,
      prNumber: currentPR ? currentPR.prNumber : 'Unknown PR',
      vendorName: vendor ? vendor.name : 'Unknown Vendor',
      poDescription: poDescription || 'สั่งซื้อวัสดุก่อสร้าง',
      totalAmount: currentItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
      status: 'Issued',
      date: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: expectedDate.toISOString().split('T')[0],
      items: currentItems.map(i => ({ ...i, receivedQuantity: 0 })),
    };
    
    setPos([newPO, ...pos]);
    setIsConfirmCreateOpen(false);
    setIsCreating(false);
    setSelectedPRId(null);
    setPoDescription('');
    alert('สร้างใบสั่งซื้อ (PO) เรียบร้อยแล้ว');
  };

  const openReceiveGoods = (po: PO) => {
    setReceivingPO(po);
    const initialData: Record<string, number> = {};
    po.items.forEach(item => {
      initialData[item.id] = item.quantity - item.receivedQuantity;
    });
    setReceiveQuantities(initialData);
    setIsDirectToSite(false);
    setDeliveryNoteFiles([]);
  };

  const handleReceiveGoods = () => {
    if (!receivingPO) return;
    
    const now = new Date().toISOString();
    
    // Update PO items
    const updatedItems = receivingPO.items.map(item => {
      const addedQty = receiveQuantities[item.id] || 0;
      if (addedQty > 0) {
        const newReceipt = { 
          id: Math.random().toString(36).substr(2, 9), 
          date: now, 
          quantity: addedQty, 
          receivedBy: 'สมชาย คลังสินค้า',
          isDirectToSite,
          deliveryNotes: deliveryNoteFiles.map(f => f.name)
        };
        return {
          ...item,
          receivedQuantity: item.receivedQuantity + addedQty,
          receipts: [...(item.receipts || []), newReceipt]
        };
      }
      return item;
    });
    
    const isCompleted = updatedItems.every(item => item.receivedQuantity >= item.quantity);
    const newStatus: POStatus = isCompleted ? 'Completed' : 'Partially Received';
    
    setPos(pos.map(po => po.id === receivingPO.id ? { ...po, status: newStatus, items: updatedItems } : po));
    setReceivingPO(null);
    alert('บันทึกรับของ (GR) เรียบร้อยแล้ว ระบบได้ทำการอัปเดตสต็อกอัตโนมัติ');
  };

  if (receivingPO) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">บันทึกรับของ (Goods Receipt)</h1>
            <p className="text-sm text-slate-500 mt-1">อ้างอิง: {receivingPO.poNumber} ({receivingPO.vendorName})</p>
          </div>
          <button onClick={() => setReceivingPO(null)} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            ย้อนกลับ
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">รายการสินค้าที่ต้องรับเข้า</h3>
            <p className="text-sm text-slate-500">ระบุจำนวนสินค้าที่ได้รับจริงในรอบนี้</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white border-b border-slate-200 text-xs text-slate-500 font-bold uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">สินค้า/รายละเอียด</th>
                  <th className="px-4 py-3 text-center w-32">จำนวนที่สั่งซื้อ</th>
                  <th className="px-4 py-3 text-center w-32">รับแล้ว</th>
                  <th className="px-4 py-3 text-center w-32">ค้างรับ</th>
                  <th className="px-4 py-3 text-right">จำนวนที่รับรอบนี้</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receivingPO.items.map((item) => (
                  <tr key={item.id} className="bg-white">
                    <td className="px-4 py-4 text-slate-800 font-medium whitespace-nowrap">{item.description}</td>
                    <td className="px-4 py-4 text-center text-slate-600 whitespace-nowrap">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-4 text-center text-emerald-600 font-bold whitespace-nowrap">{item.receivedQuantity} {item.unit}</td>
                    <td className="px-4 py-4 text-center text-amber-600 font-bold whitespace-nowrap">{Math.max(0, item.quantity - item.receivedQuantity)} {item.unit}</td>
                    <td className="px-4 py-4 text-right whitespace-nowrap min-w-[200px]">
                      <div className="flex items-center justify-end">
                        <input 
                          type="number"
                          min="0"
                          max={item.quantity - item.receivedQuantity}
                          value={receiveQuantities[item.id] ?? ''}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const val = raw === '' ? 0 : parseInt(raw, 10);
                            setReceiveQuantities(prev => ({ ...prev, [item.id]: isNaN(val) ? 0 : val }));
                          }}
                          className="w-24 px-2 py-1 border border-slate-200 rounded text-right focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                        />
                        <span className="ml-2 text-slate-500 w-8 text-left">{item.unit}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-200 bg-white">
            <label className="flex items-center space-x-3 text-slate-700 font-medium mb-3 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={isDirectToSite} 
                onChange={(e) => setIsDirectToSite(e.target.checked)} 
                className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" 
              />
              <span>รับของตรงเข้าไซต์งาน (Direct to Site)</span>
            </label>

            {isDirectToSite && (
              <div className="mt-4 p-4 border border-indigo-100 bg-indigo-50/50 rounded-lg animate-in slide-in-from-top-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">แนบรูปถ่ายใบส่งของ</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={(e) => {
                    if (e.target.files) setDeliveryNoteFiles(Array.from(e.target.files));
                  }} 
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors" 
                />
                {deliveryNoteFiles.length > 0 && (
                  <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                    {deliveryNoteFiles.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        {f.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button 
              onClick={() => setReceivingPO(null)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shadow-sm"
            >
              ยกเลิก
            </button>
            <button 
              onClick={handleReceiveGoods}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Check className="h-4 w-4 mr-2" />
              ยืนยันรับของ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCreating) {
    if (!selectedPRId) {
      return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">สร้างใบสั่งซื้อ (PO) ใหม่</h1>
              <p className="text-sm text-slate-500 mt-1">กรุณาเลือกใบขอซื้อ (PR) ที่ต้องการใช้เป็นต้นทาง</p>
            </div>
            <button onClick={() => setIsCreating(false)} className="text-sm font-medium text-slate-500 hover:text-slate-700">
              ยกเลิก
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_AVAILABLE_PRS.map(pr => (
              <div 
                key={pr.id} 
                onClick={() => setSelectedPRId(pr.id)}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 cursor-pointer hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 uppercase tracking-wide">
                      อนุมัติแล้ว
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{pr.prNumber}</h3>
                  <p className="text-sm text-slate-500 mt-1">{pr.department}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                  <span className="text-slate-500">{pr.items.length} รายการ</span>
                  <span className="font-bold text-indigo-600">{(pr.totalAmount ?? 0).toLocaleString()} บาท</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">สร้างใบสั่งซื้อ (PO)</h1>
            <p className="text-sm text-slate-500 mt-1">สร้างจาก {currentPR?.prNumber || ''} (สถานะ: อนุมัติแล้ว)</p>
          </div>
          <button onClick={() => { setIsCreating(false); setSelectedPRId(null); }} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            ยกเลิก
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-6 text-sm">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">เปรียบเทียบและเลือกผู้ขาย (Vendor)</label>
              <div className="grid grid-cols-1 space-y-2">
                {MOCK_VENDORS.map((vendor, idx) => (
                  <label key={vendor.id} className={cn("flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors", selectedVendor === vendor.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:bg-slate-50")}>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        name="vendor" 
                        value={vendor.id} 
                        checked={selectedVendor === vendor.id}
                        onChange={() => setSelectedVendor(vendor.id)}
                        className="mr-3 h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" 
                      />
                      <div>
                        <div className="font-bold text-slate-800">{vendor.name}</div>
                        <div className="text-xs text-slate-500">เงื่อนไข: เครดิต {30 + (idx * 15)} วัน</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-indigo-700">ส่วนลด {(idx * 2)}%</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">คำอธิบายการสั่งซื้อ (PO Description)</label>
              <div className="relative">
                <textarea
                  value={poDescription}
                  onChange={(e) => setPoDescription(e.target.value)}
                  placeholder="กรอกคำอธิบายการสั่งซื้อ หรือใช้ AI สร้างอัตโนมัติ..."
                  className="w-full h-32 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-colors"
                />
              </div>
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                  className="inline-flex items-center px-4 py-2 border border-slate-200 rounded text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-indigo-600" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4 text-indigo-600" />
                  )}
                  {isGenerating ? 'กำลังสร้างอัตโนมัติ...' : 'เขียนคำอธิบายด้วย AI (Gemini)'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">รายการสินค้าอ้างอิง PR</h3>
              </div>
              <ul className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                {currentItems.map(item => (
                  <li key={item.id} className="p-4 flex justify-between items-center bg-white">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.description}</p>
                      <p className="text-xs text-slate-500 mt-1">จำนวน: {item.quantity} {item.unit} &bull; ราคาต่อหน่วย: {(item.unitPrice ?? 0).toLocaleString()} บาท</p>
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm text-slate-500 font-bold uppercase tracking-wide">ยอดรวมสุทธิ</span>
                <span className="text-lg font-bold text-indigo-700">
                  {currentItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0).toLocaleString()} บาท
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={() => setIsConfirmCreateOpen(true)}
                className="inline-flex items-center justify-center rounded text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-6 py-2 shadow-sm"

              >
                <Check className="mr-2 h-4 w-4" />
                ยืนยันการสร้าง PO
              </button>
            </div>
          </div>
        </div>

        <ConfirmDialog
          isOpen={isConfirmCreateOpen}
          onClose={() => setIsConfirmCreateOpen(false)}
          onConfirm={createPO}
          title="ยืนยันการสร้างใบสั่งซื้อ (PO)"
          message="คุณแน่ใจหรือไม่ที่จะสร้างใบสั่งซื้อนี้? ข้อมูลจะถูกบันทึกและพร้อมส่งให้ผู้ขาย"
          confirmText="สร้างใบสั่งซื้อ"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">{t('po.title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('po.subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2 shadow-sm transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isEnglish ? 'Create PO (from PR)' : 'สร้าง PO (จากใบ PR)'}
        </button>
      </div>

      {/* Upcoming Deliveries Notification Box */}
      {upcomingDeliveries.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-4 shadow-sm relative">
           <div className="flex items-start">
             <div className="flex-shrink-0">
               <Bell className="h-5 w-5 text-amber-500" />
             </div>
             <div className="ml-3 w-full">
               <div className="flex items-center justify-between">
                 <h3 className="text-sm font-bold text-amber-800">
                   แจ้งเตือนพัสดุใกล้ถึงกำหนดส่ง (ภายใน {deliveryThresholdDays} วัน)
                 </h3>
                 <button 
                   onClick={() => setShowConfigThreshold(!showConfigThreshold)}
                   className="text-amber-600 hover:bg-amber-100 p-1 rounded-md transition-colors"
                   title="ตั้งค่าแจ้งเตือน"
                 >
                   <Settings2 className="h-4 w-4" />
                 </button>
               </div>
               
               {showConfigThreshold && (
                 <div className="mt-2 mb-3 bg-white p-3 rounded-md border border-amber-200 flex items-center gap-3">
                   <label className="text-sm text-slate-700 font-medium">ตั้งค่าจำนวนวันล่วงหน้า:</label>
                   <input 
                     type="number" 
                     min="1" max="30"
                     value={deliveryThresholdDays}
                     onChange={e => setDeliveryThresholdDays(parseInt(e.target.value) || 3)}
                     className="w-20 px-2 py-1 border border-slate-200 rounded text-sm focus:ring-amber-500 focus:border-amber-500"
                   />
                   <span className="text-sm text-slate-500">วัน</span>
                 </div>
               )}

               <div className="mt-2 text-sm text-amber-700">
                 <ul className="list-disc pl-5 space-y-1">
                   {upcomingDeliveries.map(po => (
                     <li key={po.id}>
                       <strong>{po.poNumber}</strong> จาก <strong>{po.vendorName}</strong> - 
                       <span className="inline-flex items-center ml-1 font-semibold text-amber-900 border-b border-amber-300">
                         <Calendar className="h-3.5 w-3.5 mr-1" />
                         ถึงกำหนดส่ง {new Date(po.expectedDeliveryDate || '').toLocaleDateString('th-TH')}
                       </span>
                     </li>
                   ))}
                 </ul>
               </div>
             </div>
           </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตามเลข PO, ผู้ขาย, PR..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            />
          </div>
        </div>
        
        {/* Mobile PO Cards List (Visible on < md screens) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredPOs.map((po) => (
            <div key={po.id} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
              {/* Header Row: PO Number and Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 flex-shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-mono text-indigo-700 font-bold text-sm block leading-tight whitespace-nowrap">
                      {po.poNumber}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                      {po.items?.length || 0} รายการสั่งซื้อ
                    </span>
                  </div>
                </div>
                <span className={cn(
                  "inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border leading-none whitespace-nowrap",
                  statusColors[po.status] || "bg-slate-100 text-slate-800"
                )}>
                  {statusLabels[po.status] || po.status}
                </span>
              </div>

              {/* Vendor & PR Reference */}
              <div className="space-y-1">
                <div className="flex items-start gap-1.5">
                  <Store className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="font-bold text-slate-900 text-sm leading-snug break-words">
                    {po.vendorName}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-mono text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                    PR: <strong className="text-indigo-700">{po.prNumber}</strong>
                  </span>
                  {po.poDescription && (
                    <span className="text-slate-500 truncate text-[11px]">
                      • {po.poDescription}
                    </span>
                  )}
                </div>
              </div>

              {/* Schedule and Amount Grid */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">กำหนดส่งมอบ</span>
                  <span className="font-semibold text-amber-800 text-xs block whitespace-nowrap">
                    {po.expectedDeliveryDate 
                      ? new Date(po.expectedDeliveryDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
                      : 'ตามกำหนดสัญญา'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 whitespace-nowrap">
                    ออกเมื่อ: {new Date(po.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="border-l border-slate-200/80 pl-2.5 text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">ยอดเงินรวม</span>
                  <span className="font-bold text-slate-900 font-mono tabular-nums text-sm block whitespace-nowrap">
                    ฿{(po.totalAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 whitespace-nowrap">
                    บาท (THB)
                  </span>
                </div>
              </div>

              {/* Actions Row */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                {(po.status === 'Issued' || po.status === 'Partially Received') && (
                  <button 
                    onClick={() => openReceiveGoods(po)}
                    className="py-1.5 px-3 text-xs font-bold text-amber-700 hover:text-white hover:bg-amber-600 bg-amber-50 border border-amber-200 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    <span>รับของ</span>
                  </button>
                )}

                <button 
                  onClick={() => setViewPO(po)}
                  className="flex-1 py-1.5 px-3 text-xs font-bold text-indigo-700 hover:text-white hover:bg-indigo-600 bg-indigo-50/80 border border-indigo-200 rounded-lg transition-colors shadow-2xs text-center"
                >
                  ดูรายละเอียด
                </button>

                {(po.status === 'Draft' || po.status === 'Issued') && (
                  <button 
                    onClick={() => setCancelPO(po)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
                    title="ยกเลิกใบสั่งซื้อ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredPOs.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              ไม่พบข้อมูลใบสั่งซื้อ
            </div>
          )}
        </div>

        {/* Desktop Table View (Visible on >= md screens) */}
        <div className="hidden md:block overflow-x-auto smooth-scroll">
          <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[960px]">
            <thead className="text-[11px] text-slate-600 font-bold uppercase bg-slate-100/90 border-b border-slate-200 tracking-wider">
              <tr>
                <th className="px-4 py-3.5 whitespace-nowrap w-[150px]">เลขที่ PO</th>
                <th className="px-4 py-3.5 min-w-[200px]">ผู้ขาย (Vendor)</th>
                <th className="px-4 py-3.5 min-w-[220px]">อ้างอิง PR / โครงการ</th>
                <th className="px-4 py-3.5 whitespace-nowrap w-[150px]">วันที่และกำหนดส่ง</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap w-[130px]">จำนวนเงิน (บาท)</th>
                <th className="px-3 py-3.5 text-center whitespace-nowrap w-[110px]">สถานะ</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap w-[140px]">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm bg-white">
              {filteredPOs.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* PO Number */}
                  <td className="px-4 py-3.5 align-top whitespace-nowrap">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 mt-0.5 flex-shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-mono text-indigo-700 font-bold text-sm block leading-tight">{po.poNumber}</span>
                        <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">
                          {po.items?.length || 0} รายการสั่งซื้อ
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Vendor */}
                  <td className="px-4 py-3.5 align-top">
                    <div className="flex items-start gap-2">
                      <Store className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900 text-sm leading-snug break-words">{po.vendorName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">คู่ค้าที่ลงทะเบียน</div>
                      </div>
                    </div>
                  </td>

                  {/* PR Ref & Desc */}
                  <td className="px-4 py-3.5 align-top">
                    <div className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                      <span>PR:</span>
                      <span className="text-indigo-700">{po.prNumber}</span>
                    </div>
                    {po.poDescription && (
                      <div className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2 break-words" title={po.poDescription}>
                        {po.poDescription}
                      </div>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3.5 align-top text-slate-600 whitespace-nowrap">
                    <div className="text-xs text-slate-700 font-medium flex items-center gap-1">
                      <span className="text-slate-400 text-[11px]">ออกเอกสาร:</span>
                      <span>{new Date(po.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    {po.expectedDeliveryDate ? (
                      <div className="text-xs font-semibold text-amber-700 mt-1 flex items-center gap-1">
                        <span className="text-amber-500 text-[11px] font-normal">กำหนดส่ง:</span>
                        <span>{new Date(po.expectedDeliveryDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 mt-1">
                        พร้อมส่งมอบตามกำหนด
                      </div>
                    )}
                  </td>

                  {/* Total Amount */}
                  <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                    <div className="text-slate-900 font-bold font-mono tabular-nums text-sm leading-tight">
                      {(po.totalAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">
                      บาท (THB)
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3.5 align-top text-center whitespace-nowrap">
                    <span className={cn(
                      "inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border leading-none whitespace-nowrap",
                      statusColors[po.status] || "bg-slate-100 text-slate-800"
                    )}>
                      {statusLabels[po.status] || po.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {(po.status === 'Issued' || po.status === 'Partially Received') && (
                        <button 
                          onClick={() => openReceiveGoods(po)}
                          className="px-2.5 py-1.5 text-xs font-bold text-amber-700 hover:text-white hover:bg-amber-600 bg-amber-50 border border-amber-200 rounded-lg transition-colors flex items-center shadow-2xs"
                          title="รับของเข้าสต็อก (GR)"
                        >
                          <Truck className="h-3.5 w-3.5 mr-1" />
                          <span>รับของ</span>
                        </button>
                      )}
                      
                      {(po.status === 'Draft' || po.status === 'Issued') && (
                        <button 
                          onClick={() => setCancelPO(po)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="ยกเลิกใบสั่งซื้อ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}

                      <button 
                        onClick={() => setViewPO(po)}
                        className="px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:text-white hover:bg-indigo-600 bg-indigo-50/70 border border-indigo-200 rounded-lg transition-colors shadow-2xs"
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPOs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    ไม่พบข้อมูลใบสั่งซื้อ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DetailsModal 
        isOpen={!!viewPO} 
        onClose={() => { setViewPO(null); setExpandedGR({}); }} 
        maxWidth="max-w-5xl"
        title={`รายละเอียดใบสั่งซื้อ: ${viewPO?.poNumber}`}
        footer={
          <div className="flex flex-col sm:flex-row gap-2 w-full justify-between items-center">
            <div className="flex gap-2">
              <button 
                onClick={() => exportToPDF('po-document-view', `${viewPO?.poNumber}`)}
                className="inline-flex items-center px-3.5 py-2 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
                title="บันทึกเป็น PDF ขนาดมาตรฐาน A4"
              >
                <Download className="h-4 w-4 mr-1.5 text-emerald-600" />
                บันทึก PDF A4
              </button>
              <button 
                onClick={() => printA4Document('po-document-view', `ใบสั่งซื้อ_${viewPO?.poNumber}`)}
                className="inline-flex items-center px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                title="พิมพ์เอกสาร A4"
              >
                <Printer className="h-4 w-4 mr-1.5 text-indigo-600" />
                พิมพ์เอกสาร A4
              </button>
            </div>
            <button 
              onClick={() => setViewPO(null)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              ปิด
            </button>
          </div>
        }
      >
        {viewPO && (
          <div id="po-document-view" className="space-y-6 standard-a4-doc bg-white p-6 rounded-lg border border-slate-200 break-words [overflow-wrap:anywhere]">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">ผู้ขาย (Vendor)</p>
                <div className="flex items-center font-bold text-slate-900 mt-1 break-words leading-snug">
                  <Store className="h-4 w-4 mr-1.5 text-indigo-500 flex-shrink-0" />
                  <span>{viewPO.vendorName}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">อ้างอิง PR</p>
                <p className="font-mono font-bold text-indigo-700 mt-1">{viewPO.prNumber}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">คำอธิบาย</p>
                <p className="font-medium text-slate-900 mt-1 break-words leading-relaxed">{viewPO.poDescription || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">วันที่</p>
                <p className="font-medium text-slate-800 mt-1">{new Date(viewPO.date).toLocaleDateString('th-TH')}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">สถานะ</p>
                <span className={cn(
                  "inline-flex px-2 py-0.5 mt-1 rounded text-[10px] font-bold uppercase tracking-wide",
                  statusColors[viewPO.status] || "bg-slate-100 text-slate-800"
                )}>
                  {statusLabels[viewPO.status] || viewPO.status}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 block border-b border-slate-200 pb-2">
                รายการสินค้าที่สั่งซื้อ ({viewPO.items.length})
              </h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs sm:text-sm text-left border-collapse">
                  <thead className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2.5 w-10 text-center"></th>
                      <th className="px-4 py-2.5 min-w-[200px]">รายละเอียดสินค้า</th>
                      <th className="px-3 py-2.5 text-right w-24">จำนวนสั่ง</th>
                      <th className="px-3 py-2.5 text-right w-24 text-emerald-800">รับแล้ว</th>
                      <th className="px-3 py-2.5 text-center w-16">หน่วย</th>
                      <th className="px-4 py-2.5 text-right w-28">ราคา/หน่วย</th>
                      <th className="px-4 py-2.5 text-right w-32">รวมเป็นเงิน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {viewPO.items.map((item, idx) => (
                      <React.Fragment key={item.id || idx}>
                        <tr 
                          className={cn("transition-colors hover:bg-slate-50/70", item.receipts && item.receipts.length > 0 ? "cursor-pointer" : "")}
                          onClick={() => {
                            if (item.receipts && item.receipts.length > 0) {
                              setExpandedGR(prev => ({ ...prev, [item.id]: !prev[item.id] }))
                            }
                          }}
                        >
                          <td className="px-3 py-3 align-top text-center">
                            {item.receipts && item.receipts.length > 0 && (
                              <button className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/50 transition-colors">
                                {expandedGR[item.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="font-semibold text-slate-900 leading-snug">{item.description}</div>
                            {item.specification && (
                              <div className="text-xs text-slate-500 mt-0.5 leading-normal">{item.specification}</div>
                            )}
                          </td>
                          <td className="px-3 py-3 align-top text-right font-mono tabular-nums text-slate-800">{Number(item.quantity).toLocaleString()}</td>
                          <td className="px-3 py-3 align-top text-right font-mono tabular-nums text-emerald-700 font-bold">{Number(item.receivedQuantity || 0).toLocaleString()}</td>
                          <td className="px-3 py-3 align-top text-center text-slate-600">{item.unit}</td>
                          <td className="px-4 py-3 align-top text-right font-mono tabular-nums text-slate-700">{Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-4 py-3 align-top text-right font-mono tabular-nums font-bold text-slate-900">{((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                        {expandedGR[item.id] && item.receipts && item.receipts.length > 0 && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={7} className="px-12 py-4 border-b border-t border-slate-100 bg-[linear-gradient(90deg,transparent_46px,#f8fafc_46px)]">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center">
                                <Truck className="h-3.5 w-3.5 mr-1.5" />
                                Goods Receipt (GR) History
                              </h4>
                              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                <table className="w-full text-sm text-left">
                                  <thead className="bg-slate-50 text-xs text-slate-500 font-bold uppercase tracking-wide border-b border-slate-200">
                                    <tr>
                                      <th className="px-4 py-2">วันที่รับ</th>
                                      <th className="px-4 py-2">จำนวนรับ</th>
                                      <th className="px-4 py-2">ผู้รับสินค้า</th>
                                      <th className="px-4 py-2 text-center">เข้าไซต์งานตรง</th>
                                      <th className="px-4 py-2">ใบส่งของ</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {item.receipts.map(rcpt => (
                                      <tr key={rcpt.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-2 text-slate-600">{new Date(rcpt.date).toLocaleString('th-TH')}</td>
                                        <td className="px-4 py-2 text-emerald-600 font-bold">{rcpt.quantity} {item.unit}</td>
                                        <td className="px-4 py-2 text-slate-600">{rcpt.receivedBy}</td>
                                        <td className="px-4 py-2 text-center">
                                          {rcpt.isDirectToSite ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : '-'}
                                        </td>
                                        <td className="px-4 py-2 text-slate-600">
                                          {rcpt.deliveryNotes && rcpt.deliveryNotes.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                              {rcpt.deliveryNotes.map((note, i) => (
                                                <span key={i} className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer">
                                                  <FileText className="h-3 w-3 mr-1" />
                                                  {note}
                                                </span>
                                              ))}
                                            </div>
                                          ) : '-'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={6} className="px-4 py-3 text-right font-bold text-slate-600 uppercase text-xs tracking-wide">ยอดรวมสุทธิ</td>
                      <td className="px-4 py-3 text-right font-bold text-indigo-700">{(viewPO.totalAmount ?? 0).toLocaleString()} บาท</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </DetailsModal>

      <ConfirmDialog
        isOpen={!!cancelPO}
        onClose={() => setCancelPO(null)}
        onConfirm={handleCancelPO}
        title="ยืนยันการยกเลิกใบสั่งซื้อ"
        message="คุณแน่ใจหรือไม่ที่จะยกเลิกใบสั่งซื้อนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
        confirmText="ยกเลิกใบสั่งซื้อ"
        cancelText="ปิด"
        isDestructive={true}
      />
    </div>
  );
}

