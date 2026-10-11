import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { translations, Language } from '../translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  isThai: boolean;
  isEnglish: boolean;
}

const STORAGE_KEY = 'procuresync_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'th') {
        return saved;
      }
    } catch {
      // Ignore localStorage errors (e.g., privacy mode)
    }
    return 'th'; // Default to Thai as primary language of the application
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore localStorage errors
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'th' ? 'en' : 'th');
  }, [language, setLanguage]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const currentDict = translations[language] || translations.th;
      if (currentDict && key in currentDict) {
        return currentDict[key];
      }
      // Fallback to Thai dictionary if key missing in English
      if (language !== 'th' && translations.th && key in translations.th) {
        return translations.th[key];
      }
      return fallback !== undefined ? fallback : key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isThai: language === 'th',
        isEnglish: language === 'en',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
