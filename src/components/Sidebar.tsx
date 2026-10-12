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
  BookOpen,
  LogOut,
  X,
  Lock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { LanguageToggle } from './LanguageToggle';
import { PWAInstallButton } from './PWAInstallButton';
import type { PermissionKey } from '../types';

interface NavItem {
  key: string;
  path: string;
  icon: any;
  requiredPerm?: PermissionKey;
}

const navItems: NavItem[] = [
  { key: 'nav.dashboard', path: '/', icon: LayoutDashboard, requiredPerm: 'dashboard:view' },
  { key: 'nav.pr', path: '/pr', icon: ShoppingCart, requiredPerm: 'pr:view' },
  { key: 'nav.approvals', path: '/approvals', icon: ClipboardCheck, requiredPerm: 'approvals:view' },
  { key: 'nav.inventory', path: '/inventory', icon: Package, requiredPerm: 'inventory:view' },
  { key: 'nav.po', path: '/po', icon: FileText, requiredPerm: 'po:view' },
  { key: 'nav.vendors', path: '/vendors', icon: Store, requiredPerm: 'vendors:view' },
  { key: 'nav.reports', path: '/reports', icon: BarChart3, requiredPerm: 'reports:view' },
  { key: 'nav.users', path: '/users', icon: Users, requiredPerm: 'users:view' },
  { key: 'nav.manual', path: '/manual', icon: BookOpen },
  { key: 'nav.settings', path: '/settings', icon: Settings, requiredPerm: 'settings:view' },
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const location = useLocation();
  const { t, isEnglish } = useLanguage();
  const { hasPermission, isAdmin, activeRoleConfig } = useAuth();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-slate-200 text-slate-600 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 h-screen",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex items-center justify-between lg:justify-center h-16 border-b border-slate-200 px-6 shrink-0">
        <div className="flex items-center gap-2.5 lg:w-full lg:justify-center">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-xs">
            <div className="w-4 h-4 border-2 border-white rounded-xs"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 truncate leading-tight">
              ProcureSync
            </h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider leading-none">Enterprise</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 p-1">
          <span className="sr-only">Close sidebar</span>
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-3">
          {t('nav.mainMenu')}
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          const label = t(item.key);
          const isPermitted = isAdmin || !item.requiredPerm || hasPermission(item.requiredPerm);

          if (!isPermitted) {
            return (
              <div
                key={item.key}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-slate-400 bg-slate-50/70 cursor-not-allowed select-none opacity-60"
                title={isEnglish ? `Access restricted by Admin for ${activeRoleConfig.titleTh || 'this position'}` : `แอดมินจำกัดสิทธิ์สำหรับตำแหน่ง ${activeRoleConfig.titleTh || 'นี้'}`}
              >
                <div className="flex items-center min-w-0">
                  <Icon className="mr-3 h-4 w-4 shrink-0 text-slate-300" />
                  <span className="truncate">{label}</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              </div>
            );
          }

          return (
            <Link
              key={item.key}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-indigo-50 text-indigo-700 font-semibold border-r-4 border-indigo-600 rounded-r-none" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn("mr-3 h-5 w-5 shrink-0", isActive ? "text-indigo-600" : "text-slate-400")} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-100 space-y-2">
        <div className="px-1">
          <PWAInstallButton variant="sidebar" className="w-full justify-center" />
        </div>

        <div className="lg:hidden flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-100">
          <span className="text-xs text-slate-500 font-medium">{t('header.language')}</span>
          <LanguageToggle />
        </div>

        <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-500 rounded-lg hover:bg-slate-50 hover:text-slate-700 transition-colors">
          <LogOut className="mr-3 h-5 w-5 text-slate-400" />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  );
}
