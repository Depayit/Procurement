import React, { useState, useRef, useMemo } from 'react';
import { X, Plus, Trash2, Upload, File as FileIcon, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import type { PRItem } from '../types';

interface PRFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any | null;
}

export const MOCK_PROJECTS = [
  { id: 'p1', name: 'โครงการ คอนโดสุขุมวิท 101', boqBudget: 5000000, usedBudget: 3500000 },
  { id: 'p2', name: 'โครงการ หมู่บ้านจัดสรร บางนา', boqBudget: 12000000, usedBudget: 8000000 },
  { id: 'p3', name: 'โครงการ อาคารสำนักงาน พระราม 9', boqBudget: 8000000, usedBudget: 2500000 },
  { id: 'p4', name: 'งานซ่อมบำรุง ส่วนกลาง', boqBudget: 500000, usedBudget: 150000 },
];

export function PRFormModal({ isOpen, onClose, onSave, initialData }: PRFormModalProps) {
  const [department, setDepartment] = useState(initialData?.department || '');
  const [justification, setJustification] = useState(initialData?.justification || '');
  const [items, setItems] = useState<PRItem[]>(
    initialData?.items?.length ? initialData.items : [{ id: '1', description: '', quantity: 1, unitPrice: 0, unit: 'ชิ้น' }]
  );
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedProject = useMemo(() => MOCK_PROJECTS.find(p => p.name === department), [department]);
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
  const availableBudget = selectedProject ? selectedProject.boqBudget - selectedProject.usedBudget : 0;
  const isOverBudget = selectedProject && totalAmount > availableBudget;

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { id: Math.random().toString(), description: '', quantity: 1, unitPrice: 0, unit: 'ชิ้น' }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleChangeItem = (id: string, field: keyof PRItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      department,
      justification,
      items,
      totalAmount,
      files
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'แก้ไขใบขอซื้อ (PR)' : 'สร้างใบขอซื้อ (PR) ใหม่'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">โครงการ / ไซต์งาน</label>
              <select
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">-- เลือกโครงการ --</option>
                {MOCK_PROJECTS.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>

              {selectedProject && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-slate-500 font-medium">งบประมาณโครงการ (BOQ):</span>
                     <span className="font-bold text-slate-800">{selectedProject.boqBudget.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-slate-500 font-medium">ใช้ไปแล้ว:</span>
                     <span className="font-bold text-amber-600">{selectedProject.usedBudget.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200 mt-1">
                     <span className="text-slate-500 font-bold">งบประมาณคงเหลือ:</span>
                     <span className={cn("font-bold", isOverBudget ? "text-red-600" : "text-emerald-600")}>
                       {availableBudget.toLocaleString()} บาท
                     </span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">เหตุผลที่ขอซื้อ</label>
              <textarea 
                required
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="ระบุเหตุผลความจำเป็นในการสั่งซื้อ หรืออ้างอิง BOQ..."
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-slate-700">รายการสินค้า / วัสดุ</label>
            </div>
            
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <div className="col-span-1 border-r border-slate-200">No.</div>
                <div className="col-span-5 border-r border-slate-200">รายละเอียด</div>
                <div className="col-span-2 border-r border-slate-200">จำนวน</div>
                <div className="col-span-1 border-r border-slate-200">หน่วย</div>
                <div className="col-span-2 border-r border-slate-200">ราคา/หน่วย</div>
                <div className="col-span-1 text-center">ลบ</div>
              </div>
              
              <div className="divide-y divide-slate-100">
                {items.map((item, index) => (
                  <div key={item.id} className="p-2 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 text-center text-sm text-slate-500">{index + 1}</div>
                    <div className="col-span-5">
                      <input 
                        type="text" required
                        value={item.description}
                        onChange={(e) => handleChangeItem(item.id, 'description', e.target.value)}
                        placeholder="รายละเอียดวัสดุ..."
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <input 
                        type="number" required min="1"
                        value={item.quantity}
                        onChange={(e) => handleChangeItem(item.id, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="col-span-1">
                      <input 
                        type="text" required
                        value={item.unit}
                        onChange={(e) => handleChangeItem(item.id, 'unit', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <input 
                        type="number" required min="0" step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleChangeItem(item.id, 'unitPrice', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button 
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length === 1}
                        className="text-slate-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <button 
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <Plus className="h-4 w-4 mr-1" /> เพิ่มรายการ
                </button>
                <div className="flex items-center">
                  {isOverBudget && (
                    <div className="flex items-center text-sm text-red-600 bg-red-50 px-3 py-1 rounded mr-4">
                       <AlertCircle className="h-4 w-4 mr-1.5" />
                       เกินงบประมาณ (BOQ) คงเหลือ
                    </div>
                  )}
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wide mr-4">รวมเป็นเงิน</span>
                    <span className={cn("text-lg font-bold", isOverBudget ? "text-red-600" : "text-indigo-700")}>
                      {totalAmount.toLocaleString()} บาท
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">แนบไฟล์ (ใบเสนอราคา, สเปก ฯลฯ)</label>
            <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-600 font-medium">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</p>
              <p className="text-xs text-slate-500 mt-1">รองรับ PDF, JPG, PNG ขนาดไม่เกิน 10MB</p>
              <input 
                type="file" 
                multiple
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
            
            {files.length > 0 && (
              <ul className="mt-4 space-y-2">
                {files.map((file, idx) => (
                  <li key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded text-sm">
                    <div className="flex items-center">
                      <FileIcon className="h-4 w-4 text-slate-400 mr-3" />
                      <span className="font-medium text-slate-700">{file.name}</span>
                      <span className="text-slate-500 ml-2">({Math.round(file.size / 1024)} KB)</span>
                    </div>
                    <button type="button" onClick={() => removeFile(idx)} className="text-slate-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded font-semibold text-sm hover:bg-white transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-indigo-600 text-white rounded font-semibold text-sm hover:bg-indigo-700 shadow-sm transition-colors"
          >
            บันทึก PR
          </button>
        </div>
      </div>
    </div>
  );
}
