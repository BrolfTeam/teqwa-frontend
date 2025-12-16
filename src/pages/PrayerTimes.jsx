import { useState, useEffect, useCallback, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaMosque, FaCompass, FaDownload, FaCalendarAlt, FaMapMarkerAlt,
  FaShare, FaCog, FaLocationArrow
} from 'react-icons/fa';
import {
  FiChevronLeft, FiChevronRight, FiRefreshCw, FiSettings,
  FiNavigation, FiClock, FiSun, FiMoon, FiBell, FiStar, FiMapPin
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import IslamicPattern from '@/components/ui/IslamicPattern';
import { prayerTimesService, PRAYER_INFO, MOSQUE_LOCATION } from '@/lib/prayerTimesService';
import { format, addMonths, subMonths, addDays, subDays } from 'date-fns';
import mesjidBg from '@/assets/mesjid2.jpg';

const PrayerTimes = memo(() => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlyData, setMonthlyData] = useState([]);
  const [currentNext, setCurrentNext] = useState(null);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [compassHeading, setCompassHeading] = useState(0);
  const [isCompassAvailable, setIsCompassAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState('detecting');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Initialize prayer times and location (optimized - parallel loading)
  const initializePrayerTimes = useCallback(async () => {
    try {
      setLoading(true);
      setLocationStatus('detecting');

      // Get location (returns immediately with cached/default, updates in background)
      const locationPromise = prayerTimesService.getCurrentLocation();
      setLocationStatus('found');

      // Wait for location (non-blocking, uses cache/default)
      await locationPromise;

      // Load data in parallel for better performance
      const [monthly, currentNextData, qibla] = await Promise.all([
        prayerTimesService.getMonthlyPrayerTimes(
          currentMonth.getFullYear(),
          currentMonth.getMonth()
        ),
        prayerTimesService.getCurrentAndNextPrayer(),
        prayerTimesService.getQiblaDirection()
      ]);

      setMonthlyData(monthly || []);
      setCurrentNext(currentNextData);
      setQiblaDirection(qibla || 0);

    } catch (error) {
      console.error('Error initializing prayer times:', error);
      setLocationStatus('error');
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());

      // Update current/next prayer every minute
      if (currentTime.getSeconds() === 0) {
        const currentNextData = prayerTimesService.getCurrentAndNextPrayer();
        setCurrentNext(currentNextData);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentTime]);

  // Initialize compass
  useEffect(() => {
    if ('DeviceOrientationEvent' in window) {
      setIsCompassAvailable(true);

      const handleOrientation = (event) => {
        if (event.webkitCompassHeading !== undefined) {
          // iOS
          setCompassHeading(360 - event.webkitCompassHeading);
        } else if (event.alpha !== null) {
          // Android and others
          setCompassHeading(360 - event.alpha);
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, []);

  // Initialize on mount and when month changes
  useEffect(() => {
    initializePrayerTimes();
  }, [initializePrayerTimes]);

  // Handle hash navigation to Qibla section
  useEffect(() => {
    const scrollToQibla = () => {
      const element = document.getElementById('qibla');
      if (element) {
        const navHeight = 80; // Approximate navbar height
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navHeight;
        
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
      }
    };

    // Check if hash is present in URL
    if (location.hash === '#qibla') {
      // Wait for content to load and render
      if (!loading) {
        // Small delay to ensure DOM is ready
        setTimeout(scrollToQibla, 300);
      } else {
        // If still loading, wait for it to complete
        const checkInterval = setInterval(() => {
          if (!loading) {
            clearInterval(checkInterval);
            setTimeout(scrollToQibla, 300);
          }
        }, 100);
        
        return () => clearInterval(checkInterval);
      }
    }
  }, [location.hash, loading]);

  // Navigation handlers
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => subMonths(prev, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => addMonths(prev, 1));
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  }, []);

  // Utility functions
  const downloadPrayerTimes = useCallback(() => {
    // Create CSV content
    const csvContent = [
      ['Date', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
      ...monthlyData.map(day => [
        format(day.date, 'yyyy-MM-dd'),
        day.prayers.fajr.formatted,
        day.prayers.sunrise.formatted,
        day.prayers.dhuhr.formatted,
        day.prayers.asr.formatted,
        day.prayers.maghrib.formatted,
        day.prayers.isha.formatted
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prayer-times-${format(currentMonth, 'yyyy-MM')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [monthlyData, currentMonth]);

  const sharePrayerTimes = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Prayer Times - ${format(currentMonth, 'MMMM yyyy')}`,
          text: `Check out the prayer times for ${format(currentMonth, 'MMMM yyyy')} at ${MOSQUE_LOCATION.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback - copy to clipboard
      const text = `Prayer Times for ${format(currentMonth, 'MMMM yyyy')} at ${MOSQUE_LOCATION.name}\n${window.location.href}`;
      navigator.clipboard?.writeText(text);
    }
  }, [currentMonth]);

  const enableCompass = useCallback(() => {
    if ('DeviceOrientationEvent' in window && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            setIsCompassAvailable(true);
          }
        })
        .catch(console.error);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 sm:p-12 max-w-md w-full text-center">
          <IslamicPattern className="opacity-5" color="currentColor" />
          <div className="relative z-10">
            <FiRefreshCw className="animate-spin text-4xl sm:text-5xl text-primary mx-auto mb-4" />
            <p className="text-base sm:text-lg text-muted-foreground font-medium">Loading prayer times...</p>
            <p className="text-sm text-muted-foreground mt-2">Please wait while we fetch the latest times</p>
          </div>
        </Card>
      </div>
    );
  }

  const todayData = Array.isArray(monthlyData) ? (monthlyData.find(day => day.isToday) || monthlyData[0]) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Islamic Design */}
      <section className="relative h-[50vh] min-h-[300px] sm:h-[55vh] sm:min-h-[400px] md:h-[60vh] md:min-h-[450px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${mesjidBg})`, filter: 'brightness(0.4)' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/40 to-accent/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Islamic Pattern Overlay */}
        <IslamicPattern className="opacity-10" color="white" />
        
        <div className="container relative z-10 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 tracking-tight">
                Prayer Times
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-1.5 sm:mb-2 font-light">
                {format(currentMonth, 'MMMM yyyy')}
              </p>
              <p className="text-xs sm:text-sm md:text-base text-white/80 mb-6 sm:mb-8">
                {MOSQUE_LOCATION.name}
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 md:gap-4 mt-6 sm:mt-8">
                <Button
                  onClick={downloadPrayerTimes}
                  variant="default"
                  size="default"
                  className="bg-white text-primary hover:bg-white/90 shadow-lg text-xs sm:text-sm h-9 sm:h-10 md:h-11 px-4 sm:px-6"
                >
                  <FaDownload className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Download Schedule
                </Button>
                <Button
                  onClick={sharePrayerTimes}
                  variant="outline"
                  size="default"
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-xs sm:text-sm h-9 sm:h-10 md:h-11 px-4 sm:px-6"
                >
                  <FaShare className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Share
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Today's Prayer Times - Mobile First */}
      {todayData && (
        <section className="py-6 sm:py-8 -mt-12 sm:-mt-16 relative z-20">
          <div className="container px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full flex items-center justify-center mb-5 sm:mb-6 px-4"
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-white dark:text-white">
                  Today's Prayer Times
                </h2>
              </motion.div>

              <Card className="rounded-2xl sm:rounded-3xl overflow-hidden bg-card border border-border/50 shadow-lg relative">
                <IslamicPattern className="opacity-3" color="currentColor" />
                <CardContent className="p-4 sm:p-6 relative z-10">
                  {/* Current and Next Prayer Cards - Mobile First */}
                  {currentNext && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
                      {/* Current Prayer */}
                      <div className="bg-primary rounded-xl sm:rounded-2xl p-3 sm:p-4 text-primary-foreground relative overflow-hidden">
                        <div className="relative z-10">
                          <div className="text-[10px] sm:text-xs font-medium opacity-90 mb-1">Now time is</div>
                          <div className="flex items-baseline gap-1.5 sm:gap-2 mb-1.5">
                            <div className="text-base sm:text-lg font-bold">
                              {currentNext.current?.name || 'N/A'}
                            </div>
                            {currentNext.current?.arabic && (
                              <div className="text-[10px] sm:text-xs font-arabic opacity-80">
                                {currentNext.current.arabic}
                              </div>
                            )}
                          </div>
                          <div className="text-xl sm:text-2xl font-bold mb-1">
                            {format(currentTime, 'h:mm a')}
                          </div>
                          <div className="text-[10px] sm:text-xs opacity-90">
                            End time - {currentNext.next?.formatted || '--:--'}
                          </div>
                        </div>
                        <FiStar className="absolute bottom-1.5 right-1.5 h-3 w-3 sm:h-4 sm:w-4 opacity-30" />
                      </div>

                      {/* Next Prayer */}
                      <div className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-primary/20 relative overflow-hidden">
                        <div className="relative z-10">
                          <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Next prayer is</div>
                          <div className="flex items-baseline gap-1.5 sm:gap-2 mb-1.5">
                            <div className="text-base sm:text-lg font-bold text-foreground">
                              {currentNext.next?.name || 'N/A'}
                            </div>
                            {currentNext.next?.arabic && (
                              <div className="text-[10px] sm:text-xs font-arabic text-muted-foreground">
                                {currentNext.next.arabic}
                              </div>
                            )}
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
                            {currentNext.next?.formatted || '--:--'}
                          </div>
                          {currentNext.timeToNext > 0 && (
                            <div className="text-[10px] sm:text-xs text-primary font-semibold mb-1">
                              in {prayerTimesService.formatTimeRemaining(currentNext.timeToNext)}
                            </div>
                          )}
                          <div className="space-y-0 text-[10px] sm:text-xs text-muted-foreground">
                            <div>Azan - {currentNext.next?.formatted || '--:--'}</div>
                            <div>Jamaat - {currentNext.next?.formatted || '--:--'}</div>
                          </div>
                        </div>
                        <FiStar className="absolute bottom-1.5 right-1.5 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground opacity-30" />
                      </div>
                    </div>
                  )}

                  {/* Sunrise, Mid Day, Sunset */}
                  <div className="bg-muted/50 rounded-xl p-2.5 sm:p-3 mb-4 sm:mb-5">
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-3 text-center">
                      <div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Sunrise</div>
                        <div className="text-xs sm:text-sm font-bold text-foreground">
                          {todayData.prayers.sunrise?.formatted || '--:--'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Mid Day</div>
                        <div className="text-xs sm:text-sm font-bold text-foreground">
                          {todayData.prayers.dhuhr?.formatted || '--:--'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Sunset</div>
                        <div className="text-xs sm:text-sm font-bold text-foreground">
                          {todayData.prayers.maghrib?.formatted || '--:--'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location - Compact */}
                  <div className="bg-muted/30 rounded-xl p-2.5 sm:p-3 mb-4 sm:mb-5">
                    <div className="flex items-center justify-center gap-2">
                      <FiMapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      <div className="text-center min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-foreground truncate">{MOSQUE_LOCATION.name}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{MOSQUE_LOCATION.address}</div>
                      </div>
                    </div>
                  </div>

                  {/* Prayer Times List */}
                  <div className="space-y-1.5 sm:space-y-2">
                    {Object.values(todayData.prayers)
                      .filter(p => p.name !== 'Sunrise')
                      .map((prayer) => (
                        <motion.div
                          key={prayer.name}
                          className={`flex items-center justify-between p-2.5 sm:p-3 rounded-lg transition-all ${
                            currentNext?.current?.name === prayer.name
                              ? 'bg-primary/10 border-2 border-primary/30'
                              : currentNext?.next?.name === prayer.name
                              ? 'bg-accent/10 border-2 border-accent/30'
                              : 'bg-muted/50 border-2 border-transparent hover:bg-muted'
                          }`}
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <span className="text-lg sm:text-xl flex-shrink-0">{prayer.icon || '🕌'}</span>
                            <div className="flex flex-col min-w-0">
                              <span className={`font-semibold text-xs sm:text-sm ${
                                currentNext?.current?.name === prayer.name
                                  ? 'text-primary'
                                  : 'text-foreground'
                              }`}>
                                {prayer.name}
                              </span>
                              {prayer.arabic && (
                                <span className="text-[10px] sm:text-xs text-muted-foreground font-arabic">
                                  {prayer.arabic}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                            <span className={`font-bold text-xs sm:text-sm md:text-base ${
                              currentNext?.current?.name === prayer.name
                                ? 'text-primary'
                                : 'text-foreground'
                            }`}>
                              {prayer.formatted}
                            </span>
                            <FiBell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Monthly Timetable - Mobile First */}
      <section className="py-6 sm:py-8 md:py-12 bg-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:gap-6 mb-5 sm:mb-6 md:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1">Monthly Timetable</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {MOSQUE_LOCATION.name} • {locationStatus === 'found' ? 'Current Location' : 'Default Location'}
                </p>
              </div>

              {/* Month Navigation - Mobile Optimized */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Button 
                  onClick={goToPreviousMonth} 
                  variant="outline" 
                  size="sm"
                  className="flex-shrink-0 h-9"
                  aria-label="Previous month"
                >
                  <FiChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm sm:text-base md:text-lg font-semibold px-3 sm:px-4 text-center flex-1 min-w-0">
                  <span className="truncate block">{format(currentMonth, 'MMMM yyyy')}</span>
                </div>
                <Button 
                  onClick={goToNextMonth} 
                  variant="outline" 
                  size="sm"
                  className="flex-shrink-0 h-9"
                  aria-label="Next month"
                >
                  <FiChevronRight className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={goToToday} 
                  variant="ghost" 
                  size="sm"
                  className="flex-shrink-0 text-xs sm:text-sm h-9"
                >
                  Today
                </Button>
              </div>
            </div>

            {/* Table Card */}
            <Card className="overflow-hidden border border-border/50 shadow-lg relative">
              <IslamicPattern className="opacity-2" color="currentColor" />
              <div className="overflow-x-auto relative z-10 -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-muted/80 backdrop-blur-sm sticky top-0 z-20">
                      <tr>
                        <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-foreground">Date</th>
                        <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-foreground">Fajr</th>
                        <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-muted-foreground">Sunrise</th>
                        <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-foreground">Dhuhr</th>
                        <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-foreground">Asr</th>
                        <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-foreground">Maghrib</th>
                        <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-foreground">Isha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 bg-card">
                      {monthlyData.map((day, index) => (
                        <motion.tr
                          key={day.day}
                          className={`transition-colors ${
                            day.isToday 
                              ? 'bg-primary/10 border-l-4 border-l-primary' 
                              : 'hover:bg-muted/50'
                          }`}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.2, delay: index * 0.005 }}
                        >
                          <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                            <div className="flex flex-col gap-1">
                              <div className="font-semibold text-xs sm:text-sm">{day.dayName}</div>
                              <div className="text-[10px] sm:text-xs text-muted-foreground">{day.gregorianDate}</div>
                              {day.isToday && (
                                <span className="inline-block px-1.5 py-0.5 text-[9px] sm:text-[10px] bg-primary text-primary-foreground rounded-full font-medium w-fit mt-0.5">
                                  Today
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 py-2.5 sm:py-3 text-center">
                            <span className="font-mono text-[10px] sm:text-xs font-semibold text-foreground">
                              {day.prayers.fajr.formatted}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 py-2.5 sm:py-3 text-center">
                            <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">
                              {day.prayers.sunrise.formatted}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 py-2.5 sm:py-3 text-center">
                            <span className="font-mono text-[10px] sm:text-xs font-semibold text-foreground">
                              {day.prayers.dhuhr.formatted}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 py-2.5 sm:py-3 text-center">
                            <span className="font-mono text-[10px] sm:text-xs font-semibold text-foreground">
                              {day.prayers.asr.formatted}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 py-2.5 sm:py-3 text-center">
                            <span className="font-mono text-[10px] sm:text-xs font-semibold text-foreground">
                              {day.prayers.maghrib.formatted}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 py-2.5 sm:py-3 text-center">
                            <span className="font-mono text-[10px] sm:text-xs font-semibold text-foreground">
                              {day.prayers.isha.formatted}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Qibla Finder - Mobile First */}
      <section id="qibla" className="py-6 sm:py-8 md:py-12 scroll-mt-24">
        <div className="container px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-5 sm:mb-6"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 text-foreground">Qibla Direction</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Find the direction to the Kaaba</p>
            </motion.div>

            <Card className="overflow-hidden border border-border/50 shadow-lg relative">
              <IslamicPattern className="opacity-3" color="currentColor" />
              <CardHeader className="text-center pb-3 sm:pb-4 relative z-10">
                <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl md:text-2xl">
                  <FaCompass className="text-primary h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  <span>Qibla Compass</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-5 sm:pb-6 md:pb-8 relative z-10">
                {/* Compass */}
                <div className="relative w-full max-w-sm mx-auto mb-5 sm:mb-6 md:mb-8">
                  <div className="relative w-full aspect-square max-w-[240px] sm:max-w-[280px] md:max-w-[320px] mx-auto">
                    {/* Compass Base */}
                    <div className="absolute inset-0 rounded-full border-4 border-primary/30 bg-gradient-to-br from-muted/50 to-muted/30 shadow-inner">
                      {/* Islamic Pattern on Compass */}
                      <div className="absolute inset-4 rounded-full opacity-5">
                        <IslamicPattern className="rounded-full" color="currentColor" />
                      </div>
                      
                      {/* Cardinal directions */}
                      <div className="absolute top-2 sm:top-3 left-1/2 transform -translate-x-1/2 text-destructive font-bold text-sm sm:text-base">N</div>
                      <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 text-muted-foreground font-bold text-sm sm:text-base">S</div>
                      <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-bold text-sm sm:text-base">W</div>
                      <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-bold text-sm sm:text-base">E</div>

                      {/* Qibla Indicator */}
                      <div
                        className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out"
                        style={{ transform: `rotate(${qiblaDirection}deg)` }}
                      >
                        <div className="w-1 sm:w-1.5 h-20 sm:h-24 bg-primary rounded-full shadow-lg"></div>
                        <div className="absolute top-0 w-0 h-0 border-l-[8px] sm:border-l-[10px] border-r-[8px] sm:border-r-[10px] border-b-[14px] sm:border-b-[16px] border-l-transparent border-r-transparent border-b-primary"></div>
                      </div>

                      {/* Compass Needle (if available) */}
                      {isCompassAvailable && (
                        <div
                          className="absolute inset-0 flex items-center justify-center transition-transform duration-100"
                          style={{ transform: `rotate(${compassHeading}deg)` }}
                        >
                          <div className="w-0.5 sm:w-1 h-16 sm:h-20 bg-destructive rounded-full"></div>
                          <div className="absolute top-2 w-0 h-0 border-l-[4px] sm:border-l-[5px] border-r-[4px] sm:border-r-[5px] border-b-[8px] sm:border-b-[10px] border-l-transparent border-r-transparent border-b-destructive"></div>
                        </div>
                      )}

                      {/* Center Circle */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-primary rounded-full border-2 border-background shadow-md"></div>
                      </div>

                      {/* Kaaba Icon */}
                      <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2">
                        <FaMosque className="text-xl sm:text-2xl text-primary/60" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Information */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-primary/10 rounded-xl p-3 sm:p-4 border border-primary/20">
                    <p className="text-xs sm:text-sm md:text-base text-foreground">
                      Qibla is <span className="font-bold text-primary text-base sm:text-lg md:text-xl">{qiblaDirection}°</span> from North
                    </p>
                  </div>

                  {isCompassAvailable ? (
                    <div className="bg-accent/10 rounded-xl p-3 sm:p-4 border border-accent/20">
                      <p className="text-xs sm:text-sm md:text-base text-foreground flex items-center justify-center gap-2">
                        <FiNavigation className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-accent flex-shrink-0" />
                        <span>Compass active - align with the green arrow</span>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Enable device orientation for live compass
                      </p>
                      <Button 
                        onClick={enableCompass} 
                        size="sm" 
                        variant="outline"
                        className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
                      >
                        <FiNavigation className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Enable Compass
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Location Info - Mobile First */}
      <section className="py-6 sm:py-8 md:py-12 bg-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <Card className="border border-border/50 shadow-lg relative overflow-hidden">
              <IslamicPattern className="opacity-3" color="currentColor" />
              <CardContent className="p-4 sm:p-5 md:p-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
                  {/* Location Information */}
                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2 text-foreground">
                      <FaMapMarkerAlt className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                      <span>Location Information</span>
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50 border border-border/50">
                        <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1">Mosque</div>
                        <div className="text-xs sm:text-sm font-semibold text-foreground">{MOSQUE_LOCATION.name}</div>
                      </div>
                      <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50 border border-border/50">
                        <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1">Address</div>
                        <div className="text-xs sm:text-sm text-foreground break-words">{MOSQUE_LOCATION.address}</div>
                      </div>
                      <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50 border border-border/50">
                        <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1">Calculation Method</div>
                        <div className="text-xs sm:text-sm text-foreground">Muslim World League</div>
                      </div>
                      <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50 border border-border/50">
                        <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1">Madhab</div>
                        <div className="text-xs sm:text-sm text-foreground">Shafi</div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-foreground">Quick Actions</h3>
                    <div className="space-y-2.5 sm:space-y-3">
                      <Button 
                        onClick={downloadPrayerTimes} 
                        className="w-full justify-start h-10 sm:h-11 text-xs sm:text-sm"
                        variant="default"
                      >
                        <FaDownload className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Download Monthly Schedule
                      </Button>
                      <Button 
                        onClick={sharePrayerTimes} 
                        variant="outline" 
                        className="w-full justify-start h-10 sm:h-11 text-xs sm:text-sm"
                      >
                        <FaShare className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Share Prayer Times
                      </Button>
                      <Button 
                        onClick={initializePrayerTimes} 
                        variant="ghost" 
                        className="w-full justify-start h-10 sm:h-11 text-xs sm:text-sm"
                      >
                        <FiRefreshCw className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Refresh Location
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
});

PrayerTimes.displayName = 'PrayerTimes';
export default PrayerTimes;