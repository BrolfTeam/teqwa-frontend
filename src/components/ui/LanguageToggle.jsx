import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageToggle() {
    const { lang, setLang } = useLanguage();

    const options = [
        { value: 'en', label: 'EN' },
        { value: 'am', label: 'AM' },
        { value: 'ar', label: 'AR' },
    ];

    return (
        <div className="flex items-center gap-2">
            {options.map(o => (
                <button
                    key={o.value}
                    onClick={() => setLang(o.value)}
                    aria-label={`Set language ${o.label}`}
                    className={`px-2 py-1 rounded text-sm ${lang === o.value ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 border'}`}>
                    {o.label}
                </button>
            ))}
        </div>
    );
}
