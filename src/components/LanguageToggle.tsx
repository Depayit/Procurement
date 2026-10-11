import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

interface LanguageToggleProps {
  variant?: 'header' | 'compact' | 'dropdown' | 'buttons';
  className?: string;
}

export function LanguageToggle({ variant = 'header', className }: LanguageToggleProps) {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleLanguage}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs",
          className
        )}
        title={language === 'th' ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"}
        aria-label="Toggle language"
      >
        <Globe className="w-3.5 h-3.5 text-indigo-600" />
        <span className="uppercase">{language === 'th' ? 'TH' : 'EN'}</span>
      </button>
    );
  }

  // Default header toggle: Segmented pill style
  return (
    <div
      className={cn(
        "inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold select-none shadow-xs",
        className
      )}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        onClick={() => setLanguage('th')}
        className={cn(
          "px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 text-xs",
          language === 'th'
            ? "bg-white text-indigo-700 shadow-xs font-bold border border-slate-200/60"
            : "text-slate-600 hover:text-slate-900"
        )}
        title="สลับเป็นภาษาไทย"
      >
        <span className="text-[13px] leading-none">🇹🇭</span>
        <span>ไทย</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={cn(
          "px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 text-xs",
          language === 'en'
            ? "bg-white text-indigo-700 shadow-xs font-bold border border-slate-200/60"
            : "text-slate-600 hover:text-slate-900"
        )}
        title="Switch to English"
      >
        <span className="text-[13px] leading-none">🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}
