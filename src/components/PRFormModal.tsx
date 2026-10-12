import React, { useState, useRef, useMemo } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Upload, 
  File as FileIcon, 
  AlertCircle, 
  Building2, 
  Boxes, 
  Zap, 
  Droplets, 
  ShieldCheck, 
  Wrench, 
  Eye, 
  FileSpreadsheet, 
  CheckCircle2,
  Printer
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { PRItem, PurchaseRequest, PRUrgency } from '../types';
import { StandardPRDocument } from './StandardPRDocument';
import { bahtText } from '../lib/bahtText';
import { useLanguage } from '../contexts/LanguageContext';
import { printA4Document } from '../lib/pdf';

interface PRFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: PurchaseRequest | null;
}

export const MOCK_PROJECTS = [
  { id: 'p1', code: 'PRJ-SKV101', name: 'โครงการ คอนโดสุขุมวิท 101', location: 'ไซต์งานสุขุมวิท 101 แขวงบางจาก พระโขนง', boqBudget: 5000000, usedBudget: 3500000 },
  { id: 'p2', code: 'PRJ-BNG02', name: 'โครงการ หมู่บ้านจัดสรร บางนา', location: 'ไซต์งานกม. 14 บางนา-ตราด สมุทรปราการ', boqBudget: 12000000, usedBudget: 8000000 },
  { id: 'p3', code: 'PRJ-RM9-03', name: 'โครงการ อาคารสำนักงาน พระราม 9', location: 'ไซต์งานสี่แยกพระราม 9 ห้วยขวาง', boqBudget: 8000000, usedBudget: 2500000 },
  { id: 'p4', code: 'PRJ-MAINT-04', name: 'งานซ่อมบำรุง ส่วนกลาง', location: 'อาคารสำนักงานใหญ่ สาทร', boqBudget: 500000, usedBudget: 150000 },
];

