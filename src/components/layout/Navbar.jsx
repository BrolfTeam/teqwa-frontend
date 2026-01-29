import { useState, useCallback, memo, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiHome, FiInfo, FiMail, FiChevronDown, FiUser, FiLogOut, FiGrid, FiHeart } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { Button, ThemeToggle, LanguageToggle } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import logo from '@/assets/logo.png';

const Navbar = memo(() => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Navigation items with translations
  const navItems = useMemo(() => [
    { name: t('nav.home'), path: '/', icon: FiHome, key: 'home' },
    { name: t('nav.about'), path: '/about', icon: FiInfo, key: 'about' },
    {
      name: t('nav.services'),
      path: '#',
      icon: FiGrid,
      key: 'services',
      dropdown: [
        { name: t('nav.futsalBooking'), path: '/futsal', key: 'futsal' },
        { name: t('nav.educationalServices'), path: '/education', key: 'education' },
        { name: t('nav.prayerTimes'), path: '/prayer-times', key: 'prayer' },
      ]
    },
    {
      name: t('nav.programs'),
      path: '#',
      icon: FiGrid,
      key: 'programs',
      dropdown: [
        { name: t('nav.events'), path: '/events', key: 'events' },
        { name: t('nav.news'), path: '/news', key: 'news' },
        { name: t('nav.gallery'), path: '/gallery', key: 'gallery' },
        { name: t('nav.itikafProgram'), path: '/itikaf', key: 'itikaf' },
        { name: t('nav.dersProgram'), path: '/ders', key: 'ders' },
      ]
    },
    { name: t('nav.membership'), path: '/membership', icon: FiUser, key: 'membership' },
    { name: t('nav.contact'), path: '/contact', icon: FiMail, key: 'contact' },
  ], [t]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
    setActiveDropdown(null);
  }, []);

  const handleDropdownEnter = (key) => {
    setActiveDropdown(key);
  };

  const handleDropdownLeave = () => {
    setActiveDropdown(null);
  };

  const handleDashboardClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/role-selection');
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
        ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border-b border-emerald-100 dark:border-emerald-900'
        : 'bg-white dark:bg-slate-900 border-b border-transparent'
        }`}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <img src={logo} alt="MUJEMA’ TEQWA MOSQUE" className="h-10 w-auto rounded-full group-hover:scale-105 transition-transform duration-300" />
          <div className="hidden sm:block">
            <span className="font-semibold text-lg text-emerald-800 dark:text-emerald-400 block leading-none">MUJEMA’</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-500 font-medium tracking-wider">TEQWA MOSQUE</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => (
            <div
              key={item.key}
              className="relative"
              onMouseEnter={() => item.dropdown && handleDropdownEnter(item.key)}
              onMouseLeave={handleDropdownLeave}
            >
              {item.dropdown ? (
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-1 ${activeDropdown === item.key || item.dropdown.some(sub => sub.path === location.pathname)
                    ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30'
                    : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50 dark:text-gray-300 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20'
                    }`}
                >
                  <span>{item.name}</span>
                  <FiChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === item.key ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <Link
                  to={item.path}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-2 ${location.pathname === item.path
                    ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30'
                    : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50 dark:text-gray-300 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20'
                    }`}
                >
                  <span>{item.name}</span>
                </Link>
              )}

              {/* Desktop Dropdown Menu */}
              <AnimatePresence>
                {item.dropdown && activeDropdown === item.key && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 rtl:left-auto rtl:right-0 w-56 pt-2"
                  >
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-emerald-100 dark:border-emerald-800 overflow-hidden py-1">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`block px-4 py-2.5 text-sm transition-colors ${location.pathname === subItem.path
                            ? 'bg-emerald-50 text-emerald-700 font-medium dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'text-gray-600 hover:bg-emerald-50/50 hover:text-emerald-700 dark:text-gray-300 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400'
                            }`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-3">
            {/* Donate Button */}
            <Link to="/donate">
              <Button
                asChild
                variant="primary"
                leftIcon={FiHeart}
                className="shadow-lg hover:shadow-primary/25 font-semibold"
              >
                {t('nav.donate')}
              </Button>
            </Link>

            {/* Dashboard Button */}
            <Button
              onClick={handleDashboardClick}
              variant="ghost"
              className="text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300"
            >
              <div className="flex items-center space-x-2">
                <div className="bg-emerald-100 dark:bg-emerald-900/50 p-1.5 rounded-full">
                  <FiUser className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                </div>
                <span className="font-medium">{t('common.dashboard')}</span>
              </div>
            </Button>

            {/* Logout Button (only if logged in) */}
            {isAuthenticated && (
              <Button
                onClick={logout}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                title={t('common.logout')}
              >
                <FiLogOut className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Language Toggle - Desktop & Mobile (top area) */}
          <LanguageToggle />

          <ThemeToggle />

          {/* Mobile Menu Button - Show on screens smaller than LG */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-emerald-800 dark:text-emerald-400"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-emerald-100 dark:border-emerald-900 bg-white dark:bg-slate-900 shadow-lg overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto lg:hidden">
              {navItems.map((item) => (
                <div key={item.name}>
                  {item.dropdown ? (
                    <div className="space-y-1">
                      <div className="px-4 py-3 text-base font-medium text-emerald-800 dark:text-emerald-400 flex items-center">
                        <item.icon className="h-5 w-5 mr-3 text-emerald-600 dark:text-emerald-500" />
                        {item.name}
                      </div>
                      <div className="pl-12 space-y-1 border-l-2 border-emerald-100 dark:border-emerald-800 ml-6">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.key}
                            to={subItem.path}
                            className={`block px-4 py-2 text-sm rounded-md transition-colors ${location.pathname === subItem.path
                              ? 'text-emerald-700 font-medium bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30'
                              : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50 dark:text-gray-300 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20'
                              }`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${location.pathname === item.path
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'text-gray-600 hover:bg-emerald-50/50 hover:text-emerald-700 dark:text-gray-300 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400'
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5 mr-3 text-emerald-600 dark:text-emerald-500" />
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile Actions */}
              <div className="pt-4 mt-4 border-t border-emerald-100 dark:border-emerald-900 space-y-3">
                <Link to="/donate" onClick={() => setIsMenuOpen(false)} className="block w-full">
                  <Button
                    asChild
                    variant="primary"
                    leftIcon={FiHeart}
                    className="w-full shadow-lg"
                  >
                    {t('donations.donateNow')}
                  </Button>
                </Link>

                <Button
                  onClick={() => {
                    handleDashboardClick();
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full border-emerald-200 text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                >
                  <FiUser className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>

                {isAuthenticated && (
                  <Button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    variant="ghost"
                    className="w-full text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <FiLogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});

Navbar.displayName = 'Navbar';
export default Navbar;