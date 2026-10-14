import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ClipboardCheck, 
  Menu,
  Bot,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { useAuth } from '../contexts/AuthContext';

interface BottomNavProps {
  onOpenMenu: () => void;
  isMenuOpen: boolean;
}

export function BottomNav({ onOpenMenu, isMenuOpen }: BottomNavProps) {
  const location = useLocation();
  const { isEnglish } = useLanguage();
  const { prs } = useProcurement();
  const { hasPermission, isAdmin } = useAuth();

  // Calculate pending approvals
  const pendingApprovalsCount = prs.filter(
    pr => pr.status === 'Pending Approval'
  ).length;

  const canViewDashboard = isAdmin || hasPermission('dashboard:view');
  const canViewPR = isAdmin || hasPermission('pr:view');
  const canViewApprovals = isAdmin || hasPermission('approvals:view');

  const isDashboardActive = location.pathname === '/';
  const isPRActive = location.pathname.startsWith('/pr');
  const isApprovalsActive = location.pathname.startsWith('/approvals');

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-5 h-14 max-w-lg mx-auto items-center px-1">
        
        {/* Tab 1: Dashboard */}
        {canViewDashboard ? (
          <Link
            to="/"
            className={cn(
              "flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative select-none touch-manipulation",
              isDashboardActive 
                ? "text-indigo-600 font-bold" 
                : "text-slate-500 hover:text-slate-900 active:scale-95"
            )}
          >
            <LayoutDashboard className={cn(
              "w-5 h-5 transition-transform", 
              isDashboardActive && "scale-110 text-indigo-600 stroke-[2.4]"
            )} />
            <span className={cn(
              "text-[10px] mt-0.5 tracking-tight truncate max-w-full leading-tight",
              isDashboardActive ? "font-bold text-indigo-600" : "font-medium"
            )}>
              {isEnglish ? 'Dashboard' : 'แดชบอร์ด'}
            </span>
            {isDashboardActive && (
              <span className="w-1.5 h-1 bg-indigo-600 rounded-full mt-0.5" />
            )}
          </Link>
        ) : <div />}

        {/* Tab 2: Purchase Request (PR) */}
        {canViewPR ? (
          <Link
            to="/pr"
            className={cn(
              "flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative select-none touch-manipulation",
              isPRActive 
                ? "text-indigo-600 font-bold" 
                : "text-slate-500 hover:text-slate-900 active:scale-95"
            )}
          >
            <ShoppingCart className={cn(
              "w-5 h-5 transition-transform", 
              isPRActive && "scale-110 text-indigo-600 stroke-[2.4]"
            )} />
            <span className={cn(
              "text-[10px] mt-0.5 tracking-tight truncate max-w-full leading-tight",
              isPRActive ? "font-bold text-indigo-600" : "font-medium"
            )}>
              {isEnglish ? 'PR' : 'ขอซื้อ'}
            </span>
            {isPRActive && (
              <span className="w-1.5 h-1 bg-indigo-600 rounded-full mt-0.5" />
            )}
          </Link>
        ) : <div />}

        {/* Tab 3: CENTER PROMINENT FLOATING AI CHAT BUTTON */}
        <div className="flex flex-col items-center justify-center relative">
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('app:open-ai-copilot', { detail: { tab: 'chat' } }));
            }}
            className="group relative flex flex-col items-center justify-center -mt-3 select-none touch-manipulation cursor-pointer"
            aria-label={isEnglish ? "Open AI Chat" : "เปิดแชทผู้ช่วย AI"}
          >
            {/* Circular Action Button (subtle) */}
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-[0_3px_10px_rgba(79,70,229,0.25)] ring-2 ring-white group-hover:shadow-[0_4px_14px_rgba(79,70,229,0.35)] group-active:scale-95 transition-all duration-200">
              <Bot className="w-5 h-5 text-white" />
              
              {/* Online Indicator */}
              <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white" />
            </div>

            {/* Label Below Circle */}
            <span className="text-[10px] mt-0.5 font-semibold tracking-tight text-indigo-600 leading-tight flex items-center gap-0.5">
              <span>{isEnglish ? 'AI Chat' : 'แชท AI'}</span>
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            </span>
          </button>
        </div>

        {/* Tab 4: Approvals */}
        {canViewApprovals ? (
          <Link
            to="/approvals"
            className={cn(
              "flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative select-none touch-manipulation",
              isApprovalsActive 
                ? "text-indigo-600 font-bold" 
                : "text-slate-500 hover:text-slate-900 active:scale-95"
            )}
          >
            <div className="relative">
              <ClipboardCheck className={cn(
                "w-5 h-5 transition-transform", 
                isApprovalsActive && "scale-110 text-indigo-600 stroke-[2.4]"
              )} />
              {pendingApprovalsCount > 0 && (
                <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9.5px] font-black flex items-center justify-center ring-2 ring-white tabular-nums animate-pulse">
                  {pendingApprovalsCount > 99 ? '99+' : pendingApprovalsCount}
                </span>
              )}
            </div>
            <span className={cn(
              "text-[10px] mt-0.5 tracking-tight truncate max-w-full leading-tight",
              isApprovalsActive ? "font-bold text-indigo-600" : "font-medium"
            )}>
              {isEnglish ? 'Approve' : 'อนุมัติ'}
            </span>
            {isApprovalsActive && (
              <span className="w-1.5 h-1 bg-indigo-600 rounded-full mt-0.5" />
            )}
          </Link>
        ) : <div />}

        {/* Tab 5: All Menus / More (Toggle Drawer) */}
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
          <Menu className={cn(
            "w-5 h-5 transition-transform",
            isMenuOpen && "scale-110 text-indigo-600 stroke-[2.4]"
          )} />
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
