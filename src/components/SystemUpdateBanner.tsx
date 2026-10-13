import React, { useState, useEffect } from 'react';
import { Sparkles, X, RefreshCw, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  CURRENT_CLIENT_VERSION, 
  applyUpdateAndReload, 
  DeploymentInfo 
} from '../services/realtimeUpdateService';
import { cn } from '../lib/utils';

export const CURRENT_SYSTEM_VERSION = CURRENT_CLIENT_VERSION;
const STORAGE_DISMISS_KEY = 'conerage_dismissed_update_version';

export function SystemUpdateBanner() {
  const { isEnglish } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeVersion, setActiveVersion] = useState(CURRENT_CLIENT_VERSION);
  const [releaseNote, setReleaseNote] = useState<string | null>(null);

  useEffect(() => {
    try {
      const dismissedVersion = localStorage.getItem(STORAGE_DISMISS_KEY);
      if (dismissedVersion !== CURRENT_CLIENT_VERSION) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }

    const handleCustomTrigger = (e: Event) => {
      const custom = e as CustomEvent<DeploymentInfo>;
      if (custom.detail?.version) {
        setActiveVersion(custom.detail.version);
        if (custom.detail.releaseNotes) {
          setReleaseNote(custom.detail.releaseNotes);
        }
      }
      setIsVisible(true);
    };

    window.addEventListener('app:new-version-deployed', handleCustomTrigger);
    window.addEventListener('procuresync:show-system-update', handleCustomTrigger);
    return () => {
      window.removeEventListener('app:new-version-deployed', handleCustomTrigger);
      window.removeEventListener('procuresync:show-system-update', handleCustomTrigger);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_DISMISS_KEY, activeVersion);
    } catch {
      // ignore
    }
  };

  const handleReload = async () => {
    setIsRefreshing(true);
    await applyUpdateAndReload();
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/30 px-3 sm:px-6 py-2.5 sm:py-3 shadow-md relative z-10 transition-all duration-300">
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        
        {/* Left: Badge + Summary */}
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/90 text-white flex items-center justify-center shrink-0 shadow-sm border border-indigo-400/30 mt-0.5 sm:mt-0">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                {isEnglish ? 'System Update Live' : 'อัพเดตระบบเวอร์ชันใหม่'}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                v{activeVersion}
              </span>
              <span className="text-[11px] text-slate-300 hidden lg:inline">
                • {isEnglish ? '5 Standard SOP Sections & Real-time Deploy Notifications' : 'คู่มือ SOP 5 ส่วนหลัก & ระบบตรวจจับการ Deploy เรียลไทม์'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1 sm:line-clamp-none">
              {releaseNote || (isEnglish 
                ? 'Automatic real-time deployment detection active. Click Update Now to load latest features immediately.'
                : 'ตรวจพบการ Deploy อัปเดตใหม่เรียบร้อยแล้ว กดปุ่ม "อัพเดตทันที" เพื่อโหลดเวอร์ชันล่าสุดโดยไม่สูญเสียข้อมูล')}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <Link
            to="/settings"
            onClick={handleDismiss}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-medium text-xs border border-white/15 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-300" />
            <span>{isEnglish ? 'Settings' : 'ดูการตั้งค่า'}</span>
          </Link>

          <button
            type="button"
            onClick={handleReload}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            title={isEnglish ? 'Refresh application and clear cached assets' : 'รีเฟรชเพื่อโหลดเวอร์ชันล่าสุดทันที'}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
            <span>{isRefreshing ? (isEnglish ? 'Updating...' : 'กำลังอัพเดต...') : (isEnglish ? 'Update Now' : 'อัพเดตทันที')}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer ml-1"
            title={isEnglish ? 'Dismiss notice' : 'ปิดการแจ้งเตือน'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
