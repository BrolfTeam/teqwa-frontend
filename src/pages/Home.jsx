import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiMapPin, FiArrowRight, FiHeart, FiUsers, FiBookOpen, FiTrendingUp, FiTarget, FiDollarSign, FiCheckCircle, FiMoon, FiCoffee, FiShield, FiActivity, FiSun, FiGrid, FiCompass } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import PrayerTimesWidget from '@/components/widgets/PrayerTimesWidget';
import LazyImage from '@/components/ui/LazyImage';
import { useEffect, useState, useMemo, memo, useCallback } from 'react';
import { dataService } from '@/lib/dataService';
import { apiService } from '@/lib/apiService';
import { DEFAULT_PRAYER_TIMES } from '@/config/constants';
import { useAuth } from '@/context/AuthContext';
import { getHeroSlides } from '@/data/heroContent';
import mesjidBg from '@/assets/mesjid2.jpg';
import futsalImage from '@/assets/futsal4.jpg';
import itikafImage from '@/assets/metakif.jpg';
import itikafImage2 from '@/assets/mutakif1.jpg';
import futsalImage1 from '@/assets/futsal1.jpg';
import futsalImage2 from '@/assets/futsal2.jpg';
import futsalImage3 from '@/assets/futsal3.jpg';

const prayerTimes = DEFAULT_PRAYER_TIMES;

const PrayerTimeCard = memo(({ name, time, index }) => (
  <motion.div
    className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/5 dark:from-primary/10 to-accent/5 dark:to-accent/10 border border-primary/10 dark:border-primary/20 hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-300 hover:shadow-soft group bg-card/50 dark:bg-card/70"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ scale: 1.02 }}
  >
    <h3 className="font-semibold capitalize text-lg text-primary mb-2 group-hover:text-primary/80 transition-colors">
      {name}
    </h3>
    <p className="text-2xl font-bold text-foreground group-hover:scale-105 transition-transform">
      {time}
    </p>
    {name === 'jummah' && (
      <span className="inline-block mt-2 px-2 py-1 text-xs bg-accent/20 dark:bg-accent/30 text-accent-foreground rounded-full">
        Friday
      </span>
    )}
  </motion.div>
));
PrayerTimeCard.displayName = 'PrayerTimeCard';

