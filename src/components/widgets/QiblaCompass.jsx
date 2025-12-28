import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { FaCompass, FaLocationArrow, FaMosque } from 'react-icons/fa';
import { FiNavigation, FiMapPin } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import IslamicPattern from '@/components/ui/IslamicPattern';
import { prayerTimesService } from '@/lib/prayerTimesService';
import { useTranslation } from 'react-i18next';

// Helper function to safely get translation with fallback
// react-i18next returns the key when translation is missing
const getTranslation = (t, key, fallback) => {
  try {
    // Use defaultValue option which react-i18next supports
    const translation = t(key, { defaultValue: fallback });

    // If the result is exactly the same as the key (and it's a namespaced key),
    // it means the translation wasn't found
    if (translation === key && key.includes('.')) {
      return fallback;
    }

    // Return the translation (or fallback if empty)
    return translation || fallback;
  } catch (error) {
    // If translation fails, return fallback
    console.warn(`Translation failed for key "${key}":`, error);
    return fallback;
  }
};

/**
 * Unified Qibla Compass Component
 * Best implementation combining features from both PrayerTimes and Qibla pages
 * 
 * Features:
 * - Instant cache-first loading (no blocking)
 * - Device compass support with permission handling
 * - Smooth animations
 * - Responsive design
 * - Accessible
 */
