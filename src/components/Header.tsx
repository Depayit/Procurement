import { Bell, Search, Check, AlertCircle, ShoppingCart, Box, Menu, Trash2, CheckCheck, Shield, UserCheck, ChevronDown, Sparkles, PanelLeftClose, PanelLeftOpen, Store } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications, NotificationType } from '../contexts/NotificationContext';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { LanguageToggle } from './LanguageToggle';
import { PWAInstallButton } from './PWAInstallButton';

export interface HeaderProps {
  onMenuClick: () => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Header({ 
  onMenuClick,
  isSidebarCollapsed = false,
  onToggleCollapse
}: HeaderProps) {
  const { t, isEnglish } = useLanguage();
  const { currentUser, activeRole, switchRole, availableRoles } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll 
  } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: NotificationType) => {
    switch(type) {
      case 'system': return <Sparkles className="h-4 w-4 text-purple-600" />;
      case 'approval': return <Check className="h-4 w-4 text-indigo-500" />;
      case 'inventory': return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'po': return <ShoppingCart className="h-4 w-4 text-emerald-500" />;
      default: return <Box className="h-4 w-4 text-slate-500" />;
    }
  };

  const getGroupTitle = (type: NotificationType) => {
    switch(type) {
      case 'system': return isEnglish ? 'System Updates' : 'อัพเดตระบบ';
      case 'approval': return isEnglish ? 'Approvals' : 'การอนุมัติเอกสาร';
      case 'inventory': return isEnglish ? 'Inventory Alerts' : 'เตือนสต็อกพัสดุ';
      case 'po': return isEnglish ? 'Purchase Orders' : 'สถานะใบสั่งซื้อ (PO)';
      default: return isEnglish ? 'System Notices' : 'การแจ้งเตือนทั่วไป';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 relative z-30 w-full shrink-0">
      <div className="flex items-center flex-1 gap-2 sm:gap-4 min-w-0">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg shrink-0 cursor-pointer transition-colors"
          title={isEnglish ? 'Open menu' : 'เปิดเมนู'}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* Mobile Brand Name */}
        <div className="lg:hidden flex items-center gap-2 min-w-0 mr-1">
          <img 
            src="/logo-64.png" 
            alt="Conerage store" 
            className="w-7 h-7 rounded-lg object-contain shrink-0 bg-white shadow-2xs border border-slate-200 p-0.5" 
          />
          <span className="font-extrabold text-sm text-slate-900 tracking-tight truncate">
            Conerage store
          </span>
        </div>

        {/* Desktop Collapse / Expand Toggle */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
            title={isSidebarCollapsed ? (isEnglish ? 'Expand sidebar (show menu)' : 'ขยายแถบเมนู (แสดงชื่อเมนู)') : (isEnglish ? 'Collapse sidebar (more workspace)' : 'ย่อแถบเมนู (เพิ่มพื้นที่ทำงาน)')}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        )}

        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border-none rounded-lg leading-5 bg-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm transition-colors"
            placeholder={t('header.searchPlaceholder')}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            type="button"
            onClick={() => {
              setShowNotifications(prev => !prev);
              setShowUserMenu(false);
            }}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg transition-colors cursor-pointer"
            title={isEnglish ? 'Notifications' : 'การแจ้งเตือน'}
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 ring-2 ring-white text-[10px] font-bold text-white tabular-nums animate-in zoom-in-75">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-1.5rem)] sm:w-84 md:w-96 max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[calc(100dvh-5rem)] flex flex-col">
              {/* Header */}
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 text-sm">{t('header.notifications')}</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount} {isEnglish ? 'new' : 'ใหม่'}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    type="button"
                    onClick={markAllAsRead} 
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>{t('header.markAllAsRead')}</span>
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto bg-white divide-y divide-slate-100 max-h-[min(380px,calc(100dvh-12rem))]">
                {notifications.length > 0 ? (
                  <div className="p-2 space-y-2">
                    {(['system', 'approval', 'inventory', 'po', 'other'] as NotificationType[]).map(groupType => {
                      const groupNotifs = notifications.filter(n => (n.type || 'other') === groupType);
                      if (groupNotifs.length === 0) return null;
                      
                      return (
                        <div key={groupType} className="rounded-xl border border-slate-100 overflow-hidden shadow-2xs">
                          <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-bold text-slate-600 tracking-wide border-b border-slate-100 flex items-center">
                            {getIcon(groupType)}
                            <span className="ml-1.5">{getGroupTitle(groupType)}</span>
                            <span className="ml-auto text-[10px] text-slate-400 font-normal">
                              ({groupNotifs.length})
                            </span>
                          </div>
                          <div className="divide-y divide-slate-50">
                            {groupNotifs.map((notif) => (
                              <div
                                key={notif.id}
                                className={cn(
                                  "p-3 flex items-start justify-between gap-2 transition-colors hover:bg-slate-50 group",
                                  notif.isRead ? "bg-white opacity-80" : "bg-indigo-50/40"
                                )}
                              >
                                <Link 
                                  to={notif.link}
                                  onClick={() => {
                                    markAsRead(notif.id);
                                    setShowNotifications(false);
                                  }}
                                  className="flex-1 min-w-0"
                                >
                                  <div className="flex items-center gap-1.5">
                                    {!notif.isRead && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                                    )}
                                    <p className={cn("text-xs font-bold leading-snug break-words", !notif.isRead ? "text-indigo-950 font-bold" : "text-slate-800")}>
                                      {notif.title}
                                    </p>
                                  </div>
                                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                                    {notif.message}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                                    {notif.time}
                                  </p>
                                </Link>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notif.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-opacity cursor-pointer"
                                  title={isEnglish ? 'Delete notification' : 'ลบการแจ้งเตือนนี้'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-600">{t('header.noNotifications')}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isEnglish ? 'All caught up!' : 'ไม่มีรายการแจ้งเตือนใหม่ในขณะนี้'}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                  <button 
                    type="button"
                    onClick={clearAll}
                    className="text-slate-400 hover:text-red-600 text-[11px] font-medium transition-colors px-2 py-1 cursor-pointer"
                  >
                    {isEnglish ? 'Clear all' : 'ล้างทั้งหมด'}
                  </button>
                  <Link
                    to="/approvals"
                    onClick={() => setShowNotifications(false)}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold text-[11px] px-2 py-1 transition-colors"
                  >
                    {t('header.viewAllNotifications')} &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Language Switcher */}
        <LanguageToggle />

        {/* User Badge & Interactive Role Switcher */}
        <div className="relative" ref={userMenuRef}>
          <button 
            type="button"
            onClick={() => {
              setShowUserMenu(prev => !prev);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl p-1.5 transition-all hover:bg-slate-100/80 cursor-pointer border border-transparent hover:border-slate-200"
            title={isEnglish ? 'Switch user / role' : 'สลับบทบาทผู้ใช้งาน'}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center text-xs font-bold shadow-xs ring-2 ring-indigo-200">
              {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="hidden md:block text-left">
              <span className="block font-semibold text-slate-800 text-xs leading-tight truncate max-w-[120px]">
                {currentUser.name}
              </span>
              <span className="block text-[10px] text-indigo-600 font-bold tracking-tight">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform hidden sm:block", showUserMenu && "rotate-180")} />
          </button>

          {showUserMenu && (
            <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-1.5rem)] sm:w-84 max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[calc(100dvh-5rem)] flex flex-col">
              {/* Header Details (Sticky Profile Summary) */}
              <div className="p-3.5 bg-gradient-to-br from-indigo-50/90 via-slate-50 to-white border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-indigo-100 shrink-0">
                    {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'US'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm truncate leading-snug">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                      {currentUser.department || 'สำนักงานใหญ่'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Persona / Role Selector (Scrollable Middle Section) */}
              <div className="p-2.5 sm:p-3 bg-slate-50/50 border-b border-slate-100 flex flex-col min-h-0 flex-1 overflow-hidden">
                <div className="flex items-center justify-between mb-2 px-1 shrink-0">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    {isEnglish ? 'Switch Persona (Demo & Testing)' : 'สลับบทบาทจำลอง (ทดสอบการทำงาน)'}
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                    Active
                  </span>
                </div>
                
                {/* Scrollable list with thin scrollbar and comfortable max-height */}
                <div className="space-y-1.5 overflow-y-auto max-h-48 sm:max-h-56 pr-1 scroll-smooth overscroll-contain">
                  {availableRoles.map(item => {
                    const isSelected = activeRole === item.role;
                    return (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => {
                          switchRole(item.role);
                          setShowUserMenu(false);
                        }}
                        className={cn(
                          "w-full text-left p-2 rounded-xl text-xs flex items-center gap-2.5 transition-all cursor-pointer border",
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs font-semibold"
                            : "bg-white text-slate-700 border-slate-200/80 hover:bg-indigo-50/50 hover:border-indigo-200"
                        )}
                      >
                        <span className={cn(
                          "w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[10px] sm:text-[11px] font-bold shrink-0",
                          isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                        )}>
                          {item.avatarText}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate leading-tight font-medium text-xs">
                            {isEnglish ? item.titleEn : item.titleTh}
                          </p>
                          <p className={cn(
                            "text-[10px] truncate mt-0.5",
                            isSelected ? "text-indigo-100" : "text-slate-400"
                          )}>
                            {isEnglish ? item.descEn : item.descTh}
                          </p>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Links (Pinned to bottom) */}
              <div className="p-2 bg-white flex flex-col gap-0.5 text-xs font-medium shrink-0">
                <Link
                  to="/users"
                  onClick={() => setShowUserMenu(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    {isEnglish ? 'User & Role Management' : 'จัดการผู้ใช้งานและสิทธิ์'}
                  </span>
                  <span className="text-[11px] text-slate-400">&rarr;</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center justify-between transition-colors"
                >
                  <span>{isEnglish ? 'System Settings' : 'ตั้งค่าระบบ'}</span>
                  <span className="text-[11px] text-slate-400">&rarr;</span>
                </Link>
                <Link
                  to="/manual"
                  onClick={() => setShowUserMenu(false)}
                  className="px-3 py-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 flex items-center justify-between transition-colors font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    {isEnglish ? 'User Manual & Guides' : 'คู่มือการใช้งานระบบ'}
                  </span>
                  <span className="text-[11px] text-indigo-500">&rarr;</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
