/**
 * Custom hook for translations
 * Provides a convenient wrapper around react-i18next's useTranslation
 * 
 * Note: English uses hardcoded strings (no translation keys needed)
 * Only Amharic and Arabic use translation keys
 */
import { useTranslation as useI18nTranslation } from 'react-i18next';

export function useTranslation(namespace = 'translation') {
  const { t, i18n, ready } = useI18nTranslation(namespace);

  const currentLanguage = i18n.language || 'en';

  /**
   * Conditional translation helper
   * Returns translation if language is not English, otherwise returns the English string
   * @param {string} key - Translation key (for Amharic/Arabic)
   * @param {string} englishText - English hardcoded text (used when language is 'en')
   * @param {object} options - i18next interpolation options
   */
  const translate = (key, englishText, options = {}) => {
    if (currentLanguage === 'en') {
      return englishText;
    }
    return t(key, options);
  };

  return {
    t, // Use t() directly if you want to always use translation files (including English)
    translate, // Use translate() for conditional: English = hardcoded, Am/Ar = translation keys
    i18n,
    ready,
    // Convenience methods
    isRTL: () => ['ar', 'he', 'fa', 'ur'].includes(currentLanguage),
    currentLanguage,
    changeLanguage: i18n.changeLanguage.bind(i18n),
  };
}

export default useTranslation;
