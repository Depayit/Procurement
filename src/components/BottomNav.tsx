import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ClipboardCheck, 
  Package, 
  Menu 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { useAuth } from '../contexts/AuthContext';
import type { PermissionKey } from '../types';

interface BottomNavProps {
  onOpenMenu: () => void;
  isMenuOpen: boolean;
}

interface NavTab {
  nameTh: string;
  nameEn: string;
  path: string;
  icon: typeof LayoutDashboard;
  requiredPerm?: PermissionKey;
  badge?: number;
}

export function BottomNav({ onOpenMenu, isMenuOpen }: BottomNavProps) {
  const location = useLocation();
  const { isEnglish } = useLanguage();
  const { prs } = useProcurement();
  const { hasPermission, isAdmin } = useAuth();

  // Calculate pending approvals
  const pendingApprovalsCount = prs.filter(
    pr => pr.status === 'pending_approval' || pr.status === 'pending'
  ).length;

  const tabs: NavTab[] = [
    {
      nameTh: 'แดชบอร์ด',
      nameEn: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      requiredPerm: 'dashboard:view',
    },
    {
      nameTh: 'ขอซื้อ',
      nameEn: 'PR',
      path: '/pr',
      icon: ShoppingCart,
      requiredPerm: 'pr:view',
    },
    {
      nameTh: 'อนุมัติ',
      nameEn: 'Approve',
      path: '/approvals',
      icon: ClipboardCheck,
      requiredPerm: 'approvals:view',
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    {
      nameTh: 'คลังพัสดุ',
      nameEn: 'Stock',
      path: '/inventory',
      icon: Package,
      requiredPerm: 'inventory:view',
    },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-5 h-14 max-w-lg mx-auto items-center px-1">
        {tabs.map((tab) => {
          const isPermitted = isAdmin || !tab.requiredPerm || hasPermission(tab.requiredPerm);
          if (!isPermitted) return null;

          const isActive = tab.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(tab.path);
          const Icon = tab.icon;
          const label = isEnglish ? tab.nameEn : tab.nameTh;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative select-none touch-manipulation",
                isActive 
                  ? "text-indigo-600 font-bold" 
                  : "text-slate-500 hover:text-slate-900 active:scale-95"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "w-5 h-5 transition-transform", 
                  isActive && "scale-110 text-indigo-600 stroke-[2.4]"
                )} />
                {typeof tab.badge === 'number' && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9.5px] font-black flex items-center justify-center ring-2 ring-white tabular-nums animate-pulse">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] mt-0.5 tracking-tight truncate max-w-full leading-tight",
                isActive ? "font-bold text-indigo-600" : "font-medium"
              )}>
                {label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1 bg-indigo-600 rounded-full mt-0.5" />
              )}
            </Link>
          );
        })}

        {/* 5th Tab: All Menus / More (Toggle Drawer) */}
        <button
          type="button"
          onClick={onOpenMenu}
          className={cn(
            "flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative select-none touch-manipulation cursor-pointer",
            isMenuOpen 
              ? "text-indigo-600 font-bold" 
              : "text-slate-500 hover:text-slate-900 active:scale-95"
          )}
          aria-label={isEnglish ? "All Menus" : "เมนูทั้งหมด"}
        >
          <div className="relative">
            <Menu className={cn(
              "w-5 h-5 transition-transform",
              isMenuOpen && "scale-110 text-indigo-600 stroke-[2.4]"
            )} />
          </div>
          <span className={cn(
            "text-[10px] mt-0.5 tracking-tight truncate max-w-full leading-tight",
            isMenuOpen ? "font-bold text-indigo-600" : "font-medium"
          )}>
            {isEnglish ? 'More' : 'เมนูหลัก'}
          </span>
          {isMenuOpen && (
            <span className="w-1.5 h-1 bg-indigo-600 rounded-full mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
}
