import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
    const { theme, setTheme, toggleTheme, isDark } = useTheme();

    return (
        <div className="flex items-center">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                title={`Theme: ${theme}`}
                aria-label="Toggle theme"
            >
                {isDark ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
            </button>
        </div>
    );
}
