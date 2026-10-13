import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId = 'calm-ocean' | 'forest-sage' | 'warm-sand' | 'steel-slate' | 'midnight-dark';

export interface ThemePreset {
  id: ThemeId;
  nameTh: string;
  nameEn: string;
  tagTh: string;
  tagEn: string;
  descriptionTh: string;
  descriptionEn: string;
  primaryColor: string;
  primaryHover: string;
  primaryLight: string;
  primaryBorder: string;
  primaryText: string;
  surfaceColor: string;
  canvasBg: string;
  textColor: string;
  textMuted: string;
  borderColor: string;
  isDark?: boolean;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'calm-ocean',
    nameTh: 'ครามสมุทรนุ่มนวล (Calm Ocean)',
    nameEn: 'Calm Ocean (Soft Navy)',
    tagTh: 'มาตรฐาน สบายตา (ค่าเริ่มต้น)',
    tagEn: 'Standard Comfort (Default)',
    descriptionTh: 'โทนครามสเลทลุ่มลึก นุ่มนวล ไม่จ้าตา ลดแสงสะท้อน และคงความน่าเชื่อถือระดับมืออาชีพ',
    descriptionEn: 'Soothing slate-navy balanced for prolonged viewing without retinal glare or fatigue.',
    primaryColor: '#1d4ed8',
    primaryHover: '#1e40af',
    primaryLight: '#eff6ff',
    primaryBorder: '#bfdbfe',
    primaryText: '#ffffff',
    surfaceColor: '#ffffff',
    canvasBg: '#f8fafc',
    textColor: '#0f172a',
    textMuted: '#64748b',
    borderColor: '#e2e8f0',
  },
  {
    id: 'forest-sage',
    nameTh: 'เขียวเซจผ่อนคลาย (Forest Sage)',
    nameEn: 'Forest Sage (Eye-Care)',
    tagTh: 'ถนอมสายตาเป็นพิเศษ',
    tagEn: 'Optimal Eye Relief',
    descriptionTh: 'ความยาวคลื่นแสงสีเขียวธรรมชาติ ช่วยคลายกล้ามเนื้อตา เหมาะอย่างยิ่งสำหรับการทำงานเอกสารต่อเนื่อง',
    descriptionEn: 'Natural green wavelengths ease eye strain and relax optic nerves during long sessions.',
    primaryColor: '#059669',
    primaryHover: '#047857',
    primaryLight: '#ecfdf5',
    primaryBorder: '#a7f3d0',
    primaryText: '#ffffff',
    surfaceColor: '#ffffff',
    canvasBg: '#f4f8f6',
    textColor: '#064e3b',
    textMuted: '#4b7362',
    borderColor: '#d1e3d9',
  },
  {
    id: 'warm-sand',
    nameTh: 'วอร์มสโตนถนอมสายตา (Warm Sand)',
    nameEn: 'Warm Sand (Low Blue-Light)',
    tagTh: 'ลดแสงสะท้อน แสงสีฟ้าต่ำ',
    tagEn: 'Reduced Blue-Light',
    descriptionTh: 'โทนสีนวลกระดาษธรรมชาติ ลดความจ้าของแสงสีฟ้าหน้าจอ สบายตาเหมือนอ่านบนหน้ากระดาษพรีเมียม',
    descriptionEn: 'True-tone paper warmth minimizes high-energy visible blue light emissions.',
    primaryColor: '#b45309',
    primaryHover: '#92400e',
    primaryLight: '#fffbeb',
    primaryBorder: '#fde68a',
    primaryText: '#ffffff',
    surfaceColor: '#ffffff',
    canvasBg: '#faf7f2',
    textColor: '#292524',
    textMuted: '#78716c',
    borderColor: '#e7e5e4',
  },
  {
    id: 'steel-slate',
    nameTh: 'สตีลสเลทมินิมอล (Steel Slate)',
    nameEn: 'Steel Slate (Neutral Minimal)',
    tagTh: 'เรียบหรู คมชัด นิ่งสงบ',
    tagEn: 'Muted & Calm',
    descriptionTh: 'สไตล์สแกนดิเนเวียน นิ่งเรียบ ไม่มีสีสันฉูดฉาดรบกวนสมาธิ ช่วยให้โฟกัสกับข้อมูลตัวเลขได้ดีเยี่ยม',
    descriptionEn: 'Minimalist neutral graphite eliminates visual saturation distractions.',
    primaryColor: '#334155',
    primaryHover: '#1e293b',
    primaryLight: '#f1f5f9',
    primaryBorder: '#cbd5e1',
    primaryText: '#ffffff',
    surfaceColor: '#ffffff',
    canvasBg: '#f8fafc',
    textColor: '#0f172a',
    textMuted: '#64748b',
    borderColor: '#e2e8f0',
  },
  {
    id: 'midnight-dark',
    nameTh: 'มิดไนท์ชาร์โคล (Midnight Dark)',
    nameEn: 'Midnight Charcoal (Dark Mode)',
    tagTh: 'สบายตาในที่แสงน้อย',
    tagEn: 'Low-Light Ergonomic',
    descriptionTh: 'ดาร์กโหมดสเลทลุ่มลึก ไม่ใช่ดำสนิท ลดความเปรียบต่างที่รุนแรง ไม่ทำให้ปวดตาเวลาเปิดดูตอนกลางคืน',
    descriptionEn: 'Engineered dark slate reduces ocular contrast shocks in low-light environments.',
    primaryColor: '#3b82f6',
    primaryHover: '#60a5fa',
    primaryLight: '#1e293b',
    primaryBorder: '#334155',
    primaryText: '#ffffff',
    surfaceColor: '#1e293b',
    canvasBg: '#0f172a',
    textColor: '#f8fafc',
    textMuted: '#94a3b8',
    borderColor: '#334155',
    isDark: true,
  },
];

