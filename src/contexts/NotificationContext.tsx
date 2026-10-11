import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type NotificationType = 'approval' | 'inventory' | 'po' | 'other';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  type: NotificationType;
  isRead: boolean;
  link: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  permission: NotificationPermission | 'unsupported';
  isSupported: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (notif: {
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
    time?: string;
  }) => void;
  requestPermission: () => Promise<boolean>;
  sendSystemNotification: (title: string, options?: NotificationOptions) => Promise<boolean>;
}

const STORAGE_KEY = 'procuresync_notifications';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { 
    id: '1', 
    title: 'รอการอนุมัติ: PR-2025-001', 
    message: 'คุณมีใบขอซื้อใหม่รอการพิจารณาอนุมัติจำนวน 1 รายการ (งานเทคอนกรีตฐานราก)', 
    time: '10 นาทีที่แล้ว', 
    timestamp: Date.now() - 10 * 60 * 1000, 
    type: 'approval', 
    isRead: false, 
    link: '/approvals' 
  },
  { 
    id: '2', 
    title: 'สต็อกใกล้หมด: ปูนซีเมนต์ปอร์ตแลนด์', 
    message: 'สินค้าจำนวนต่ำกว่าเกณฑ์ความปลอดภัย (เหลือ 50 ถุง จากเกณฑ์ขั้นต่ำ 100 ถุง)', 
    time: '1 ชั่วโมงที่แล้ว', 
    timestamp: Date.now() - 60 * 60 * 1000, 
    type: 'inventory', 
    isRead: false, 
    link: '/inventory' 
  },
  { 
    id: '3', 
    title: 'รับสินค้าแล้ว: PO-2025-090', 
    message: 'คุณวิชัยรับ เหล็กเส้นเพิ่มเติมสำหรับลานจอดรถ แล้ว (จำนวน 50 เส้น)', 
    time: '2 ชั่วโมงที่แล้ว', 
    timestamp: Date.now() - 2 * 60 * 60 * 1000, 
    type: 'po', 
    isRead: true, 
    link: '/po' // Fixed route from /purchase-orders to /po
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize any old links
          return parsed.map(n => ({
            ...n,
            link: n.link === '/purchase-orders' ? '/po' : n.link
          }));
        }
      }
    } catch {
      // Ignore storage errors
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');

  const isSupported = typeof window !== 'undefined' && 'Notification' in window;

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    } else {
      setPermission('unsupported');
    }
  }, [isSupported]);

  // Persist notifications
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // Ignore storage errors
    }
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      return res === 'granted';
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return false;
    }
  }, [isSupported]);

  const sendSystemNotification = useCallback(async (title: string, options?: NotificationOptions): Promise<boolean> => {
    if (!isSupported) return false;

    let currentPerm = Notification.permission;
    if (currentPerm === 'default') {
      currentPerm = await Notification.requestPermission();
      setPermission(currentPerm);
    }

    if (currentPerm !== 'granted') return false;

    try {
      // Try service worker notification first (better mobile PWA support)
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(title, {
            icon: '/pwa-192x192.png',
            badge: '/favicon.ico',
            ...options
          });
          return true;
        }
      }

      // Fallback to standard window Notification
      new Notification(title, {
        icon: '/pwa-192x192.png',
        ...options
      });
      return true;
    } catch (err) {
      console.warn('Could not display system notification:', err);
      return false;
    }
  }, [isSupported]);

  const addNotification = useCallback((notif: {
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
    time?: string;
  }) => {
    const newEntry: AppNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: notif.title,
      message: notif.message,
      type: notif.type || 'other',
      link: notif.link || '/pr',
      time: notif.time || 'เมื่อสักครู่',
      timestamp: Date.now(),
      isRead: false
    };

    setNotifications(prev => [newEntry, ...prev]);

    // Also trigger native device notification if permitted
    sendSystemNotification(notif.title, {
      body: notif.message,
      tag: newEntry.id,
    });
  }, [sendSystemNotification]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        permission,
        isSupported,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        addNotification,
        requestPermission,
        sendSystemNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