export function PRFormModal({ isOpen, onClose, onSave, initialData }: PRFormModalProps) {
  const { t, isEnglish } = useLanguage();
  const [department, setDepartment] = useState(initialData?.department || 'โครงการ คอนโดสุขุมวิท 101');
  const [requesterName, setRequesterName] = useState(initialData?.requesterName || 'สมปอง จัดซื้อ');
  const [requesterPosition, setRequesterPosition] = useState(initialData?.requesterPosition || 'วิศวกรควบคุมงาน');
  const [contactPhone, setContactPhone] = useState(initialData?.contactPhone || '089-123-4567');
  const [deliveryLocation, setDeliveryLocation] = useState(initialData?.deliveryLocation || 'ไซต์งานสุขุมวิท 101 แขวงบางจาก พระโขนง');
  const [requiredDate, setRequiredDate] = useState(
    initialData?.requiredDate ? initialData.requiredDate.split('T')[0] : 
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [urgency, setUrgency] = useState<PRUrgency>(initialData?.urgency || 'normal');
  const [justification, setJustification] = useState(initialData?.justification || '');
  const [suggestedVendor, setSuggestedVendor] = useState(initialData?.suggestedVendor || '');
  const [includeVat, setIncludeVat] = useState(initialData?.includeVat ?? true);
  
  const [items, setItems] = useState<PRItem[]>(
    initialData?.items?.length 
      ? initialData.items 
      : [{ id: '1', itemCode: 'MAT-001', description: '', specification: '', quantity: 1, unitPrice: 0, unit: 'ชิ้น', remark: '' }]
  );

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [docZoom, setDocZoom] = useState<'actual' | 'fit'>('actual');

  const selectedProject = useMemo(() => MOCK_PROJECTS.find(p => p.name === department), [department]);

  // When project changes, auto set default location
  const handleProjectChange = (projName: string) => {
    setDepartment(projName);
    const p = MOCK_PROJECTS.find(item => item.name === projName);
    if (p && (!deliveryLocation || deliveryLocation.includes('ไซต์งาน'))) {
      setDeliveryLocation(p.location);
    }
  };

  // Calculations
  const rawSubtotal = items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);
  const vatAmount = includeVat ? rawSubtotal * 0.07 : 0;
  const totalAmount = rawSubtotal + vatAmount;
  const availableBudget = selectedProject ? selectedProject.boqBudget - selectedProject.usedBudget : 0;
  const isOverBudget = selectedProject && totalAmount > availableBudget;

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items, 
      { 
        id: Math.random().toString(), 
        itemCode: `ITM-${String(items.length + 1).padStart(3, '0')}`,
        description: '', 
        specification: '',
        quantity: 1, 
        unitPrice: 0, 
        unit: 'ชิ้น',
        remark: ''
      }
    ]);
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
      projectCode: selectedProject?.code || 'PRJ-01',
      requesterName,
      requesterPosition,
      contactPhone,
      deliveryLocation,
      requiredDate,
      urgency,
      justification,
      suggestedVendor,
      items,
      includeVat,
      vatAmount,
      totalAmount,
      files
    });
  };

  // Simulated PR object for live preview
  const previewPR: PurchaseRequest = {
    id: initialData?.id || 'preview-id',
    prNumber: initialData?.prNumber || 'PR-2025-XXX',
    requesterName,
    requesterPosition,
    contactPhone,
    department,
    projectCode: selectedProject?.code || 'PRJ-MAIN-01',
    requestDate: initialData?.requestDate || new Date().toISOString(),
    requiredDate: requiredDate,
    deliveryLocation,
    urgency,
    status: initialData?.status || 'Draft',
    justification,
    suggestedVendor,
    items,
    includeVat,
    vatAmount,
    totalAmount,
    signatures: {
      requestedBy: {
        name: requesterName,
        position: requesterPosition,
        date: new Date().toISOString(),
        signed: true
      },
      checkedBy: {
        name: 'นายอภิสิทธิ์ วิศวกรโครงการ',
        position: 'Project Engineer',
        signed: false
      },
      budgetCheckedBy: {
        name: 'ฝ่ายควบคุมงบประมาณและจัดซื้อ',
        position: 'Cost Controller',
        signed: false
      },
      approvedBy: {
        name: 'ผู้อำนวยการสายงานก่อสร้าง',
        position: 'Project Director',
        signed: false
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto print:p-0">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity print-hidden"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-slate-200 print-area print:shadow-none print:border-none print:max-w-none print:w-full print:max-h-none print:rounded-none">
        {/* Header */}
        <div className="p-3.5 sm:px-6 sm:py-4 border-b border-slate-200 bg-slate-50/70 rounded-t-xl space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4 print-hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm shrink-0">
                PR
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-xl font-bold text-slate-800 leading-snug break-words">
                  {initialData 
                    ? (isEnglish ? `Edit PR: ${initialData.prNumber}` : `แก้ไขใบขอซื้อ: ${initialData.prNumber}`)
                    : (isEnglish ? 'Create Purchase Request (PR)' : 'สร้างใบขอซื้อ (Purchase Request)')}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 sm:line-clamp-none">
                  {isEnglish 
                    ? 'Construction standard form with BOQ budget check' 
                    : 'แบบฟอร์มมาตรฐานจัดซื้อและตรวจสอบงบ BOQ'}
                </p>
              </div>
            </div>

            <button 
              type="button"
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors sm:hidden shrink-0"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {/* View Mode Toggle */}
            <div className="bg-slate-200/80 p-0.5 rounded-lg flex text-xs font-semibold w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={cn(
                  "flex-1 sm:flex-initial px-3 py-1.5 rounded-md transition-colors text-center whitespace-nowrap",
                  activeTab === 'form' ? "bg-white text-indigo-700 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
                )}
              >
                {isEnglish ? 'Form Editor' : 'กรอกข้อมูลฟอร์ม'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={cn(
                  "flex-1 sm:flex-initial px-3 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1 text-center whitespace-nowrap",
                  activeTab === 'preview' ? "bg-white text-indigo-700 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Eye className="w-3.5 h-3.5" /> 
                <span>{isEnglish ? 'Preview A4' : 'พรีวิวฟอร์ม A4'}</span>
              </button>
            </div>

            <button 
              type="button"
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors hidden sm:block shrink-0"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        {activeTab === 'preview' ? (
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-100 print:p-0 print:bg-white smooth-scroll">
            {/* Top Toolbar in Preview */}
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-4 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs print-hidden">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-700">พรีวิวแบบฟอร์มมาตรฐาน A4 (210 x 297 มม.)</span>
                <span className="text-xs text-slate-400 hidden sm:inline">| สเกล 1:1 ตรงตามเอกสารทางการ</span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setDocZoom(docZoom === 'actual' ? 'fit' : 'actual')}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-indigo-700 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  title="สลับขนาดพรีวิวระหว่าง 1:1 A4 และย่อพอดีจอ"
                >
                  {docZoom === 'actual' ? '📱 ย่อพอดีหน้าจอ' : '🔍 ขนาดจริง 1:1 A4 (100%)'}
                </button>
                <button
                  type="button"
                  onClick={() => printA4Document('preview-pr-doc', `แบบร่าง_ใบขอซื้อ`)}
                  className="inline-flex items-center px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  title="พิมพ์เอกสารขนาด A4 มาตรฐาน (หรือเลือกบันทึกเป็น PDF ผ่านเมนูพิมพ์)"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                  พิมพ์เอกสาร A4
                </button>
              </div>
            </div>

            <div className="bg-slate-200/70 p-2 sm:p-6 rounded-xl overflow-x-auto flex justify-center shadow-inner smooth-scroll max-w-5xl mx-auto print:bg-white print:p-0 print:shadow-none">
              <div className={cn(
                "transition-all duration-200",
                docZoom === 'fit' ? "scale-[0.45] xs:scale-[0.55] sm:scale-100 origin-top h-[540px] sm:h-auto" : "scale-100"
              )}>
                <StandardPRDocument pr={previewPR} id="preview-pr-doc" />
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
            {/* Top Grid: Department, Project, Requester, Dates, Urgency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">โครงการ / ไซต์งาน *</label>
                <select
                  required
                  value={department}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {MOCK_PROJECTS.map(p => (
                    <option key={p.id} value={p.name}>{p.name} ({p.code})</option>
                  ))}
                </select>

                {selectedProject && (
                  <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                    <div className="flex justify-between">
                      <span>BOQ Budget:</span>
                      <span className="font-semibold text-slate-800">{(selectedProject?.boqBudget ?? 0).toLocaleString()} บ.</span>
                    </div>
                    <div className="flex justify-between">
                      <span>คงเหลือ:</span>
                      <span className={cn("font-bold", isOverBudget ? "text-red-600" : "text-emerald-600")}>
                        {(availableBudget ?? 0).toLocaleString()} บ.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">ผู้ขอซื้อ (Requester) & ตำแหน่ง *</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    placeholder="ชื่อผู้ขอ"
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <input
                    type="text"
                    value={requesterPosition}
                    onChange={(e) => setRequesterPosition(e.target.value)}
                    placeholder="ตำแหน่ง"
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="เบอร์โทรติดต่อหน้างาน (เช่น 089-123-4567)"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">วันที่ต้องการสินค้า & ความเร่งด่วน</label>
                <input
                  type="date"
                  required
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white mb-2"
                />
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setUrgency('normal')}
                    className={cn(
                      "py-1 text-center rounded text-[11px] font-semibold border transition-all",
                      urgency === 'normal' 
                        ? "bg-slate-800 text-white border-slate-800" 
                        : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    ปกติ
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('urgent')}
                    className={cn(
                      "py-1 text-center rounded text-[11px] font-semibold border transition-all",
                      urgency === 'urgent' 
                        ? "bg-amber-600 text-white border-amber-600" 
                        : "bg-white text-slate-600 border-slate-300 hover:bg-amber-50"
                    )}
                  >
                    ด่วน
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('emergency')}
                    className={cn(
                      "py-1 text-center rounded text-[11px] font-semibold border transition-all",
                      urgency === 'emergency' 
                        ? "bg-red-600 text-white border-red-600 font-bold" 
                        : "bg-white text-slate-600 border-slate-300 hover:bg-red-50"
                    )}
                  >
                    ด่วนที่สุด
                  </button>
                </div>
              </div>
            </div>

            {/* Delivery site and vendor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">สถานที่จัดส่ง (Delivery Location)</label>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="ระบุสถานที่ส่งของ เช่น หน้างานประตู 2 ไซต์สุขุมวิท..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">ร้านค้า / ผู้ขายที่เสนอแนะ (Suggested Vendor - ถ้ามี)</label>
                <input
                  type="text"
                  value={suggestedVendor}
                  onChange={(e) => setSuggestedVendor(e.target.value)}
                  placeholder="เช่น บริษัท ซีแพค จำกัด, สหพานิชย์..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            {/* Justification */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">วัตถุประสงค์และเหตุผลความจำเป็นในการสั่งซื้อ *</label>
              <textarea 
                required
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="ระบุเหตุผลความจำเป็นในการสั่งซื้อ อ้างอิง BOQ งวดงาน หรือสาเหตุความเร่งด่วน..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-18 bg-white"
              />
            </div>

            {/* Items Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    รายการพัสดุ / วัสดุ (ITEMS)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    ({items.length} รายการ)
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> เพิ่มแถวรายการ
                </button>
              </div>
              
              {/* Mobile Line Items Cards (Visible on < sm) */}
              <div className="sm:hidden space-y-3">
                {items.map((item, index) => {
                  const lineTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
                  return (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          รายการที่ {index + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono tabular-nums text-indigo-700">
                            ฿{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <button 
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={items.length === 1}
                            className="text-slate-400 hover:text-red-500 disabled:opacity-30 p-1"
                            title="ลบแถวนี้"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <input 
                          type="text" required
                          value={item.description}
                          onChange={(e) => handleChangeItem(item.id, 'description', e.target.value)}
                          placeholder="ชื่อสินค้า/พัสดุ *"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        />
                        <input 
                          type="text"
                          value={item.specification || ''}
                          onChange={(e) => handleChangeItem(item.id, 'specification', e.target.value)}
                          placeholder="รายละเอียดสเปก, เกรด, มอก. ..."
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[11px] text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">รหัสพัสดุ</label>
                          <input 
                            type="text"
                            value={item.itemCode || ''}
                            onChange={(e) => handleChangeItem(item.id, 'itemCode', e.target.value)}
                            placeholder="MAT-01"
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">จำนวน *</label>
                          <input 
                            type="number" required min="0.01" step="any"
                            value={item.quantity}
                            onChange={(e) => handleChangeItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-right font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">หน่วย *</label>
                          <input 
                            type="text" required
                            value={item.unit}
                            onChange={(e) => handleChangeItem(item.id, 'unit', e.target.value)}
                            placeholder="ชิ้น/ถุง"
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">ราคา/หน่วย (บาท) *</label>
                          <input 
                            type="number" required min="0" step="any"
                            value={item.unitPrice}
                            onChange={(e) => handleChangeItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-right font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">หมายเหตุ</label>
                          <input 
                            type="text"
                            value={item.remark || ''}
                            onChange={(e) => handleChangeItem(item.id, 'remark', e.target.value)}
                            placeholder="ระบุเพิ่มเติม..."
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View (Visible on >= sm) */}
              <div className="hidden sm:block border border-slate-300 rounded-lg overflow-x-auto bg-white smooth-scroll">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      <th className="py-2.5 px-2 text-center w-10 border-r border-slate-200">No.</th>
                      <th className="py-2.5 px-2 w-28 border-r border-slate-200">รหัสพัสดุ</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">รายการและสเปกวัสดุ *</th>
                      <th className="py-2.5 px-2 w-20 text-right border-r border-slate-200">จำนวน *</th>
                      <th className="py-2.5 px-2 w-16 text-center border-r border-slate-200">หน่วย *</th>
                      <th className="py-2.5 px-2 w-24 text-right border-r border-slate-200">ราคา/หน่วย *</th>
                      <th className="py-2.5 px-3 w-28 text-right border-r border-slate-200">รวมเป็นเงิน</th>
                      <th className="py-2.5 px-2 w-28 border-r border-slate-200">หมายเหตุ</th>
                      <th className="py-2.5 px-2 w-10 text-center">ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((item, index) => {
                      const lineTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70">
                          <td className="py-2 px-2 text-center text-slate-400 font-medium border-r border-slate-200 align-top pt-3">
                            {index + 1}
                          </td>
                          <td className="py-2 px-2 border-r border-slate-200 align-top">
                            <input 
                              type="text"
                              value={item.itemCode || ''}
                              onChange={(e) => handleChangeItem(item.id, 'itemCode', e.target.value)}
                              placeholder="รหัส เช่น MAT-01"
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                            />
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 space-y-1.5 align-top">
                            <input 
                              type="text" required
                              value={item.description}
                              onChange={(e) => handleChangeItem(item.id, 'description', e.target.value)}
                              placeholder="ชื่อสินค้า/วัสดุ..."
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                            />
                            <input 
                              type="text"
                              value={item.specification || ''}
                              onChange={(e) => handleChangeItem(item.id, 'specification', e.target.value)}
                              placeholder="รายละเอียดสเปก, เกรด, มอก. ..."
                              className="w-full px-2 py-1 border border-slate-200 rounded text-[11px] text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                            />
                          </td>
                          <td className="py-2 px-2 border-r border-slate-200 align-top">
                            <input 
                              type="number" required min="0.01" step="any"
                              value={item.quantity}
                              onChange={(e) => handleChangeItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs text-right font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                            />
                          </td>
                          <td className="py-2 px-2 border-r border-slate-200 align-top">
                            <input 
                              type="text" required
                              value={item.unit}
                              onChange={(e) => handleChangeItem(item.id, 'unit', e.target.value)}
                              placeholder="หน่วย"
                              className="w-full px-1.5 py-1.5 border border-slate-200 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                            />
                          </td>
                          <td className="py-2 px-2 border-r border-slate-200 align-top">
                            <input 
                              type="number" required min="0" step="any"
                              value={item.unitPrice}
                              onChange={(e) => handleChangeItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs text-right font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                            />
                          </td>
                          <td className="py-2 px-3 border-r border-slate-200 text-right font-bold font-mono text-slate-900 align-top pt-3 text-xs tabular-nums">
                            {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-2 border-r border-slate-200 align-top">
                            <input 
                              type="text"
                              value={item.remark || ''}
                              onChange={(e) => handleChangeItem(item.id, 'remark', e.target.value)}
                              placeholder="หมายเหตุ..."
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                            />
                          </td>
                          <td className="py-2 px-2 text-center align-top pt-2.5">
                            <button 
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={items.length === 1}
                              className="text-slate-400 hover:text-red-500 disabled:opacity-40 transition-colors p-1"
                              title="ลบแถว"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

                {/* Bottom Calculation & Baht Text in Table */}
                <div className="bg-slate-50 border-t border-slate-300 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <div className="text-[11px] font-bold text-slate-600">
                        จำนวนเงินตัวอักษร (Baht Text):
                      </div>
                      <div className="text-xs font-semibold text-slate-800 bg-white p-2 border border-slate-200 rounded mt-1">
                        {bahtText(totalAmount)}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={includeVat}
                            onChange={(e) => setIncludeVat(e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>คิดภาษีมูลค่าเพิ่ม (VAT 7%)</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-right font-mono">
                      <div className="flex justify-between md:justify-end gap-6 text-xs text-slate-600">
                        <span>รวมเป็นเงินก่อนภาษี:</span>
                        <span>{rawSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</span>
                      </div>
                      {includeVat && (
                        <div className="flex justify-between md:justify-end gap-6 text-xs text-slate-600">
                          <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                          <span>{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</span>
                        </div>
                      )}
                      <div className="flex justify-between md:justify-end gap-6 text-base font-bold text-indigo-700 pt-1 border-t border-slate-200">
                        <span>ยอดสุทธิรวมทั้งสิ้น:</span>
                        <span>{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</span>
                      </div>
                      {isOverBudget && (
                        <div className="flex items-center justify-end text-xs text-red-600 pt-1 font-sans">
                          <AlertCircle className="w-3.5 h-3.5 mr-1" /> ยอดเงินเกินงบประมาณ BOQ คงเหลือ!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            {/* Attachments */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">แนบไฟล์ (ใบเสนอราคา, สเปก, ภาพถ่ายหน้างาน ฯลฯ)</label>
              <div 
                className="border border-dashed border-slate-300 rounded-lg p-5 text-center hover:bg-slate-50 transition-colors cursor-pointer bg-white" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-6 w-6 text-slate-400 mb-1.5" />
                <p className="text-xs text-slate-600 font-medium">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</p>
                <p className="text-[11px] text-slate-400 mt-0.5">รองรับ PDF, JPG, PNG, Excel ขนาดไม่เกิน 10MB</p>
                <input 
                  type="file" 
                  multiple
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>
              
              {files.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {files.map((file, idx) => (
                    <li key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded text-xs">
                      <div className="flex items-center">
                        <FileIcon className="h-3.5 w-3.5 text-slate-400 mr-2" />
                        <span className="font-medium text-slate-700">{file.name}</span>
                        <span className="text-slate-500 ml-2">({Math.round(file.size / 1024)} KB)</span>
                      </div>
                      <button type="button" onClick={() => removeFile(idx)} className="text-slate-400 hover:text-red-500">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 rounded-b-xl print-hidden">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            {isEnglish ? 'Grand Total: ' : 'ยอดรวมสุทธิ: '}
            <span className="font-bold text-slate-800 text-sm font-mono">
              {(totalAmount ?? 0).toLocaleString()} {isEnglish ? 'THB' : 'บาท'}
            </span>
            {isOverBudget && <span className="text-red-600 ml-2 font-bold">{isEnglish ? '(Over BOQ Budget)' : '(เกินงบ BOQ)'}</span>}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold text-xs hover:bg-white transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button 
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {initialData 
                ? (isEnglish ? 'Save PR Changes' : 'บันทึกการแก้ไข PR') 
                : (isEnglish ? 'Confirm & Create PR' : 'ยืนยันสร้างใบขอซื้อ (PR)')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
