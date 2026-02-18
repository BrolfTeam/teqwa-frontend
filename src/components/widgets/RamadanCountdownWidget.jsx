import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiMoon } from 'react-icons/fi';
import { Card, CardContent } from '@/components/ui/Card';
import { getRamadanDay, getStoredHijriAdjustment } from '@/utils/hijriUtils';
import { useMemo } from 'react';

const RamadanCountdownWidget = ({ className = '' }) => {
    const { t } = useTranslation();
    const adjustment = getStoredHijriAdjustment();
    const ramadanDay = useMemo(() => getRamadanDay(new Date(), adjustment), [adjustment]);

    if (!ramadanDay) return null;

    // Calculate progress percentage (assumes 30 days for visual representation)
    const progress = Math.min((ramadanDay / 30) * 100, 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`w-full max-w-md mx-auto ${className}`}
        >
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 backdrop-blur-md shadow-xl">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/20 text-primary">
                                <FiMoon className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">
                                    {t('ramadan.dayCount', { day: ramadanDay })}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {t('ramadan.crescentMoon')}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-black text-primary">
                                {ramadanDay}
                                <span className="text-sm text-muted-foreground ml-1">/ 30</span>
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            <span>{t('ramadan.progress')}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-3 w-full bg-primary/10 rounded-full overflow-hidden border border-primary/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1.5, ease: "circOut", delay: 0.3 }}
                                className="h-full bg-gradient-to-r from-primary via-primary/80 to-accent rounded-full relative shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
                            </motion.div>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-around items-center pt-4 border-t border-primary/10">
                        <div className="text-center">
                            <p className="text-[10px] uppercase text-muted-foreground tracking-tighter mb-1">Phase</p>
                            <p className="text-xs font-bold text-foreground">
                                {ramadanDay <= 10 ? 'Rahmah' : ramadanDay <= 20 ? 'Maghfirah' : 'Itqun minan Naar'}
                            </p>
                        </div>
                        <div className="h-8 w-[1px] bg-primary/10" />
                        <div className="text-center">
                            <p className="text-[10px] uppercase text-muted-foreground tracking-tighter mb-1">Status</p>
                            <p className="text-xs font-bold text-emerald-500 animate-pulse">Active</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <style>{`
        @keyframes shimmer {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
      `}</style>
        </motion.div>
    );
};

export default RamadanCountdownWidget;
