import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  FiMapPin, FiCalendar, FiChevronLeft, FiChevronRight,
  FiBell, FiRefreshCw, FiStar, FiCompass, FiArrowRight, FiMoon, FiSun, FiClock, FiUser
} from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import IslamicPattern from '@/components/ui/IslamicPattern';
import { prayerTimesService, PRAYER_INFO, formatTimeRemaining, MOSQUE_LOCATION } from '@/lib/prayerTimesService';
import { format, addDays, subDays } from 'date-fns';
import { useTranslation } from '@/hooks/useTranslation';
import { isRamadan, getRamadanDay, getStoredHijriAdjustment, calculateHijri } from '@/utils/hijriUtils';
import siteService from '@/services/siteService';

// Helper function to get daily imams from localStorage
const getDailyImams = () => {
  try {
    const stored = localStorage.getItem('daily_imams');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading daily imams:', e);
  }
  return {}; // Default: no imams assigned
};

// Helper function to translate prayer names
const getPrayerTranslation = (prayerName, t, isRamadanMode = false) => {
  const name = prayerName?.toLowerCase();

  if (isRamadanMode) {
    if (name === 'fajr') return t('prayer.suhoorEnd') || 'Suhoor End';
    if (name === 'maghrib') return t('prayer.iftar') || 'Iftar';
  }

  const prayerMap = {
    'fajr': t('prayer.fajr'),
    'dhuhr': t('prayer.dhuhr'),
    'asr': t('prayer.asr'),
    'maghrib': t('prayer.maghrib'),
    'isha': t('prayer.isha'),
    'sunrise': t('prayer.sunrise')
  };
  return prayerMap[name] || prayerName;
};