// Donation Progress Widget Component
const DonationProgressWidget = memo(({ className = '' }) => {
  const { t } = useTranslation();
  const [donationStats, setDonationStats] = useState(null);
  const [donationCauses, setDonationCauses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    const fetchDonationData = async () => {
      try {
        setLoading(true);

        // Check if user is authenticated before calling protected endpoints
        const token = localStorage.getItem('authToken');

        // Try to get stats (may require auth, so handle gracefully)
        let stats = { total_amount: 0, total_donations: 0 };
        if (token) {
          // Only try protected endpoint if user is authenticated
          try {
            const statsResponse = await apiService.getDonationStats();
            stats = statsResponse?.data || statsResponse || stats;
            // Normalize stats format
            if (stats.total_amount_completed !== undefined) {
              stats.total_amount = stats.total_amount_completed;
              stats.total_donations = stats.total_completed || 0;
            }
          } catch (error) {
            // If 401 or 429, skip and use defaults
            if (error.status === 401 || error.status === 429) {
              console.log('Skipping donation stats (auth required or rate limited)');
            } else {
              // For other errors, try public endpoint
              try {
                const publicResponse = await apiService.request('/donations/');
                if (publicResponse?.data) {
                  stats = {
                    total_amount: publicResponse.data.total_amount || 0,
                    total_donations: publicResponse.data.total_donations || 0
                  };
                }
              } catch (e) {
                // If both fail, use defaults
                console.log('Using default donation stats');
              }
            }
          }
        }

        // Get donation causes (public endpoint, but handle rate limiting)
        let causes = [];
        try {
          const causesResponse = await apiService.getDonationCauses({ active: 'true' });
          causes = causesResponse?.data || causesResponse || [];
          if (!Array.isArray(causes)) causes = [];
        } catch (error) {
          // Silently handle rate limiting or other errors
          if (error.status !== 429) {
            console.log('Could not fetch donation causes');
          }
        }

        if (isMounted) {
          setDonationStats(stats);
          setDonationCauses(causes);
        }
      } catch (error) {
        console.error('Failed to fetch donation data:', error);
        if (isMounted) {
          setDonationStats({ total_amount: 0, total_donations: 0 });
          setDonationCauses([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDonationData();
    // Refresh every 5 minutes (only if component is still mounted)
    intervalId = setInterval(() => {
      if (isMounted) {
        fetchDonationData();
      }
    }, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Loading donation progress...</span>
        </div>
      </Card>
    );
  }

  const totalRaised = donationStats?.total_amount || 0;
  const totalDonations = donationStats?.total_donations || 0;
  const activeCause = donationCauses[0];
  const causeProgress = activeCause ? ((activeCause.raised_amount || 0) / (activeCause.target_amount || 1)) * 100 : 0;

  return (
    <Card className={`p-6 bg-gradient-to-br from-primary/5 dark:from-primary/10 via-card to-accent/5 dark:to-accent/10 border-primary/20 dark:border-primary/30 ${className}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FiHeart className="h-5 w-5 text-primary" />
            {t('donations.communitySupport')}
          </h3>
          <Link to="/donations" className="text-sm text-primary hover:underline flex items-center gap-1">
            {t('donations.viewAll')} <FiArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Overall Stats */}
        <div className="space-y-4">
          <div className="bg-background/50 dark:bg-background/70 rounded-lg p-4 border border-border/50 dark:border-border/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{t('donations.totalRaised')}</span>
              <FiDollarSign className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {totalRaised.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ETB
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalDonations} {totalDonations === 1 ? t('donations.donation') : t('donations.donations')}
            </p>
          </div>

          {/* Active Campaign Progress */}
          {activeCause && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{activeCause.name || activeCause.title}</span>
                <span className="text-muted-foreground">
                  {Math.round(causeProgress)}%
                </span>
              </div>
              <div className="w-full bg-muted/50 dark:bg-muted/60 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(causeProgress, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{(activeCause.raised_amount || 0).toLocaleString()} ETB</span>
                <span>{t('home.goal')}: {(activeCause.target_amount || 0).toLocaleString()} ETB</span>
              </div>
            </div>
          )}
        </div>

        <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/80">
          <Link to="/donations" className="flex items-center justify-center gap-2">
            <FiHeart className="h-4 w-4" />
            {t('donations.supportOurCause')}
          </Link>
        </Button>
      </div>
    </Card>
  );
});
DonationProgressWidget.displayName = 'DonationProgressWidget';

const Home = memo(() => {
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [donationCauses, setDonationCauses] = useState([]);
  const [itikafPrograms, setItikafPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  // Dynamic Occasion Logic
  const getIslamicOccasion = () => {
    const today = new Date();
    const day = today.getDay();
    const isRamadan = false;

    if (day === 5) return 'jumuah';
    if (isRamadan) return 'ramadan';
    return 'default';
  };

  const occasion = getIslamicOccasion();

  // Create dynamic hero slides using content configuration
  const { t } = useTranslation();
  const heroSlides = useMemo(() => {
    const featuredEvents = upcomingEvents.filter(e => e.featured);
    const activeCampaigns = donationCauses.filter(c => c.status === 'active');
    return getHeroSlides(featuredEvents, activeCampaigns, t);
  }, [upcomingEvents, donationCauses, t]);

  // Listen for khatib updates from admin settings
  useEffect(() => {
    const handleKhatibUpdate = () => {
      // Force re-render by reloading the page to refresh hero slides
      window.location.reload();
    };
    window.addEventListener('jumuah-khatib-updated', handleKhatibUpdate);
    return () => window.removeEventListener('jumuah-khatib-updated', handleKhatibUpdate);
  }, []);

  // Auto-advance carousel with smooth timing and progress indicator
  useEffect(() => {
    if (!isAutoPlaying || heroSlides.length <= 1) {
      setProgress(0);
      return;
    }

    const duration = 7000; // 7 seconds per slide
    const interval = 100; // Update progress every 100ms
    let elapsed = 0;

    const progressTimer = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / duration) * 100);
    }, interval);

    const slideTimer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      setProgress(0);
    }, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(slideTimer);
    };
  }, [isAutoPlaying, heroSlides.length, currentSlide]);

  // Touch/swipe support for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };

  // Manual slide navigation
  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10s
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [heroSlides.length]);

  // Fetch all data
  useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [homeData, causesResponse] = await Promise.all([
          dataService.getHomePageData().catch(() => ({ events: [], announcements: [] })),
          apiService.getDonationCauses({ active: 'true' }).catch(() => ({ data: [] }))
        ]);

        if (isMounted) {
          setAnnouncements(homeData.announcements || []);
          setUpcomingEvents(homeData.events || []);

          const causes = causesResponse?.data || causesResponse || [];
          setDonationCauses(Array.isArray(causes) ? causes : []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        if (isMounted) {
          setAnnouncements([]);
          setUpcomingEvents([]);
          setDonationCauses([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    // Refresh data every 5 minutes (only if component is still mounted)
    intervalId = setInterval(() => {
      if (isMounted) {
        fetchData();
      }
    }, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // Fetch Iʿtikāf programs
  useEffect(() => {
    let isMounted = true;

    const fetchItikafPrograms = async () => {
      try {
        const programs = await dataService.getUpcomingItikafPrograms(3);
        if (isMounted) {
          setItikafPrograms(programs || []);
        }
      } catch (error) {
        // Silently handle rate limiting
        if (error.status !== 429) {
          console.error('Error fetching Iʿtikāf programs:', error);
        }
        if (isMounted) {
          setItikafPrograms([]);
        }
      }
    };

    fetchItikafPrograms();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentSlideData = heroSlides[currentSlide] || heroSlides[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background font-sans selection:bg-primary/20 w-full overflow-x-hidden">
      {/* Enhanced Hero Section */}
      <section
        className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden bg-primary"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Background Carousel - Seamless Continuous Slide */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div
            className="flex h-full"
            animate={{
              x: `-${(currentSlide / heroSlides.length) * 100}%`
            }}
            transition={{
              duration: 0.7,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{
              width: `${heroSlides.length * 100}%`
            }}
          >
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id || index}
                className="relative flex-shrink-0 h-full"
                style={{
                  width: `${100 / heroSlides.length}%`
                }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
                <div className="absolute inset-0 bg-primary/85 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent opacity-95" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-transparent to-primary/40" />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Content */}
        <div className="container container-padding relative z-20 text-white w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 max-w-7xl mx-auto">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`content-${currentSlide}`}
                className="max-w-3xl text-center lg:text-left flex-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{
                  duration: 0.6,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                {/* Dynamic Badge */}
                {currentSlideData?.badge && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-6 mx-auto lg:mx-0"
                  >
                    <span className={`w-2 h-2 rounded-full ${occasion === 'jumuah' ? 'bg-green-400 animate-pulse' : 'bg-accent'}`} />
                    <span className="text-sm font-semibold tracking-wide">{currentSlideData.badge}</span>
                  </motion.div>
                )}

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 drop-shadow-2xl text-white"
                >
                  {currentSlideData?.title || "Welcome to Teqwa"}
                  {currentSlideData?.titleHighlight && (
                    <>
                      <br />
                      <motion.span
                        className="text-accent drop-shadow-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      >
                        {currentSlideData.titleHighlight}
                      </motion.span>
                    </>
                  )}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="text-lg md:text-xl lg:text-2xl text-white/95 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed drop-shadow-md font-medium"
                >
                  {currentSlideData?.subtitle || "Join us in our daily prayers, educational programs, and community events."}
                </motion.p>

                {/* Khatib/Imam Info for Jumuah */}
                {currentSlideData?.khatib && currentSlideData.khatib.name && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="mb-6 flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 max-w-md mx-auto lg:mx-0"
                  >
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden border-2 border-white/30 relative">
                      {currentSlideData.khatib.photo ? (
                        <>
                          <img
                            src={currentSlideData.khatib.photo}
                            alt={currentSlideData.khatib.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Hide image and show icon fallback
                              e.target.style.display = 'none';
                              const iconFallback = e.target.nextElementSibling;
                              if (iconFallback) {
                                iconFallback.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="absolute inset-0 w-full h-full flex items-center justify-center hidden">
                            <FiUsers className="h-8 w-8 text-accent" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiUsers className="h-8 w-8 text-accent" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-white/80 mb-1">{t('home.todayKhutbahBy')}</p>
                      <p className="text-lg font-semibold text-white">{currentSlideData.khatib.name}</p>
                      {currentSlideData.khatib.title && (
                        <p className="text-sm text-white/70">{currentSlideData.khatib.title}</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Event/Campaign Specific Info */}
                {currentSlideData?.type === 'event' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="flex flex-wrap gap-4 mb-8 text-white/90"
                  >
                    {currentSlideData.date && (
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <FiCalendar className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {new Date(currentSlideData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                    {currentSlideData.time && (
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <FiClock className="h-4 w-4" />
                        <span className="text-sm font-medium">{currentSlideData.time}</span>
                      </div>
                    )}
                    {currentSlideData.location && (
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <FiMapPin className="h-4 w-4" />
                        <span className="text-sm font-medium">{currentSlideData.location}</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Campaign Progress */}
                {currentSlideData?.type === 'campaign' && currentSlideData.raised !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="mb-8 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white/90">{t('home.progress')}</span>
                      <span className="text-sm font-bold text-white">
                        {Math.round(((currentSlideData.raised || 0) / (currentSlideData.target || 1)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-accent to-accent/80 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(((currentSlideData.raised || 0) / (currentSlideData.target || 1)) * 100, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-white/80">
                      <span>{(currentSlideData.raised || 0).toLocaleString()} ETB {t('home.raised')}</span>
                      <span>{t('home.goal')}: {(currentSlideData.target || 0).toLocaleString()} ETB</span>
                    </div>
                  </motion.div>
                )}

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="flex flex-wrap justify-center lg:justify-start gap-4"
                >
                  {currentSlideData?.cta && (
                    <Button size="xl" className="bg-accent text-primary-900 hover:bg-accent/90 shadow-xl min-w-[180px] font-bold text-lg px-8 py-6 group">
                      <Link to={currentSlideData.cta.link} className="flex items-center gap-2">
                        {currentSlideData.cta.label}
                        {currentSlideData.cta.icon === 'arrow' && <FiArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                        {currentSlideData.cta.icon === 'calendar' && <FiCalendar className="h-5 w-5" />}
                        {currentSlideData.cta.icon === 'heart' && <FiHeart className="h-5 w-5" />}
                        {currentSlideData.cta.icon === 'users' && <FiUsers className="h-5 w-5" />}
                        {currentSlideData.cta.icon === 'book' && <FiBookOpen className="h-5 w-5" />}
                        {!currentSlideData.cta.icon && <FiArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                      </Link>
                    </Button>
                  )}
                  {currentSlideData?.secondaryCta && (
                    <Button size="xl" variant="outline" className="border-white/40 text-white hover:bg-white/20 backdrop-blur-sm min-w-[180px] font-semibold text-lg px-8 py-6">
                      {currentSlideData.secondaryCta.external ? (
                        <a
                          href={currentSlideData.secondaryCta.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          {currentSlideData.secondaryCta.label}
                          {currentSlideData.secondaryCta.icon === 'book' && <FiBookOpen className="h-5 w-5" />}
                        </a>
                      ) : (
                        <Link to={currentSlideData.secondaryCta.link} className="flex items-center gap-2">
                          {currentSlideData.secondaryCta.label}
                          {currentSlideData.secondaryCta.icon === 'book' && <FiBookOpen className="h-5 w-5" />}
                        </Link>
                      )}
                    </Button>
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Prayer Widget - Desktop */}
            <div className="hidden lg:block w-full max-w-md flex-shrink-0">
              <PrayerTimesWidget />
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        {heroSlides.length > 1 && (
          <>
            {/* Previous/Next Buttons - Modern Design - Hidden on mobile, visible on tablet+ */}
            <motion.button
              onClick={prevSlide}
              className="hidden sm:flex absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 p-3 md:p-4 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 text-white shadow-lg hover:shadow-xl group"
              aria-label="Previous slide"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiArrowRight className="h-5 w-5 md:h-6 md:w-6 rotate-180 group-hover:-translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              onClick={nextSlide}
              className="hidden sm:flex absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 p-3 md:p-4 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 text-white shadow-lg hover:shadow-xl group"
              aria-label="Next slide"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiArrowRight className="h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Slide Indicators with Progress */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3">
              <div className="flex gap-2.5">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className="relative group"
                    aria-label={`Go to slide ${idx + 1}`}
                  >
                    <div className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx
                      ? 'w-8 bg-white shadow-lg shadow-white/50'
                      : 'w-2 bg-white/50 hover:bg-white/80'
                      }`}>
                      {currentSlide === idx && (
                        <motion.div
                          className="h-full bg-white rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.1, ease: "linear" }}
                        />
                      )}
                    </div>
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white whitespace-nowrap bg-black/50 px-2 py-1 rounded">
                      {t('home.slide')} {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* Quick Links Section - Enhanced */}
      <section className="bg-gray-50 dark:bg-background py-16">
        <div className="container container-padding">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Mobile Prayer Widget */}
              <div className="lg:hidden mb-8">
                <PrayerTimesWidget className="mx-auto" />
              </div>

              {/* Donation Progress Widget - Mobile/Tablet */}
              <div className="lg:hidden mb-8">
                <DonationProgressWidget />
              </div>

              {/* Section Title */}
              <div className="flex flex-col items-center justify-center mb-12 text-center">
                <h2 className="text-3xl font-bold text-foreground mb-3">{t('home.quickActions')}</h2>
                <div className="h-1 w-20 bg-accent rounded-full mb-4" />
                <p className="text-muted-foreground text-lg">{t('home.accessServices')}</p>
              </div>

              {/* Quick Links Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6 items-stretch">
                {[
                  { title: t('nav.news'), icon: FiBookOpen, to: '/news', color: 'text-blue-500', bg: 'bg-blue-500/10', hoverBg: 'hover:bg-blue-500/20' },
                  { title: t('nav.educationalServices'), icon: FiBookOpen, to: '/education', color: 'text-green-500', bg: 'bg-green-500/10', hoverBg: 'hover:bg-green-500/20' },
                  { title: t('nav.events'), icon: FiCalendar, to: '/events', color: 'text-purple-500', bg: 'bg-purple-500/10', hoverBg: 'hover:bg-purple-500/20' },
                  { title: t('nav.donate'), icon: FiHeart, to: '/donate', color: 'text-red-500', bg: 'bg-red-500/10', hoverBg: 'hover:bg-red-500/20' },
                  { title: t('nav.islamicCalendar'), icon: FiMoon, to: '/islamic-calendar', color: 'text-indigo-500', bg: 'bg-indigo-500/10', hoverBg: 'hover:bg-indigo-500/20' },
                  { title: t('nav.qiblaDirection'), icon: FiCompass, to: '/qibla', color: 'text-emerald-500', bg: 'bg-emerald-500/10', hoverBg: 'hover:bg-emerald-500/20' },
                  { title: t('nav.services'), icon: FiGrid, to: '/services', color: 'text-orange-500', bg: 'bg-orange-500/10', hoverBg: 'hover:bg-orange-500/20' },
                  { title: t('nav.contact'), icon: FiMapPin, to: '/contact', color: 'text-teal-500', bg: 'bg-teal-500/10', hoverBg: 'hover:bg-teal-500/20' },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1, type: 'spring', stiffness: 300 }}
                    whileHover={{ y: -8, scale: 1.05 }}
                    className="h-full flex"
                  >
                    <Link to={item.to} className="block h-full w-full group">
                      <Card className="h-full w-full border-border/40 dark:border-border/60 group-hover:border-primary/50 dark:group-hover:border-primary/60 group-hover:shadow-xl transition-all duration-300 bg-card/80 dark:bg-card/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 lg:p-6 hover:bg-gradient-to-br hover:from-primary/5 hover:to-accent/5 dark:hover:from-primary/10 dark:hover:to-accent/10">
                        <div className={`p-3 sm:p-3.5 md:p-4 lg:p-4 rounded-2xl ${item.bg} ${item.color} mb-3 sm:mb-3.5 md:mb-4 lg:mb-4 group-hover:scale-110 transition-transform duration-300 ${item.hoverBg} flex-shrink-0 flex items-center justify-center w-fit mx-auto`}>
                          <item.icon className="h-6 w-6 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-7 lg:w-7" />
                        </div>
                        <span className="font-semibold text-sm sm:text-sm md:text-base lg:text-base text-foreground group-hover:text-primary transition-colors text-center leading-tight w-full block mt-auto">{item.title}</span>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Donation Progress & Stats Section - Desktop */}
      <section className="container container-padding mb-20 hidden lg:block">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <DonationProgressWidget />
            </div>
            <div className="lg:col-span-1">
              <PrayerTimesWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Iʿtikāf Section - Homepage with Image Cards */}
      <section className="relative py-20 mb-20 overflow-hidden">
        {/* Full Background */}
        <div className="absolute inset-0">
          <img src={mesjidBg} alt="Iʿtikāf Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/90" />
        </div>

        <div className="container container-padding relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold mb-6 border border-white/30 text-white">{t('home.itikafSection.badge')}</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-white">
                {t('home.itikafSection.title')} <span className="text-accent-300">{t('home.itikafSection.titleHighlight')}</span>
              </h2>
              <p className="text-lg md:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed">
                {t('home.itikafSection.description')}
              </p>
            </motion.div>

            {/* Three Image Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-8">
              {[
                {
                  image: itikafImage,
                  title: t('home.itikafSection.card1Title'),
                  description: t('home.itikafSection.card1Description')
                },
                {
                  image: itikafImage2,
                  title: t('home.itikafSection.card2Title'),
                  description: t('home.itikafSection.card2Description')
                },
                {
                  image: mesjidBg,
                  title: t('home.itikafSection.card3Title'),
                  description: t('home.itikafSection.card3Description')
                }
              ].map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <Card className="h-full overflow-hidden border-2 border-white/20 hover:border-emerald-300/50 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 bg-white dark:bg-slate-800/95 backdrop-blur-sm">
                    <div className="relative h-56 md:h-48 lg:h-56 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    </div>
                    <CardContent className="p-6 md:p-5 lg:p-6 text-center bg-gradient-to-b from-white to-emerald-50/30 dark:from-slate-800 dark:to-slate-800/80 backdrop-blur-md">
                      <h3 className="text-xl md:text-lg lg:text-xl font-bold mb-3 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">{card.title}</h3>
                      <p className="text-muted-foreground text-sm md:text-xs lg:text-sm leading-relaxed">{card.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Button asChild size="lg" className="bg-accent text-primary-900 hover:bg-accent/90 border-0 shadow-xl font-bold">
                <Link to="/itikaf" className="flex items-center gap-2">
                  {t('home.itikafSection.cta')}
                  <FiArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Futsal Section - Homepage with Image Cards */}
      <section className="relative py-20 mb-20 overflow-hidden">
        {/* Full Background */}
        <div className="absolute inset-0">
          <img src={futsalImage} alt="Futsal Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/90" />
        </div>

        <div className="container container-padding relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold mb-6 border border-white/30 text-white">{t('home.futsalSection.badge')}</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-white">
                {t('home.futsalSection.title')} <span className="text-accent-300">{t('home.futsalSection.titleHighlight')}</span>
              </h2>
              <p className="text-lg md:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed">
                {t('home.futsalSection.description')}
              </p>
            </motion.div>

            {/* Three Image Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-8">
              {[
                {
                  image: futsalImage1,
                  title: t('home.futsalSection.card1Title'),
                  description: t('home.futsalSection.card1Description')
                },
                {
                  image: futsalImage2,
                  title: t('home.futsalSection.card2Title'),
                  description: t('home.futsalSection.card2Description')
                },
                {
                  image: futsalImage3,
                  title: t('home.futsalSection.card3Title'),
                  description: t('home.futsalSection.card3Description')
                }
              ].map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <Card className="h-full overflow-hidden border-2 border-white/20 hover:border-emerald-300/50 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 bg-white dark:bg-slate-800/95 backdrop-blur-sm">
                    <div className="relative h-56 md:h-48 lg:h-56 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    </div>
                    <CardContent className="p-6 md:p-5 lg:p-6 text-center bg-gradient-to-b from-white to-emerald-50/30 dark:from-slate-800 dark:to-slate-800/80 backdrop-blur-md">
                      <h3 className="text-xl md:text-lg lg:text-xl font-bold mb-3 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">{card.title}</h3>
                      <p className="text-muted-foreground text-sm md:text-xs lg:text-sm leading-relaxed">{card.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Button asChild size="lg" className="bg-accent text-primary-900 hover:bg-accent/90 border-0 shadow-xl font-bold">
                <Link to="/futsal" className="flex items-center gap-2">
                  {t('home.futsalSection.cta')}
                  <FiArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section - Enhanced */}
      <section className="relative py-20 mb-20 overflow-hidden bg-gradient-to-br from-gray-50 via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="container container-padding relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-2 bg-primary/10 backdrop-blur-md rounded-full text-sm font-semibold mb-6 border border-primary/20 text-primary dark:bg-primary/20 dark:border-primary/30">
                {t('home.eventsSection.badge')}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-foreground">
                {t('home.eventsSection.title')} <span className="text-primary">{t('home.eventsSection.titleHighlight')}</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {t('home.eventsSection.description')}
              </p>
            </motion.div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    <Card className="h-full flex flex-col hover:shadow-2xl transition-all duration-300 border-border/60 hover:border-primary/50 group bg-card dark:bg-card/90 backdrop-blur-sm hover:bg-card dark:hover:bg-card/95">
                      {event.image && (
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          <LazyImage
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 bg-primary/90 dark:bg-primary/80 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/20 dark:border-white/30">
                              {t('home.eventsSection.upcoming')}
                            </span>
                          </div>
                        </div>
                      )}
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl md:text-2xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                          {event.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
                          <div className="flex items-center bg-primary/5 dark:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/10 dark:border-primary/20">
                            <FiCalendar className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                            <span className="font-medium">{event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD'}</span>
                          </div>
                          {event.time && (
                            <div className="flex items-center bg-primary/5 dark:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/10 dark:border-primary/20">
                              <FiClock className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                              <span className="font-medium">{event.time}</span>
                            </div>
                          )}
                        </div>
                        {event.location && (
                          <div className="flex items-center text-muted-foreground text-sm bg-accent/5 dark:bg-accent/10 px-3 py-1.5 rounded-lg border border-accent/10 dark:border-accent/20">
                            <FiMapPin className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                            <span className="line-clamp-1 font-medium">{event.location}</span>
                          </div>
                        )}
                        <p className="text-muted-foreground leading-relaxed line-clamp-3 text-sm md:text-base">
                          {event.description}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-4">
                        <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all shadow-sm group-hover:shadow-md dark:border-border dark:group-hover:border-primary">
                          <Link to={`/events/${event.id}`} className="flex items-center justify-center space-x-2">
                            <span>{t('home.eventsSection.learnMore')}</span>
                            <FiArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <FiCalendar className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">{t('home.eventsSection.noEvents')}</p>
                </motion.div>
              </div>
            )}

            <div className="text-center mt-12">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild variant="primary" size="lg" className="px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all">
                  <Link to="/events" className="flex items-center space-x-2">
                    <span>{t('home.eventsSection.viewAllEvents')}</span>
                    <FiCalendar className="h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section - Enhanced */}
      <section className="relative py-24 bg-primary text-white overflow-hidden">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-transparent to-transparent" />

        <div className="container container-padding relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold mb-6 border border-white/30 text-white">
                {t('home.communitySection.badge')}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-white">
                {t('home.communitySection.title')} <span className="text-accent-300">{t('home.communitySection.titleHighlight')}</span>
              </h2>
              <p className="text-lg md:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed">
                {t('home.communitySection.description')}
              </p>
            </motion.div>

            <div className="flex justify-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild className="bg-accent text-primary-900 hover:bg-accent/90 font-bold shadow-2xl text-lg px-10 py-6 border-0" size="xl">
                  <Link to="/membership" className="flex items-center space-x-3">
                    <FiUsers className="h-6 w-6" />
                    <span>{t('home.communitySection.becomeMember')}</span>
                    <FiArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Latest Announcements */}
            {announcements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="text-center mb-12">
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">{t('home.communitySection.latestAnnouncements')}</h3>
                  <p className="text-white/90 text-lg">{t('home.communitySection.stayUpdated')}</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {announcements.map((announcement, index) => (
                    <motion.div
                      key={announcement.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                    >
                      <Card className="h-full hover:shadow-2xl transition-all duration-300 border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/15 hover:border-white/30 group">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg md:text-xl font-semibold leading-tight text-white group-hover:text-accent-300 transition-colors">
                              {announcement.title}
                            </CardTitle>
                            <span className="text-xs text-white/80 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full whitespace-nowrap ml-2 flex-shrink-0 border border-white/30">
                              {new Date(announcement.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-white/90 leading-relaxed line-clamp-3 text-sm md:text-base">
                            {announcement.excerpt || announcement.content?.substring(0, 160)}
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button asChild variant="ghost" size="sm" className="w-full justify-start p-0 h-auto hover:bg-transparent text-white/90 hover:text-accent-300">
                            <Link to={`/announcements/${announcement.id}`} className="flex items-center space-x-2 group/link">
                              <span>{t('home.communitySection.readMore')}</span>
                              <FiArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
});

Home.displayName = 'Home';
export default Home;
