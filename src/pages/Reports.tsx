import React, { useState } from 'react';
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
import { exportToPDF } from '../lib/pdf';
import { useLanguage } from '../contexts/LanguageContext';

// Mock Data
const monthlySpend = [
  { month: 'ม.ค.', amount: 450000 },
  { month: 'ก.พ.', amount: 520000 },
  { month: 'มี.ค.', amount: 380000 },
  { month: 'เม.ย.', amount: 650000 },
  { month: 'พ.ค.', amount: 480000 },
  { month: 'มิ.ย.', amount: 720000 },
];

const categorySpend = [
  { name: 'วัสดุก่อสร้าง', value: 45 },
  { name: 'เครื่องมือช่าง', value: 25 },
  { name: 'ค่าเช่าเครื่องจักร', value: 20 },
  { name: 'เบ็ดเตล็ด', value: 10 },
];

const vendorPerformance = [
  { id: 'v1', name: 'บริษัท วัสดุก่อสร้างไทย จำกัด', orders: 45, onTime: 95, rating: 4.8, spend: 1250000 },
  { id: 'v2', name: 'โฮมสแควร์ เซ็นเตอร์', orders: 32, onTime: 88, rating: 4.2, spend: 850000 },
  { id: 'v3', name: 'ดีดี อินเตอร์เทรดวัสดุ', orders: 28, onTime: 92, rating: 4.5, spend: 620000 },
  { id: 'v4', name: 'สมพงษ์ ค้าเหล็ก', orders: 15, onTime: 80, rating: 3.9, spend: 450000 },
  { id: 'v5', name: 'ซีเมนต์ไทย เซลส์', orders: 56, onTime: 98, rating: 4.9, spend: 2100000 },
];

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#64748B'];

export function ReportsPage() {
  const { t, isEnglish } = useLanguage();
  const [dateRange, setDateRange] = useState('YTD');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportToPDF('report-content', `Procurement_Report_${new Date().toISOString().split('T')[0]}`);
    } finally {
      setIsExporting(false);
    }
  };

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">{t('reports.title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('reports.subtitle')}</p>
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
                <h3 className="text-2xl font-bold text-slate-800 mt-1">฿3.2M</h3>
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
                <h3 className="text-2xl font-bold text-slate-800 mt-1">176</h3>
              </div>
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-blue-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>+5% จากเดือนที่แล้ว</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-6">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-lg font-bold text-slate-800">แนวโน้มยอดสั่งซื้อ (บาท)</h2>
               <button className="print-hidden p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg">
                 <Filter className="h-4 w-4" />
               </button>
             </div>
             <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
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
                     formatter={(value: number) => [`฿${value.toLocaleString()}`, 'ยอดสั่งซื้อ']}
                   />
                   <Line type="monotone" dataKey="amount" stroke="#4F46E5" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-6">
             <h2 className="text-lg font-bold text-slate-800 mb-6">สัดส่วนยอดซื้อตามหมวดหมู่</h2>
             <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={categorySpend}
                     cx="50%"
                     cy="45%"
                     innerRadius={60}
                     outerRadius={100}
                     paddingAngle={2}
                     dataKey="value"
                   >
                     {categorySpend.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip 
                     formatter={(value) => [`${value}%`, 'สัดส่วน']}
                     contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                   />
                   <Legend verticalAlign="bottom" height={36} iconType="circle" />
                 </PieChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800">ประสิทธิภาพการจัดส่งของผู้ขาย (Vendor Performance)</h2>
            <span className="text-sm font-medium text-slate-500">Top 5 ผู้ขายที่มียอดซื้อสูงสุด</span>
          </div>
          <div className="overflow-x-auto">
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
                      <div className="font-bold text-slate-900 text-sm leading-snug">{vendor.name}</div>
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
                      ฿{vendor.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

