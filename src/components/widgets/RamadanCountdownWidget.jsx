import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiMoon, FiStar } from 'react-icons/fi';
import { Card, CardContent } from '@/components/ui/Card';
import { getRamadanDay, getStoredHijriAdjustment } from '@/utils/hijriUtils';
import { useMemo, useState } from 'react';

const RamadanCountdownWidget = ({ className = '' }) => {
    const { t, i18n } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const adjustment = getStoredHijriAdjustment();
    const ramadanDay = useMemo(() => getRamadanDay(new Date(), adjustment), [adjustment]);
    const isRTL = i18n.language === 'ar';

    if (!ramadanDay) return null;

    const daysLeft = 30 - ramadanDay;
    const progress = Math.min((ramadanDay / 30) * 100, 100);

    // Phase detection
    const phase = ramadanDay <= 10 ? 'Rahmah' : ramadanDay <= 20 ? 'Maghfirah' : 'Itqun minan Naar';
    const phaseColor = ramadanDay <= 10 ? 'text-emerald-400' : ramadanDay <= 20 ? 'text-amber-400' : 'text-orange-400';

    // Twinkling stars data - varied sizes and rhythms
    const stars = useMemo(() => [...Array(10)].map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 8,
        duration: 3 + Math.random() * 5,
        size: 0.5 + Math.random() * 1.5
    })), []);

    return (
        <motion.div
            initial={{ x: isRTL ? 100 : -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`fixed top-1/2 -translate-y-1/2 ${isRTL ? 'right-0' : 'left-0'} z-[45] flex items-center group ${className}`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* Sidebar Tab Handle */}
            <motion.div
                className={`relative z-20 cursor-pointer flex items-center justify-center w-12 h-32 md:w-14 md:h-40 rounded-r-[2rem] border-y-2 border-r-2 border-white/20 bg-black/60 backdrop-blur-3xl shadow-[0_0_30px_rgba(0,0,0,0.3)] ${isRTL ? 'rounded-l-[2rem] rounded-r-none border-r-0 border-l-2' : ''}`}
                animate={{
                    x: isExpanded ? (isRTL ? 280 : -280) : 0,
                    width: isExpanded ? 0 : (window.innerWidth < 768 ? 48 : 56),
                    opacity: isExpanded ? 0 : 1
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-inherit">
                    {stars.slice(0, 5).map(star => (
                        <motion.div
                            key={star.id}
                            className="absolute bg-white rounded-full shadow-[0_0_5px_white]"
                            style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
                            animate={{ opacity: [0.1, 1, 0.1] }}
                            transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
                        />
                    ))}
                </div>
                <div className="flex flex-col items-center gap-4 relative z-10 text-white">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 5, repeat: Infinity }}
                    >
                        <FiMoon className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                    </motion.div>
                    <span className={`[writing-mode:vertical-lr] text-[10px] md:text-xs font-black uppercase tracking-[0.3em] ${isRTL ? 'rotate-180' : ''}`}>
                        {t('ramadan.kareem', 'Ramadan')}
                    </span>
                </div>
            </motion.div>

            {/* Expanded Content Card */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ x: isRTL ? 100 : -100, opacity: 0, scale: 0.9 }}
                        animate={{ x: isRTL ? -10 : 10, opacity: 1, scale: 1 }}
                        exit={{ x: isRTL ? 100 : -100, opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={`absolute ${isRTL ? 'right-2' : 'left-2'} w-[280px] md:w-[320px]`}
                    >
                        <Card className="relative overflow-hidden border-white/20 bg-black/80 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] border-2">
                            {/* Star Field */}
                            <div className="absolute inset-0 z-0 pointer-events-none">
                                {stars.map(star => (
                                    <motion.div
                                        key={star.id}
                                        className="absolute bg-white rounded-full shadow-[0_0_5px_white]"
                                        style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
                                        animate={{ opacity: [0.1, 1, 0.1], scale: [1, 1.2, 1] }}
                                        transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
                                    />
                                ))}
                            </div>

                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/40 text-white border border-white/20 shadow-inner">
                                            <FiMoon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white tracking-tight leading-none mb-1">
                                                {t('ramadan.dayCount', { day: ramadanDay })}
                                            </h3>
                                            <span className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest">
                                                {t('ramadan.kareem', 'Ramadan Kareem')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-center backdrop-blur-md shadow-inner">
                                        <span className="block text-lg font-black text-primary leading-none">{daysLeft}</span>
                                        <span className="text-[8px] text-white/40 uppercase font-bold tracking-tighter">Days Left</span>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between items-end px-1 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                                        <span>Journey</span>
                                        <span className="text-white/80">{Math.round(progress)}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 2, type: "spring", bounce: 0 }}
                                            className="h-full bg-gradient-to-r from-primary via-primary/80 to-accent rounded-full relative shadow-[0_0_15px_rgba(var(--primary),0.4)]"
                                        >
                                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] bg-[length:200%_100%] animate-[shimmer_3s_infinite]" />
                                        </motion.div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                                    <div className="p-2 rounded-xl bg-primary/20">
                                        <FiStar className={`w-4 h-4 ${phaseColor} drop-shadow-[0_0_3px_currentColor]`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] uppercase text-white/30 font-bold tracking-widest leading-none mb-1">Phase</p>
                                        <p className={`text-xs font-black ${phaseColor} tracking-tight`}>{phase}</p>
                                    </div>
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"
                                        title="Live Tracker"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Shimmer Animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}} />
        </motion.div>
    );
};

export default RamadanCountdownWidget;
