import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from '../locales/en.json';
import amTranslations from '../locales/am.json';
import arTranslations from '../locales/ar.json';

// RTL languages
const rtlLanguages = ['ar', 'he', 'fa', 'ur'];

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      am: {
        translation: amTranslations,
      },
      ar: {
        translation: arTranslations,
      },
    },
    lng: 'en', // Default language is English (hardcoded, not in switcher)
    fallbackLng: 'en',
    supportedLngs: ['en', 'am', 'ar'], // 'en' is default but not shown in switcher
    defaultNS: 'translation',
    ns: ['translation'],
    
    // Detection options
    detection: {
      // Order of detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Keys to lookup language from
      lookupLocalStorage: 'i18nextLng',
      // Cache user language
      caches: ['localStorage'],
      // Don't cache if language is not supported
      checkWhitelist: true,
      // Convert detected language to supported language
      convertDetectedLanguage: (lng) => {
        // If detected language is Amharic or Arabic, use it
        // Otherwise default to English (which uses hardcoded strings)
        if (['am', 'ar'].includes(lng)) {
          return lng;
        }
        return 'en'; // Default to English (hardcoded, no translation needed)
      },
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false, // Disable suspense for better compatibility
    },
  });

// Function to check if current language is RTL
export const isRTL = () => {
  return rtlLanguages.includes(i18n.language);
};

// Function to set document direction based on language
export const setDocumentDirection = (lang) => {
  const isRtl = rtlLanguages.includes(lang);
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
};

// Set initial direction
setDocumentDirection(i18n.language);

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  setDocumentDirection(lng);
});

export default i18n;
