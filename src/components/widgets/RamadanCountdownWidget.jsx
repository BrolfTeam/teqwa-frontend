import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiMoon, FiStar } from 'react-icons/fi';
import { Card, CardContent } from '@/components/ui/Card';
import { getRamadanDay, getStoredHijriAdjustment } from '@/utils/hijriUtils';
import { useMemo } from 'react';

const RamadanCountdownWidget = ({ className = '' }) => {
    const { t, i18n } = useTranslation();
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
    const stars = useMemo(() => [...Array(15)].map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 8,
        duration: 3 + Math.random() * 5,
        size: 0.5 + Math.random() * 1.8
    })), []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, x: isRTL ? -100 : 100 }}
            animate={{
                opacity: 1,
                scale: 1,
                x: 0,
                y: [0, -12, 0],
            }}
            whileHover={{
                scale: 1.05,
                transition: { type: "spring", stiffness: 400, damping: 10 }
            }}
            transition={{
                x: { type: "spring", stiffness: 100, damping: 20 },
                scale: { type: "spring", stiffness: 200, damping: 25 },
                y: {
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }
            }}
            className={`fixed bottom-24 md:bottom-8 ${isRTL ? 'left-4 md:left-8' : 'right-4 md:right-8'} z-[100] w-[280px] md:w-[320px] group ${className}`}
        >
            {/* Main Outer Glow - Pulsing */}
            <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-100 transition duration-1000"
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [0.95, 1.05, 0.95]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <Card className="relative overflow-hidden border-white/20 bg-black/60 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] border-2">
                {/* Star Field Background */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    {stars.map(star => (
                        <motion.div
                            key={star.id}
                            className="absolute bg-white rounded-full shadow-[0_0_5px_white]"
                            style={{
                                top: star.top,
                                left: star.left,
                                width: star.size,
                                height: star.size
                            }}
                            animate={{
                                opacity: [0.1, 1, 0.1],
                                scale: [1, 1.5, 1]
                            }}
                            transition={{
                                duration: star.duration,
                                repeat: Infinity,
                                delay: star.delay,
                                ease: "linear"
                            }}
                        />
                    ))}
                </div>

                {/* Islamic Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')] bg-repeat" />

                <CardContent className="p-5 md:p-6 relative z-10">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <motion.div
                                className="relative"
                                animate={{ rotate: [0, 8, -8, 0] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="absolute inset-0 bg-primary/50 blur-md rounded-full animate-pulse" />
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/40 to-accent/40 text-white relative border border-white/20 shadow-inner">
                                    <FiMoon className="w-6 h-6" />
                                </div>
                            </motion.div>
                            <div>
                                <h3 className="text-lg md:text-xl font-black text-white tracking-tight leading-none mb-1">
                                    {t('ramadan.dayCount', { day: ramadanDay })}
                                </h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981] animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest">{t('ramadan.kareem', 'Ramadan Kareem')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 text-center backdrop-blur-md shadow-inner">
                            <span className="block text-base font-black text-primary leading-none">{daysLeft}</span>
                            <span className="text-[8px] text-white/40 uppercase font-bold tracking-tighter">Days Left</span>
                        </div>
                    </div>

                    <div className="space-y-2 mb-5">
                        <div className="flex justify-between items-end px-1">
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Ramadan Spirit</span>
                            <span className="text-xs font-black text-white/80">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 2.5, type: "spring", bounce: 0, delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-primary via-primary/80 to-accent rounded-full relative group-hover:brightness-110 transition-all shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] bg-[length:200%_100%] animate-[shimmer_3s_infinite]" />
                            </motion.div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                        <div className="p-1.5 rounded-lg bg-primary/20 flex-shrink-0">
                            <FiStar className={`w-3.5 h-3.5 ${phaseColor} drop-shadow-[0_0_3px_currentColor]`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] uppercase text-white/30 font-bold tracking-widest leading-none mb-0.5">Phase</p>
                            <p className={`text-xs font-black truncate ${phaseColor} tracking-tight`}>{phase}</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-accent/20 hover:bg-accent/40 text-accent-foreground p-1.5 rounded-lg transition-colors border border-accent/10"
                        >
                            <FiStar className="w-3.5 h-3.5" />
                        </motion.button>
                    </div>
                </CardContent>

                {/* Inline Styles for Shimmer */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes shimmer {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                    }
                `}} />
            </Card>
        </motion.div>
    );
};

export default RamadanCountdownWidget;
