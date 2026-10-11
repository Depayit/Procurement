import { Bell, Search, Check, AlertCircle, ShoppingCart, Box, Menu, Trash2, CheckCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications, NotificationType } from '../contexts/NotificationContext';
import { LanguageToggle } from './LanguageToggle';
import { PWAInstallButton } from './PWAInstallButton';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { t, isEnglish } = useLanguage();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll 
  } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: NotificationType) => {
    switch(type) {
      case 'approval': return <Check className="h-4 w-4 text-indigo-500" />;
      case 'inventory': return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'po': return <ShoppingCart className="h-4 w-4 text-emerald-500" />;
      default: return <Box className="h-4 w-4 text-slate-500" />;
    }
  };

  const getGroupTitle = (type: NotificationType) => {
    switch(type) {
      case 'approval': return isEnglish ? 'Approvals' : 'การอนุมัติเอกสาร';
      case 'inventory': return isEnglish ? 'Inventory Alerts' : 'เตือนสต็อกพัสดุ';
      case 'po': return isEnglish ? 'Purchase Orders' : 'สถานะใบสั่งซื้อ (PO)';
      default: return isEnglish ? 'System Notices' : 'การแจ้งเตือนทั่วไป';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10 w-full shrink-0">
      <div className="flex items-center flex-1 gap-3 sm:gap-4 min-w-0">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md shrink-0 cursor-pointer"
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" />
        </button>
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
      
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
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
            <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-1.5rem)] sm:w-84 md:w-96 max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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
              <div className="max-h-[380px] overflow-y-auto bg-white divide-y divide-slate-100">
                {notifications.length > 0 ? (
                  <div className="p-2 space-y-2">
                    {(['approval', 'inventory', 'po', 'other'] as NotificationType[]).map(groupType => {
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

        {/* User Badge */}
        <div className="flex items-center">
          <Link 
            to="/settings"
            className="flex items-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1 transition-colors hover:bg-slate-50"
            title={isEnglish ? 'Go to Settings' : 'ไปยังหน้าการตั้งค่า'}
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold border border-indigo-200">
              SC
            </div>
            <div className="hidden md:block text-left">
              <span className="block font-semibold text-slate-800 text-xs leading-tight">{t('header.userName')}</span>
              <span className="block text-[10px] text-slate-400 font-medium">{t('header.userRole')}</span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
