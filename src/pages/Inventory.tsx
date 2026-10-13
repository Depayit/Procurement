import { 
  Package, 
  ArrowDownUp, 
  AlertTriangle, 
  CheckSquare, 
  Printer, 
  FileSpreadsheet, 
  Barcode, 
  Store, 
  Tag, 
  Search, 
  CheckCircle2, 
  Box,
  Layers,
  Sparkles,
  Building2,
  UploadCloud
} from 'lucide-react';
import { useState, useRef, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import type { InventoryItem } from '../types';
import { cn } from '../lib/utils';
import { 
  InventoryTransactionModal, 
  QRCodeScannerModal, 
  PhysicalCountModal,
  SkuBarcodeLabelModal,
  SkuBarcode
} from '../components/InventoryModals';
import { DetailsModal } from '../components/DetailsModal';
import * as xlsx from 'xlsx';
import { useLanguage } from '../contexts/LanguageContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { useAuth } from '../contexts/AuthContext';

export function InventoryPage() {
  const { t, isEnglish } = useLanguage();
  const { inventory, addInventoryItem, transactInventory, companyProfile } = useProcurement();
  const { currentUser } = useAuth();
  
  // Modals state
  const [isTransactOpen, setIsTransactOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [countItem, setCountItem] = useState<InventoryItem | null>(null);
  const [viewItem, setViewItem] = useState<InventoryItem | null>(null);
  const [transactDefaultId, setTransactDefaultId] = useState<string | undefined>();
  const [barcodeModalItem, setBarcodeModalItem] = useState<InventoryItem | null>(null);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  
  // Search & Filter state
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const locations = Array.from(new Set(inventory.map(i => i.location)));
  
  // Filter inventory by location and search query (SKU, barcode, name, category, binLocation)
  const filteredInventory = inventory.filter(item => {
    const matchesLocation = !selectedLocation || item.location === selectedLocation;
    if (!matchesLocation) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const itemSku = (item.sku || '').toLowerCase();
    const itemBarcode = (item.barcode || '').toLowerCase();
    const itemCode = (item.code || '').toLowerCase();
    const itemName = (item.name || '').toLowerCase();
    const itemCat = (item.category || '').toLowerCase();
    const itemBin = (item.binLocation || '').toLowerCase();
    const itemProjects = (item.projectAllocations || []).join(' ').toLowerCase();

    return (
      itemSku.includes(query) ||
      itemBarcode.includes(query) ||
      itemCode.includes(query) ||
      itemName.includes(query) ||
      itemCat.includes(query) ||
      itemBin.includes(query) ||
      itemProjects.includes(query)
    );
  });

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = xlsx.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = xlsx.utils.sheet_to_json(ws);
        
        const newItems: InventoryItem[] = (data as any[]).map(row => {
          const itemCode = row.code || row['รหัส'] || `ITEM-${Math.floor(Math.random() * 1000)}`;
          const itemSku = row.sku || row['SKU'] || `SKU-${itemCode}`;
          return {
            id: Math.random().toString(36).substr(2, 9),
            code: itemCode,
            sku: itemSku,
            barcode: String(row.barcode || row['บาร์โค้ด'] || row.sku || itemCode),
            name: row.name || row['ชื่อสินค้า'] || 'นำเข้าใหม่',
            category: row.category || row['หมวดหมู่'] || 'ทั่วไป',
            quantity: Number(row.quantity || row['จำนวน'] || 0),
            unit: row.unit || row['หน่วย'] || 'ชิ้น',
            minStockLevel: Number(row.minStockLevel || row['ขั้นต่ำ'] || 0),
            location: row.location || row['สถานที่'] || 'คลังพัสดุก่อสร้างกลาง (Central Material Hub)',
            binLocation: row.binLocation || row['จุดเก็บ'] || 'โซนจัดเก็บ A-01',
            centralWarehouse: 'คลังพัสดุก่อสร้างกลาง (Central Material Hub)',
            projectAllocations: ['โครงการ คอนโดสุขุมวิท 101', 'โครงการ โรงพยาบาลบางนา', 'ไซต์งานทั่วไป'],
            unitPrice: Number(row.unitPrice || row['ราคา'] || 0),
          };
        });

        newItems.forEach(item => addInventoryItem(item));
        alert(`นำเข้าข้อมูล ${newItems.length} รายการสำเร็จ`);
      } catch (err) {
        console.error("Error importing file:", err);
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์');
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleTransaction = (data: any) => {
    if (data.type === 'receive') {
      transactInventory(data.itemId, data.quantity, 'IN', data.note || 'รับเข้าคลัง');
    } else if (data.type === 'issue') {
      transactInventory(data.itemId, data.quantity, 'OUT', data.note || 'เบิกใช้งาน');
    } else if (data.type === 'transfer') {
      const sourceItem = inventory.find(i => i.id === data.itemId);
      if (sourceItem) {
        transactInventory(data.itemId, data.quantity, 'OUT', `โอนย้ายไปยัง ${data.location}`);
        const targetItem = inventory.find(i => i.code === sourceItem.code && i.location === data.location);
        if (targetItem) {
          transactInventory(targetItem.id, data.quantity, 'IN', `รับโอนจาก ${sourceItem.location}`);
        } else {
          addInventoryItem({
            code: sourceItem.code,
            sku: sourceItem.sku,
            barcode: sourceItem.barcode,
            name: sourceItem.name,
            category: sourceItem.category,
            quantity: data.quantity,
            unit: sourceItem.unit,
            minStockLevel: sourceItem.minStockLevel,
            location: data.location,
            binLocation: sourceItem.binLocation,
            centralWarehouse: sourceItem.centralWarehouse,
            projectAllocations: sourceItem.projectAllocations,
            unitPrice: sourceItem.unitPrice
          });
        }
      }
    }
    alert(`บันทึกรายการ${data.type === 'receive' ? 'รับ' : data.type === 'issue' ? 'เบิก' : 'โอน'}เรียบร้อย`);
    setIsTransactOpen(false);
  };

  const handleScanSuccess = (scannedCode: string) => {
    const clean = scannedCode.toLowerCase().trim();
    const item = inventory.find(i => 
      (i.sku && i.sku.toLowerCase() === clean) ||
      (i.barcode && i.barcode.toLowerCase() === clean) ||
      i.code.toLowerCase() === clean || 
      i.id.toLowerCase() === clean ||
      i.name.toLowerCase() === clean
    );
    setIsScannerOpen(false);
    if (item) {
      setTimeout(() => {
        setTransactDefaultId(item.id);
        setIsTransactOpen(true);
      }, 300);
    } else {
      alert(isEnglish 
        ? `Item with SKU / Barcode "${scannedCode}" not found in central warehouse` 
        : `ไม่พบสินค้าที่มีรหัส Master SKU หรือ Barcode "${scannedCode}" ในระบบคลังกลาง`);
    }
  };

  const handleScannerAction = (action: 'transact' | 'count' | 'view', item: InventoryItem) => {
    setIsScannerOpen(false);
    setTimeout(() => {
      if (action === 'transact') {
        setTransactDefaultId(item.id);
        setIsTransactOpen(true);
      } else if (action === 'count') {
        setCountItem(item);
      } else if (action === 'view') {
        setViewItem(item);
      }
    }, 250);
  };

  const handleOpenBarcodeModal = (item: InventoryItem) => {
    setBarcodeModalItem(item);
    setIsBarcodeModalOpen(true);
  };

  const handlePhysicalCount = (itemId: string, newQuantity: number, note: string) => {
    transactInventory(itemId, newQuantity, 'ADJUST', note || 'ตรวจนับยอดคงเหลือจริงหน้างาน');
    alert('บันทึกยอดตรวจนับเรียบร้อย');
    setCountItem(null);
  };

  const lowStockItems = filteredInventory.filter(i => i.quantity <= i.minStockLevel).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
              {isEnglish ? 'Central Construction Material Warehouse & Barcode' : 'คลังพัสดุและวัสดุก่อสร้างกลาง (Central Material Hub)'}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
              <Building2 className="w-3 h-3" />
              Central Construction Hub
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isEnglish 
              ? 'Central material warehouse controlling stock, tools, and construction supplies dispatched across contractor project sites' 
              : 'คลังพัสดุและวัสดุก่อสร้างกลาง • ควบคุมสต็อกพัสดุ เครื่องมือ และวัสดุงานก่อสร้าง จัดเก็บและเบิกจ่ายไปยังไซต์งาน/โครงการต่างๆ'}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
            className="hidden" 
          />
          <Link 
            to="/import?target=inventory"
            className="inline-flex items-center justify-center px-2 sm:px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 bg-white shadow-2xs hover:bg-slate-50 transition-colors text-center w-full sm:w-auto"
            title="นำเข้าไฟล์หลายรูปแบบ (Excel, CSV, CAD, PDF, Word, JSON) พร้อมจับคู่คอลัมน์อัตโนมัติ"
          >
            <UploadCloud className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-indigo-600 shrink-0" />
            <span className="truncate">{isEnglish ? 'Import' : 'นำเข้าไฟล์'}</span>
          </Link>
          
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="inline-flex items-center justify-center px-2 sm:px-3.5 py-2 border border-indigo-200 rounded-lg text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50/70 shadow-2xs hover:bg-indigo-100 transition-colors text-center w-full sm:w-auto"
            title="สแกนบาร์โค้ด SKU ด้วยกล้องหรือเครื่องยิงบาร์โค้ด"
          >
            <Barcode className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-indigo-600 shrink-0" />
            <span className="truncate">{isEnglish ? 'Scan Barcode' : 'สแกน SKU'}</span>
          </button>

          <button 
            onClick={() => { setTransactDefaultId(undefined); setIsTransactOpen(true); }}
            className="inline-flex items-center justify-center px-2 sm:px-3 py-2 border border-transparent rounded-lg shadow-2xs text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors text-center w-full sm:w-auto"
          >
            <ArrowDownUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 shrink-0" />
            <span className="truncate">{isEnglish ? 'Receive/Issue' : 'รับเข้า/เบิก'}</span>
          </button>
        </div>
      </div>

      {/* Central Warehouse Architecture Banner */}
      <div className="bg-gradient-to-br from-[#122b20] via-[#154c38] to-[#1c3e30] text-white rounded-3xl p-5 sm:p-6 border border-emerald-900/30 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center relative z-10">
          
          {/* Left Column: Title & Architecture Explanation (7 cols) */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-white/10 text-white border border-white/20 shrink-0">
                <Building2 className="w-5 h-5 text-emerald-200" />
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide" style={{ textWrap: 'pretty' }}>
                  สถาปัตยกรรมคลังพัสดุก่อสร้างกลาง
                </h2>
                <p className="text-[11px] text-emerald-200 font-medium">
                  Central Construction Material Hub • Site Requisition & Real-time Sync
                </p>
              </div>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed pr-0 lg:pr-2">
              พัสดุและวัสดุก่อสร้างทั้งหมดถูกควบคุมอยู่ที่ <strong>คลังพัสดุก่อสร้างกลางแห่งเดียว</strong> โดยใช้ <strong>Master SKU Barcode (Code 128)</strong> เป็นรหัสมาตรฐาน เมื่อวิศวกรหรือโฟร์แมนทำรายการเบิกจ่ายไปหน้างาน หรือตรวจรับพัสดุเข้าคลังจากใบสั่งซื้อ (PO Receipt) สต็อกจริงในคลังกลางจะถูกอัปเดตแบบ Real-time ทันที
            </p>
          </div>

          {/* Right Column: Connected Project Sites Group (5 cols) */}
          <div className="lg:col-span-5 bg-white/10 p-3.5 rounded-2xl border border-white/15">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/10">
              <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                ไซต์งานและโครงการที่เชื่อมโยงเบิกใช้วัสดุ
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-mono">
                5 Sites Active
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                'คอนโดสุขุมวิท 101',
                'โรงพยาบาลบางนา',
                'อาคารสำนักงานพระราม 9',
                'งานระบบ MEP & เครื่องมือช่าง',
                'งานโครงสร้างและวิศวกรรมฐานราก',
              ].map(siteName => (
                <span 
                  key={siteName}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border border-white/10 bg-black/20 text-emerald-100"
                >
                  <CheckCircle2 className="w-2.5 h-2.5 shrink-0 text-emerald-300" />
                  <span className="whitespace-nowrap">{siteName}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3 sm:p-4">
          <h3 className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-wide uppercase line-clamp-1">
            {isEnglish ? 'Total Stock Items' : 'รายการพัสดุทั้งหมด'}
          </h3>
          <p className="text-lg sm:text-2xl font-bold font-mono tabular-nums text-slate-800 mt-1">
            {filteredInventory.length} <span className="text-xs font-normal text-slate-500">SKUs</span>
          </p>
        </div>
        
        <div className={cn("bg-white rounded-xl shadow-xs border p-3 sm:p-4 relative overflow-hidden", lowStockItems > 0 ? "border-red-200" : "border-slate-200")}>
          {lowStockItems > 0 && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>}
          <h3 className={cn("text-[11px] sm:text-xs font-bold tracking-wide uppercase line-clamp-1", lowStockItems > 0 ? "text-red-600" : "text-slate-500")}>
            {isEnglish ? 'Low Stock Alerts' : 'เตือนสต็อกต่ำ'}
          </h3>
          <p className={cn("text-lg sm:text-2xl font-bold font-mono tabular-nums mt-1", lowStockItems > 0 ? "text-red-700" : "text-slate-800")}>
            {lowStockItems}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3 sm:p-4">
          <h3 className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-wide uppercase line-clamp-1">
            {isEnglish ? 'Central Warehouse Locations' : 'โซนจัดเก็บในคลังกลาง'}
          </h3>
          <p className="text-lg sm:text-2xl font-bold font-mono tabular-nums text-indigo-700 mt-1">
            {locations.length} <span className="text-xs font-normal text-slate-500">จุดเก็บ/แร็ค</span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3 sm:p-4">
          <h3 className="text-[11px] sm:text-xs font-bold text-slate-500 tracking-wide uppercase line-clamp-1">
            {isEnglish ? 'Site Fulfillment Rate' : 'ความพร้อมจ่ายวัสดุหน้างาน'}
          </h3>
          <p className="text-lg sm:text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1 flex items-center gap-1.5">
            98.5% <span className="text-xs font-normal text-slate-500">พร้อมเบิกจ่าย</span>
          </p>
        </div>
      </div>

      {/* Search & Location Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อสินค้า, Master SKU, บาร์โค้ด, หมวดหมู่..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ล้าง
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select 
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{isEnglish ? 'All Storage Zones in Warehouse' : 'ทุกโซนจัดเก็บในคลังกลาง'}</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Container */}
      <div className="bg-white shadow-xs border border-slate-200 rounded-xl overflow-hidden">
        
        {/* Mobile Cards View (Visible on < md screens) */}
        <div className="md:hidden divide-y divide-slate-200">
          {filteredInventory.map((item, index) => {
            const isLow = (item.quantity ?? 0) <= (item.minStockLevel ?? 0);
            const masterSku = item.sku || item.code;
            const barcodeVal = item.barcode || masterSku;
            const binLoc = item.binLocation || item.location;

            return (
              <div 
                key={item.id} 
                className={cn(
                  "p-4 transition-colors space-y-3", 
                  isLow 
                    ? "bg-amber-50/60 border-l-4 border-l-amber-500" 
                    : index % 2 === 1 
                      ? "bg-slate-100/60" 
                      : "bg-white"
                )}
              >
                {/* Item Top Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className={cn(
                      "flex-shrink-0 h-9 w-9 border rounded-lg flex items-center justify-center mt-0.5 shadow-2xs", 
                      isLow ? "bg-red-50 border-red-200 text-red-600" : "bg-slate-50 text-slate-600 border-slate-200"
                    )}>
                      {isLow ? <AlertTriangle className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug break-words">{item.name}</h4>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 whitespace-nowrap flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          {masterSku}
                        </span>
                        <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap flex items-center gap-1">
                          <Barcode className="w-2.5 h-2.5" />
                          {barcodeVal}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    {isLow ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
                        <AlertTriangle className="w-2.5 h-2.5 mr-1 text-red-500" />
                        สต็อกต่ำ
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
                        ปกติ
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock & Storage Bin Row */}
                <div className={cn(
                  "grid grid-cols-2 gap-2 p-2.5 rounded-lg border text-xs",
                  isLow
                    ? "bg-white/90 border-amber-200/80"
                    : index % 2 === 1
                      ? "bg-white border-slate-200/90 shadow-2xs"
                      : "bg-slate-50 border-slate-200/60"
                )}>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">คงเหลือในคลัง</span>
                    <span className="font-bold text-slate-900 font-mono tabular-nums text-sm">
                      {(item.quantity ?? 0).toLocaleString()} <span className="font-sans text-xs text-slate-500 font-normal">{item.unit}</span>
                    </span>
                    <span className={cn("block text-[10px] mt-0.5", isLow ? "text-red-600 font-semibold" : "text-slate-400")}>
                      ขั้นต่ำ: {(item.minStockLevel ?? 0).toLocaleString()} {item.unit}
                    </span>
                  </div>
                  <div className="border-l border-slate-200/80 pl-2.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">จุดเก็บในคลัง</span>
                    <span className="font-bold text-emerald-700 text-[11px] block truncate">
                      {binLoc}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      @{(item.unitPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ./{item.unit}
                    </span>
                  </div>
                </div>

                {/* Project Site Badges */}
                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                  <span className="text-[10px] font-semibold text-slate-400">โครงการ:</span>
                  {(item.projectAllocations || ['โครงการ คอนโดสุขุมวิท 101', 'ทุกไซต์งาน']).map(p => (
                    <span 
                      key={p} 
                      className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                        index % 2 === 1
                          ? "bg-white text-slate-700 border-slate-200/90"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      )}
                    >
                      {p}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button 
                    onClick={() => handleOpenBarcodeModal(item)}
                    className="flex-1 py-1.5 px-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-1"
                    title="สั่งพิมพ์ป้ายบาร์โค้ด SKU"
                  >
                    <Barcode className="h-3.5 w-3.5 text-indigo-600" />
                    <span>ป้ายบาร์โค้ด</span>
                  </button>
                  <button 
                    onClick={() => setCountItem(item)}
                    className="flex-1 py-1.5 px-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-1"
                  >
                    <CheckSquare className="h-3.5 w-3.5 text-slate-500" />
                    <span>ตรวจนับ</span>
                  </button>
                  <button 
                    onClick={() => setViewItem(item)}
                    className="flex-1 py-1.5 px-2 text-xs font-bold text-slate-800 hover:text-white hover:bg-slate-800 bg-slate-100 border border-slate-300 rounded-lg transition-colors shadow-2xs text-center"
                  >
                    รายละเอียด
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View (Visible on >= md screens) */}
        <div className="hidden md:block overflow-x-auto smooth-scroll">
          <table className="w-full divide-y divide-slate-200 text-left border-collapse min-w-[840px]">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-3.5 py-3.5 min-w-[240px]">สินค้า, SKU & หมวดหมู่</th>
                <th scope="col" className="px-3.5 py-3.5 whitespace-nowrap w-[160px]">จุดจัดเก็บในคลังกลาง</th>
                <th scope="col" className="px-3.5 py-3.5 text-right whitespace-nowrap w-[130px]">สต็อกคลังกลาง</th>
                <th scope="col" className="px-3 py-3.5 whitespace-nowrap w-[160px]">โครงการ / ไซต์งานที่ใช้</th>
                <th scope="col" className="px-3 py-3.5 text-right whitespace-nowrap w-[185px] sticky right-0 bg-slate-100/95 backdrop-blur-xs shadow-[-4px_0_8px_rgba(0,0,0,0.03)]">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredInventory.map((item) => {
                const isLow = (item.quantity ?? 0) <= (item.minStockLevel ?? 0);
                const masterSku = item.sku || item.code;
                const barcodeVal = item.barcode || masterSku;
                const binLoc = item.binLocation || item.location;
                const projects = item.projectAllocations || ['โครงการ คอนโดสุขุมวิท 101', 'ทุกไซต์งาน'];

                return (
                  <tr key={item.id} className={cn("hover:bg-slate-50/80 transition-colors", isLow ? "bg-amber-50/20" : "")}>
                    <td className="px-3.5 py-3.5 align-top">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "flex-shrink-0 h-10 w-10 border rounded-lg flex items-center justify-center shadow-2xs mt-0.5", 
                          isLow ? "bg-red-50 border-red-200 text-red-600" : "bg-slate-50 text-slate-600 border-slate-200"
                        )}>
                          {isLow ? <AlertTriangle className="h-4 w-4" /> : <Package className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-slate-900 leading-snug">{item.name}</span>
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              {item.category}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-bold whitespace-nowrap flex items-center gap-1">
                              <Tag className="w-3 h-3 text-indigo-600" />
                              {masterSku}
                            </span>
                            <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold whitespace-nowrap flex items-center gap-1">
                              <Barcode className="w-3 h-3 text-slate-500" />
                              {barcodeVal}
                            </span>
                            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                              • @{(item.unitPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ./{item.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3.5 py-3.5 align-top whitespace-nowrap text-slate-700">
                      <div className="font-bold text-emerald-800 text-sm leading-snug flex items-center gap-1">
                        <Box className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {binLoc}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[150px]">
                        {item.centralWarehouse || item.location}
                      </div>
                    </td>

                    <td className="px-3.5 py-3.5 align-top whitespace-nowrap text-right">
                      <div className="text-sm font-bold font-mono tabular-nums text-slate-900 leading-tight">
                        {(item.quantity ?? 0).toLocaleString()} <span className="font-sans font-normal text-xs text-slate-600">{item.unit}</span>
                      </div>
                      <div className={cn("text-xs mt-1 font-medium whitespace-nowrap", isLow ? "text-red-600 font-semibold" : "text-slate-500")}>
                        {isLow ? '⚠️ สต็อกต่ำกว่าเกณฑ์' : `ขั้นต่ำ: ${(item.minStockLevel ?? 0).toLocaleString()} ${item.unit}`}
                      </div>
                    </td>

                    <td className="px-3 py-3.5 align-top">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {projects.map(p => (
                          <span 
                            key={p} 
                            className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[140px]"
                            title={p}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
                        ● คลังกลางกระจายหน้างาน
                      </span>
                    </td>

                    <td className="px-3 py-3.5 align-top whitespace-nowrap text-right sticky right-0 bg-white/95 backdrop-blur-xs shadow-[-4px_0_8px_rgba(0,0,0,0.03)]">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleOpenBarcodeModal(item)}
                          className="px-2 py-1.5 text-xs font-bold text-indigo-700 hover:text-white hover:bg-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg transition-colors shadow-2xs flex items-center gap-1"
                          title="พิมพ์ป้ายสติกเกอร์บาร์โค้ด SKU"
                        >
                          <Barcode className="h-3.5 w-3.5" />
                          <span>บาร์โค้ด</span>
                        </button>

                        <button 
                          onClick={() => setCountItem(item)}
                          className="px-2 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs flex items-center gap-0.5"
                          title="บันทึกตรวจนับสต็อกจริง"
                        >
                          <CheckSquare className="h-3.5 w-3.5 text-slate-500" />
                          <span>ตรวจนับ</span>
                        </button>

                        <button 
                          onClick={() => setViewItem(item)}
                          className="px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors shadow-2xs"
                        >
                          รายละเอียด
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Details Modal */}
      <DetailsModal 
        isOpen={!!viewItem} 
        onClose={() => setViewItem(null)} 
        title={`รายละเอียดสินค้า: ${viewItem?.sku || viewItem?.code}`}
        footer={
          <div className="flex gap-2 w-full justify-end">
            <button 
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              title="พิมพ์ข้อมูลสินค้า (หรือเลือกบันทึกเป็น PDF ผ่านเมนูพิมพ์)"
            >
              <Printer className="h-4 w-4 mr-1.5 text-indigo-600" />
              พิมพ์ข้อมูลสินค้า
            </button>
            <button 
              onClick={() => setViewItem(null)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
            >
              ปิด
            </button>
          </div>
        }
      >
        {viewItem && (
          <div className="space-y-6">
            {/* Print-only Company Letterhead */}
            <div className="hidden print:flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-2">
              <div className="flex items-center gap-3">
                {companyProfile?.logoUrl ? (
                  <img src={companyProfile.logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
                ) : (
                  <div className="w-10 h-10 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-base font-mono">
                    {(companyProfile?.nameEn || 'CS').substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-base font-bold text-slate-900">{companyProfile?.nameTh || 'บริษัท โคนเนอเรจ สโตร์ จำกัด'}</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase">{companyProfile?.nameEn || 'CONERAGE STORE CO., LTD.'}</p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <div>พิมพ์เมื่อ: {new Date().toLocaleDateString(isEnglish ? 'en-US' : 'th-TH')}</div>
                <div className="font-semibold text-slate-700">ใบรายละเอียดพัสดุและสต็อกสินค้า</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={cn(
                "flex-shrink-0 h-16 w-16 border rounded-xl flex items-center justify-center", 
                viewItem.quantity <= viewItem.minStockLevel ? "bg-red-50 border-red-200 text-red-500" : "bg-slate-50 text-slate-500 border-slate-200"
              )}>
                {viewItem.quantity <= viewItem.minStockLevel ? <AlertTriangle className="h-8 w-8" /> : <Package className="h-8 w-8" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{viewItem.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-indigo-600" />
                    Master SKU: {viewItem.sku || viewItem.code}
                  </span>
                  <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                    <Barcode className="w-3 h-3 text-slate-500" />
                    บาร์โค้ด: {viewItem.barcode || viewItem.sku || viewItem.code}
                  </span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {viewItem.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Central Warehouse & Project Allocation Info */}
            <div className="bg-gradient-to-r from-[#122b20] to-[#154c38] text-white p-4 rounded-2xl border border-emerald-900/30 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200">
                    <Building2 className="w-4 h-4 text-emerald-300" />
                    <span>{viewItem.centralWarehouse || 'คลังพัสดุก่อสร้างกลาง (Central Material Hub)'}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="text-white font-bold">Single Construction Hub</span>
                  </div>
                  <div className="text-xs text-emerald-100 mt-1">
                    จุดจัดเก็บ: <span className="font-bold text-white font-mono bg-black/20 px-2 py-0.5 rounded border border-white/10">{viewItem.binLocation || viewItem.location}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-200/80 block mb-1">โครงการก่อสร้างที่เบิกใช้วัสดุนี้:</span>
                  <div className="flex flex-wrap gap-1">
                    {(viewItem.projectAllocations || ['โครงการ คอนโดสุขุมวิท 101', 'โครงการ โรงพยาบาลบางนา']).map(p => (
                      <span key={p} className="text-[10px] font-bold bg-black/20 px-2 py-0.5 rounded text-emerald-100 border border-white/10">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">ตำแหน่งเก็บ</p>
                <p className="font-bold text-slate-800">{viewItem.binLocation || viewItem.location}</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">จำนวนคงเหลือ</p>
                <p className={cn("text-xl font-black", viewItem.quantity <= viewItem.minStockLevel ? "text-red-700" : "text-indigo-700")}>
                  {viewItem.quantity} <span className="text-sm font-bold">{viewItem.unit}</span>
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">ระดับขั้นต่ำ</p>
                <p className="font-bold text-slate-800">{viewItem.minStockLevel} {viewItem.unit}</p>
              </div>

              {/* 1D Barcode Quick Print Trigger */}
              <div 
                onClick={() => handleOpenBarcodeModal(viewItem)}
                className="bg-white hover:bg-indigo-50/80 p-2.5 rounded-lg border-2 border-indigo-200 hover:border-indigo-400 flex flex-col items-center justify-center cursor-pointer transition-colors group relative shadow-2xs"
                title={isEnglish ? "Click to view / print Master SKU Barcode Label" : "คลิกเพื่อดูและพิมพ์ป้ายบาร์โค้ด SKU คลังกลาง"}
              >
                <div className="w-full flex items-center justify-center overflow-hidden py-1">
                  <SkuBarcode 
                    value={viewItem.barcode || viewItem.sku || viewItem.code}
                    format="CODE128"
                    width={1.6}
                    height={38}
                    displayValue={false}
                  />
                </div>
                <span className="font-mono text-[11px] font-black text-slate-900 tracking-wider">
                  {viewItem.sku || viewItem.code}
                </span>
                <span className="text-[10px] text-indigo-700 font-bold group-hover:text-indigo-900 mt-1 flex items-center gap-1">
                  <Printer className="w-3 h-3" /> 
                  {isEnglish ? 'Print Barcode Label' : 'พิมพ์ป้ายบาร์โค้ด SKU'}
                </span>
              </div>
            </div>

            {/* Movement Logs Simulated */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">ประวัติการเคลื่อนไหวสต็อก (Stock Movement History)</h3>
                <span className="text-xs font-medium text-slate-500">Real-time Central Log</span>
              </div>
              <ul className="divide-y divide-slate-100 max-h-[260px] overflow-y-auto bg-white">
                <li className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mr-3">
                      <ArrowDownUp className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">รับเข้าคลังสินค้ากลาง (Stock In)</p>
                      <p className="text-xs text-slate-500">2 ชั่วโมงที่แล้ว • PO-2026-089 (GR บันทึกรับ)</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">+50 {viewItem.unit}</span>
                </li>
                <li className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3">
                      <Barcode className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">เบิกจ่ายวัสดุไปหน้างาน (โครงการคอนโดสุขุมวิท 101)</p>
                      <p className="text-xs text-slate-500">4 ชั่วโมงที่แล้ว • ยิงบาร์โค้ด Master SKU ตัดจ่ายตามใบเบิกพัสดุ</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-blue-700">-10 {viewItem.unit}</span>
                </li>
                <li className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mr-3">
                      <ArrowDownUp className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">เบิกออกไซต์งาน / โครงการ (Stock Out)</p>
                      <p className="text-xs text-slate-500">1 วันที่แล้ว • ไซต์งานสุขุมวิท</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-amber-700">-20 {viewItem.unit}</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </DetailsModal>

      {/* SKU Barcode Label Modal (Multi-Platform Central Warehouse) */}
      <SkuBarcodeLabelModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        item={barcodeModalItem || viewItem}
      />

      {/* Inventory Transaction Modal */}
      <InventoryTransactionModal 
        isOpen={isTransactOpen}
        onClose={() => setIsTransactOpen(false)}
        onSave={handleTransaction}
        items={inventory}
        defaultItemId={transactDefaultId}
      />
      
      {/* Barcode & QR Scanner Modal */}
      <QRCodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanSuccess}
        items={inventory}
        onSelectAction={handleScannerAction}
        onPrintLabel={handleOpenBarcodeModal}
      />

      {/* Physical Count Modal */}
      <PhysicalCountModal
        isOpen={!!countItem}
        onClose={() => setCountItem(null)}
        onSave={handlePhysicalCount}
        item={countItem}
      />
    </div>
  );
}
