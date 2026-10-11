import { Package, ArrowDownUp, QrCode, AlertTriangle, CheckSquare, Printer, FileSpreadsheet, Download, X } from 'lucide-react';
import { useState, useRef, useEffect, ChangeEvent } from 'react';
import QRCode from 'qrcode';
import type { InventoryItem } from '../types';
import { cn } from '../lib/utils';
import { InventoryTransactionModal, QRCodeScannerModal, PhysicalCountModal } from '../components/InventoryModals';
import { DetailsModal } from '../components/DetailsModal';
import { exportToPDF } from '../lib/pdf';
import * as xlsx from 'xlsx';
import { useLanguage } from '../contexts/LanguageContext';

const INITIAL_MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', code: 'MAT-CEM-01', name: 'ปูนซีเมนต์ปอร์ตแลนด์ (ตราช้าง)', category: 'วัสดุก่อสร้าง', quantity: 450, unit: 'ถุง', minStockLevel: 100, location: 'ไซโล 1', unitPrice: 155 },
  { id: '2', code: 'MAT-STL-24', name: 'เหล็กเส้นกลม SR24', category: 'วัสดุก่อสร้าง', quantity: 15, unit: 'ตัน', minStockLevel: 20, location: 'ลานเก็บ B', unitPrice: 24500 },
  { id: '3', code: 'TOL-DRL-01', name: 'สว่านโรตารี่', category: 'เครื่องมือช่าง', quantity: 2, unit: 'เครื่อง', minStockLevel: 5, location: 'ห้องช่าง', unitPrice: 3850 },
  { id: '4', code: 'SAF-HLM-01', name: 'หมวกนิรภัย', category: 'อุปกรณ์เซฟตี้', quantity: 120, unit: 'ใบ', minStockLevel: 50, location: 'ห้องสโตร์', unitPrice: 280 },
];

