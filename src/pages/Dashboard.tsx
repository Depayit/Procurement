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

const data = [
  { name: 'Jan', pr: 4000, po: 2400 },
  { name: 'Feb', pr: 3000, po: 1398 },
  { name: 'Mar', pr: 2000, po: 9800 },
  { name: 'Apr', pr: 2780, po: 3908 },
  { name: 'May', pr: 1890, po: 4800 },
  { name: 'Jun', pr: 2390, po: 3800 },
];

export function Dashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">แดชบอร์ด</h1>
        <p className="text-sm text-slate-500 mt-1">ภาพรวมของระบบจัดซื้อและคลังสินค้า</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200 p-5 group hover:border-indigo-200 transition-colors">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-50 rounded-lg p-3 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <ShoppingCart className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">PR ทั้งหมด (เดือนนี้)</dt>
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
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200 p-5 group hover:border-indigo-200 transition-colors">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-50 rounded-lg p-3 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <ClipboardCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">รอการอนุมัติ</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-bold text-slate-800">18</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200 p-5 group hover:border-amber-200 transition-colors">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-amber-50 rounded-lg p-3 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">สินค้าใกล้หมด</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-bold text-slate-800">5</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200 p-5 group hover:border-emerald-200 transition-colors">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-emerald-50 rounded-lg p-3 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <ShoppingCart className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">PO ที่กำลังดำเนินการ</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-bold text-slate-800">42</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-1">ปริมาณ PR เทียบกับ PO</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'}} />
                <Bar dataKey="pr" name="Purchase Requests" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="po" name="Purchase Orders" fill="#818CF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-6 relative">
          <h2 className="text-lg font-bold text-slate-800 mb-4 cursor-default border-b border-slate-100 pb-1">รายการที่รออนุมัติล่าสุด</h2>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-slate-100">
              {[
                { id: 'PR-2025-001', desc: 'ปูนซีเมนต์ปอร์ตแลนด์ 500 ถุง', amount: '75,000', req: 'ไซต์งาน สุขุมวิท', date: '2 ชม. ที่แล้ว' },
                { id: 'PR-2025-002', desc: 'เหล็กเส้นกลม SR24', amount: '245,000', req: 'ไซต์งาน บางนา', date: '4 ชม. ที่แล้ว' },
                { id: 'PO-2025-089', desc: 'เช่ารถขุดตีนตะขาบ', amount: '120,000', req: 'ส่วนกลาง', date: '5 ชม. ที่แล้ว' },
                { id: 'PR-2025-003', desc: 'อิฐมอญแดง 5000 ก้อน', amount: '12,500', req: 'ไซต์งาน ลาดพร้าว', date: '1 วันที่แล้ว' },
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
                      ตรวจสอบ &rarr;
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