const PrayerTimesWidget = memo(({ className = '', showNavigation = true, compact = false }) => {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  // Initialize with cached data instantly (no loading state)
  const [prayerData, setPrayerData] = useState(() => {
    try {
      return prayerTimesService.getCachedFormattedPrayerTimes(selectedDate);
    } catch {
      return null;
    }
  });
  const [currentNext, setCurrentNext] = useState(null);
  const [loading, setLoading] = useState(false); // Never block UI
  const [error, setError] = useState(null);
  const [locationStatus, setLocationStatus] = useState('found'); // Assume cached location
  const [dailyImams, setDailyImams] = useState(getDailyImams());
  const [siteConfig, setSiteConfig] = useState(null);
  const cardRef = useRef(null);

  // Fetch site configuration for Ramadan imams
  useEffect(() => {
    const fetchSiteConfig = async () => {
      try {
        const response = await siteService.getSiteConfig();
        const data = response?.data || response;
        setSiteConfig(data);
      } catch (err) {
        console.error('Failed to fetch site config for imams:', err);
      }
    };
    fetchSiteConfig();
  }, []);

  // 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), { stiffness: 300, damping: 30 });

  // Mobile 3D effect - device orientation and automatic animation
  const [isMobile, setIsMobile] = useState(false);
  const [deviceOrientation, setDeviceOrientation] = useState({ beta: 0, gamma: 0 });
  const autoRotateX = useMotionValue(0);
  const autoRotateY = useMotionValue(0);

  // Auto-rotation animation for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Device orientation for mobile 3D effect
  useEffect(() => {
    if (!isMobile) return;

    const handleOrientation = (e) => {
      if (e.beta !== null && e.gamma !== null) {
        // Normalize device orientation to widget rotation
        const beta = Math.max(-45, Math.min(45, e.beta)) / 45; // Pitch (-45 to 45 degrees)
        const gamma = Math.max(-45, Math.min(45, e.gamma)) / 45; // Roll (-45 to 45 degrees)
        setDeviceOrientation({ beta, gamma });
        y.set(beta * 0.3);
        x.set(gamma * 0.3);
      }
    };

    // Request permission for iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isMobile, x, y]);

  // Automatic subtle 3D animation for mobile when no orientation
  useEffect(() => {
    if (!isMobile) return;

    const interval = setInterval(() => {
      // Check if device orientation is available
      if (deviceOrientation.beta === 0 && deviceOrientation.gamma === 0) {
        // Create subtle floating animation
        const time = Date.now() / 2000;
        autoRotateX.set(Math.sin(time) * 0.15);
        autoRotateY.set(Math.cos(time * 0.7) * 0.15);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isMobile, deviceOrientation, autoRotateX, autoRotateY]);

  // Touch gesture for 3D effect on mobile
  const handleTouchStart = useCallback((e) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const touchX = touch.clientX - centerX;
    const touchY = touch.clientY - centerY;

    x.set((touchX / (rect.width / 2)) * 0.5);
    y.set((touchY / (rect.height / 2)) * 0.5);
  }, [isMobile, x, y]);

  const handleTouchMove = useCallback((e) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const touchX = touch.clientX - centerX;
    const touchY = touch.clientY - centerY;

    x.set((touchX / (rect.width / 2)) * 0.5);
    y.set((touchY / (rect.height / 2)) * 0.5);
  }, [isMobile, x, y]);

  const handleTouchEnd = useCallback(() => {
    if (!isMobile) return;
    // Smoothly return to center or auto-rotate position
    x.set(autoRotateX.get());
    y.set(autoRotateY.get());
  }, [isMobile, x, y, autoRotateX, autoRotateY]);

  // Combine auto-rotation with manual control
  const finalRotateX = useSpring(
    useTransform([y, autoRotateY], ([yVal, autoY]) => {
      if (isMobile && deviceOrientation.beta === 0 && deviceOrientation.gamma === 0) {
        return autoY * 7;
      }
      return yVal * 7;
    }),
    { stiffness: 300, damping: 30 }
  );
  const finalRotateY = useSpring(
    useTransform([x, autoRotateX], ([xVal, autoX]) => {
      if (isMobile && deviceOrientation.beta === 0 && deviceOrientation.gamma === 0) {
        return autoX * 7;
      }
      return xVal * 7;
    }),
    { stiffness: 300, damping: 30 }
  );

  // Initialize prayer times with cache-first strategy (INSTANT LOAD)
  const initializePrayerTimes = useCallback(async (forceRefresh = false) => {
    try {
      // Only show loading if forcing refresh
      if (forceRefresh) {
        setLoading(true);
      }
      setError(null);
      setLocationStatus('found'); // Assume we have location from cache

      // Get location (non-blocking, uses cache - returns instantly)
      await prayerTimesService.getCurrentLocation();

      // Load prayer times with cache-first (instant from cache, background refresh)
      const isToday = selectedDate.toDateString() === new Date().toDateString();
      const [times, currentNextData] = await Promise.all([
        prayerTimesService.getFormattedPrayerTimes(selectedDate, {
          skipCache: forceRefresh,
          backgroundRefresh: !forceRefresh
        }),
        isToday ? prayerTimesService.getCurrentAndNextPrayer(selectedDate, {
          skipCache: forceRefresh,
          backgroundRefresh: !forceRefresh
        }) : Promise.resolve(null)
      ]);

      if (times && times.prayers) {
        setPrayerData(times);
        if (currentNextData) {
          setCurrentNext(currentNextData);
        }
      } else {
        // Fallback to local calculation if no cache
        const localTimes = prayerTimesService.getCachedFormattedPrayerTimes(selectedDate);
        if (localTimes && localTimes.prayers) {
          setPrayerData(localTimes);
        } else {
          throw new Error('Invalid prayer times data');
        }
      }
    } catch (err) {
      console.error('Error initializing prayer times:', err);
      setError('Failed to load prayer times');
      setLocationStatus('default');
      // Don't clear prayerData on error, keep showing last known data
    } finally {
      if (forceRefresh) {
        setLoading(false);
      } else {
        // Never show loading for cache-first loads
        setLoading(false);
      }
    }
  }, [selectedDate]);

  // Update current time every second and prayer status intelligently
  useEffect(() => {
    let lastPrayerUpdate = 0;
    let lastDataRefresh = 0;
    let lastKnownNextPrayerTime = null;
    const PRAYER_UPDATE_INTERVAL = 10000; // Update every 10 seconds
    const DATA_REFRESH_INTERVAL = 300000; // Refresh data every 5 minutes

    const updatePrayerStatus = async () => {
      if (!prayerData || !prayerData.prayers) return;

      try {
        const currentNextData = await prayerTimesService.getCurrentAndNextPrayer(selectedDate);
        if (currentNextData) {
          setCurrentNext(prev => {
            // Check if prayer transition occurred (next prayer became current)
            const prayerChanged = !prev ||
              prev.current?.name !== currentNextData.current?.name ||
              prev.next?.name !== currentNextData.next?.name;

            // Update if prayer changed or time difference is significant
            if (prayerChanged || !prev || Math.abs(prev.timeToNext - currentNextData.timeToNext) > 5) {
              // If prayer transition detected, log it
              if (prayerChanged && prev) {
                console.log('Prayer transition detected:', {
                  from: prev.current?.name,
                  to: currentNextData.current?.name
                });
              }
              return currentNextData;
            }
            return prev;
          });

          // Track next prayer time for immediate update detection
          if (currentNextData.next?.time) {
            lastKnownNextPrayerTime = currentNextData.next.time.getTime();
          }
        }
      } catch (err) {
        console.error('Error updating current/next prayer:', err);
      }
    };

    const timer = setInterval(async () => {
      const now = new Date();
      setCurrentTime(now);

      // Update current/next prayer for today
      const isToday = format(selectedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

      if (isToday && prayerData && prayerData.prayers) {
        const nowTime = now.getTime();

        // Immediate update if we've passed the next prayer time
        if (lastKnownNextPrayerTime && nowTime >= lastKnownNextPrayerTime - 60000) {
          // Within 1 minute of next prayer or past it - update immediately
          await updatePrayerStatus();
          lastPrayerUpdate = nowTime;
        }
        // Regular update every 10 seconds
        else if (nowTime - lastPrayerUpdate >= PRAYER_UPDATE_INTERVAL) {
          lastPrayerUpdate = nowTime;
          await updatePrayerStatus();
        }

        // Refresh full prayer times data every 5 minutes in background (cache-first)
        if (nowTime - lastDataRefresh >= DATA_REFRESH_INTERVAL) {
          lastDataRefresh = nowTime;
          // Refresh in background (non-blocking)
          prayerTimesService.getFormattedPrayerTimes(selectedDate, {
            skipCache: false,
            backgroundRefresh: true
          }).then(times => {
            if (times && times.prayers) {
              setPrayerData(times);
              // Also update current/next after refresh
              updatePrayerStatus();
            }
          }).catch(() => {
            // Silently fail - we already have cached data
          });
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedDate, prayerData]);

  // Initialize on mount and when date changes (cache-first)
  useEffect(() => {
    // Load instantly from cache, refresh in background
    initializePrayerTimes(false);
  }, [initializePrayerTimes]);

  // Listen for background updates
  useEffect(() => {
    const handleUpdate = (event) => {
      if (event.detail && event.detail.date) {
        const updateDate = new Date(event.detail.date);
        if (updateDate.toDateString() === selectedDate.toDateString()) {
          // Silently update with fresh data
          setPrayerData(event.detail.data);

          // Recalculate current/next if today
          const isToday = selectedDate.toDateString() === new Date().toDateString();
          if (isToday) {
            prayerTimesService.getCurrentAndNextPrayer(selectedDate, {
              skipCache: false,
              backgroundRefresh: false
            }).then(data => {
              if (data) setCurrentNext(data);
            }).catch(() => { });
          }
        }
      }
    };

    window.addEventListener('prayer-times-updated', handleUpdate);
    return () => window.removeEventListener('prayer-times-updated', handleUpdate);
  }, [selectedDate]);

  // Listen for imam updates from admin settings
  useEffect(() => {
    const handleImamUpdate = () => {
      setDailyImams(getDailyImams());
    };
    window.addEventListener('daily-imams-updated', handleImamUpdate);
    return () => window.removeEventListener('daily-imams-updated', handleImamUpdate);
  }, []);

  // Navigation handlers
  const goToPreviousDay = useCallback(() => {
    setSelectedDate(prev => subDays(prev, 1));
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate(prev => addDays(prev, 1));
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  const navigate = useNavigate();

  // Handle mouse move for 3D effect (desktop only) - MUST be before early returns
  const handleMouseMove = useCallback((e) => {
    if (isMobile) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    x.set(mouseX / (rect.width / 2));
    y.set((mouseY / (rect.height / 2)));
  }, [isMobile, x, y]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    x.set(0);
    y.set(0);
  }, [isMobile, x, y]);

  // Only show loading spinner if forcing refresh (never on initial cache load)
  if (loading && !prayerData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
      >
        <Card className={`p-6 ${className} relative bg-gradient-to-br from-card via-card to-muted/20 backdrop-blur-sm border-primary/20 shadow-2xl overflow-hidden`}>
          <IslamicPattern className="opacity-[0.03]" color="currentColor" />
          <div className="flex items-center justify-center space-x-3 relative z-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <FiRefreshCw className="h-5 w-5 text-primary" />
            </motion.div>
            <span className="text-muted-foreground">Loading prayer times...</span>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
      >
        <Card className={`p-6 ${className} relative bg-gradient-to-br from-card via-card to-muted/20 backdrop-blur-sm border-primary/20 shadow-2xl overflow-hidden`}>
          <IslamicPattern className="opacity-[0.03]" color="currentColor" />
          <div className="text-center relative z-10">
            <p className="text-destructive mb-4">{error}</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => initializePrayerTimes(true)} size="sm" variant="outline" className="hover:bg-primary/10">
                <FiRefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (!prayerData || !prayerData.prayers) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
      >
        <Card className={`p-6 ${className} relative bg-gradient-to-br from-card via-card to-muted/20 backdrop-blur-sm border-primary/20 shadow-2xl overflow-hidden`}>
          <IslamicPattern className="opacity-[0.03]" color="currentColor" />
          <div className="flex items-center justify-center space-x-3 relative z-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <FiRefreshCw className="h-5 w-5 text-primary" />
            </motion.div>
            <span className="text-muted-foreground">Loading prayer times...</span>
          </div>
        </Card>
      </motion.div>
    );
  }

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const prayers = Object.values(prayerData.prayers || {});

  // Hijri adjustment and Ramadan detection
  const hijriAdjustment = getStoredHijriAdjustment();
  // Hijri day starts at Maghrib (sunset). 
  // We only shift to the next Hijri day if it's TODAY and we are AFTER Maghrib but BEFORE midnight.
  const now = new Date();
  const isAfterMaghrib = isToday && now.getHours() >= 12 && (
    currentNext?.current?.name === 'Maghrib' ||
    currentNext?.current?.name === 'Isha' ||
    (currentNext?.next?.name === 'Fajr' && now.getHours() > 15)
  );

  const ramadanDay = getRamadanDay(selectedDate, hijriAdjustment, isAfterMaghrib);
  const isRamadanMode = ramadanDay !== null;

  // Calculate end time for current prayer (next prayer time)
  const currentPrayerEndTime = isToday && currentNext?.next?.formatted ? currentNext.next.formatted : '--:--';

  // Get current time formatted
  const currentTimeFormatted = format(currentTime, 'h:mm a');

  return (
    <div className="w-full perspective-1000 overflow-hidden md:overflow-visible" style={{ perspective: '1000px' }}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          rotateX: isMobile ? 0 : finalRotateX,
          rotateY: isMobile ? 0 : finalRotateY,
          transformStyle: 'preserve-3d',
        }}
        className="w-full"
      >
        {/* 3D Model Container */}
        <div className="relative w-full" style={{ transformStyle: 'preserve-3d' }}>
          {/* Back Shadow - Hidden on Mobile */}
          <motion.div
            className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl -z-10 hidden md:block"
            style={{ transform: 'translateZ(-40px) scale(0.9)', opacity: 0.5 }}
          />

          {/* Main Card */}
          <Card className={`w-full max-w-full flex flex-col relative border-white/20 shadow-2xl ${className} bg-background/80 backdrop-blur-xl overflow-hidden`}
            style={{
              transform: isMobile ? 'none' : 'translateZ(0px)',
              transformStyle: isMobile ? 'flat' : 'preserve-3d',
            }}
          >
            {/* Texture/Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none p-6">
              <IslamicPattern color="currentColor" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full p-3 sm:p-4 overflow-hidden" style={{ transform: 'translateZ(10px)' }}>

              {/* 1. Header: Date & Nav */}
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                {showNavigation && (
                  <button onClick={(e) => { e.preventDefault(); goToPreviousDay(); }} className="p-1.5 rounded-full hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary">
                    <FiChevronLeft className="h-4 w-4" />
                  </button>
                )}
                <div className="text-center">
                  <div className="text-base font-bold text-foreground tracking-wide flex items-center justify-center gap-2">
                    {isRamadanMode && <FiMoon className="text-primary animate-pulse h-4 w-4" />}
                    {format(selectedDate, 'EEEE, d MMMM')}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium mt-0.5 flex items-center justify-center gap-2">
                    {isRamadanMode ? (
                      <span className="text-primary font-bold">
                        {t('islamicCalendar.monthNames.ramadan')} {ramadanDay}, {calculateHijri(selectedDate, hijriAdjustment, isAfterMaghrib).year}H
                      </span>
                    ) : (
                      prayerData?.hijriDate || t('islamicCalendar.hijriDate') || 'Islamic Date'
                    )}
                  </div>
                </div>
                {showNavigation && (
                  <button onClick={goToNextDay} className="p-1.5 rounded-full hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary">
                    <FiChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* 2. Hero: Next Prayer Focus */}
              {isToday && currentNext && (
                <div className="bg-primary/5 rounded-xl p-3 mb-2 flex flex-wrap gap-y-2 items-center justify-between flex-shrink-0 border border-primary/10 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs uppercase font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {t('prayer.next')} {currentNext.next?.name === 'Fajr' && new Date().getHours() > 12 ? `(${t('prayer.tomorrow')})` : ''}
                      </span>
                      <span className="text-2xl font-black text-foreground">{getPrayerTranslation(currentNext.next?.name, t, isRamadanMode)}</span>
                    </div>
                    <div className="text-3xl font-light text-foreground/90 leading-none">
                      {currentNext.next?.formatted}
                    </div>
                  </div>

                  <div className="text-right relative z-10">
                    {currentNext.timeToNext > 0 && (
                      <div className="text-base font-bold text-primary mb-1 tabular-nums">
                        - {prayerTimesService.formatTimeRemaining(currentNext.timeToNext)}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground/80">
                      {t('prayer.now')} <span className="font-bold text-foreground">{getPrayerTranslation(currentNext.current?.name, t, isRamadanMode)}</span>
                    </div>
                  </div>

                  {/* Decorative faint background icon */}
                  <div className="absolute -right-2 -bottom-4 opacity-5 text-primary rotate-12 pointer-events-none">
                    <FiClock className="w-24 h-24" />
                  </div>
                </div>
              )}

              {/* 3. Clean Prayer List */}
              <div className="space-y-0.5 mb-2 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent min-h-0">
                {prayers.length > 0 ? (
                  prayers
                    .filter(p => ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(p.name.toLowerCase()))
                    .sort((a, b) => {
                      const order = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
                      return order.indexOf(a.name.toLowerCase()) - order.indexOf(b.name.toLowerCase());
                    })
                    .map((prayer) => {
                      const isCurrent = isToday && currentNext?.current?.name === prayer.name;
                      const isNext = isToday && currentNext?.next?.name === prayer.name;
                      const prayerKey = prayer.name.toLowerCase();
                      let imam = dailyImams[prayerKey];

                      // Use Ramadan imams if in Ramadan mode
                      if (isRamadanMode && siteConfig?.ramadan_imams?.[prayerKey]) {
                        const ramadanImams = siteConfig.ramadan_imams[prayerKey];
                        if (Array.isArray(ramadanImams) && ramadanImams.length > 0) {
                          imam = ramadanImams.join(', ');
                        }
                      }

                      return (
                        <div
                          key={prayer.name}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isCurrent
                            ? 'bg-primary text-primary-foreground shadow-lg font-semibold scale-[1.02]'
                            : isNext
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-foreground/90 hover:bg-muted font-medium'
                            } mb-1`}
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <span className="text-2xl opacity-80 w-8 text-center flex-shrink-0">{prayer.icon || '🕌'}</span>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-base">{getPrayerTranslation(prayer.name, t, isRamadanMode)}</span>
                              {imam && (
                                <span className={`text-xs opacity-80 truncate ${isCurrent ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                                  <FiUser className="inline h-3 w-3 mr-1" />
                                  {imam}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <span className="text-base font-bold tracking-wide">{prayer.formatted}</span>
                            {isCurrent && (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <FiBell className="h-4 w-4" />
                              </motion.div>
                            )}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-4">{t('prayer.noDataAvailable')}</div>
                )}
              </div>

              {/* 4. Sun Times Footer - Compact */}
              <div className="grid grid-cols-2 gap-2 px-3 py-3 bg-muted/60 rounded-xl mb-3 text-sm text-muted-foreground flex-shrink-0">
                <div className="flex items-center justify-center gap-2 border-r border-border/50">
                  <FiSun className="h-4 w-4 text-orange-400" />
                  <div className="flex flex-col">
                    <span className="text-[11px] uppercase font-bold opacity-60 line-height-none mb-0.5">{t('prayer.sunrise')}</span>
                    <span className="font-bold text-foreground text-sm leading-none">{prayerData.prayers?.sunrise?.formatted || '--'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <FiMoon className="h-4 w-4 text-indigo-400" />
                  <div className="flex flex-col">
                    <span className="text-[11px] uppercase font-bold opacity-60 line-height-none mb-0.5">
                      {isRamadanMode ? (t('prayer.iftar') || 'Iftar') : t('prayer.maghrib')}
                    </span>
                    <span className="font-bold text-foreground text-sm leading-none">{prayerData.prayers?.maghrib?.formatted || '--'}</span>
                  </div>
                </div>
              </div>

              {/* 5. Buttons - Compact */}
              {showNavigation && (
                <div className="grid grid-cols-2 gap-3 mt-auto pt-2 border-t border-border/10 flex-shrink-0">
                  <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg font-bold h-12 rounded-xl text-sm">
                    <Link to="/prayer-times" className="flex items-center justify-center gap-2">
                      <FiCalendar className="h-4 w-4" />
                      <span>{t('prayer.schedule')}</span>
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-primary/30 text-primary hover:bg-primary/5 hover:text-primary shadow-sm font-bold h-12 rounded-xl text-sm">
                    <Link to="/prayer-times#qibla" className="flex items-center justify-center gap-2">
                      <FiCompass className="h-4 w-4" />
                      <span>{t('prayer.qibla')}</span>
                    </Link>
                  </Button>
                </div>
              )}

            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
});

PrayerTimesWidget.displayName = 'PrayerTimesWidget';

export default PrayerTimesWidget;