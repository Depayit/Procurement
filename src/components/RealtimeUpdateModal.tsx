import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  X, 
  ArrowRight, 
  Rocket, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Minimize2
} from 'lucide-react';
import { 
  initRealtimeDeploymentWatcher, 
  applyUpdateAndReload, 
  playUpdateChime, 
  DeploymentInfo,
  CURRENT_CLIENT_VERSION 
} from '../services/realtimeUpdateService';
import { useNotifications } from '../contexts/NotificationContext';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

export function RealtimeUpdateModal() {
  const { isEnglish } = useLanguage();
  const { addNotification, sendSystemNotification } = useNotifications();
  const [deployment, setDeployment] = useState<DeploymentInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Start listening for real-time deployments via Service Worker, Poller, and BroadcastChannel
    const unsubscribe = initRealtimeDeploymentWatcher((info) => {
      setDeployment(info);
      setIsOpen(true);
      setIsMinimized(false);

      // Play audio chime and haptic feedback
      playUpdateChime();

      // Add to in-app notification center
      addNotification({
        title: isEnglish 
          ? `🚀 New System Deployment (v${info.version})` 
          : `🚀 มีการ Deploy อัพเดตระบบใหม่ (v${info.version})`,
        message: info.releaseNotes || (isEnglish 
          ? 'A new version has been deployed. Click to reload with the latest features.' 
          : 'ระบบตรวจพบการ Deploy เวอร์ชันใหม่ พร้อมฟังก์ชันและการปรับปรุงล่าสุด'),
        type: 'system',
        link: '/settings',
        time: 'เมื่อสักครู่',
      });

      // Send native device push notification if permitted
      sendSystemNotification(
        isEnglish ? 'Conerage store: System Update Live!' : 'Conerage store: มีการอัพเดตระบบใหม่แบบเรียลไทม์!',
        {
          body: isEnglish 
            ? `Version ${info.version} has just been deployed. Tap to update now.` 
            : `เวอร์ชัน ${info.version} เพิ่งถูก deploy เรียบร้อยแล้ว แตะเพื่ออัปเดตทันที`,
          tag: 'system-deployment-' + info.buildId,
        }
      );
    });

    return () => {
      unsubscribe();
    };
  }, [addNotification, sendSystemNotification, isEnglish]);

  const handleUpdateNow = async () => {
    setIsUpdating(true);
    await applyUpdateAndReload();
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleDismiss = () => {
    setIsOpen(false);
    setIsMinimized(true);
  };

  if (!deployment || (!isOpen && !isMinimized)) {
    return null;
  }

  // Minimized Floating Pill on bottom-right
  if (isMinimized) {
    return (
      <aside aria-label={isEnglish ? 'System update notification' : 'การแจ้งเตือนอัปเดตระบบ'} className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
        <button
          type="button"
          onClick={() => {
            setIsMinimized(false);
            setIsOpen(true);
          }}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 border border-indigo-500/40 cursor-pointer group transition-all"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span>{isEnglish ? 'Update Available' : 'มีอัพเดตใหม่'} (v{deployment.version})</span>
          </span>
          <span className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-white">
            {isEnglish ? 'View' : 'ดู'}
          </span>
        </button>
      </aside>
    );
  }

  // Full High-Impact Real-time Deployment Alert
  return (
    <aside aria-label={isEnglish ? 'New version alert' : 'แจ้งเตือนเวอร์ชันใหม่'} className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 max-w-md w-[calc(100vw-1.5rem)] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-indigo-500/40 p-4 sm:p-5 overflow-hidden relative">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
              <Rocket className="w-5 h-5 text-amber-300 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span>{isEnglish ? 'New Version Deployed!' : 'ตรวจพบการ Deploy ระบบใหม่!'}</span>
                </h4>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  v{deployment.version}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{isEnglish ? 'Real-time Deployment Sync' : 'แจ้งเตือนอัตโนมัติแบบเรียลไทม์'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleMinimize}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title={isEnglish ? 'Minimize' : 'ย่อหน้าต่าง'}
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title={isEnglish ? 'Dismiss' : 'ปิด'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="mt-3.5 space-y-2 text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
          <p className="text-[11.5px] text-slate-200">
            {deployment.releaseNotes || (isEnglish
              ? 'A fresh build has just been deployed to production. Update now to ensure seamless operation without losing work.'
              : 'ระบบได้รับการ Deploy เวอร์ชันล่าสุดเรียบร้อยแล้ว กรุณากดปุ่มเพื่ออัปเดตและเริ่มใช้งานฟังก์ชันใหม่ได้ทันที')}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 text-[10px] text-slate-400 font-mono">
            <span className="truncate">Build: {deployment.buildId.slice(0, 16)}</span>
            <span className="shrink-0 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{isEnglish ? 'Just now' : 'เมื่อสักครู่'}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleMinimize}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isEnglish ? 'Remind Later' : 'เตือนภายหลัง'}
          </button>

          <button
            type="button"
            onClick={handleUpdateNow}
            disabled={isUpdating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isUpdating && "animate-spin")} />
            <span>
              {isUpdating 
                ? (isEnglish ? 'Updating System...' : 'กำลังอัพเดตและรีเฟรช...') 
                : (isEnglish ? 'Update Now' : 'อัพเดตทันที')}
            </span>
          </button>
        </div>

      </div>
    </aside>
  );
}
