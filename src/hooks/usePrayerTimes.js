import { useState, useEffect, useCallback } from 'react';
import { prayerTimesService } from '@/lib/prayerTimesService';

export const usePrayerTimes = (date = new Date()) => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [currentNext, setCurrentNext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationStatus, setLocationStatus] = useState('detecting');

  const loadPrayerTimes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setLocationStatus('detecting');

      // Get current location
      await prayerTimesService.getCurrentLocation();
      setLocationStatus('found');

      // Get prayer times for the specified date
      const times = await prayerTimesService.getFormattedPrayerTimes(date);
      setPrayerTimes(times);

      // Get current and next prayer (only for today)
      const isToday = date.toDateString() === new Date().toDateString();
      if (isToday) {
        const currentNextData = await prayerTimesService.getCurrentAndNextPrayer();
        setCurrentNext(currentNextData);
      } else {
        setCurrentNext(null);
      }

    } catch (err) {
      console.error('Error loading prayer times:', err);
      setError(err.message || 'Failed to load prayer times');
      setLocationStatus('error');
    } finally {
      setLoading(false);
    }
  }, [date]);

  const refreshPrayerTimes = useCallback(() => {
    loadPrayerTimes();
  }, [loadPrayerTimes]);

  useEffect(() => {
    loadPrayerTimes();
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
  const [currentNext, setCurrentNext] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateCurrentPrayer = async () => {
      try {
        const currentNextData = await prayerTimesService.getCurrentAndNextPrayer();
        setCurrentNext(currentNextData);
      } catch (error) {
        console.error('Error updating current prayer:', error);
      }
    };

    // Initial load
    updateCurrentPrayer();

    // Update every second for countdown
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Update prayer data every minute
      if (new Date().getSeconds() === 0) {
        updateCurrentPrayer();
      }
    }, 1000);

    return () => clearInterval(timer);
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