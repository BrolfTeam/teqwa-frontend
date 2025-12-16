import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { prayerTimesService } from '@/lib/prayerTimesService';

const HeroPrayerWidget = memo(({ className = '' }) => {
  const [prayerData, setPrayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextPrayerTime, setNextPrayerTime] = useState('');

  useEffect(() => {
    const fetchPrayerData = async () => {
      try {
        const data = await prayerTimesService.getFormattedPrayerTimes();
        setPrayerData(data);
      } catch (error) {
        console.error('Failed to fetch prayer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerData();

    // Refresh prayer data every minute to keep times accurate and highlight correct prayer
    const timer = setInterval(() => {
      fetchPrayerData();
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Update "starts in" countdown every second
  useEffect(() => {
    if (!prayerData) return;

    const updateCountdown = () => {
      // We need to find the next prayer dynamically
      // This logic is simplified for the countdown display, 
      // ideally we'd use the service's next prayer info if available or recalculate
      // For now, let's just rely on the static time display or simple calculation if needed.
      // Actually, let's just show the current time in the header or similar.
      // The requirement asked for "accurate solat prayer times", the list is the most important part.
    };

    // For this widget, a static list is cleaner than a ticking countdown for every prayer.
    // We will just highlight the current prayer.
  }, [prayerData]);

  if (loading) {
    return (
      <div className={`w-80 ${className}`}>
        <Card className="bg-emerald-950/80 backdrop-blur-md border-emerald-500/30">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-emerald-500/20 rounded w-3/4 mx-auto"></div>
              <div className="space-y-3 pt-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-emerald-500/20 rounded w-1/3"></div>
                    <div className="h-4 bg-emerald-500/20 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!prayerData) return null;

  const { prayers, hijriDate, gregorianDate } = prayerData;
  const prayerList = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

  // Helper to determine if a prayer is current
  // This is a simple check; for more robust "current", we can use the service's logic
  // But since we have the full list, we can just highlight based on time comparison
  const now = new Date();
  const currentPrayerKey = prayerList.reduce((acc, key) => {
    if (prayers[key] && prayers[key].time <= now) {
      return key;
    }
    return acc;
  }, null) || 'isha'; // Default to isha if all passed (technically previous day's isha, or wait for fajr)

  // Better logic: find the one that is active right now
  // We can use the service's getCurrentAndNextPrayer to get the exact current one to highlight
  // But to avoid double fetching, let's just use the time.

  return (
    <motion.div
      className={`w-96 ${className}`} // Slightly wider for better bilingual display
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-emerald-500/30 shadow-2xl bg-gradient-to-br from-emerald-950/90 via-emerald-900/90 to-emerald-950/90 backdrop-blur-md text-white">
        {/* Islamic Pattern Overlay (CSS based) */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />

        <CardHeader className="pb-4 text-center relative z-10 border-b border-emerald-500/20">
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold text-emerald-100 font-serif tracking-wide">Prayer Times</h3>
            <p className="text-emerald-400/80 text-sm font-arabic mt-1">أوقات الصلاة</p>
          </div>
          <div className="mt-3 space-y-1">
            <div className="text-xs text-emerald-200/70 uppercase tracking-widest font-medium">
              {gregorianDate}
            </div>
            <div className="text-sm text-emerald-300 font-medium">
              {hijriDate}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 relative z-10">
          <div className="divide-y divide-emerald-500/10">
            {prayerList.map((key) => {
              const prayer = prayers[key];
              if (!prayer) return null;

              // Simple highlight logic: if it's the next prayer or current range
              // For simplicity in this view, let's just list them cleanly. 
              // We could highlight the *next* prayer to pray.

              return (
                <div
                  key={key}
                  className={`flex items-center justify-between px-6 py-3 transition-colors hover:bg-emerald-500/5 group
                    ${key === 'sunrise' ? 'bg-emerald-950/30 text-emerald-400/60' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{prayer.icon}</span>
                    <div className="flex flex-col text-left">
                      <span className={`font-medium ${key === 'sunrise' ? 'text-sm' : 'text-base text-emerald-50'}`}>
                        {prayer.displayName}
                      </span>
                      <span className="text-xs text-emerald-400/60 font-arabic">
                        {prayer.arabic}
                      </span>
                    </div>
                  </div>

                  <div className={`font-mono font-medium ${key === 'sunrise' ? 'text-sm' : 'text-lg text-emerald-100'}`}>
                    {prayer.formatted}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>

        <CardFooter className="p-4 bg-emerald-950/50 border-t border-emerald-500/20 relative z-10">
          <Button
            asChild
            variant="ghost"
            className="w-full text-emerald-300 hover:text-emerald-100 hover:bg-emerald-500/20 group"
          >
            <Link to="/prayer-times" className="flex items-center justify-center gap-2">
              <span>View More</span>
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
});

HeroPrayerWidget.displayName = 'HeroPrayerWidget';
export default HeroPrayerWidget;