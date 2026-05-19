import { Package, ArrowDownUp, QrCode, AlertTriangle, CheckSquare, Printer, FileSpreadsheet } from 'lucide-react';
import { useState, useRef, ChangeEvent } from 'react';
import type { InventoryItem } from '../types';
import { cn } from '../lib/utils';
import { InventoryTransactionModal, QRCodeScannerModal, PhysicalCountModal } from '../components/InventoryModals';
import { DetailsModal } from '../components/DetailsModal';
import { exportToPDF } from '../lib/pdf';
import * as xlsx from 'xlsx';

const INITIAL_MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', code: 'MAT-CEM-01', name: 'ปูนซีเมนต์ปอร์ตแลนด์ (ตราช้าง)', category: 'วัสดุก่อสร้าง', quantity: 450, unit: 'ถุง', minStockLevel: 100, location: 'ไซโล 1' },
  { id: '2', code: 'MAT-STL-24', name: 'เหล็กเส้นกลม SR24', category: 'วัสดุก่อสร้าง', quantity: 15, unit: 'ตัน', minStockLevel: 20, location: 'ลานเก็บ B' },
  { id: '3', code: 'TOL-DRL-01', name: 'สว่านโรตารี่', category: 'เครื่องมือช่าง', quantity: 2, unit: 'เครื่อง', minStockLevel: 5, location: 'ห้องช่าง' },
  { id: '4', code: 'SAF-HLM-01', name: 'หมวกนิรภัย', category: 'อุปกรณ์เซฟตี้', quantity: 120, unit: 'ใบ', minStockLevel: 50, location: 'ห้องสโตร์' },
];

export function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_MOCK_INVENTORY);
  const [isTransactOpen, setIsTransactOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [countItem, setCountItem] = useState<InventoryItem | null>(null);
  const [viewItem, setViewItem] = useState<InventoryItem | null>(null);
  const [transactDefaultId, setTransactDefaultId] = useState<string | undefined>();
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const item = inventory.find(i => i.code === code);
    setIsScannerOpen(false);
    if (item) {
      setTimeout(() => {
        setTransactDefaultId(item.id);
        setIsTransactOpen(true);
      }, 300);
    } else {
      alert('ไม่พบสินค้านี้ในระบบ');
    }
  };

  const handlePhysicalCount = (itemId: string, newQuantity: number, note: string) => {
    setInventory(inventory.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
    alert('บันทึกยอดตรวจนับเรียบร้อย');
    setCountItem(null);
  };

  const lowStockItems = filteredInventory.filter(i => i.quantity <= i.minStockLevel).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">คลังสินค้า</h1>
          <p className="text-sm text-slate-500 mt-1">ติดตามและจัดการระดับสต็อกตามไซต์งาน</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded text-sm font-semibold text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">ทุกไซต์งาน / สถานที่</option>
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
            className="inline-flex items-center px-4 py-2 border border-slate-200 rounded text-sm font-semibold text-slate-700 bg-white shadow-sm hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2 text-slate-500" />
            นำเข้า
          </button>
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-slate-200 rounded text-sm font-semibold text-slate-700 bg-white shadow-sm hover:bg-slate-50 transition-colors"
          >
            <QrCode className="h-4 w-4 mr-2 text-slate-500" />
            สแกน QR
          </button>
          <button 
            onClick={() => { setTransactDefaultId(undefined); setIsTransactOpen(true); }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            <ArrowDownUp className="h-4 w-4 mr-2" />
            รับเข้า / เบิกออก
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
           <h3 className="text-sm font-bold text-slate-500 tracking-wide uppercase">รายการทั้งหมด</h3>
           <p className="text-2xl font-bold text-slate-800 mt-1">{filteredInventory.length}</p>
         </div>
         <div className={cn("bg-white rounded-xl shadow-sm border p-4 relative overflow-hidden", lowStockItems > 0 ? "border-red-200" : "border-slate-200")}>
           {lowStockItems > 0 && <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>}
           <h3 className={cn("text-sm font-bold tracking-wide uppercase", lowStockItems > 0 ? "text-red-600" : "text-slate-500")}>
             เตือนสต็อกต่ำ
           </h3>
           <p className={cn("text-2xl font-bold mt-1", lowStockItems > 0 ? "text-red-700" : "text-slate-800")}>{lowStockItems}</p>
         </div>
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
           <h3 className="text-sm font-bold text-slate-500 tracking-wide uppercase">รอตรวจนับตรวจสอบ</h3>
           <p className="text-2xl font-bold text-slate-800 mt-1">4</p>
         </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">รายละเอียดสินค้า</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">หมวดหมู่</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">สถานที่เก็บ</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">จำนวนคงเหลือ</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredInventory.map((item) => {
                const isLow = item.quantity <= item.minStockLevel;
                return (
                  <tr key={item.id} className={cn("hover:bg-slate-50 transition-colors", isLow ? "bg-red-50/30" : "")}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={cn("flex-shrink-0 h-10 w-10 border rounded flex items-center justify-center", isLow ? "bg-red-50 border-red-200 text-red-500" : "bg-slate-50 text-slate-500 border-slate-200")}>
                          {isLow ? <AlertTriangle className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-800">{item.name}</div>
                          <div className="text-sm text-slate-500 mt-0.5">{item.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {item.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={cn("inline-flex px-2 py-0.5 text-xs font-bold tracking-wide uppercase rounded", isLow ? 'text-red-700 bg-red-100' : 'text-slate-800 bg-slate-100')}>
                        {item.quantity} {item.unit}
                      </span>
                      {isLow && <div className="text-xs text-red-500 font-medium mt-1">ขั้นต่ำ: {item.minStockLevel}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                      <button 
                         onClick={() => setCountItem(item)}
                         className="text-slate-500 hover:text-slate-700 font-bold text-xs uppercase tracking-wide transition-colors"
                         title="ตรวจนับ"
                      >
                         <CheckSquare className="h-4 w-4 inline-block mr-1 items-center mb-0.5" /> ตรวจนับ
                      </button>
                      <button 
                         onClick={() => setViewItem(item)}
                         className="text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase tracking-wide transition-colors"
                      >
                         รายละเอียด
                      </button>
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
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-center">
                 <QrCode className="h-10 w-10 text-slate-300" />
                 <p className="text-xs text-slate-400 absolute mt-12">สแกนรหัส</p>
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
