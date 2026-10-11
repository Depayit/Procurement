import { Bell, Search, Check, AlertCircle, ShoppingCart, Box, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'รอการอนุมัติ: PR-2025-001', message: 'คุณมีใบขอซื้อใหม่รอการพิจารณาอนุมัติจำนวน 1 รายการ', time: '10 นาทีที่แล้ว', type: 'approval', isRead: false, link: '/approvals' },
  { id: '2', title: 'สต็อกใกล้หมด: ปูนซีเมนต์ปอร์ตแลนด์', message: 'สินค้าจำนวนต่ำกว่าเกณฑ์ (เหลือ 50 ถุง)', time: '1 ชั่วโมงที่แล้ว', type: 'inventory', isRead: false, link: '/inventory' },
  { id: '3', title: 'รับสินค้าแล้ว: PO-2025-090', message: 'คุณวิชัยรับ เหล็กเส้นเพิ่มเติมสำหรับลานจอดรถ แล้ว (50 เส้น)', time: '2 ชั่วโมงที่แล้ว', type: 'po', isRead: true, link: '/purchase-orders' },
];

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'approval': return <Check className="h-5 w-5 text-indigo-500" />;
      case 'inventory': return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'po': return <ShoppingCart className="h-5 w-5 text-emerald-500" />;
      default: return <Box className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10 w-full shrink-0">
      <div className="flex items-center flex-1 gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" />
        </button>
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border-none rounded-md leading-5 bg-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm transition-colors"
            placeholder={t('header.searchPlaceholder')}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full transition-colors"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 ring-2 ring-white text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 lg:w-96 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800">{t('header.notifications')}</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                    {t('header.markAllAsRead')}
                  </button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto bg-slate-50">
                {notifications.length > 0 ? (
                  <div className="flex flex-col gap-2 p-2">
                    {['approval', 'inventory', 'po', 'other'].map(groupType => {
                      const groupNotifs = notifications.filter(n => (n.type || 'other') === groupType);
                      if (groupNotifs.length === 0) return null;
                      
                      let groupTitle = 'Other';
                      if (groupType === 'approval') groupTitle = 'Approvals';
                      if (groupType === 'inventory') groupTitle = 'Inventory Alerts';
                      if (groupType === 'po') groupTitle = 'PO Updates';

                      return (
                        <div key={groupType} className="bg-white rounded-lg border border-slate-100 overflow-hidden shadow-sm">
                          <div className="px-3 py-2 bg-slate-50/80 text-xs font-bold text-slate-600 tracking-wide border-b border-slate-100 flex items-center">
                            {getIcon(groupType)}
                            <span className="ml-2 uppercase">{groupTitle}</span>
                          </div>
                          <div className="divide-y divide-slate-50">
                            {groupNotifs.map((notif) => (
                              <Link 
                                key={notif.id} 
                                to={notif.link}
                                onClick={() => {
                                  setNotifications(notifications.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                                  setShowNotifications(false);
                                }}
                                className={cn("p-3 block hover:bg-slate-50 transition-colors", notif.isRead ? "opacity-70" : "bg-indigo-50/40")}
                              >
                                <div className="flex items-start gap-3">
                                  <div>
                                    <p className={cn("text-sm font-bold text-slate-800", !notif.isRead && "text-indigo-900")}>
                                      {notif.title}
                                    </p>
                                    <p className="text-sm text-slate-600 mt-0.5 line-clamp-2 leading-snug">
                                      {notif.message}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1.5 font-medium">
                                      {notif.time}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    {t('header.noNotifications')}
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                <button className="text-sm font-medium text-slate-600 hover:text-slate-800">
                  {t('header.viewAllNotifications')}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Language Switcher */}
        <LanguageToggle />

        <div className="flex items-center">
          <button className="flex items-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md p-1 transition-colors hover:bg-slate-50">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-300">SC</div>
            <div className="hidden md:block text-left">
              <span className="block font-medium text-slate-700 leading-tight">{t('header.userName')}</span>
              <span className="block text-xs text-slate-500">{t('header.userRole')}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