const QiblaCompass = memo(({
  variant = 'default', // 'default' | 'compact' | 'embedded'
  showHeader = true,
  showLocation = true,
  showActions = true,
  className = ''
}) => {
  const { t } = useTranslation();
  const [qiblaDirection, setQiblaDirection] = useState(0); // True north based (fixed)
  const [compassHeading, setCompassHeading] = useState(0); // Magnetic north from device
  const [isCompassAvailable, setIsCompassAvailable] = useState(false);
  const [loading, setLoading] = useState(false); // Never block UI
  const [userLocation, setUserLocation] = useState(null);
  const compassWatchId = useRef(null);
  const orientationHandlerRef = useRef(null);

  // Magnetic declination for Ethiopia (Addis Ababa area)
  // Positive value means magnetic north is east of true north
  // Ethiopia: approximately +2° to +4°, using +3° as average
  const MAGNETIC_DECLINATION = 3.0;

  // Initialize Qibla direction with cache-first strategy
  const initializeQibla = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setLoading(true);
      }

      // Get location (non-blocking, uses cache)
      const location = await prayerTimesService.getCurrentLocation();
      setUserLocation(location);

      // Get Qibla direction (cache-first)
      const qibla = await prayerTimesService.getQiblaDirection();
      setQiblaDirection(qibla);

      // Refresh in background if not forcing
      if (!forceRefresh) {
        // Background refresh doesn't block UI
        prayerTimesService.getQiblaDirection().then(freshQibla => {
          if (freshQibla !== qibla) {
            setQiblaDirection(freshQibla);
          }
        }).catch(() => {
          // Silently fail - we already have cached data
        });
      }
    } catch (error) {
      console.error('Error initializing Qibla:', error);
      // Use default direction for Addis Ababa (approximately 50 degrees)
      if (qiblaDirection === 0) {
        setQiblaDirection(50);
      }
    } finally {
      if (forceRefresh) {
        setLoading(false);
      }
    }
  }, [qiblaDirection]);

  // Request device compass permission and start tracking
  const requestCompassPermission = useCallback(() => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            startCompassTracking();
          }
        })
        .catch(error => {
          console.error('Error requesting compass permission:', error);
        });
    } else {
      startCompassTracking();
    }
  }, []);

  const startCompassTracking = useCallback(() => {
    if (compassWatchId.current !== null) {
      return; // Already tracking
    }

    const handleOrientation = (event) => {
      if (event.webkitCompassHeading !== undefined) {
        // iOS - webkitCompassHeading is already magnetic north (0-360)
        setCompassHeading(event.webkitCompassHeading);
        setIsCompassAvailable(true);
      } else if (event.alpha !== null) {
        // Android and others - alpha is magnetic north (0-360)
        // Normalize to 0-360 range
        let heading = event.alpha;
        if (heading < 0) heading += 360;
        setCompassHeading(heading);
        setIsCompassAvailable(true);
      }
    };

    orientationHandlerRef.current = handleOrientation;
    window.addEventListener('deviceorientation', handleOrientation);
    compassWatchId.current = true; // Mark as active
  }, []);

  // Initialize on mount
  useEffect(() => {
    // Load instantly from cache, refresh in background
    initializeQibla(false);

    // Check if compass is available
    if ('DeviceOrientationEvent' in window) {
      // Try to start compass if permission already granted
      if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
        startCompassTracking();
      }
    }

    return () => {
      if (orientationHandlerRef.current) {
        window.removeEventListener('deviceorientation', orientationHandlerRef.current);
        compassWatchId.current = null;
      }
    };
  }, [initializeQibla, startCompassTracking]);

  // Calculate rotations correctly:
  // 1. Compass ring rotates with device (so N on ring always points to magnetic north)
  // 2. Qibla arrow shows Qibla direction relative to the rotating ring
  // 3. Qibla is calculated from TRUE north, but ring shows MAGNETIC north
  // 4. So: Qibla relative to magnetic = Qibla (true) - declination

  // Compass ring rotation (negative because we rotate the background)
  // When device points to magnetic north, ring's N should be at top
  const compassRingRotation = isCompassAvailable ? -compassHeading : 0;

  // Qibla arrow rotation relative to the ring (which is aligned to magnetic north)
  // Qibla direction is from TRUE north, so adjust for magnetic declination
  // If declination is +3°, magnetic north is 3° east of true north
  // So Qibla from magnetic = Qibla (true) - 3°
  const qiblaArrowRotation = qiblaDirection - MAGNETIC_DECLINATION;

  const isCompact = variant === 'compact';
  const isEmbedded = variant === 'embedded';

  return (
    <Card className={`overflow-hidden border border-border/50 shadow-xl relative bg-gradient-to-br from-card via-card to-muted/20 ${className}`}>
      <IslamicPattern className="opacity-[0.02]" />

      {showHeader && (
        <CardHeader className="text-center pb-4 sm:pb-5 relative z-10 border-b border-border/30">
          <CardTitle className={`flex items-center justify-center gap-2.5 ${isCompact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl md:text-3xl'}`}>
            <FaCompass className="text-primary h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
            <span>{getTranslation(t, 'prayerTimes.qiblaCompass', getTranslation(t, 'qibla.qiblaCompass', 'Qibla Compass'))}</span>
          </CardTitle>
        </CardHeader>
      )}

      <CardContent className={`text-center ${isCompact ? 'pb-4 sm:pb-5' : 'pb-6 sm:pb-8 md:pb-10'} relative z-10 px-4 sm:px-6`}>
        {/* Compass */}
        <div className={`relative w-full mx-auto ${isCompact ? 'max-w-[200px] mb-4' : 'max-w-sm mb-6 sm:mb-8'}`}>
          <div className={`relative aspect-square ${isCompact ? 'max-w-[200px]' : 'max-w-[240px] sm:max-w-[280px] md:max-w-[320px]'} mx-auto`}>
            {/* Outer Ring - Fixed */}
            <div className="absolute inset-0 rounded-full border-2 border-border/40 bg-gradient-to-br from-background/80 to-muted/40 shadow-lg"></div>

            {/* Compass Base Ring - Rotates with device (magnetic north) */}
            <div
              className="absolute inset-2 rounded-full border-[3px] border-primary/40 bg-gradient-to-br from-muted/60 via-muted/40 to-muted/60 shadow-inner transition-transform duration-100 ease-out"
              style={{ transform: `rotate(${compassRingRotation}deg)` }}
            >
              {/* Islamic Pattern on Compass */}
              <div className="absolute inset-3 rounded-full opacity-[0.03]">
                <IslamicPattern className="rounded-full" color="currentColor" />
              </div>

              {/* Cardinal directions - rotate with ring */}
              <div className={`absolute top-1.5 sm:top-2 left-1/2 transform -translate-x-1/2 text-destructive font-extrabold ${isCompact ? 'text-xs' : 'text-sm sm:text-base'} drop-shadow-sm`}>
                N
              </div>
              <div className={`absolute bottom-1.5 sm:bottom-2 left-1/2 transform -translate-x-1/2 text-muted-foreground font-bold ${isCompact ? 'text-xs' : 'text-sm sm:text-base'}`}>S</div>
              <div className={`absolute left-1.5 sm:left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground font-bold ${isCompact ? 'text-xs' : 'text-sm sm:text-base'}`}>W</div>
              <div className={`absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground font-bold ${isCompact ? 'text-xs' : 'text-sm sm:text-base'}`}>E</div>

              {/* Qibla Indicator Arrow - Relative to ring (magnetic north aligned) */}
              <div
                className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out z-10"
                style={{ transform: `rotate(${qiblaArrowRotation}deg)` }}
              >
                {/* Arrow shaft */}
                <div className={`w-1.5 sm:w-2 ${isCompact ? 'h-16' : 'h-20 sm:h-24'} bg-gradient-to-b from-primary via-primary to-primary/80 rounded-full shadow-lg`}></div>
                {/* Arrow head */}
                <div className={`absolute top-0 w-0 h-0 ${isCompact ? 'border-l-[7px] border-r-[7px] border-b-[12px]' : 'border-l-[9px] sm:border-l-[11px] border-r-[9px] sm:border-r-[11px] border-b-[16px] sm:border-b-[18px]'} border-l-transparent border-r-transparent border-b-primary drop-shadow-md`}></div>
                {/* Qibla label */}
                <div className="absolute -top-6 sm:-top-7 text-[11px] sm:text-xs font-bold text-primary bg-background/90 px-1.5 py-0.5 rounded-full border border-primary/30">
                  Qibla
                </div>
              </div>
            </div>

            {/* Center Circle */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className={`${isCompact ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6'} bg-primary rounded-full border-[3px] border-background shadow-lg ring-2 ring-primary/20`}></div>
            </div>

            {/* Kaaba Icon - Fixed at bottom, always visible */}
            <div className={`absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-15 bg-background/80 rounded-full p-1.5 sm:p-2 border border-primary/20`}>
              <FaMosque className={`${isCompact ? 'text-base' : 'text-lg sm:text-xl'} text-primary/70`} />
            </div>
          </div>
        </div>

        {/* Qibla Direction Display */}
        <div className={`${isCompact ? 'mb-3' : 'mb-5 sm:mb-6'} bg-primary/5 rounded-2xl ${isCompact ? 'p-3' : 'p-4 sm:p-5'} border border-primary/10`}>
          <div className={`${isCompact ? 'text-3xl' : 'text-4xl sm:text-5xl md:text-6xl'} font-bold text-primary mb-2 sm:mb-3 tracking-tight`}>
            {Math.round(qiblaDirection)}°
          </div>
          <div className={`${isCompact ? 'text-xs' : 'text-sm sm:text-base md:text-lg'} text-muted-foreground`}>
            <span className="font-medium">{getTranslation(t, 'prayerTimes.qiblaFromNorth', getTranslation(t, 'qibla.qiblaFromNorth', 'Qibla is'))}</span>{' '}
            <span className="font-bold text-primary">{Math.round(qiblaDirection)}°</span>{' '}
            <span>{getTranslation(t, 'prayerTimes.fromNorth', getTranslation(t, 'qibla.fromNorth', 'from North'))}</span>
            {isCompassAvailable && (
              <span className="block text-xs mt-1.5 text-muted-foreground/70 italic">
                (True North, {MAGNETIC_DECLINATION > 0 ? '+' : ''}{MAGNETIC_DECLINATION}° declination corrected)
              </span>
            )}
          </div>
        </div>

        {/* Location Status */}
        {showLocation && userLocation && (
          <div className={`flex items-center justify-center gap-2 ${isCompact ? 'text-xs mb-3' : 'text-sm mb-4 sm:mb-5'} text-muted-foreground bg-muted/30 rounded-lg ${isCompact ? 'p-2' : 'p-2.5 sm:p-3'}`}>
            <FiMapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/70" />
            <span className="font-mono">
              {userLocation.latitude.toFixed(4)}°, {userLocation.longitude.toFixed(4)}°
            </span>
          </div>
        )}

        {/* Compass Status */}
        {isCompassAvailable ? (
          <div className={`bg-accent/10 rounded-xl ${isCompact ? 'p-2.5 mb-3' : 'p-3 sm:p-4 mb-4'} border border-accent/20`}>
            <p className={`${isCompact ? 'text-xs' : 'text-xs sm:text-sm md:text-base'} text-foreground flex items-center justify-center gap-2`}>
              <FiNavigation className={`${isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5'} text-accent flex-shrink-0`} />
              <span>{getTranslation(t, 'prayerTimes.compassActive', getTranslation(t, 'qibla.compassActive', 'Compass Active'))}</span>
            </p>
          </div>
        ) : (
          showActions && (
            <div className={`space-y-2.5 sm:space-y-3 ${isCompact ? 'mb-3' : 'mb-4'}`}>
              <p className={`${isCompact ? 'text-xs' : 'text-xs sm:text-sm'} text-muted-foreground text-center`}>
                {getTranslation(t, 'prayerTimes.enableCompassDescription', getTranslation(t, 'qibla.enableCompassDescription', 'Enable device orientation for live compass tracking'))}
              </p>
              <Button
                onClick={requestCompassPermission}
                size={isCompact ? 'sm' : 'sm'}
                variant="outline"
                className={`${isCompact ? 'w-full text-xs h-8' : 'w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10'} mx-auto`}
              >
                <FiNavigation className={`mr-2 ${isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5 sm:h-4 sm:w-4'}`} />
                {getTranslation(t, 'prayerTimes.enableCompass', getTranslation(t, 'qibla.enableCompass', 'Enable Compass'))}
              </Button>
            </div>
          )
        )}

        {/* Action Buttons */}
        {showActions && !isEmbedded && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            <Button
              onClick={() => initializeQibla(true)}
              variant="outline"
              size={isCompact ? 'sm' : 'lg'}
              disabled={loading}
              className="min-w-[120px]"
            >
              <FiNavigation className="w-4 h-4 mr-2" />
              {loading ? getTranslation(t, 'common.loading', 'Loading...') : getTranslation(t, 'common.refresh', 'Refresh')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

QiblaCompass.displayName = 'QiblaCompass';

export default QiblaCompass;
