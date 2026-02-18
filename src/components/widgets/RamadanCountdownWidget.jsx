import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiMoon, FiStar } from 'react-icons/fi';
import { Card, CardContent } from '@/components/ui/Card';
import { getRamadanDay, getStoredHijriAdjustment } from '@/utils/hijriUtils';
import { useMemo } from 'react';

const RamadanCountdownWidget = ({ className = '' }) => {
    const { t } = useTranslation();
    const adjustment = getStoredHijriAdjustment();
    const ramadanDay = useMemo(() => getRamadanDay(new Date(), adjustment), [adjustment]);

    if (!ramadanDay) return null;

    const daysLeft = 30 - ramadanDay;
    const progress = Math.min((ramadanDay / 30) * 100, 100);

    // Phase detection
    const phase = ramadanDay <= 10 ? 'Rahmah' : ramadanDay <= 20 ? 'Maghfirah' : 'Itqun minan Naar';
    const phaseColor = ramadanDay <= 10 ? 'text-emerald-400' : ramadanDay <= 20 ? 'text-amber-400' : 'text-orange-400';

    // Twinkling stars data
    const stars = useMemo(() => [...Array(12)].map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: 2 + Math.random() * 3,
        size: 0.5 + Math.random() * 1.5
    })), []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{
                opacity: 1,
                scale: 1,
                y: [0, -10, 0],
            }}
            transition={{
                opacity: { duration: 0.8 },
                scale: { duration: 0.8 },
                y: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }
            }}
            className={`w-full max-w-sm mx-auto relative group ${className}`}
        >
            {/* Glow Effect Underlying */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

            <Card className="relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl rounded-3xl border">
                {/* Star Field Background */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    {stars.map(star => (
                        <motion.div
                            key={star.id}
                            className="absolute bg-white rounded-full"
                            style={{
                                top: star.top,
                                left: star.left,
                                width: star.size,
                                height: star.size
                            }}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{
                                duration: star.duration,
                                repeat: Infinity,
                                delay: star.delay,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>

                {/* Islamic Pattern Overlay */}
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')] bg-repeat" />

                <CardContent className="p-7 relative z-10">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <motion.div
                                className="relative"
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="absolute inset-0 bg-primary/40 blur-lg rounded-full animate-pulse" />
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 text-white relative border border-white/10">
                                    <FiMoon className="w-7 h-7" />
                                </div>
                            </motion.div>
                            <div>
                                <motion.h3
                                    className="text-xl font-black text-white tracking-tight"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {t('ramadan.dayCount', { day: ramadanDay })}
                                </motion.h3>
                                <motion.p
                                    className="text-xs text-white/60 font-medium uppercase tracking-widest"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    {t('ramadan.kareem', 'Ramadan Kareem')}
                                </motion.p>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-2 text-center min-w-[60px] backdrop-blur-md">
                            <span className="block text-lg font-black text-primary leading-none">{daysLeft}</span>
                            <span className="text-[10px] text-white/50 uppercase font-bold tracking-tighter">Left</span>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Journey Progress</span>
                            <span className="text-sm font-black text-white">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/10">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 2, ease: "circOut", delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-primary via-primary/80 to-accent rounded-full relative"
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
                            </motion.div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                        <div className="p-2 rounded-xl bg-primary/20">
                            <FiStar className={`w-4 h-4 ${phaseColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] uppercase text-white/40 font-bold tracking-widest leading-none mb-1">Current Phase</p>
                            <p className={`text-sm font-bold truncate ${phaseColor}`}>{phase}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase">Live</span>
                        </div>
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
