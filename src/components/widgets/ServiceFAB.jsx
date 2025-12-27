import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    FiGrid, FiX, FiCalendar, FiBookOpen, FiActivity,
    FiHeart, FiSun, FiMapPin, FiInfo, FiChevronRight
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';

const ServiceFAB = () => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const isRTL = i18n.dir() === 'rtl';

    const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);

    const services = [
        { name: t('nav.educationalServices'), path: '/education', icon: FiBookOpen, color: 'text-blue-500' },
        { name: t('nav.dersProgram'), path: '/ders', icon: FiCalendar, color: 'text-emerald-500' },
        { name: t('nav.futsalBooking'), path: '/futsal', icon: FiActivity, color: 'text-orange-500' },
        { name: t('nav.prayerTimes'), path: '/prayer-times', icon: FiSun, color: 'text-yellow-600' },
        { name: t('nav.itikafProgram'), path: '/itikaf', icon: FiInfo, color: 'text-purple-500' },
        { name: t('nav.donate'), path: '/donations', icon: FiHeart, color: 'text-red-500' },
    ];

    return (
        <div className={`fixed bottom-24 md:bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-50 flex flex-col items-center`}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className={`mb-4 w-72 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-100 dark:border-emerald-800 p-4 backdrop-blur-lg bg-opacity-95 dark:bg-opacity-95`}
                    >
                        <div className="flex items-center justify-between mb-4 px-2">
                            <span className="font-bold text-emerald-800 dark:text-emerald-400">{t('common.quickAccess')}</span>
                            <button
                                onClick={toggleOpen}
                                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                                aria-label={t('common.close')}
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {services.map((service, index) => (
                                <motion.div
                                    key={service.path}
                                    initial={{ opacity: 0, x: isRTL ? -10 : 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        to={service.path}
                                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 group transition-all duration-200 border border-transparent hover:border-emerald-100 dark:hover:border-emerald-800"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl bg-gray-50 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-slate-900 shadow-sm transition-colors ${service.color}`}>
                                                <service.icon className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                                                {service.name}
                                            </span>
                                        </div>
                                        <FiChevronRight className={`w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                            <Link
                                to="/services"
                                className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 underline underline-offset-4"
                                onClick={() => setIsOpen(false)}
                            >
                                {t('common.browseAll')}
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={toggleOpen}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-16 h-16 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center hover:bg-primary/90 transition-all duration-300 relative group overflow-hidden`}
                aria-label={t('common.quickAccess')}
            >
                <span className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-150 rounded-full transition-transform duration-700" />
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <FiX className="w-7 h-7" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center"
                        >
                            <FiGrid className="w-7 h-7" />
                            <span className="text-[10px] font-bold mt-1 tracking-tighter uppercase">{t('common.services')}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
};

export default ServiceFAB;
