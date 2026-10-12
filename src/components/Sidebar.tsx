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
  Lock,
  UploadCloud,
  Cloud
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useProcurement } from '../contexts/ProcurementContext';
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
  { key: 'nav.dataImport', path: '/import', icon: UploadCloud },
  { key: 'nav.integrations', path: '/integrations', icon: Cloud },
  { key: 'nav.reports', path: '/reports', icon: BarChart3, requiredPerm: 'reports:view' },
  { key: 'nav.users', path: '/users', icon: Users, requiredPerm: 'users:view' },
  { key: 'nav.manual', path: '/manual', icon: BookOpen },
  { key: 'nav.settings', path: '/settings', icon: Settings, requiredPerm: 'settings:view' },
];

export interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  isCollapsed?: boolean;
}

export function Sidebar({ 
  isOpen, 
  setIsOpen,
  isCollapsed = false
}: SidebarProps) {
  const location = useLocation();
  const { t, isEnglish } = useLanguage();
  const { hasPermission, isAdmin, activeRoleConfig } = useAuth();
  const { companyProfile } = useProcurement();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  // Lock background scroll on mobile when sidebar drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 text-slate-600 transition-transform duration-300 ease-in-out h-[100dvh] w-72 max-w-[85vw]",
      "lg:relative lg:inset-auto lg:h-screen lg:max-w-none lg:z-30 lg:transition-[width,transform]",
      isCollapsed ? "lg:w-20" : "lg:w-64",
      isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full pointer-events-none lg:translate-x-0 lg:pointer-events-auto shadow-none"
    )}>
      {/* Header Branding */}
      <div className={cn(
        "flex items-center h-16 border-b border-slate-200 shrink-0 transition-all duration-300",
        isCollapsed ? "lg:justify-center lg:px-2 px-5 justify-between" : "px-5 justify-between"
      )}>
        <div className={cn(
          "flex items-center gap-2.5 min-w-0",
          isCollapsed ? "lg:justify-center" : ""
        )}>
          {companyProfile?.logoUrl ? (
            <img 
              src={companyProfile.logoUrl} 
              alt="Company Logo" 
              className="w-8 h-8 rounded object-contain shrink-0 border border-slate-200 p-0.5 bg-white shadow-2xs" 
            />
          ) : (
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-xs shrink-0">
              <div className="w-4 h-4 border-2 border-white rounded-xs"></div>
            </div>
          )}

          <div className={cn(
            "min-w-0 transition-opacity duration-200",
            isCollapsed ? "lg:hidden" : "block"
          )}>
            <h1 className="text-base font-bold tracking-tight text-slate-900 truncate leading-tight">
              {companyProfile?.nameEn ? (companyProfile.nameEn.split(' ')[0] || 'ProcureSync') : 'ProcureSync'}
            </h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider leading-none truncate">
              {companyProfile?.nameTh ? companyProfile.nameTh.substring(0, 16) : 'Enterprise'}
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button 
          type="button"
          onClick={() => setIsOpen(false)} 
          className="lg:hidden text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-colors cursor-pointer"
          title={isEnglish ? 'Close menu' : 'ปิดเมนู'}
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className={cn(
          "text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-3",
          isCollapsed ? "lg:hidden" : "block"
        )}>
          {t('nav.mainMenu')}
        </div>
        {isCollapsed && <div className="hidden lg:block border-b border-slate-100 my-2 mx-1" />}

        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          const label = t(item.key);
          const isPermitted = isAdmin || !item.requiredPerm || hasPermission(item.requiredPerm);

          if (!isPermitted) {
            return (
              <div
                key={item.key}
                className={cn(
                  "flex items-center rounded-lg text-xs font-medium text-slate-400 bg-slate-50/70 cursor-not-allowed select-none opacity-60 group relative",
                  isCollapsed ? "lg:justify-center lg:px-2 lg:py-2.5 px-3 py-2.5" : "justify-between px-3 py-2.5"
                )}
                title={isEnglish ? `Access restricted by Admin for ${activeRoleConfig.titleTh || 'this position'}` : `แอดมินจำกัดสิทธิ์สำหรับตำแหน่ง ${activeRoleConfig.titleTh || 'นี้'}`}
              >
                <div className="flex items-center min-w-0">
                  <Icon className={cn("h-4 w-4 shrink-0 text-slate-300", isCollapsed ? "lg:mr-0 mr-3" : "mr-3")} />
                  <span className={cn("truncate", isCollapsed ? "lg:hidden" : "block")}>{label}</span>
                </div>
                <Lock className={cn("w-3.5 h-3.5 text-slate-400 shrink-0", isCollapsed ? "lg:hidden" : "ml-1")} />

                {/* Floating Tooltip */}
                {isCollapsed && (
                  <span className="hidden lg:group-hover:block absolute left-full ml-3 px-2.5 py-1 bg-slate-800 text-white text-xs font-medium rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
                    {label} ({isEnglish ? 'Restricted' : 'จำกัดสิทธิ์'})
                  </span>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.key}
              to={item.path}
              title={label}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-all group relative",
                isCollapsed 
                  ? "lg:justify-center lg:px-2 lg:py-2.5 px-3 py-2.5" 
                  : "px-3 py-2.5",
                isActive 
                  ? "bg-indigo-50 text-indigo-700 font-semibold border-r-4 border-indigo-600 rounded-r-none" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 shrink-0 transition-transform group-hover:scale-105",
                isCollapsed ? "lg:mr-0 mr-3" : "mr-3",
                isActive ? "text-indigo-600" : "text-slate-400"
              )} />
              <span className={cn("truncate transition-opacity duration-200", isCollapsed ? "lg:hidden" : "block")}>
                {label}
              </span>

              {/* Floating Tooltip for collapsed mode */}
              {isCollapsed && (
                <span className="hidden lg:group-hover:block absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-100 space-y-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] lg:pb-3">
        <div className="px-1">
          <div className={cn(isCollapsed ? "lg:hidden" : "block")}>
            <PWAInstallButton variant="sidebar" className="w-full justify-center" />
          </div>
          {isCollapsed && (
            <div className="hidden lg:flex justify-center">
              <PWAInstallButton variant="header" className="p-2 rounded-lg justify-center w-10 h-10 [&>span]:hidden" />
            </div>
          )}
        </div>

        <div className="lg:hidden flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-100">
          <span className="text-xs text-slate-500 font-medium">{t('header.language')}</span>
          <LanguageToggle />
        </div>

        <button 
          title={t('nav.logout')}
          className={cn(
            "flex items-center w-full text-sm font-medium text-slate-500 rounded-lg hover:bg-slate-50 hover:text-slate-700 transition-colors group relative",
            isCollapsed ? "lg:justify-center lg:px-2 lg:py-2 px-3 py-2" : "px-3 py-2"
          )}
        >
          <LogOut className={cn("h-5 w-5 text-slate-400 shrink-0", isCollapsed ? "lg:mr-0 mr-3" : "mr-3")} />
          <span className={cn("truncate", isCollapsed ? "lg:hidden" : "block")}>
            {t('nav.logout')}
          </span>
          {isCollapsed && (
            <span className="hidden lg:group-hover:block absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
              {t('nav.logout')}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
