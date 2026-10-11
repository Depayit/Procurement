import { 
  ShoppingCart, 
  ClipboardCheck, 
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

const data = [
  { name: 'Jan', pr: 4000, po: 2400 },
  { name: 'Feb', pr: 3000, po: 1398 },
  { name: 'Mar', pr: 2000, po: 9800 },
  { name: 'Apr', pr: 2780, po: 3908 },
  { name: 'May', pr: 1890, po: 4800 },
  { name: 'Jun', pr: 2390, po: 3800 },
];

export function Dashboard() {
  const { t, isEnglish } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">{t('dashboard.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="bg-white overflow-hidden shadow-xs rounded-xl border border-slate-200 p-5 group hover:border-indigo-200 transition-colors">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-50 rounded-lg p-3 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <ShoppingCart className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">{t('dashboard.totalPr')}</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-bold text-slate-800">124</div>
                  <div className="ml-2 flex items-baseline text-xs font-bold text-green-600 px-2 py-0.5 bg-green-100 rounded tracking-wide uppercase">
                    <TrendingUp className="self-center flex-shrink-0 h-3 w-3 mr-1 text-green-700" aria-hidden="true" />
                    +12% YoY
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white overflow-hidden shadow-xs rounded-xl border border-slate-200 p-5 group hover:border-indigo-200 transition-colors">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-50 rounded-lg p-3 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <ClipboardCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">{t('dashboard.pendingApprovals')}</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-bold text-slate-800">18</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white overflow-hidden shadow-xs rounded-xl border border-slate-200 p-5 group hover:border-amber-200 transition-colors">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-amber-50 rounded-lg p-3 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">{t('dashboard.lowStock')}</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-bold text-slate-800">5</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white overflow-hidden shadow-xs rounded-xl border border-slate-200 p-5 group hover:border-emerald-200 transition-colors">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-emerald-50 rounded-lg p-3 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <ShoppingCart className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">{isEnglish ? 'Active Purchase Orders' : 'PO ที่กำลังดำเนินการ'}</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-bold text-slate-800">42</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        <div className="bg-white shadow-xs border border-slate-200 rounded-xl p-6 min-w-0">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
            {t('dashboard.prPoComparison')}
          </h2>
          <div className="w-full h-72 min-w-0 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
              <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'}} />
                <Bar dataKey="pr" name={isEnglish ? "Purchase Requests (PR)" : "ใบขอซื้อ (PR)"} fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="po" name={isEnglish ? "Purchase Orders (PO)" : "ใบสั่งซื้อ (PO)"} fill="#818CF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white shadow-xs border border-slate-200 rounded-xl p-6 relative">
          <h2 className="text-lg font-bold text-slate-800 mb-4 cursor-default border-b border-slate-100 pb-2">
            {t('dashboard.recentPrs')}
          </h2>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-slate-100">
              {[
                { id: 'PR-2025-001', desc: isEnglish ? 'Portland Cement 500 Bags' : 'ปูนซีเมนต์ปอร์ตแลนด์ 500 ถุง', amount: '75,000 THB', req: isEnglish ? 'Sukhumvit Site' : 'ไซต์งาน สุขุมวิท', date: isEnglish ? '2 hrs ago' : '2 ชม. ที่แล้ว' },
                { id: 'PR-2025-002', desc: isEnglish ? 'Round Bar Steel SR24' : 'เหล็กเส้นกลม SR24', amount: '245,000 THB', req: isEnglish ? 'Bangna Site' : 'ไซต์งาน บางนา', date: isEnglish ? '4 hrs ago' : '4 ชม. ที่แล้ว' },
                { id: 'PO-2025-089', desc: isEnglish ? 'Crawler Excavator Rental' : 'เช่ารถขุดตีนตะขาบ', amount: '120,000 THB', req: isEnglish ? 'Head Office' : 'ส่วนกลาง', date: isEnglish ? '5 hrs ago' : '5 ชม. ที่แล้ว' },
                { id: 'PR-2025-003', desc: isEnglish ? 'Red Clay Bricks 5,000 pcs' : 'อิฐมอญแดง 5000 ก้อน', amount: '12,500 THB', req: isEnglish ? 'Ladprao Site' : 'ไซต์งาน ลาดพร้าว', date: isEnglish ? '1 day ago' : '1 วันที่แล้ว' },
              ].map((item) => (
                <li key={item.id} className="py-4 flex items-center group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {item.id} - {item.desc}
                    </p>
                    <p className="text-sm text-slate-500 truncate mt-0.5">
                      {item.req} &bull; {item.date}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 text-right">
                    <p className="text-sm font-bold text-slate-800">{item.amount}</p>
                    <button className="mt-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors tracking-wide uppercase">
                      {t('common.view')} &rarr;
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
