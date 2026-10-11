import React, { useState, useEffect } from 'react';
import { X, ArrowDown, ArrowUp, ArrowRightLeft, ScanLine, ClipboardCheck, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import type { InventoryItem } from '../types';

interface InventoryTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  items: InventoryItem[];
  defaultItemId?: string;
}

export function InventoryTransactionModal({ isOpen, onClose, onSave, items, defaultItemId }: InventoryTransactionModalProps) {
  const [type, setType] = useState<'receive' | 'issue' | 'transfer'>('receive');
  const [itemId, setItemId] = useState(defaultItemId || '');
  const [quantity, setQuantity] = useState('');
  const [refDoc, setRefDoc] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (defaultItemId) setItemId(defaultItemId);
  }, [defaultItemId]);

  if (!isOpen) return null;

  const selectedItem = items.find(i => i.id === itemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId || !quantity) return;
    onSave({ type, itemId, quantity: Number(quantity), refDoc, location, note });
    // Reset
    setItemId(''); setQuantity(''); setRefDoc(''); setLocation(''); setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">จัดการสต็อก (รับ/เบิก/โอน)</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setType('receive')}
              className={cn("flex items-center justify-center py-2 text-sm font-bold rounded-md transition-colors", type === 'receive' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              <ArrowDown className="w-4 h-4 mr-1.5" /> รับเข้า
            </button>
            <button
              type="button"
              onClick={() => setType('issue')}
              className={cn("flex items-center justify-center py-2 text-sm font-bold rounded-md transition-colors", type === 'issue' ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              <ArrowUp className="w-4 h-4 mr-1.5" /> เบิกออก
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={cn("flex items-center justify-center py-2 text-sm font-bold rounded-md transition-colors", type === 'transfer' ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              <ArrowRightLeft className="w-4 h-4 mr-1.5" /> โอนย้าย
            </button>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">รายการสินค้า</label>
            <select required value={itemId} onChange={(e) => setItemId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none pr-8">
              <option value="">-- เลือกรายการ --</option>
              {items.map(i => <option key={i.id} value={i.id}>[{i.code}] {i.name} (คงเหลือ: {i.quantity} {i.unit})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">จำนวน</label>
              <div className="relative">
                <input required type="number" min="0.01" step="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00" />
                <span className="absolute right-3 top-2.5 text-sm text-slate-400 font-bold">{selectedItem?.unit || '-'}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">เอกสารอ้างอิง (PR/PO/Job)</label>
              <input type="text" value={refDoc} onChange={(e) => setRefDoc(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="เช่น PO-2025-089" />
            </div>
          </div>

          {type === 'transfer' && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">สถานที่ปลายทาง</label>
              <input required type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="ระบุสถานที่..." />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">หมายเหตุ</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" rows={2} placeholder="รายละเอียดเพิ่มเติม..."></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold text-sm hover:bg-slate-50">ยกเลิก</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 shadow-sm">บันทึกรายการ</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { QRCodeScannerModal } from './QRCodeScannerModal';
export type { QRCodeScannerModalProps } from './QRCodeScannerModal';


interface PhysicalCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemId: string, newQuantity: number, note: string) => void;
  item: InventoryItem | null;
}

export function PhysicalCountModal({ isOpen, onClose, onSave, item }: PhysicalCountModalProps) {
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen && item) {
      setQuantity(item.quantity.toString());
      setNote('');
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity) return;
    onSave(item.id, Number(quantity), note);
  };

  const diff = Number(quantity) - item.quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">ตรวจนับสต็อก (Physical Count)</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-500 font-bold mb-1">{item.code}</p>
          <p className="font-bold text-slate-800">{item.name}</p>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">ยอดคงเหลือในระบบ:</span>
            <span className="font-bold text-slate-800 text-lg">{item.quantity} {item.unit}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">ยอดนับจริง (Physical Qty)</label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input required type="number" min="0" step="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-lg font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                <span className="absolute right-3 top-3 text-sm text-slate-400 font-bold">{item.unit}</span>
              </div>
              <div className="w-24 text-right">
                {quantity !== '' && diff !== 0 ? (
                  <span className={cn("text-sm font-bold", diff > 0 ? "text-green-600" : "text-red-600")}>
                    {diff > 0 ? '+' : ''}{diff}
                  </span>
                ) : <span className="text-sm font-bold text-slate-400">0</span>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">หมายเหตุ (สาเหตุของส่วนต่าง)</label>
            <textarea required={diff !== 0} value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" rows={3} placeholder={diff !== 0 ? "โปรดระบุสาเหตุที่ยอดไม่ตรงกัน..." : "รายละเอียดเพิ่มเติม..."}></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold text-sm hover:bg-slate-50">ยกเลิก</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 shadow-sm">ยืนยันยอด</button>
          </div>
        </form>
      </div>
    </div>
  );
}
