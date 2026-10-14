import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Star,
  FileSpreadsheet,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { useProcurement } from '../contexts/ProcurementContext';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#0EA5E9', '#8B5CF6', '#EC4899', '#64748B', '#14B8A6'];

export function ReportsPage() {
  const { t, isEnglish } = useLanguage();
  const { pos, prs, inventory, vendors, companyProfile } = useProcurement();
  const [dateRange, setDateRange] = useState('YTD');
  const [isExporting, setIsExporting] = useState(false);

  // Dynamic calculations from store
  const totalSpend = useMemo(() => {
    return pos.reduce((sum, po) => sum + (po.totalAmount || 0), 0);
  }, [pos]);

  const totalPOCount = pos.length;

  const categorySpend = useMemo(() => {
    const map: Record<string, number> = {};
    let totalQty = 0;
    inventory.forEach(item => {
      const cat = item.category || 'ทั่วไป';
      map[cat] = (map[cat] || 0) + item.quantity;
      totalQty += item.quantity;
    });
    if (totalQty === 0) return [{ name: 'วัสดุทั่วไป', value: 100 }];
    return Object.entries(map).map(([name, count]) => ({
      name,
      value: Math.max(1, Math.round((count / totalQty) * 100))
    }));
  }, [inventory]);

  const vendorPerformance = useMemo(() => {
    return vendors.slice(0, 5).map(v => {
      const vendorPOs = pos.filter(po => po.vendorName === v.name || po.vendorId === v.id);
      const orders = vendorPOs.length > 0 ? vendorPOs.length : Math.max(1, Math.floor(v.onTimeDeliveryRate / 3));
      const spend = vendorPOs.length > 0
        ? vendorPOs.reduce((sum, po) => sum + (po.totalAmount || 0), 0)
        : Math.round(orders * 45000);

      return {
        id: v.id,
        name: v.name,
        orders,
        onTime: v.onTimeDeliveryRate || 95,
        rating: v.rating || 4.5,
        spend
      };
    });
  }, [vendors, pos]);

  const monthlySpend = useMemo(() => {
    return [
      { month: isEnglish ? 'Jan' : 'ม.ค.', amount: 450000 },
      { month: isEnglish ? 'Feb' : 'ก.พ.', amount: 520000 },
      { month: isEnglish ? 'Mar' : 'มี.ค.', amount: 380000 },
      { month: isEnglish ? 'Apr' : 'เม.ย.', amount: 650000 },
      { month: isEnglish ? 'May' : 'พ.ค.', amount: Math.round(totalSpend * 0.55) || 480000 },
      { month: isEnglish ? 'Jun' : 'มิ.ย.', amount: Math.round(totalSpend * 0.45) || 720000 },
    ];
  }, [isEnglish, totalSpend]);

  const handleExportExcel = () => {
    // Generate simple CSV for vendor performance
    const headers = ['Vendor Name', 'Total Orders', 'On-Time Delivery (%)', 'Rating', 'Total Spend (THB)'];
    const rows = vendorPerformance.map(v => 
      `"${v.name}",${v.orders},${v.onTime},${v.rating},${v.spend}`
    );
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(',') + '\n' + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Vendor_Performance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full">
      {/* Print-only Company Letterhead */}
      <div className="hidden print:flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-4">
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
          <div>พิมพ์รายงานเมื่อ: {new Date().toLocaleDateString(isEnglish ? 'en-US' : 'th-TH')}</div>
          <div className="font-semibold text-slate-700">รายงานสรุปผลการจัดซื้อและงบประมาณ (BI Analytics)</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {t('reports.title')}
            </h1>
            <span className="heading-badge heading-badge-primary shadow-2xs">
              {isEnglish ? 'Analytics & BI' : 'ศูนย์วิเคราะห์และสถิติ'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            {t('reports.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <button 
              onClick={() => setDateRange('MTD')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${dateRange === 'MTD' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {isEnglish ? 'This Month' : 'เดือนนี้'}
            </button>
            <button 
              onClick={() => setDateRange('QTD')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${dateRange === 'QTD' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {isEnglish ? 'This Quarter' : 'ไตรมาสนี้'}
            </button>
            <button 
              onClick={() => setDateRange('YTD')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${dateRange === 'YTD' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {isEnglish ? 'This Year' : 'ปีนี้'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportExcel}
              className="inline-flex items-center px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
              title="ส่งออกรายงานเป็น Excel/CSV"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
              Excel
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
            >
              {isExporting ? 'กำลังสร้าง...' : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div id="report-content" className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">ยอดสั่งซื้อรวม (Spend)</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">฿{totalSpend.toLocaleString()}</h3>
              </div>
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-emerald-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+15% จากเดือนที่แล้ว</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">ใบสั่งซื้อที่ดำเนินการ (POs)</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalPOCount}</h3>
              </div>
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-blue-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Live Updates</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">อัตราการส่งมอบตรงเวลา</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">92.5%</h3>
              </div>
              <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-emerald-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>สูงกว่าเป้าหมาย (90%)</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">เรตติ้งผู้ขายเฉลี่ย</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">4.62</h3>
              </div>
              <div className="bg-amber-50 text-amber-600 p-2 rounded-lg">
                <Star className="h-5 w-5 fill-amber-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-slate-500">
              <span>จากผู้ขายที่ใช้งานอยู่ 24 ราย</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
          <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-6 min-w-0">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-lg font-bold text-slate-800">แนวโน้มยอดสั่งซื้อ (บาท)</h2>
               <button className="print-hidden p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg">
                 <Filter className="h-4 w-4" />
               </button>
             </div>
             <div className="w-full h-72 min-w-0 min-h-[280px]">
               <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
                 <LineChart data={monthlySpend} margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                   <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                   <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{fill: '#64748B', fontSize: 12}} 
                     tickFormatter={(value) => `฿${(value/1000)}k`}
                   />
                   <Tooltip 
                     cursor={{stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4'}} 
                     contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                     formatter={(value: any) => [`฿${Number(value || 0).toLocaleString()}`, 'ยอดสั่งซื้อ']}
                   />
                   <Line type="monotone" dataKey="amount" stroke="#4F46E5" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-5 sm:p-6 min-w-0 flex flex-col justify-between">
             <div className="flex items-center justify-between mb-4 sm:mb-6">
               <h2 className="text-base sm:text-lg font-bold text-slate-800">
                 {isEnglish ? 'Spend by Category' : 'สัดส่วนยอดซื้อตามหมวดหมู่'}
               </h2>
               <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                 {categorySpend.length} {isEnglish ? 'Categories' : 'หมวดหมู่'}
               </span>
             </div>

             <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 min-w-0 flex-1">
               {/* Donut Chart with Center Metric */}
               <div className="w-full sm:w-1/2 h-52 sm:h-60 relative flex items-center justify-center shrink-0">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={categorySpend}
                       cx="50%"
                       cy="50%"
                       innerRadius={50}
                       outerRadius={75}
                       paddingAngle={3}
                       dataKey="value"
                     >
                       {categorySpend.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip 
                       formatter={(value: any) => [`${value ?? 0}%`, isEnglish ? 'Share' : 'สัดส่วน']}
                       contentStyle={{borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 4px 10px rgba(0,0,0,0.06)'}} 
                     />
                   </PieChart>
                 </ResponsiveContainer>
                 {/* Center Label in Donut Hole */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-xl font-extrabold text-slate-800">{categorySpend.length}</span>
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                     {isEnglish ? 'Types' : 'ประเภท'}
                   </span>
                 </div>
               </div>

               {/* Responsive Legend List (No SVG Overflow) */}
               <div className="w-full sm:w-1/2 flex flex-col gap-1.5 max-h-56 sm:max-h-64 overflow-y-auto no-scrollbar">
                 {categorySpend.map((entry, index) => (
                   <div 
                     key={entry.name}
                     className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                   >
                     <div className="flex items-center gap-2 min-w-0">
                       <span 
                         className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" 
                         style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                       />
                       <span className="text-slate-700 font-medium truncate" title={entry.name}>
                         {entry.name}
                       </span>
                     </div>
                     <span className="font-bold font-mono text-slate-900 shrink-0 ml-2">
                       {entry.value}%
                     </span>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>

        {/* Data Table */}
        {/* Data Table Container */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 bg-slate-50">
            <h2 className="text-base sm:text-lg font-bold text-slate-800">ประสิทธิภาพการจัดส่งของผู้ขาย (Vendor Performance)</h2>
            <span className="text-xs sm:text-sm font-medium text-slate-500">Top 5 ผู้ขายที่มียอดซื้อสูงสุด</span>
          </div>

          {/* Mobile Cards (Visible on < md) */}
          <div className="md:hidden divide-y divide-slate-100">
            {vendorPerformance.map((vendor) => (
              <div key={vendor.id} className="p-4 space-y-2.5 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug break-words">
                    {vendor.name}
                  </h4>
                  <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-bold font-mono text-[10px] whitespace-nowrap">
                    <Star className="h-3 w-3 mr-0.5 fill-amber-500 text-amber-500" />
                    {(vendor.rating ?? 0).toFixed(1)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">คำสั่งซื้อ (PO)</span>
                    <span className="font-bold text-slate-800 font-mono">{vendor.orders} รายการ</span>
                  </div>
                  <div className="border-x border-slate-200/80">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">ตรงเวลา</span>
                    <span className={`font-bold font-mono text-xs ${
                      vendor.onTime >= 90 ? "text-emerald-700" : vendor.onTime >= 80 ? "text-amber-700" : "text-red-700"
                    }`}>
                      {vendor.onTime}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">ยอดซื้อรวม</span>
                    <span className="font-bold text-slate-900 font-mono text-xs whitespace-nowrap">
                      ฿{(vendor.spend / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (Visible on >= md) */}
          <div className="hidden md:block overflow-x-auto smooth-scroll">
            <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[860px]">
              <thead className="bg-slate-100/90 text-[11px] text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 min-w-[240px]">ชื่อผู้ขาย / บริษัทคู่ค้า</th>
                  <th className="px-3 py-3.5 text-center whitespace-nowrap w-[150px]">จำนวนคำสั่งซื้อ (PO)</th>
                  <th className="px-3 py-3.5 text-center whitespace-nowrap w-[150px]">ส่งมอบตรงเวลา (%)</th>
                  <th className="px-3 py-3.5 text-center whitespace-nowrap w-[140px]">เรตติ้งประเมิน</th>
                  <th className="px-4 py-3.5 text-right whitespace-nowrap w-[180px]">ยอดซื้อสะสมรวม (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm bg-white">
                {vendorPerformance.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 align-top">
                      <div className="font-bold text-slate-900 text-sm leading-snug break-words">{vendor.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">คู่ค้ายอดสั่งซื้อสูงสุดประจำไตรมาส</div>
                    </td>
                    <td className="px-3 py-3.5 align-top text-center font-mono tabular-nums font-semibold text-slate-900">
                      {vendor.orders} <span className="text-xs text-slate-500 font-normal">รายการ</span>
                    </td>
                    <td className="px-3 py-3.5 align-top text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold font-mono tabular-nums border leading-none ${
                        vendor.onTime >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        vendor.onTime >= 80 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {vendor.onTime}%
                      </span>
                    </td>
                    <td className="px-3 py-3.5 align-top text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-bold font-mono tabular-nums text-xs leading-none">
                        <Star className="h-3.5 w-3.5 mr-1 fill-amber-500 text-amber-500" />
                        {vendor.rating.toFixed(1)} / 5.0
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap text-sm leading-tight">
                      ฿{(vendor.spend ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

