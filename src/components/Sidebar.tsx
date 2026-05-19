import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ClipboardCheck, 
  Package, 
  FileText, 
  BarChart3, 
  Settings,
  Store,
  Users,
  LogOut,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect } from 'react';

const navItems = [
  { name: 'แดชบอร์ด', path: '/', icon: LayoutDashboard },
  { name: 'ระบบสั่งซื้อ (PR)', path: '/pr', icon: ShoppingCart },
  { name: 'อนุมัติ', path: '/approvals', icon: ClipboardCheck },
  { name: 'คลังสินค้า', path: '/inventory', icon: Package },
  { name: 'ระบบจัดซื้อ (PO)', path: '/po', icon: FileText },
  { name: 'คู่ค้า (Vendors)', path: '/vendors', icon: Store },
  { name: 'รายงาน', path: '/reports', icon: BarChart3 },
  { name: 'ผู้ใช้งาน', path: '/users', icon: Users },
  { name: 'ตั้งค่า', path: '/settings', icon: Settings },
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-slate-200 text-slate-600 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 h-screen",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex items-center justify-between lg:justify-center h-16 border-b border-slate-200 px-6 shrink-0">
        <div className="flex items-center gap-2 lg:w-full lg:justify-center">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 truncate">
            ProcureSync
          </h1>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 p-1">
          <span className="sr-only">Close sidebar</span>
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-3">
          เมนูหลัก
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600 rounded-r-none" 
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-indigo-600" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100">
        <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-500 rounded-md hover:bg-slate-50 hover:text-slate-700 transition-colors">
          <LogOut className="mr-3 h-5 w-5 text-slate-400" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}