export function InventoryPage() {
  const { t, isEnglish } = useLanguage();
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_MOCK_INVENTORY);
  const [isTransactOpen, setIsTransactOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [countItem, setCountItem] = useState<InventoryItem | null>(null);
  const [viewItem, setViewItem] = useState<InventoryItem | null>(null);
  const [transactDefaultId, setTransactDefaultId] = useState<string | undefined>();
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [itemQrDataUrl, setItemQrDataUrl] = useState<string>('');
  const [isQrLabelOpen, setIsQrLabelOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (viewItem) {
      QRCode.toDataURL(viewItem.code, { width: 300, margin: 2 })
        .then(setItemQrDataUrl)
        .catch(() => setItemQrDataUrl(''));
    } else {
      setItemQrDataUrl('');
    }
  }, [viewItem]);


  const locations = Array.from(new Set(inventory.map(i => i.location)));
  const filteredInventory = selectedLocation ? inventory.filter(i => i.location === selectedLocation) : inventory;

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
        
        const newItems: InventoryItem[] = (data as any[]).map(row => ({
          id: Math.random().toString(36).substr(2, 9),
          code: row.code || row['รหัส'] || `ITEM-${Math.floor(Math.random()*1000)}`,
          name: row.name || row['ชื่อสินค้า'] || 'นำเข้าใหม่',
          category: row.category || row['หมวดหมู่'] || 'ทั่วไป',
          quantity: Number(row.quantity || row['จำนวน'] || 0),
          unit: row.unit || row['หน่วย'] || 'ชิ้น',
          minStockLevel: Number(row.minStockLevel || row['ขั้นต่ำ'] || 0),
          location: row.location || row['สถานที่'] || 'คลังหลัก',
          unitPrice: Number(row.unitPrice || row['ราคา'] || 0),
        }));

        setInventory(prev => [...prev, ...newItems]);
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
    let updatedInventory = [...inventory];
    if (data.type === 'receive' || data.type === 'issue') {
      updatedInventory = updatedInventory.map(item => {
        if (item.id === data.itemId) {
          let newQty = item.quantity;
          if (data.type === 'receive') newQty += data.quantity;
          if (data.type === 'issue') newQty -= data.quantity;
          return { ...item, quantity: newQty };
        }
        return item;
      });
    } else if (data.type === 'transfer') {
      // Find source item
      const sourceItem = updatedInventory.find(i => i.id === data.itemId);
      if (sourceItem) {
        // Deduct from source
        updatedInventory = updatedInventory.map(item => 
          item.id === data.itemId ? { ...item, quantity: item.quantity - data.quantity } : item
        );
        // Find if target location already has this item code
        const targetItemIndex = updatedInventory.findIndex(i => i.code === sourceItem.code && i.location === data.location);
        if (targetItemIndex >= 0) {
          updatedInventory[targetItemIndex] = { ...updatedInventory[targetItemIndex], quantity: updatedInventory[targetItemIndex].quantity + data.quantity };
        } else {
          updatedInventory.push({
            ...sourceItem,
            id: Math.random().toString(36).substr(2, 9),
            location: data.location,
            quantity: data.quantity
          });
        }
      }
    }
    setInventory(updatedInventory);
    alert(`บันทึกรายการ${data.type === 'receive' ? 'รับ' : data.type === 'issue' ? 'เบิก' : 'โอน'}เรียบร้อย`);
    setIsTransactOpen(false);
  };

  const handleScanSuccess = (code: string) => {
    const item = inventory.find(i => 
      i.code.toLowerCase() === code.toLowerCase() || 
      i.id.toLowerCase() === code.toLowerCase()
    );
    setIsScannerOpen(false);
    if (item) {
      setTimeout(() => {
        setTransactDefaultId(item.id);
        setIsTransactOpen(true);
      }, 300);
    } else {
      alert(isEnglish ? `Item with code "${code}" not found in system` : `ไม่พบสินค้ารหัส "${code}" ในระบบ`);
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


  const handlePhysicalCount = (itemId: string, newQuantity: number, note: string) => {
    setInventory(inventory.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
    alert('บันทึกยอดตรวจนับเรียบร้อย');
    setCountItem(null);
  };

  const lowStockItems = filteredInventory.filter(i => i.quantity <= i.minStockLevel).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">{t('inventory.title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{t('inventory.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{isEnglish ? 'All Sites / Locations' : 'ทุกไซต์งาน / สถานที่'}</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 bg-white shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5 text-slate-500" />
            <span>{isEnglish ? 'Import' : 'นำเข้า'}</span>
          </button>
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 bg-white shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <QrCode className="h-4 w-4 mr-1.5 text-slate-500" />
            <span>{isEnglish ? 'Scan QR' : 'สแกน QR'}</span>
          </button>
          <button 
            onClick={() => { setTransactDefaultId(undefined); setIsTransactOpen(true); }}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg shadow-2xs text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            <ArrowDownUp className="h-4 w-4 mr-1.5" />
            <span>{isEnglish ? 'Receive / Issue' : 'รับเข้า / เบิกออก'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
          <h3 className="text-xs sm:text-sm font-bold text-slate-500 tracking-wide uppercase">{isEnglish ? 'Total Stock Items' : 'รายการทั้งหมด'}</h3>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-800 mt-1">{filteredInventory.length}</p>
        </div>
        <div className={cn("bg-white rounded-xl shadow-xs border p-4 relative overflow-hidden", lowStockItems > 0 ? "border-red-200" : "border-slate-200")}>
          {lowStockItems > 0 && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>}
          <h3 className={cn("text-xs sm:text-sm font-bold tracking-wide uppercase", lowStockItems > 0 ? "text-red-600" : "text-slate-500")}>
            {isEnglish ? 'Low Stock Alerts' : 'เตือนสต็อกต่ำ'}
          </h3>
          <p className={cn("text-xl sm:text-2xl font-bold font-mono tabular-nums mt-1", lowStockItems > 0 ? "text-red-700" : "text-slate-800")}>{lowStockItems}</p>
        </div>
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
          <h3 className="text-xs sm:text-sm font-bold text-slate-500 tracking-wide uppercase">{isEnglish ? 'Pending Audits' : 'รอตรวจนับตรวจสอบ'}</h3>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-800 mt-1">4</p>
        </div>
      </div>

      {/* Inventory Container */}
      <div className="bg-white shadow-xs border border-slate-200 rounded-xl overflow-hidden">
        {/* Mobile Cards View (Visible on < md screens) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredInventory.map((item) => {
            const isLow = (item.quantity ?? 0) <= (item.minStockLevel ?? 0);
            return (
              <div key={item.id} className={cn("p-4 transition-colors space-y-3", isLow ? "bg-amber-50/30" : "bg-white")}>
                {/* Item Top Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className={cn(
                      "flex-shrink-0 h-8 w-8 border rounded-lg flex items-center justify-center mt-0.5 shadow-2xs", 
                      isLow ? "bg-red-50 border-red-200 text-red-600" : "bg-slate-50 text-slate-600 border-slate-200"
                    )}>
                      {isLow ? <AlertTriangle className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug break-words">{item.name}</h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="font-mono text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 whitespace-nowrap">
                          {item.code}
                        </span>
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                          {item.category}
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

                {/* Stock & Location Row */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">คงเหลือ</span>
                    <span className="font-bold text-slate-900 font-mono tabular-nums text-sm">
                      {(item.quantity ?? 0).toLocaleString()} <span className="font-sans text-xs text-slate-500 font-normal">{item.unit}</span>
                    </span>
                    <span className={cn("block text-[10px] mt-0.5", isLow ? "text-red-600 font-semibold" : "text-slate-400")}>
                      ขั้นต่ำ: {(item.minStockLevel ?? 0).toLocaleString()} {item.unit}
                    </span>
                  </div>
                  <div className="border-l border-slate-200/80 pl-2.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">ราคา & สถานที่</span>
                    <span className="font-medium text-slate-800 text-[11px] block truncate">
                      @{(item.unitPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ./{item.unit}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                      {item.location}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button 
                    onClick={() => setCountItem(item)}
                    className="flex-1 py-1.5 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <CheckSquare className="h-3.5 w-3.5 text-slate-500" />
                    <span>ตรวจนับ</span>
                  </button>
                  <button 
                    onClick={() => setViewItem(item)}
                    className="flex-1 py-1.5 px-3 text-xs font-bold text-indigo-700 hover:text-white hover:bg-indigo-600 bg-indigo-50/80 hover:border-indigo-600 border border-indigo-200 rounded-lg transition-colors shadow-2xs text-center"
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
          <table className="w-full divide-y divide-slate-200 text-left border-collapse min-w-[880px]">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3.5 min-w-[260px]">รหัสและรายละเอียดพัสดุ</th>
                <th scope="col" className="px-3 py-3.5 whitespace-nowrap w-[130px]">หมวดหมู่</th>
                <th scope="col" className="px-4 py-3.5 whitespace-nowrap w-[160px]">สถานที่จัดเก็บ</th>
                <th scope="col" className="px-4 py-3.5 text-right whitespace-nowrap w-[140px]">จำนวนคงเหลือ</th>
                <th scope="col" className="px-3 py-3.5 text-center whitespace-nowrap w-[140px]">สถานะสต็อก</th>
                <th scope="col" className="px-4 py-3.5 text-right whitespace-nowrap w-[160px]">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredInventory.map((item) => {
                const isLow = (item.quantity ?? 0) <= (item.minStockLevel ?? 0);
                return (
                  <tr key={item.id} className={cn("hover:bg-slate-50/80 transition-colors", isLow ? "bg-amber-50/20" : "")}>
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "flex-shrink-0 h-9 w-9 border rounded-lg flex items-center justify-center shadow-2xs mt-0.5", 
                          isLow ? "bg-red-50 border-red-200 text-red-600" : "bg-slate-50 text-slate-600 border-slate-200"
                        )}>
                          {isLow ? <AlertTriangle className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 leading-snug break-words">{item.name}</div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 font-semibold whitespace-nowrap">
                              {item.code}
                            </span>
                            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                              • ราคา @{(item.unitPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บ./{item.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 align-top whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap text-slate-700">
                      <div className="font-medium text-slate-900 text-sm leading-snug">{item.location}</div>
                      <div className="text-xs text-slate-500 mt-0.5">คลังหลัก / หน้างาน</div>
                    </td>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap text-right">
                      <div className="text-sm font-bold font-mono tabular-nums text-slate-900 leading-tight">
                        {(item.quantity ?? 0).toLocaleString()} <span className="font-sans font-normal text-xs text-slate-600">{item.unit}</span>
                      </div>
                      <div className={cn("text-xs mt-1 font-medium whitespace-nowrap", isLow ? "text-red-600 font-semibold" : "text-slate-500")}>
                        ขั้นต่ำ: {(item.minStockLevel ?? 0).toLocaleString()} {item.unit}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 align-top whitespace-nowrap text-center">
                      {isLow ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 leading-none whitespace-nowrap">
                          <AlertTriangle className="w-3 h-3 mr-1 text-red-500" />
                          สต็อกต่ำกว่าเกณฑ์
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 leading-none whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                          พร้อมใช้งานปกติ
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => setCountItem(item)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs flex items-center"
                          title="บันทึกตรวจนับสต็อกจริง"
                        >
                          <CheckSquare className="h-3.5 w-3.5 mr-1 text-slate-500" />
                          <span>ตรวจนับ</span>
                        </button>
                        <button 
                          onClick={() => setViewItem(item)}
                          className="px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:text-white hover:bg-indigo-600 bg-indigo-50/70 hover:border-indigo-600 border border-indigo-200 rounded-lg transition-colors shadow-2xs"
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

      <DetailsModal 
        isOpen={!!viewItem} 
        onClose={() => setViewItem(null)} 
        title={`รายละเอียดสินค้า: ${viewItem?.code}`}
        footer={
          <div className="flex gap-2 w-full justify-end">
            <button 
              onClick={() => exportToPDF('pdf-content', `InventoryItem_${viewItem?.code}`)}
              className="inline-flex items-center px-4 py-2 border border-slate-200 rounded text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Printer className="h-4 w-4 mr-2" />
              Export PDF / พิมพ์
            </button>
            <button 
              onClick={() => setViewItem(null)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              ปิด
            </button>
          </div>
        }
      >
        {viewItem && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className={cn("flex-shrink-0 h-16 w-16 border rounded-lg flex items-center justify-center", viewItem.quantity <= viewItem.minStockLevel ? "bg-red-50 border-red-200 text-red-500" : "bg-slate-50 text-slate-500 border-slate-200")}>
                {viewItem.quantity <= viewItem.minStockLevel ? <AlertTriangle className="h-8 w-8" /> : <Package className="h-8 w-8" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{viewItem.name}</h3>
                <p className="text-sm font-medium text-slate-500">{viewItem.category}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">สถานที่เก็บ</p>
                 <p className="font-bold text-slate-800">{viewItem.location}</p>
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
               <div 
                 onClick={() => setIsQrLabelOpen(true)}
                 className="bg-slate-50 hover:bg-indigo-50/60 p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 flex flex-col items-center justify-center cursor-pointer transition-colors group relative"
                 title={isEnglish ? "Click to view / print QR Label" : "คลิกเพื่อดูและพิมพ์ป้าย QR Code"}
               >
                 {itemQrDataUrl ? (
                   <img src={itemQrDataUrl} alt={`QR for ${viewItem.code}`} className="h-16 w-16 object-contain" />
                 ) : (
                   <QrCode className="h-10 w-10 text-slate-300" />
                 )}
                 <span className="text-[10px] text-slate-500 font-bold group-hover:text-indigo-600 mt-1 flex items-center gap-1">
                   <Printer className="w-3 h-3" /> {isEnglish ? 'Print QR' : 'พิมพ์ป้าย QR'}
                 </span>
               </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
               <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                 <h3 className="text-sm font-bold text-slate-800">ประวัติการเคลื่อนไหวล่าสุด (จำลอง)</h3>
                 <span className="text-xs font-medium text-slate-500">5 รายการล่าสุด</span>
               </div>
               <ul className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto bg-white">
                 <li className="p-4 flex items-center justify-between">
                   <div className="flex items-center">
                     <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mr-3">
                       <ArrowDownUp className="h-4 w-4" />
                     </span>
                     <div>
                       <p className="text-sm font-bold text-slate-800">รับเข้าสต็อก</p>
                       <p className="text-xs text-slate-500">2 ชั่วโมงที่แล้ว • PO-2025-089</p>
                     </div>
                   </div>
                   <span className="text-sm font-bold text-emerald-700">+50 {viewItem.unit}</span>
                 </li>
                 <li className="p-4 flex items-center justify-between">
                   <div className="flex items-center">
                     <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mr-3">
                       <ArrowDownUp className="h-4 w-4" />
                     </span>
                     <div>
                       <p className="text-sm font-bold text-slate-800">เบิกออกไซต์งาน</p>
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

      {/* QR Code Sticker Label Print Modal */}
      {isQrLabelOpen && viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsQrLabelOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">
                {isEnglish ? 'Inventory QR Sticker Label' : 'ป้ายสติกเกอร์สต็อกสินค้า (QR Label)'}
              </h3>
              <button 
                onClick={() => setIsQrLabelOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sticker Preview Card */}
            <div className="my-5 p-5 rounded-2xl border-2 border-dashed border-indigo-200 bg-slate-50/70 flex flex-col items-center text-center shadow-inner">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                PROCURESYNC INVENTORY
              </p>
              
              <div className="my-3 p-3 bg-white rounded-xl shadow-xs border border-slate-100">
                {itemQrDataUrl && (
                  <img src={itemQrDataUrl} alt={viewItem.code} className="w-36 h-36" />
                )}
              </div>

              <p className="text-lg font-mono font-black text-slate-900 tracking-wider">
                {viewItem.code}
              </p>
              <p className="text-xs font-bold text-slate-700 mt-1 max-w-[240px] truncate">
                {viewItem.name}
              </p>
              
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                <span className="bg-slate-200/80 px-2 py-0.5 rounded font-medium">{viewItem.category}</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">{viewItem.location}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5">
              {itemQrDataUrl && (
                <a 
                  href={itemQrDataUrl} 
                  download={`QR_${viewItem.code}.png`}
                  className="flex-1 py-2.5 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>{isEnglish ? 'Save PNG' : 'ดาวน์โหลดรูป'}</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  const printWin = window.open('', '_blank');
                  if (printWin) {
                    printWin.document.write(`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta charset="utf-8" />
                          <title>Print Label - ${viewItem.code}</title>
                          <style>
                            @page { size: auto; margin: 10mm; }
                            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #fff; }
                            .label { border: 2px dashed #94a3b8; padding: 24px; border-radius: 16px; text-align: center; width: 260px; page-break-inside: avoid; }
                            .brand { font-size: 10px; font-weight: 800; color: #64748b; letter-spacing: 2px; text-transform: uppercase; }
                            .qr { width: 160px; height: 160px; margin: 12px auto; display: block; }
                            .code { font-size: 22px; font-weight: 900; font-family: monospace; letter-spacing: 1px; color: #0f172a; margin-top: 4px; }
                            .name { font-size: 13px; font-weight: 700; margin-top: 4px; color: #334155; }
                            .loc { font-size: 11px; color: #64748b; margin-top: 8px; font-weight: 600; }
                          </style>
                        </head>
                        <body>
                          <div class="label">
                            <div class="brand">PROCURESYNC WAREHOUSE</div>
                            <img class="qr" src="${itemQrDataUrl}" />
                            <div class="code">${viewItem.code}</div>
                            <div class="name">${viewItem.name}</div>
                            <div class="loc">${viewItem.category} • ${viewItem.location}</div>
                          </div>
                          <script>
                            window.onload = function() { window.print(); window.close(); }
                          </script>
                        </body>
                      </html>
                    `);
                    printWin.document.close();
                  }
                }}
                className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl text-center transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>{isEnglish ? 'Print Label' : 'สั่งพิมพ์ป้าย'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <InventoryTransactionModal 
        isOpen={isTransactOpen}
        onClose={() => setIsTransactOpen(false)}
        onSave={handleTransaction}
        items={inventory}
        defaultItemId={transactDefaultId}
      />
      
      <QRCodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanSuccess}
        items={inventory}
        onSelectAction={handleScannerAction}
      />

      <PhysicalCountModal
        isOpen={!!countItem}
        onClose={() => setCountItem(null)}
        onSave={handlePhysicalCount}
        item={countItem}
      />
    </div>
  );
}
