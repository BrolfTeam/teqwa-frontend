import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiClock, FiGrid, FiUser, FiHeart } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';

const MobileBottomNav = memo(() => {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) return null;

    const navLinks = [
        { to: '/', icon: FiHome, label: t('nav.home') },
        { to: '/dashboard', icon: FiGrid, label: t('common.dashboard') },
        { to: '/donate', icon: FiHeart, label: t('nav.donate') },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-emerald-100 dark:border-emerald-900 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            <nav className="flex items-center justify-around h-16 px-2">
                {navLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `
                            flex flex-col items-center justify-center space-y-1 w-full h-full transition-colors
                            ${isActive
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500'
                            }
                        `}
                    >
                        <link.icon className="h-5 w-5" />
                        <span className="text-[10px] font-medium truncate max-w-[60px]">{link.label}</span>
                        {/* Active Indicator */}
                        <NavLink
                            to={link.to}
                            className={({ isActive }) => `
                                h-1 w-1 rounded-full transition-all duration-300
                                ${isActive ? 'bg-emerald-600 dark:bg-emerald-400 scale-100' : 'bg-transparent scale-0'}
                            `}
                        />
                    </NavLink>
                ))}
            </nav>
        </div>
    );
});

MobileBottomNav.displayName = 'MobileBottomNav';
export default MobileBottomNav;
