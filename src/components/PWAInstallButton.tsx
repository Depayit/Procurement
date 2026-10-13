import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  X, 
  CheckCircle2, 
  Share, 
  Sparkles, 
  Zap, 
  QrCode, 
  Wifi, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'sidebar' | 'settings' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '',
  variant = 'header'
}) => {
  const { isInstalled, canPromptNative, isIOS, isAndroid, isDesktop, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>(
    isIOS ? 'ios' : isAndroid ? 'android' : 'desktop'
  );
  const { isEnglish } = useLanguage();

  const handleInstallClick = async () => {
    if (canPromptNative) {
      const outcome = await install();
      if (outcome === 'guide') {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  // 1. If already installed in Standalone mode
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{isEnglish ? 'Installed as App (Standalone Mode)' : 'ติดตั้งเป็นแอปพลิเคชันแล้ว (โหมดสแตนด์อโลน)'}</span>
        </div>
      );
    }
    if (variant === 'sidebar') {
      return (
        <div className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">{isEnglish ? 'App Installed (Ready)' : 'ติดตั้งเป็นแอปแล้ว'}</span>
        </div>
      );
    }
    return null;
  }

  // 2. Render triggers based on variant
  const renderTrigger = () => {
    if (variant === 'settings') {
      return (
        <button
          type="button"
          onClick={handleInstallClick}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer hover:shadow-indigo-200"
        >
          <Download className="w-4 h-4" />
          <span>{isEnglish ? 'Install Conerage store App' : 'ติดตั้งแอป Conerage store บนเครื่อง'}</span>
        </button>
      );
    }

    if (variant === 'sidebar') {
      return (
        <button
          type="button"
          onClick={handleInstallClick}
          className={cn(
            "flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer hover:shadow-indigo-200",
            className
          )}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isEnglish ? 'Install App (PWA)' : 'ติดตั้งแอป Conerage store'}</span>
        </button>
      );
    }

    // Default 'header' variant
    return (
      <button
        type="button"
        onClick={handleInstallClick}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-colors cursor-pointer",
          className
        )}
        title={isEnglish ? 'Install as App' : 'ติดตั้งแอปพลิเคชัน'}
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{isEnglish ? 'Install App' : 'ติดตั้งแอป'}</span>
      </button>
    );
  };

  return (
    <>
      {renderTrigger()}

      {/* Comprehensive PWA Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden space-y-0 animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo-128.png" 
                  alt="Conerage store" 
                  className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 shadow-xs border border-white/20" 
                />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isEnglish ? 'Install Conerage store' : 'ติดตั้งแอปพลิเคชัน Conerage store'}
                  </h3>
                  <p className="text-xs text-indigo-200">
                    {isEnglish ? 'Progressive Web App (PWA) & Offline Ready' : 'ใช้งานเสมือนแอปจริง • รวดเร็ว • ทำงานแบบออฟไลน์ได้'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              
              {/* Platform Selector Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => setActiveTab('android')}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    activeTab === 'android' ? "bg-white text-indigo-700 shadow-xs" : "hover:text-slate-900"
                  )}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Android</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ios')}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    activeTab === 'ios' ? "bg-white text-indigo-700 shadow-xs" : "hover:text-slate-900"
                  )}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>iOS (iPhone/iPad)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('desktop')}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                    activeTab === 'desktop' ? "bg-white text-indigo-700 shadow-xs" : "hover:text-slate-900"
                  )}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Windows / Mac</span>
                </button>
              </div>

              {/* Instructions per Tab */}
              <div className="space-y-2.5 text-xs text-slate-600">
                {activeTab === 'android' && (
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">1</span>
                      <p>
                        เปิดเว็บไซต์นี้ผ่าน <strong>Google Chrome</strong> หรือ <strong>Samsung Internet</strong>
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">2</span>
                      <p>
                        แตะที่ไอคอน <strong>จุดสามจุด (⋮)</strong> ที่มุมขวาบนของเบราว์เซอร์
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">3</span>
                      <p>
                        เลือก <strong>&ldquo;ติดตั้งแอป&rdquo; (Install App)</strong> หรือ <strong>&ldquo;เพิ่มลงในหน้าจอหลัก&rdquo; (Add to Home screen)</strong>
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'ios' && (
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">1</span>
                      <p>
                        เปิดเว็บไซต์ด้วย <strong>Safari</strong> แล้วแตะที่ปุ่ม <strong className="inline-flex items-center gap-1 mx-0.5 text-indigo-700"><Share className="w-3 h-3 inline" /> แชร์ (Share)</strong> ที่แถบเครื่องมือด้านล่าง
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">2</span>
                      <p>
                        เลื่อนลงมาแล้วเลือก <strong>&ldquo;เพิ่มไปยังหน้าจอโฮม&rdquo; (Add to Home Screen)</strong>
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">3</span>
                      <p>
                        แตะ <strong>&ldquo;เพิ่ม&rdquo; (Add)</strong> ที่มุมขวาบน ไอคอนจะปรากฏบนหน้าจอโฮมทันที
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'desktop' && (
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">1</span>
                      <p>
                        เปิดเว็บไซต์ผ่าน <strong>Google Chrome</strong> หรือ <strong>Microsoft Edge</strong>
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">2</span>
                      <p>
                        มองหาไอคอน <strong>&ldquo;ติดตั้ง Conerage store&rdquo; (Install App)</strong> ที่อยู่ทางด้านขวาของช่อง Address Bar
                      </p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">3</span>
                      <p>
                        หรือคลิกเมนู <strong>จุดสามจุด (⋮) &gt; บันทึกและแชร์ &gt; ติดตั้ง Conerage store</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* PWA Benefits Grid */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  คุณประโยชน์เมื่อติดตั้ง PWA:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 p-2 bg-indigo-50/60 rounded-lg text-indigo-900 font-medium">
                    <Zap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>เร็วระดับ Native 100%</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-indigo-50/60 rounded-lg text-indigo-900 font-medium">
                    <Wifi className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>เปิดดูได้แม้ออฟไลน์</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-indigo-50/60 rounded-lg text-indigo-900 font-medium">
                    <QrCode className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>สแกนกล้อง QR ทันที</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-indigo-50/60 rounded-lg text-indigo-900 font-medium">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>มีเมนูลัด App Shortcuts</span>
                  </div>
                </div>
              </div>

              {/* Native Prompt Trigger Button if available */}
              {canPromptNative && (
                <button
                  type="button"
                  onClick={async () => {
                    await install();
                    setShowGuideModal(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>กดตรงนี้เพื่อเปิดหน้าต่างติดตั้งทันที</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                {isEnglish ? 'Close' : 'เข้าใจแล้ว / ปิดหน้าต่าง'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
