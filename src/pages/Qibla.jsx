import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import {
  FaCompass, FaLocationArrow
} from 'react-icons/fa';
import {
  FiNavigation, FiMapPin, FiRefreshCw, FiSun, FiMoon
} from 'react-icons/fi';
import Hero from '@/components/ui/Hero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import IslamicPattern from '@/components/ui/IslamicPattern';
import { prayerTimesService, MOSQUE_LOCATION } from '@/lib/prayerTimesService';
import mesjidBg from '@/assets/mesjid2.jpg';
import { LoadingSpinner } from '@/components/ui';
import { toast } from 'sonner';

const Qibla = memo(() => {
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [compassHeading, setCompassHeading] = useState(0);
  const [isCompassAvailable, setIsCompassAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState('detecting');
  const [userLocation, setUserLocation] = useState(null);
  const compassWatchId = useRef(null);

  // Initialize Qibla direction
  const initializeQibla = useCallback(async () => {
    try {
      setLoading(true);
      setLocationStatus('detecting');

      // Get current location
      const location = await prayerTimesService.getCurrentLocation();
      setUserLocation(location);
      setLocationStatus('found');

      // Get Qibla direction
      const qibla = await prayerTimesService.getQiblaDirection();
      setQiblaDirection(qibla);

    } catch (error) {
      console.error('Error initializing Qibla:', error);
      setLocationStatus('error');
      toast.error('Unable to determine your location. Using default Qibla direction.');
      // Use default direction for mosque location
      try {
        // Set default coordinates first
        prayerTimesService.coordinates = { latitude: MOSQUE_LOCATION.coordinates.latitude, longitude: MOSQUE_LOCATION.coordinates.longitude };
        const defaultQibla = await prayerTimesService.getQiblaDirection();
        setQiblaDirection(defaultQibla);
      } catch (fallbackError) {
        console.error('Fallback Qibla calculation failed:', fallbackError);
        // Use approximate direction for Addis Ababa (approximately 50 degrees from north)
        setQiblaDirection(50);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Request device compass permission and start tracking
  const requestCompassPermission = useCallback(() => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            startCompassTracking();
          } else {
            toast.error('Compass permission denied');
          }
        })
        .catch(error => {
          console.error('Error requesting compass permission:', error);
          toast.error('Unable to access compass');
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
      if (event.alpha !== null) {
        setCompassHeading(event.alpha);
        setIsCompassAvailable(true);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    compassWatchId.current = true; // Mark as active

    // Check if compass is available after a short delay
    setTimeout(() => {
      if (!isCompassAvailable) {
        setIsCompassAvailable(false);
        toast.info('Compass not available on this device. Showing Qibla direction only.');
      }
    }, 1000);
  }, [isCompassAvailable]);

  useEffect(() => {
    initializeQibla();
    return () => {
      if (compassWatchId.current) {
        window.removeEventListener('deviceorientation', () => {});
        compassWatchId.current = null;
      }
    };
  }, [initializeQibla]);

  const handleRefresh = () => {
    setLoading(true);
    initializeQibla();
  };

  // Calculate compass rotation (compass heading - qibla direction)
  const compassRotation = isCompassAvailable ? (compassHeading - qiblaDirection + 360) % 360 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <Hero
        title="Qibla"
        titleHighlight="Direction"
        align="center"
        description="Find the direction to the Kaaba in Mecca for accurate prayer orientation."
        backgroundImage={mesjidBg}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Main Qibla Compass Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="overflow-hidden border border-border/50 shadow-xl relative">
              <IslamicPattern className="opacity-[0.02]" />
              <CardHeader className="text-center pb-4 relative z-10">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl md:text-3xl">
                  <FaCompass className="text-primary h-6 w-6 md:h-7 md:w-7" />
                  <span>Qibla Compass</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-8 relative z-10">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <LoadingSpinner size="lg" />
                    <p className="text-muted-foreground mt-4">Determining Qibla direction...</p>
                  </div>
                ) : (
                  <>
                    {/* Compass */}
                    <div className="relative w-full max-w-md mx-auto mb-8">
                      <div className="aspect-square relative">
                        {/* Outer Compass Ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-primary/20 bg-gradient-to-br from-muted/50 to-background shadow-inner" />
                        
                        {/* Compass Background */}
                        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-background to-muted/30 border-2 border-border/50 flex items-center justify-center">
                          {/* Qibla Indicator Arrow */}
                          <div
                            className="absolute w-1/3 h-1/3 flex items-center justify-center"
                            style={{
                              transform: `rotate(${qiblaDirection}deg)`,
                              transition: 'transform 0.3s ease-out'
                            }}
                          >
                            <div className="relative">
                              <FaLocationArrow className="text-primary h-12 w-12 md:h-16 md:w-16 drop-shadow-lg" />
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-xs font-bold text-primary">
                                Qibla
                              </div>
                            </div>
                          </div>

                          {/* Center Point */}
                          <div className="absolute w-3 h-3 bg-primary rounded-full z-10 shadow-lg" />

                          {/* Direction Markers */}
                          {['N', 'E', 'S', 'W'].map((dir, idx) => {
                            const angle = idx * 90;
                            const rad = (angle - 90) * (Math.PI / 180);
                            const radius = 45; // Percentage from center
                            return (
                              <div
                                key={dir}
                                className="absolute text-xs font-bold text-foreground/60"
                                style={{
                                  top: `calc(50% - ${Math.sin(rad) * radius}% - 0.5rem)`,
                                  left: `calc(50% + ${Math.cos(rad) * radius}% - 0.5rem)`,
                                  transform: `rotate(${-qiblaDirection}deg)`
                                }}
                              >
                                {dir}
                              </div>
                            );
                          })}
                        </div>

                        {/* Device Compass Overlay (if available) */}
                        {isCompassAvailable && (
                          <div
                            className="absolute inset-0 rounded-full border-2 border-dashed border-accent/50"
                            style={{
                              transform: `rotate(${-compassRotation}deg)`,
                              transition: 'transform 0.1s ease-out'
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Qibla Direction Display */}
                    <div className="mb-6">
                      <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                        {Math.round(qiblaDirection)}°
                      </div>
                      <div className="text-lg text-muted-foreground">
                        Direction to Kaaba, Mecca
                      </div>
                    </div>

                    {/* Location Status */}
                    {locationStatus === 'found' && userLocation && (
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                        <FiMapPin className="w-4 h-4" />
                        <span>
                          Location: {userLocation.latitude.toFixed(4)}°, {userLocation.longitude.toFixed(4)}°
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={handleRefresh}
                        variant="outline"
                        size="lg"
                      >
                        <FiRefreshCw className="w-4 h-4 mr-2" />
                        Refresh Direction
                      </Button>
                      {!isCompassAvailable && typeof DeviceOrientationEvent !== 'undefined' && (
                        <Button
                          onClick={requestCompassPermission}
                          variant="primary"
                          size="lg"
                        >
                          <FiNavigation className="w-4 h-4 mr-2" />
                          Use Device Compass
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FiSun className="w-5 h-5 text-primary" />
                  About Qibla
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  The Qibla is the direction that Muslims face when performing their prayers (Salah). 
                  It points towards the Kaaba, the sacred building at the center of the Grand Mosque in Mecca, Saudi Arabia.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FiMoon className="w-5 h-5 text-primary" />
                  How to Use
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Allow location access for accurate direction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Use device compass for real-time orientation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Face the direction shown on the compass</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

Qibla.displayName = 'Qibla';
export default Qibla;