interface ThemeContextType {
  currentThemeId: ThemeId;
  currentTheme: ThemePreset;
  setTheme: (id: ThemeId) => void;
  eyeComfortMode: boolean;
  setEyeComfortMode: (enabled: boolean) => void;
  themes: ThemePreset[];
  resetToDefaultTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_THEME_KEY = 'procuresync_theme';
const STORAGE_EYE_COMFORT_KEY = 'procuresync_eye_comfort';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME_KEY) as ThemeId;
      if (saved && THEME_PRESETS.some(t => t.id === saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'calm-ocean';
  });

  const [eyeComfortMode, setEyeComfortModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_EYE_COMFORT_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const currentTheme = THEME_PRESETS.find(t => t.id === currentThemeId) || THEME_PRESETS[0];

  const setTheme = (id: ThemeId) => {
    setCurrentThemeId(id);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, id);
    } catch {
      // ignore
    }
  };

  const setEyeComfortMode = (enabled: boolean) => {
    setEyeComfortModeState(enabled);
    try {
      localStorage.setItem(STORAGE_EYE_COMFORT_KEY, String(enabled));
    } catch {
      // ignore
    }
  };

  const resetToDefaultTheme = () => {
    setTheme('calm-ocean');
    setEyeComfortMode(false);
  };

  // Apply theme attributes and CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;

    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', currentTheme.id);

    // Toggle dark class if applicable
    if (currentTheme.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Toggle eye comfort warmth class
    if (eyeComfortMode) {
      root.classList.add('eye-comfort-mode');
    } else {
      root.classList.remove('eye-comfort-mode');
    }

    // Inject CSS variables for theme tokens
    root.style.setProperty('--theme-primary', currentTheme.primaryColor);
    root.style.setProperty('--theme-primary-hover', currentTheme.primaryHover);
    root.style.setProperty('--theme-primary-light', currentTheme.primaryLight);
    root.style.setProperty('--theme-primary-border', currentTheme.primaryBorder);
    root.style.setProperty('--theme-primary-text', currentTheme.primaryText);
    root.style.setProperty('--theme-surface', currentTheme.surfaceColor);
    root.style.setProperty('--theme-canvas', currentTheme.canvasBg);
    root.style.setProperty('--theme-text-primary', currentTheme.textColor);
    root.style.setProperty('--theme-text-muted', currentTheme.textMuted);
    root.style.setProperty('--theme-border', currentTheme.borderColor);

    // Apply canvas background directly to body for instant fluidity
    document.body.style.backgroundColor = currentTheme.canvasBg;
  }, [currentTheme, eyeComfortMode]);

  return (
    <ThemeContext.Provider
      value={{
        currentThemeId,
        currentTheme,
        setTheme,
        eyeComfortMode,
        setEyeComfortMode,
        themes: THEME_PRESETS,
        resetToDefaultTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
