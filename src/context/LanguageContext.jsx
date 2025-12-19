import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setDocumentDirection } from '@/lib/i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();

  // Initialize with English if no language is set
  // English is the default (hardcoded strings, not in language switcher)
  useEffect(() => {
    const currentLang = i18n.language || localStorage.getItem('i18nextLng');
    // Only set to English if language is not Amharic or Arabic
    if (!currentLang || !['am', 'ar'].includes(currentLang)) {
      i18n.changeLanguage('en');
    }
  }, []);

  // Set document direction when language changes
  useEffect(() => {
    setDocumentDirection(i18n.language);
  }, [i18n.language]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    // Language is persisted automatically by i18next-browser-languagedetector
  };

  const value = {
    lang: i18n.language,
    setLang: changeLanguage,
    // Expose i18n for advanced usage
    i18n,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
