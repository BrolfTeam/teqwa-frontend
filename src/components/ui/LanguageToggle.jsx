import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FiGlobe, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // All three languages
  const options = [
    { value: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
    { value: 'am', label: 'አማርኛ', native: 'አማርኛ', flag: '🇪🇹' },
    { value: 'ar', label: 'العربية', native: 'العربية', flag: '🇸🇦' },
  ];

  const currentOption = options.find(opt => opt.value === lang) || options[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    setLang(value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-300"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <FiGlobe className="w-5 h-5" />
        <span className="hidden sm:inline text-sm font-medium">{currentOption.label}</span>
        <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-emerald-100 dark:border-emerald-800 overflow-hidden py-1 z-50"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-2.5 text-sm text-left transition-colors flex items-center gap-3 ${
                  lang === option.value
                    ? 'bg-emerald-50 text-emerald-700 font-medium dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'text-gray-600 hover:bg-emerald-50/50 hover:text-emerald-700 dark:text-gray-300 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400'
                }`}
                aria-label={`Set language to ${option.native}`}
              >
                <span className="text-lg">{option.flag}</span>
                <div className="flex flex-col">
                  <span>{option.label}</span>
                  {option.value !== 'en' && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">{option.native}</span>
                  )}
                </div>
                {lang === option.value && (
                  <span className="ml-auto text-emerald-600 dark:text-emerald-400">✓</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
