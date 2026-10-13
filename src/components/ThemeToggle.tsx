import { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sun, Sparkles, Sliders } from 'lucide-react';
import { useTheme, ThemeId } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function ThemeToggle() {
  const { currentThemeId, currentTheme, setTheme, eyeComfortMode, setEyeComfortMode, themes } = useTheme();
  const { isEnglish } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={cn(
          "flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-xs",
          isOpen
            ? "border-indigo-600 bg-indigo-50/60 text-indigo-700"
            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
        )}
        title={isEnglish ? 'Theme & Eye Comfort' : 'เลือกธีมสีสบายตา & ถนอมสายตา'}
        aria-label="Theme selection"
      >
        <span 
          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs"
          style={{ backgroundColor: currentTheme.primaryColor }}
        />
        <Palette className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
        <span className="hidden md:inline font-medium text-[11px] truncate max-w-[85px]">
          {isEnglish ? currentTheme.nameEn.split(' ')[0] : currentTheme.nameTh.split(' ')[0]}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Mobile backdrop to easily dismiss */}
          <div 
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed left-3 right-3 top-[68px] sm:left-auto sm:right-0 sm:top-auto sm:absolute sm:mt-2 sm:w-80 rounded-2xl bg-white shadow-2xl border border-slate-200/90 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3.5 pb-2 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-600" />
                  {isEnglish ? 'Eye-Friendly Themes' : 'โทนสีสบายตา ได้มาตรฐาน'}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isEnglish ? 'Ergonomic colors reducing eye fatigue' : 'คัดสรรโทนสีสรีรศาสตร์ ลดความเมื่อยล้าตา'}
                </p>
              </div>
              <Link
                to="/settings?tab=theme"
                onClick={() => setIsOpen(false)}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline flex items-center gap-0.5"
              >
                <Sliders className="w-3 h-3" />
                {isEnglish ? 'Full Settings' : 'ตั้งค่าเต็ม'}
              </Link>
            </div>

            {/* Theme Presets List */}
            <div className="p-1.5 space-y-1 max-h-64 overflow-y-auto">
              {themes.map((theme) => {
                const isSelected = currentThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      setTheme(theme.id);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer group",
                      isSelected
                        ? "bg-indigo-50/80 border border-indigo-200/80 font-semibold text-slate-900"
                        : "hover:bg-slate-50 text-slate-700 border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex items-center -space-x-1 shrink-0">
                        <span
                          className="w-4 h-4 rounded-full border border-white shadow-2xs"
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                          style={{ backgroundColor: theme.primaryLight }}
                        />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span className="truncate">{isEnglish ? theme.nameEn : theme.nameTh}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal truncate">
                          {isEnglish ? theme.tagEn : theme.tagTh}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Eye Comfort Warmth Toggle */}
            <div className="pt-2 mt-1 border-t border-slate-100 px-3.5 pb-1">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-200/70">
                <div className="flex items-center gap-2 min-w-0">
                  <Sun className={cn("w-4 h-4 shrink-0 transition-colors", eyeComfortMode ? "text-amber-500" : "text-slate-400")} />
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {isEnglish ? 'Eye Comfort Filter' : 'โหมดถนอมสายตา'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {isEnglish ? 'Softer warmth (cuts blue light)' : 'ปรับโทนนวลลดแสงสีฟ้า'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEyeComfortMode(!eyeComfortMode)}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    eyeComfortMode ? "bg-amber-500" : "bg-slate-300"
                  )}
                  role="switch"
                  aria-checked={eyeComfortMode}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                      eyeComfortMode ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
