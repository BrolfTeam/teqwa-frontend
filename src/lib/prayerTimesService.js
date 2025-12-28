import { PrayerTimes, CalculationMethod, Coordinates, Madhab } from 'adhan';
import { format, addDays, differenceInSeconds, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

// Default coordinates for Addis Ababa, Ethiopia (MuJemea At-Tekwa area)
const DEFAULT_COORDINATES = {
  latitude: 9.0108,
  longitude: 38.7613
};

// Mosque location
export const MOSQUE_LOCATION = {
  name: 'MuJemea At-Tekwa',
  address: 'MuJemea At-Tekwa, Addis Ababa, Ethiopia',
  coordinates: DEFAULT_COORDINATES,
  timezone: 'Africa/Addis_Ababa'
};

// Prayer names with display information
export const PRAYER_INFO = {
  fajr: { name: 'Fajr', displayName: 'Dawn', arabic: 'الفجر', icon: '🌅', color: 'blue' },
  sunrise: { name: 'Sunrise', displayName: 'Sunrise', arabic: 'الشروق', icon: '☀️', color: 'orange' },
  dhuhr: { name: 'Dhuhr', displayName: 'Noon', arabic: 'الظهر', icon: '🕌', color: 'yellow' },
  asr: { name: 'Asr', displayName: 'Afternoon', arabic: 'العصر', icon: '☁️', color: 'amber' },
  maghrib: { name: 'Maghrib', displayName: 'Sunset', arabic: 'المغرب', icon: '🌇', color: 'red' },
  isha: { name: 'Isha', displayName: 'Night', arabic: 'العشاء', icon: '🌙', color: 'indigo' }
};

class PrayerTimesService {
  constructor() {
    this.coordinates = DEFAULT_COORDINATES;
    this.calculationMethod = CalculationMethod.MuslimWorldLeague();
    this.calculationMethod.madhab = Madhab.Shafi;
    this.locationCache = null;
    this.locationCacheTime = null;
    this.locationCacheTimeout = 300000; // 5 minutes cache
    this.isLocationLoading = false;
    this.locationPromise = null;
    this.timingsCache = new Map(); // In-memory cache for daily prayer times
    this.storageKeyPrefix = 'prayer_times_';
    this.locationStorageKey = 'prayer_location';
    this.cacheExpiryHours = 24; // Cache prayer times for 24 hours

    // Load cached location from localStorage immediately
    this.loadCachedLocation();
  }

  // Load cached location from localStorage
  loadCachedLocation() {
    try {
      const cached = localStorage.getItem(this.locationStorageKey);
      if (cached) {
        const { coordinates, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        // Use cached location if less than 1 hour old
        if (age < 3600000 && coordinates) {
          this.coordinates = coordinates;
        }
      }
    } catch (e) {
      console.warn('Error loading cached location:', e);
    }
  }

  // Save location to localStorage
  saveLocationToStorage(coordinates) {
    try {
      localStorage.setItem(this.locationStorageKey, JSON.stringify({
        coordinates,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Error saving location to storage:', e);
    }
  }

  // Get cache key for storage
  getStorageCacheKey(date, latitude, longitude) {
    const dateStr = format(date, 'yyyy-MM-dd');
    return `${this.storageKeyPrefix}${dateStr}_${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
  }

  // Load from localStorage cache
  loadFromStorageCache(date, latitude, longitude) {
    try {
      const key = this.getStorageCacheKey(date, latitude, longitude);
      const cached = localStorage.getItem(key);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        const expiryMs = this.cacheExpiryHours * 3600000;

        // Return cached data if not expired
        if (age < expiryMs && data) {
          return data;
        } else {
          // Remove expired cache
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Error loading from storage cache:', e);
    }
    return null;
  }

  // Save to localStorage cache
  saveToStorageCache(date, latitude, longitude, data) {
    try {
      const key = this.getStorageCacheKey(date, latitude, longitude);
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Error saving to storage cache:', e);
      // If storage is full, clear old entries
      this.clearOldCacheEntries();
    }
  }

  // Clear old cache entries if storage is full
  clearOldCacheEntries() {
    try {
      const keysToRemove = [];
      const now = Date.now();
      const expiryMs = this.cacheExpiryHours * 3600000;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storageKeyPrefix)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const { timestamp } = JSON.parse(cached);
              if (now - timestamp > expiryMs) {
                keysToRemove.push(key);
              }
            }
          } catch (e) {
            keysToRemove.push(key); // Remove invalid entries
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('Error clearing old cache:', e);
    }
  }

  // Set custom coordinates
  setCoordinates(latitude, longitude) {
    const newCoords = { latitude, longitude };
    const coordsChanged =
      Math.abs(this.coordinates.latitude - newCoords.latitude) > 0.0001 ||
      Math.abs(this.coordinates.longitude - newCoords.longitude) > 0.0001;

    if (coordsChanged) {
      this.coordinates = newCoords;
      // Clear in-memory cache when location changes
      this.timingsCache.clear();
      // Save to localStorage
      this.saveLocationToStorage(this.coordinates);
    }
  }

  // Get current location (optimized - returns immediately with cached/default, updates in background)
  getCurrentLocation(forceRefresh = false) {
    // Return cached coordinates immediately if we have them
    if (!forceRefresh && this.coordinates &&
      (this.coordinates.latitude !== DEFAULT_COORDINATES.latitude ||
        this.coordinates.longitude !== DEFAULT_COORDINATES.longitude)) {
      // Return immediately with cached coordinates
      if (!this.locationPromise) {
        // Update location in background (non-blocking)
        this.updateLocationInBackground();
      }
      return Promise.resolve(this.coordinates);
    }

    // If already loading, return the existing promise
    if (this.locationPromise) return this.locationPromise;

    // Return default coordinates immediately, then update in background
    const defaultPromise = Promise.resolve(this.coordinates);
    this.updateLocationInBackground();
    return defaultPromise;
  }

  // Update location in background (non-blocking)
  updateLocationInBackground() {
    if (!navigator.geolocation) {
      return;
    }

    // Don't set loading flag, so UI doesn't block
    this.locationPromise = new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.setCoordinates(position.coords.latitude, position.coords.longitude);
          this.locationPromise = null;
          resolve(this.coordinates);
        },
        (error) => {
          // Silently fail - we already have default coordinates
          console.warn('Background location update failed:', error);
          this.locationPromise = null;
          resolve(this.coordinates);
        },
        {
          enableHighAccuracy: false,
          timeout: 5000, // Reduced timeout for faster fallback
          maximumAge: 3600000 // Accept location up to 1 hour old
        }
      );
    });
  }

  // Fetch from Aladhan API (optimized with localStorage cache)
  async fetchAladhanTimings(date = new Date()) {
    try {
      const dateStr = format(date, 'dd-MM-yyyy');
      // Create a unique cache key for this date and location
      const cacheKey = `${dateStr}_${this.coordinates.latitude}_${this.coordinates.longitude}`;

      // Check in-memory cache first
      if (this.timingsCache.has(cacheKey)) {
        return this.timingsCache.get(cacheKey);
      }

      // Check localStorage cache
      const cachedData = this.loadFromStorageCache(date, this.coordinates.latitude, this.coordinates.longitude);
      if (cachedData) {
        // Also store in memory cache for faster access
        this.timingsCache.set(cacheKey, cachedData);
        return cachedData;
      }

      const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${this.coordinates.latitude}&longitude=${this.coordinates.longitude}&method=3&school=0`; // Method 3 = MWL, School 0 = Shafi

      const response = await fetch(url);
      if (!response.ok) throw new Error('Aladhan API failed');

      const data = await response.json();

      // Store in both caches
      if (data && data.data) {
        this.timingsCache.set(cacheKey, data.data);
        this.saveToStorageCache(date, this.coordinates.latitude, this.coordinates.longitude, data.data);
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching from Aladhan:', error);
      return null;
    }
  }

  // Get cached formatted prayer times synchronously (INSTANT - no network)
  getCachedFormattedPrayerTimes(date = new Date()) {
    const dateStr = format(date, 'dd-MM-yyyy');
    const cacheKey = `${dateStr}_${this.coordinates.latitude}_${this.coordinates.longitude}`;

    // Check in-memory cache first
    if (this.timingsCache.has(cacheKey)) {
      const aladhanData = this.timingsCache.get(cacheKey);
      return this.formatAladhanResponse(aladhanData, date);
    }

    // Check localStorage cache (synchronous)
    const cachedData = this.loadFromStorageCache(date, this.coordinates.latitude, this.coordinates.longitude);
    if (cachedData) {
      // Store in memory cache for faster access
      this.timingsCache.set(cacheKey, cachedData);
      return this.formatAladhanResponse(cachedData, date);
    }

    // Fallback to local calculation (always works, no network needed)
    const times = this.getPrayerTimesLocal(date);
    const formatted = {};

    Object.keys(PRAYER_INFO).forEach(prayer => {
      if (times[prayer]) {
        formatted[prayer] = {
          ...PRAYER_INFO[prayer],
          time: times[prayer],
          formatted: format(times[prayer], 'h:mm a'),
          timestamp: times[prayer].getTime()
        };
      }
    });

    return {
      ...times,
      prayers: formatted,
      hijriDate: this.getHijriDate(date),
      gregorianDate: format(date, 'EEEE, MMMM d, yyyy')
    };
  }

  // Get formatted prayer times (Pure Local Calculation)
  async getFormattedPrayerTimes(date = new Date(), options = {}) {
    // Pure local calculation using Adhan library - Instant & Offline-capable
    const times = this.getPrayerTimesLocal(date);
    const formatted = {};

    Object.keys(PRAYER_INFO).forEach(prayer => {
      if (times[prayer]) {
        formatted[prayer] = {
          ...PRAYER_INFO[prayer],
          time: times[prayer],
          formatted: format(times[prayer], 'h:mm a'),
          timestamp: times[prayer].getTime()
        };
      }
    });

    return {
      ...times,
      prayers: formatted,
      hijriDate: this.getHijriDate(date),
      gregorianDate: format(date, 'EEEE, MMMM d, yyyy')
    };
  }

  formatAladhanResponse(data, date) {
    const timings = data.timings;
    const hijri = data.date.hijri;
    const formatted = {};

    Object.keys(PRAYER_INFO).forEach(key => {
      // Aladhan returns keys like "Fajr", "Sunrise", etc. matching our PRAYER_INFO names
      const apiName = PRAYER_INFO[key].name;
      if (timings[apiName]) {
        // Parse time string "HH:mm"
        const [hours, minutes] = timings[apiName].split(':');
        const timeDate = new Date(date);
        timeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        formatted[key] = {
          ...PRAYER_INFO[key],
          time: timeDate,
          formatted: format(timeDate, 'h:mm a'),
          timestamp: timeDate.getTime()
        };
      }
    });

    return {
      prayers: formatted,
      hijriDate: `${hijri.day} ${hijri.month.en} ${hijri.year}`,
      gregorianDate: format(date, 'EEEE, MMMM d, yyyy'),
      location: MOSQUE_LOCATION // We could update this with reverse geocoding if needed
    };
  }

  // Local calculation using Adhan library (Fallback)
  getPrayerTimesLocal(date = new Date()) {
    const coordinates = new Coordinates(this.coordinates.latitude, this.coordinates.longitude);
    const prayerTimes = new PrayerTimes(coordinates, date, this.calculationMethod);

    return {
      date,
      fajr: prayerTimes.fajr,
      sunrise: prayerTimes.sunrise,
      dhuhr: prayerTimes.dhuhr,
      asr: prayerTimes.asr,
      maghrib: prayerTimes.maghrib,
      isha: prayerTimes.isha,
      coordinates: this.coordinates,
      calculationMethod: 'Muslim World League'
    };
  }

  // Get current and next prayer with cache-first strategy
  // Returns cached data instantly, updates in background
  async getCurrentAndNextPrayer(date = new Date(), options = {}) {
    const { skipCache = false, backgroundRefresh = true } = options;

    try {
      // Use cache-first approach - get data instantly from cache
      const times = await this.getFormattedPrayerTimes(date, { skipCache, backgroundRefresh });
      if (!times || !times.prayers) {
        return null;
      }

      const prayers = Object.values(times.prayers);
      const now = new Date();

      let currentPrayer = null;
      let nextPrayer = null;

      // Filter out sunrise and sort by time
      const validPrayers = prayers
        .filter(p => p && p.name && p.name.toLowerCase() !== 'sunrise')
        .sort((a, b) => a.time - b.time);

      // Find current prayer (last prayer that has passed or is happening now)
      // Check if we're within 2 minutes of a prayer time (to handle transitions smoothly)
      for (let i = validPrayers.length - 1; i >= 0; i--) {
        const prayerTime = validPrayers[i].time;
        const timeDiff = differenceInSeconds(now, prayerTime);

        // Consider prayer current if it has passed or is within 2 minutes
        if (timeDiff >= -120) {
          currentPrayer = validPrayers[i];
          break;
        }
      }

      // Find next prayer (first prayer that hasn't passed yet)
      for (let i = 0; i < validPrayers.length; i++) {
        const prayerTime = validPrayers[i].time;
        if (isAfter(prayerTime, now)) {
          nextPrayer = validPrayers[i];
          break;
        }
      }

      // If no next prayer today, get Fajr from tomorrow (use cache)
      if (!nextPrayer) {
        try {
          const tomorrow = addDays(date, 1);
          const tomorrowTimes = await this.getFormattedPrayerTimes(tomorrow);
          if (tomorrowTimes && tomorrowTimes.prayers && tomorrowTimes.prayers.fajr) {
            nextPrayer = tomorrowTimes.prayers.fajr;
          }
        } catch (err) {
          console.warn('Could not fetch tomorrow prayer times:', err);
        }
      }

      // If no current prayer (before Fajr), current is Isha from yesterday (use cache)
      if (!currentPrayer) {
        try {
          const yesterday = addDays(date, -1);
          const yesterdayTimes = await this.getFormattedPrayerTimes(yesterday);
          if (yesterdayTimes && yesterdayTimes.prayers && yesterdayTimes.prayers.isha) {
            currentPrayer = yesterdayTimes.prayers.isha;
          }
        } catch (err) {
          console.warn('Could not fetch yesterday prayer times:', err);
        }
      }

      // Calculate time to next prayer
      const timeToNext = nextPrayer && nextPrayer.time
        ? Math.max(0, differenceInSeconds(nextPrayer.time, now))
        : 0;

      // Always return a valid structure, even if prayers are null
      return {
        current: currentPrayer,
        next: nextPrayer,
        timeToNext: timeToNext
      };
    } catch (error) {
      console.error('Error in getCurrentAndNextPrayer:', error);
      // Return empty structure instead of null to prevent N/A display
      return {
        current: null,
        next: null,
        timeToNext: 0
      };
    }
  }

  // Get monthly prayer times (Local Calculation)
  async getMonthlyPrayerTimes(year = new Date().getFullYear(), month = new Date().getMonth(), options = {}) {
    // Check cache first
    const cacheKey = `monthly_${year}_${month}_${this.coordinates.latitude.toFixed(4)}_${this.coordinates.longitude.toFixed(4)}`;
    try {
      const cached = localStorage.getItem(`monthly_${cacheKey}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        // Cache monthly data for 6 hours
        if (age < 21600000 && data) {
          return data;
        }
      }
    } catch (e) {
      // Ignore cache errors
    }

    // Perform Local Calculation for the month
    const monthlyTimes = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    // Process all days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      // Use our local calculation method (which is now synchronous/fast)
      const times = await this.getFormattedPrayerTimes(date);

      monthlyTimes.push({
        date,
        day,
        dayName: format(date, 'EEE'),
        isToday: format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
        prayers: times.prayers,
        hijriDate: times.hijriDate,
        gregorianDate: format(date, 'MMM d')
      });
    }

    // Cache the calculated monthly data
    try {
      localStorage.setItem(`monthly_${cacheKey}`, JSON.stringify({
        data: monthlyTimes,
        timestamp: Date.now()
      }));
    } catch (e) {
      // Ignore storage errors
    }

    return monthlyTimes;
  }

  // Get Hijri date using Intl.DateTimeFormat (Accurate)
  getHijriDate(date) {
    try {
      return new Intl.DateTimeFormat('en-TN-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      // Fallback to standard islamic if umalqura requires nicer environment support
      return new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    }
  }

  // Format time remaining until next prayer
  formatTimeRemaining(seconds) {
    if (seconds <= 0) return '0m';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  // Get Qibla direction (with caching)
  async getQiblaDirection() {
    // Qibla direction doesn't change for a location, so cache it
    const cacheKey = `qibla_${this.coordinates.latitude.toFixed(4)}_${this.coordinates.longitude.toFixed(4)}`;

    // Check cache first
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { direction, timestamp } = JSON.parse(cached);
        // Cache for 30 days (Qibla doesn't change)
        if (Date.now() - timestamp < 2592000000) {
          return direction;
        }
      }
    } catch (e) {
      // Ignore cache errors
    }

    // Qibla direction calculation (Pure Local)
    // No need for API as Great Circle calculation is mathematically precise
    const meccaLat = 21.4225; // Kaaba latitude
    const meccaLng = 39.8262; // Kaaba longitude

    const lat1 = this.coordinates.latitude * Math.PI / 180;
    const lat2 = meccaLat * Math.PI / 180;
    const deltaLng = (meccaLng - this.coordinates.longitude) * Math.PI / 180;

    const x = Math.sin(deltaLng) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

    let bearing = Math.atan2(x, y) * 180 / Math.PI;
    bearing = (bearing + 360) % 360; // Normalize to 0-360

    const direction = Math.round(bearing);

    // Cache the calculated result
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        direction,
        timestamp: Date.now()
      }));
    } catch (e) {
      // Ignore storage errors
    }

    return direction;
  }
}

// Create singleton instance
export const prayerTimesService = new PrayerTimesService();

// Export utility functions
export const formatPrayerTime = (date) => format(date, 'h:mm a');
export const formatTimeRemaining = (seconds) => prayerTimesService.formatTimeRemaining(seconds);

export default prayerTimesService;