import { useState, useEffect, useCallback } from 'react';
import { prayerTimesService } from '@/lib/prayerTimesService';
import { differenceInSeconds, isAfter } from 'date-fns';

// Helper function to calculate current/next from prayer times (outside component for use in initializer)
const calculateCurrentNextFromTimes = (times, date) => {
  if (!times || !times.prayers) return null;
  
  const prayers = Object.values(times.prayers);
  const now = new Date();
  
  const validPrayers = prayers
    .filter(p => p && p.name && p.name.toLowerCase() !== 'sunrise')
    .sort((a, b) => a.time - b.time);
  
  let currentPrayer = null;
  let nextPrayer = null;
  
  // Find current prayer
  for (let i = validPrayers.length - 1; i >= 0; i--) {
    const prayerTime = validPrayers[i].time;
    const timeDiff = (now - prayerTime) / 1000; // seconds
    if (timeDiff >= -120) {
      currentPrayer = validPrayers[i];
      break;
    }
  }
  
  // Find next prayer
  for (let i = 0; i < validPrayers.length; i++) {
    if (validPrayers[i].time > now) {
      nextPrayer = validPrayers[i];
      break;
    }
  }
  
  const timeToNext = nextPrayer && nextPrayer.time
    ? Math.max(0, (nextPrayer.time - now) / 1000)
    : 0;
  
  return {
    current: currentPrayer,
    next: nextPrayer,
    timeToNext
  };
};

export const usePrayerTimes = (date = new Date()) => {
  // Initialize with cached data instantly (no loading state)
  const [prayerTimes, setPrayerTimes] = useState(() => {
    try {
      // Get cached data synchronously on mount
      return prayerTimesService.getCachedFormattedPrayerTimes(date);
    } catch {
      return null;
    }
  });
  
  const [currentNext, setCurrentNext] = useState(() => {
    try {
      // Try to get cached current/next prayer
      const isToday = date.toDateString() === new Date().toDateString();
      const cachedTimes = prayerTimesService.getCachedFormattedPrayerTimes(date);
      if (isToday && cachedTimes) {
        // Calculate from cached prayer times
        return calculateCurrentNextFromTimes(cachedTimes, date);
      }
    } catch {
      // Ignore errors on initial load
    }
    return null;
  });
  
  const [loading, setLoading] = useState(false); // Never block UI with loading
  const [error, setError] = useState(null);
  const [locationStatus, setLocationStatus] = useState('found'); // Assume we have location from cache

  // Helper function to calculate current/next from prayer times (for updates)
  const calculateCurrentNextFromTimesCallback = useCallback((times) => {
    if (!times || !times.prayers) return null;
    
    const prayers = Object.values(times.prayers);
    const now = new Date();
    
    const validPrayers = prayers
      .filter(p => p && p.name && p.name.toLowerCase() !== 'sunrise')
      .sort((a, b) => a.time - b.time);
    
    let currentPrayer = null;
    let nextPrayer = null;
    
    // Find current prayer
    for (let i = validPrayers.length - 1; i >= 0; i--) {
      const prayerTime = validPrayers[i].time;
      const timeDiff = (now - prayerTime) / 1000; // seconds
      if (timeDiff >= -120) {
        currentPrayer = validPrayers[i];
        break;
      }
    }
    
    // Find next prayer
    for (let i = 0; i < validPrayers.length; i++) {
      if (validPrayers[i].time > now) {
        nextPrayer = validPrayers[i];
        break;
      }
    }
    
    return calculateCurrentNextFromTimes(times, date);
  }, [date]);

  // Load prayer times with cache-first strategy
  const loadPrayerTimes = useCallback(async (forceRefresh = false) => {
    try {
      // Only show loading if forcing refresh
      if (forceRefresh) {
        setLoading(true);
      }
      setError(null);

      // Get location (non-blocking, uses cache)
      await prayerTimesService.getCurrentLocation();
      setLocationStatus('found');

      // Get prayer times (cache-first, background refresh)
      const times = await prayerTimesService.getFormattedPrayerTimes(date, {
        skipCache: forceRefresh,
        backgroundRefresh: !forceRefresh
      });
      
      if (times) {
        setPrayerTimes(times);

        // Get current and next prayer (only for today)
        const isToday = date.toDateString() === new Date().toDateString();
        if (isToday) {
          const currentNextData = await prayerTimesService.getCurrentAndNextPrayer(date, {
            skipCache: forceRefresh,
            backgroundRefresh: !forceRefresh
          });
          if (currentNextData) {
            setCurrentNext(currentNextData);
          }
        } else {
          setCurrentNext(null);
        }
      }

    } catch (err) {
      console.error('Error loading prayer times:', err);
      setError(err.message || 'Failed to load prayer times');
      setLocationStatus('error');
    } finally {
      if (forceRefresh) {
        setLoading(false);
      }
    }
  }, [date]);

  // Listen for background updates
  useEffect(() => {
    const handleUpdate = (event) => {
      if (event.detail && event.detail.date) {
        const updateDate = new Date(event.detail.date);
        if (updateDate.toDateString() === date.toDateString()) {
          // Silently update with fresh data
          setPrayerTimes(event.detail.data);
          
          // Recalculate current/next if today
          const isToday = date.toDateString() === new Date().toDateString();
          if (isToday) {
            prayerTimesService.getCurrentAndNextPrayer(date, { skipCache: false, backgroundRefresh: false })
              .then(data => {
                if (data) setCurrentNext(data);
              })
              .catch(() => {});
          }
        }
      }
    };

    window.addEventListener('prayer-times-updated', handleUpdate);
    return () => window.removeEventListener('prayer-times-updated', handleUpdate);
  }, [date]);

  // Initial load and background refresh
  useEffect(() => {
    // Load immediately with cache, refresh in background
    loadPrayerTimes(false);
  }, [loadPrayerTimes]);

  const refreshPrayerTimes = useCallback(() => {
    loadPrayerTimes(true); // Force refresh
  }, [loadPrayerTimes]);

  return {
    prayerTimes,
    currentNext,
    loading,
    error,
    locationStatus,
    refreshPrayerTimes
  };
};

