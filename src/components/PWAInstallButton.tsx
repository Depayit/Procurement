import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../contexts/LanguageContext';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'banner' | 'settings';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '',
  variant = 'header'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { isEnglish } = useLanguage();

  // If running in standalone installed PWA, show status badge in settings, otherwise hide in header
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{isEnglish ? 'Installed as App (Standalone Mode)' : 'ติดตั้งเป็นแอปแล้ว (โหมดสแตนด์อโลน)'}</span>
        </div>
      );
    }
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'settings') {
      return (
        <button
          type="button"
          onClick={install}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{isEnglish ? 'Install ProcureSync App' : 'ติดตั้งแอป ProcureSync บนเครื่อง'}</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={install}
        className={`inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer ${className}`}
        title={isEnglish ? 'Install as App' : 'ติดตั้งแอปพลิเคชัน'}
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{isEnglish ? 'Install App' : 'ติดตั้งแอป'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 text-xs font-semibold shadow-2xs transition-colors cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">{isEnglish ? 'Install on iOS' : 'ติดตั้งบน iOS'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    {isEnglish ? 'Install on iPhone / iPad' : 'วิธีติดตั้งบน iPhone / iPad'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">1</span>
                  <p>
                    {isEnglish ? 'Tap the ' : 'แตะปุ่ม '}
                    <strong className="text-slate-800 inline-flex items-center gap-1 mx-0.5">
                      <Share className="w-3 h-3 text-indigo-600 inline" /> {isEnglish ? 'Share' : 'แชร์ (Share)'}
                    </strong>
                    {isEnglish ? ' button in the Safari toolbar at the bottom.' : ' ที่แถบเครื่องมือของ Safari'}
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">2</span>
                  <p>
                    {isEnglish ? 'Scroll down and select ' : 'เลื่อนลงแล้วเลือก '}
                    <strong className="text-slate-800">
                      {isEnglish ? 'Add to Home Screen' : '"เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)'}
                    </strong>
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">3</span>
                  <p>
                    {isEnglish ? 'Tap ' : 'กด '}
                    <strong className="text-slate-800">{isEnglish ? 'Add' : '"เพิ่ม" (Add)'}</strong>
                    {isEnglish ? ' at the top right to open ProcureSync as a native app!' : ' ที่มุมขวาบน เพื่อเริ่มใช้งานเหมือนแอปจริงทันที!'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-700 transition-colors"
              >
                {isEnglish ? 'Got it' : 'เข้าใจแล้ว'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for settings or desktop when prompt not yet fired
  if (variant === 'settings') {
    return (
      <div className="text-xs text-slate-500">
        {isEnglish ? 'PWA Ready — Open in browser to install to desktop or phone.' : 'ระบบ PWA พร้อมใช้งาน — เปิดผ่านเบราว์เซอร์เพื่อติดตั้งลงในหน้าจอโฮม'}
      </div>
    );
  }

  return null;
};