export const useCurrentPrayer = () => {
  // Initialize with cached data instantly
  const [currentNext, setCurrentNext] = useState(() => {
    try {
      const today = new Date();
      const cachedTimes = prayerTimesService.getCachedFormattedPrayerTimes(today);
      if (cachedTimes && cachedTimes.prayers) {
        // Calculate from cached data
        return calculateCurrentNextFromCached(cachedTimes);
      }
    } catch {
      // Ignore errors on initial load
    }
    return null;
  });
  
  const [currentTime, setCurrentTime] = useState(new Date());

  // Helper to calculate current/next from cached times
  const calculateCurrentNextFromCached = (times) => {
    if (!times || !times.prayers) return null;
    
    const prayers = Object.values(times.prayers);
    const now = new Date();
    
    const validPrayers = prayers
      .filter(p => p && p.name && p.name.toLowerCase() !== 'sunrise')
      .sort((a, b) => a.time - b.time);
    
    let currentPrayer = null;
    let nextPrayer = null;
    
    // Find current prayer
    for (let i = validPrayers.length - 1; i >= 0; i--) {
      const prayerTime = validPrayers[i].time;
      const timeDiff = (now - prayerTime) / 1000;
      if (timeDiff >= -120) {
        currentPrayer = validPrayers[i];
        break;
      }
    }
    
    // Find next prayer
    for (let i = 0; i < validPrayers.length; i++) {
      if (validPrayers[i].time > now) {
        nextPrayer = validPrayers[i];
        break;
      }
    }
    
    const timeToNext = nextPrayer && nextPrayer.time
      ? Math.max(0, (nextPrayer.time - now) / 1000)
      : 0;
    
    return {
      current: currentPrayer,
      next: nextPrayer,
      timeToNext
    };
  };

  useEffect(() => {
    // Initial load with cache-first (instant)
    const updateCurrentPrayer = async () => {
      try {
        const currentNextData = await prayerTimesService.getCurrentAndNextPrayer(new Date(), {
          skipCache: false,
          backgroundRefresh: true
        });
        if (currentNextData) {
          setCurrentNext(currentNextData);
        }
      } catch (error) {
        console.error('Error updating current prayer:', error);
      }
    };

    // Load immediately with cache
    updateCurrentPrayer();

    // Listen for background updates
    const handleUpdate = () => {
      updateCurrentPrayer();
    };
    window.addEventListener('prayer-times-updated', handleUpdate);

    // Update every second for countdown
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Recalculate timeToNext every second (no network call)
      setCurrentNext(prev => {
        if (!prev || !prev.next) return prev;
        const now = new Date();
        const timeToNext = Math.max(0, (prev.next.time - now) / 1000);
        return { ...prev, timeToNext };
      });
      
      // Update prayer data every minute (cache-first)
      if (new Date().getSeconds() === 0) {
        updateCurrentPrayer();
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('prayer-times-updated', handleUpdate);
    };
  }, []);

  return {
    currentNext,
    currentTime
  };
};

export const useMonthlyPrayerTimes = (year, month) => {
  const [monthlyTimes, setMonthlyTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMonthlyTimes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Ensure location is available
      await prayerTimesService.getCurrentLocation();

      // Get monthly prayer times
      const times = await prayerTimesService.getMonthlyPrayerTimes(year, month);
      setMonthlyTimes(times);

    } catch (err) {
      console.error('Error loading monthly prayer times:', err);
      setError(err.message || 'Failed to load monthly prayer times');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    loadMonthlyTimes();
  }, [loadMonthlyTimes]);

  return {
    monthlyTimes,
    loading,
    error,
    refreshMonthlyTimes: loadMonthlyTimes
  };
};

export const useQiblaDirection = () => {
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [compassHeading, setCompassHeading] = useState(0);
  const [isCompassAvailable, setIsCompassAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeQibla = async () => {
      try {
        // Get current location and calculate Qibla
        await prayerTimesService.getCurrentLocation();
        const direction = await prayerTimesService.getQiblaDirection();
        setQiblaDirection(direction);

        // Check for compass availability
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
          
          return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
          };
        }
      } catch (error) {
        console.error('Error initializing Qibla direction:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeQibla();
  }, []);

  const requestCompassPermission = useCallback(async () => {
    if ('DeviceOrientationEvent' in window && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          setIsCompassAvailable(true);
          return true;
        }
      } catch (error) {
        console.error('Error requesting compass permission:', error);
      }
    }
    return false;
  }, []);

  return {
    qiblaDirection,
    compassHeading,
    isCompassAvailable,
    loading,
    requestCompassPermission
  };
};

export default usePrayerTimes;