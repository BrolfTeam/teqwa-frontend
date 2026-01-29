import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiMapPin, FiUsers, FiStar, FiCheckCircle,
  FiInfo, FiArrowRight, FiRefreshCw, FiBookOpen, FiMoon, FiSun,
  FiHeart, FiCheck, FiX, FiActivity, FiShield, FiCoffee
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import IslamicPattern from '@/components/ui/IslamicPattern';
import { dataService } from '@/lib/dataService';
import { format, parseISO, isValid } from 'date-fns';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import mesjidBg from '@/assets/mesjid2.jpg';
import { useAuth } from '@/context/AuthContext';
import Hero from '@/components/ui/Hero';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';
import paymentService from '@/services/paymentService';

const Itikaf = memo(() => {
  const { t } = useTranslation();

  const safeFormatDate = (date, formatStr = 'MMM dd, yyyy') => {
    if (!date) return t('itikaf.dateTBD');
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
      if (isValid(dateObj)) {
        return format(dateObj, formatStr);
      }
      return t('itikaf.invalidDate');
    } catch (error) {
      return t('itikaf.dateTBD');
    }
  };
  const { isAuthenticated, logout } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const [registrationData, setRegistrationData] = useState({
    emergency_contact: '',
    emergency_phone: '',
    special_requirements: '',
    notes: ''
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('manual_qr');
  const [proofFile, setProofFile] = useState(null);

  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dataService.getItikafPrograms({ upcoming: true });
      const programsData = response?.data || response || [];
      setPrograms(Array.isArray(programsData) ? programsData : []);
    } catch (error) {
      // Silently handle rate limiting (429)
      if (error.status === 429) {
        console.warn('Rate limited, returning empty programs list');
        setPrograms([]);
      } else {
        console.error('Error fetching programs:', error);
        toast.error(t('itikaf.failedToLoadPrograms'));
        setPrograms([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyRegistrations = useCallback(async () => {
    if (!isAuthenticated) {
      setMyRegistrations([]);
      return;
    }

    try {
      const response = await dataService.getMyItikafRegistrations();
      const registrationsData = response?.data || response || [];
      setMyRegistrations(Array.isArray(registrationsData) ? registrationsData : []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      if (error.message && error.message.includes('401')) {
        logout();
      }
    }
  }, [isAuthenticated, logout]);

  const fetchSchedules = useCallback(async (programId) => {
    try {
      const response = await dataService.getItikafSchedules(programId);
      const schedulesData = response?.data || response || [];
      setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules([]);
    }
  }, []);

  const loadProgramDetails = useCallback(async (programId) => {
    try {
      const program = await dataService.getItikafProgram(programId);
      setSelectedProgram(program?.data || program);
      await fetchSchedules(programId);
    } catch (error) {
      console.error('Error loading program:', error);
      toast.error(t('itikaf.failedToLoadDetails'));
    }
  }, [fetchSchedules]);

  const handleRegister = useCallback(async (programId) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error(t('itikaf.pleaseLoginToRegister'));
      return;
    }

    // Validate Payment Proof if needed
    if (selectedProgram?.fee > 0 && paymentMethod === 'manual_qr' && !proofFile) {
      toast.error(t('payment.proofRequired'));
      return;
    }

    try {
      setRegistering(true);

      let response;
      const isPaid = selectedProgram?.fee > 0;

      if (isPaid && paymentMethod === 'manual_qr') {
        const formData = new FormData();
        Object.keys(registrationData).forEach(key => {
          formData.append(key, registrationData[key]);
        });
        formData.append('payment_method', 'manual_qr');
        formData.append('proof_image', proofFile);

        response = await dataService.registerForItikaf(programId, formData);
        toast.success(t('itikaf.registrationSubmitted'));
      } else {
        // Card or Free
        const payload = {
          ...registrationData,
          payment_method: isPaid ? 'card' : 'free' // backend should handle 'free' or default
        };
        response = await dataService.registerForItikaf(programId, payload);

        // Handle Payment redirection
        if (isPaid && paymentMethod === 'card' && response) {
          const regId = response.data?.id || response.id;
          if (regId) {
            try {
              const paymentResponse = await paymentService.initializePayment({
                amount: parseFloat(selectedProgram.fee),
                currency: 'ETB',
                email: 'user@example.com', // ideally get from user context
                first_name: registrationData.emergency_contact.split(' ')[0],
                last_name: '',
                phone_number: registrationData.emergency_phone,
                content_type_model: 'itikafregistration',
                object_id: regId
              });

              if (paymentResponse && paymentResponse.checkout_url) {
                toast.success(t('itikaf.registrationInitiated'));
                window.location.href = paymentResponse.checkout_url;
                return;
              }
            } catch (paymentError) {
              console.error('Payment initialization error:', paymentError);
              toast.error(t('itikaf.registrationSuccessPaymentFailed'));
            }
          }
        }
        if (!isPaid || paymentMethod !== 'card') {
          toast.success(response?.message || t('itikaf.successfullyRegistered'));
        }
      }

      setShowRegistrationForm(false);
      setRegistrationData({
        emergency_contact: '',
        emergency_phone: '',
        special_requirements: '',
        notes: ''
      });
      setProofFile(null);
      setPaymentMethod('card');

      await fetchPrograms();
      await fetchMyRegistrations();
    } catch (error) {
      const errorMessage = error?.message || t('itikaf.failedToRegister');
      toast.error(errorMessage);
    } finally {
      setRegistering(false);
    }
  }, [registrationData, fetchPrograms, fetchMyRegistrations, selectedProgram, paymentMethod, proofFile, t]);

  const isRegistered = useCallback((programId) => {
    return myRegistrations.some(reg =>
      reg.program === programId || reg.program?.id === programId
    );
  }, [myRegistrations]);

  useEffect(() => {
    fetchPrograms();
    fetchMyRegistrations();
  }, [fetchPrograms, fetchMyRegistrations]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <IslamicPattern className="opacity-5" color="currentColor" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-lg text-muted-foreground font-medium animate-pulse">{t('itikaf.loadingPrograms')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      {/* Hero Section */}
      <Hero
        title={t('itikaf.title')}
        titleHighlight={t('itikaf.spiritualRetreat')}
        description={t('itikaf.itikafSubtitle')}
        backgroundImage={mesjidBg}
        primaryAction={t('itikaf.findProgram')}
        onPrimaryActionClick={() => setActiveSection('programs')}
        secondaryAction={t('itikaf.learnMore')}
        onSecondaryActionClick={() => setActiveSection('about')}
      />

      {/* Navigation Dock */}
      <div className="sticky top-6 z-40 flex justify-center px-4 mb-12 pointer-events-none mt-8">
        <div className="bg-background/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-full p-1.5 pointer-events-auto flex items-center gap-1">
          {[
            { id: 'about', label: t('itikaf.aboutItikaf') },
            { id: 'programs', label: t('itikaf.programsRegistration') }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 ${activeSection === tab.id
                ? 'text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {activeSection === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-full shadow-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="container px-4 pb-24">
        <AnimatePresence mode="wait">
          {activeSection === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-20"
            >
              {/* Definition Section */}
              <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                <div className="space-y-6">
                  <div className="inline-flex bg-primary/10 text-primary p-3 rounded-2xl">
                    <FiMoon className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold">{t('itikaf.whatIsItikaf')}</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {t('itikaf.itikafDescription')}
                  </p>
                  <ul className="space-y-3">
                    {[
                      t('itikaf.sunnahOfProphet'),
                      t('itikaf.spiritualPurification'),
                      t('itikaf.seekingLaylatAlQadr'),
                      t('itikaf.strengtheningConnection')
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-foreground/80">
                        <FiCheckCircle className="text-primary w-5 h-5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Card className="bg-gradient-to-br from-primary/5 via-transparent to-accent/5 border-primary/10 p-2 overflow-hidden">
                  <div className="relative rounded-lg overflow-hidden h-full min-h-[300px]">
                    <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm flex items-center justify-center">
                      <IslamicPattern className="opacity-20 text-primary" />
                      <div className="text-center p-8">
                        <p className="text-2xl md:text-3xl font-arabic leading-loose mb-4">
                          وَلَا تُبَاشِرُوهُنَّ وَأَنتُمْ عَاكِفُونَ فِي الْمَسَاجِدِ
                        </p>
                        <p className="text-muted-foreground italic">
                          {t('itikaf.quranicVerseTranslation')}
                        </p>
                        <p className="text-sm font-medium mt-2 text-primary">{t('itikaf.quranicReference')}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Timing Cards */}
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">{t('itikaf.whenToPerform')}</h2>
                  <p className="text-muted-foreground">{t('itikaf.timingAndDuration')}</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: FiMoon,
                      title: t('itikaf.ramadanSunnah'),
                      desc: t('itikaf.ramadanSunnahDesc'),
                      color: "text-primary",
                      bg: "bg-primary/10"
                    },
                    {
                      icon: FiActivity,
                      title: t('itikaf.voluntaryNatafil'),
                      desc: t('itikaf.voluntaryNatafilDesc'),
                      color: "text-accent-foreground",
                      bg: "bg-accent/10"
                    },
                    {
                      icon: FiClock,
                      title: t('itikaf.duration'),
                      desc: t('itikaf.durationDesc'),
                      color: "text-secondary-foreground",
                      bg: "bg-secondary/10"
                    }
                  ].map((item, i) => (
                    <Card key={i} className="group hover:-translate-y-2 transition-transform duration-300 border-border/40">
                      <CardContent className="p-8 text-center pt-8">
                        <div className={`${item.bg} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                          <item.icon className={`w-8 h-8 ${item.color}`} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Why With Us Section (Refactored) */}
              <section className="container container-padding py-16 px-0 md:px-0">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">{t('itikaf.whyWithUs')}</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    {t('itikaf.whyWithUsDesc')}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: FiUsers, title: t('itikaf.scholarlyGuidance'), desc: t('itikaf.scholarlyGuidanceDesc') },
                    { icon: FiBookOpen, title: t('itikaf.structuredProgram'), desc: t('itikaf.structuredProgramDesc') },
                    { icon: FiCoffee, title: t('itikaf.mealsProvided'), desc: t('itikaf.mealsProvidedDesc') },
                    { icon: FiShield, title: t('itikaf.comfortSafety'), desc: t('itikaf.comfortSafetyDesc') }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="h-full border-primary/20 bg-background/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                            <feature.icon className="h-8 w-8" />
                          </div>
                          <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                          <p className="text-muted-foreground text-sm">{feature.desc}</p>

                          {/* Decorative background pattern */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none">
                            <IslamicPattern color="currentColor" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeSection === 'programs' && (
            <motion.div
              key="programs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-12"
            >
              {/* My Registrations */}
              {myRegistrations.length > 0 && (
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 md:p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FiCheckCircle className="text-primary" />
                    {t('itikaf.myRegistrations')}
                  </h3>
                  <div className="grid gap-4">
                    {(myRegistrations || []).map((registration, regIdx) => (
                      <div key={registration.id || registration.program_id || `registration-${regIdx}`} className="bg-background rounded-xl p-5 border border-border/50 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                        <div>
                          <h4 className="font-bold text-lg mb-1">{registration.program_title || t('itikaf.programTitleFallback')}</h4>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5 bg-muted px-2 py-0.5 rounded">
                              <FiCalendar className="w-3.5 h-3.5" />
                              {safeFormatDate(registration.program_start_date)}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${registration.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              registration.status === 'waitlisted' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                              }`}>
                              {t(`common.${registration.status}`)}
                            </span>
                          </div>
                        </div>
                        {registration.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => loadProgramDetails(registration.program?.id || registration.program)}
                          >
                            {t('itikaf.viewDetails')}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Programs */}
              <div>
                <h3 className="text-2xl font-bold mb-8">{t('itikaf.availablePrograms')}</h3>
                {programs.length === 0 ? (
                  <Card className="py-16 text-center bg-muted/20 border-border/60">
                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FiCalendar className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <h4 className="text-xl font-semibold mb-2">{t('itikaf.noUpcomingPrograms')}</h4>
                    <p className="text-muted-foreground">{t('itikaf.pleaseCheckBack')}</p>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(programs || []).map((program, progIdx) => (
                      <Card key={program.id || program.program_id || `program-${progIdx}`} hoverable className="h-full flex flex-col group overflow-hidden bg-white shadow-md border-border/40">
                        <div className="relative h-56 overflow-hidden">
                          {program.image ? (
                            <img
                              src={program.image}
                              alt={program.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                              <IslamicPattern className="opacity-10" />
                              <FiMoon className="w-16 h-16 text-primary/40" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h4 className="text-xl font-bold text-white mb-1 line-clamp-1">{program.title}</h4>
                            <div className="flex items-center gap-2 text-white/90 text-sm">
                              <FiMapPin className="w-3.5 h-3.5 text-accent" />
                              {program.location || t('itikaf.mainPrayerHall')}
                            </div>
                          </div>
                          {(program.is_full) && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                              {t('itikaf.full')}
                            </div>
                          )}
                        </div>
                        <CardContent className="flex-1 flex flex-col p-6">
                          <div className="flex items-center justify-between text-sm mb-6">
                            <span className="flex items-center gap-1.5 text-muted-foreground bg-muted/40 px-2 py-1 rounded">
                              <FiCalendar className="w-4 h-4 text-primary" />
                              {safeFormatDate(program.start_date)}
                            </span>
                            <span className={`font-semibold ${program.fee > 0 ? "text-foreground" : "text-primary/90"}`}>
                              {program.fee > 0 ? `${program.fee} ETB` : t('itikaf.freeRegistration')}
                            </span>
                          </div>

                          <p className="text-muted-foreground line-clamp-3 mb-6 text-sm leading-relaxed flex-1">
                            {program.short_description || t('itikaf.joinUsRetreat')}
                          </p>

                          <div className="mt-auto space-y-3">
                            <div className="flex items-center justify-end text-xs font-medium text-muted-foreground mb-1">
                              {program.participant_count} / {program.capacity} {t('itikaf.registered')}
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-primary h-full rounded-full"
                                style={{ width: `${Math.min((program.participant_count / program.capacity) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-6 pt-0 flex gap-2">
                          {/* Read More / View Details Action */}
                          <Button
                            className="flex-1"
                            variant="outline"
                            onClick={() => loadProgramDetails(program.id)}
                          >
                            {t('common.readMore')}
                          </Button>

                          {program.is_registration_open && !program.is_full && (
                            <Button
                              className="flex-1"
                              onClick={() => {
                                if (isRegistered(program.id)) {
                                  toast.info(t('itikaf.alreadyRegisteredToast'));
                                } else {
                                  setSelectedProgram(program);
                                  setShowRegistrationForm(true);
                                }
                              }}
                              variant={isRegistered(program.id) ? "secondary" : "primary"}
                            >
                              {isRegistered(program.id) ? t('itikaf.registered') : t('itikaf.registerNow')}
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Program Details Modal */}
      <AnimatePresence>
        {selectedProgram && !showRegistrationForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-background w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative"
            >
              <button
                onClick={() => setSelectedProgram(null)}
                className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors"
                aria-label={t('itikaf.close')}
              >
                <FiX className="w-5 h-5" />
              </button>

              <div className="relative h-56 md:h-64 flex-shrink-0">
                {selectedProgram.image ? (
                  <img
                    src={selectedProgram.image}
                    alt={selectedProgram.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <IslamicPattern className="opacity-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">{selectedProgram.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground/80">
                    <span className="flex items-center gap-1.5"><FiCalendar /> {format(new Date(selectedProgram.start_date), 'MMMM dd')} - {format(new Date(selectedProgram.end_date), 'MMMM dd, yyyy')}</span>
                    <span className="flex items-center gap-1.5"><FiMapPin /> {selectedProgram.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid md:grid-cols-3 gap-10">
                  <div className="md:col-span-2 space-y-8">
                    <div>
                      <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                        <FiInfo className="text-primary" /> {t('common.about')}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {selectedProgram.description}
                      </p>
                    </div>

                    {schedules.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                          <FiClock className="text-primary" /> {t('common.today')} {t('common.schedule')}
                        </h3>
                        <div className="relative border-l-2 border-primary/20 ml-3 space-y-8 pb-4">
                          {(schedules || []).map((schedule, idx) => (
                            <div key={schedule.id || `schedule-${idx}`} className="relative pl-8">
                              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                              <div className="mb-2">
                                <span className="text-sm font-semibold text-primary uppercase tracking-wider">{t('itikaf.day')} {schedule.day_number}</span>
                                <h4 className="text-lg font-bold">{safeFormatDate(schedule.date)}</h4>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-muted/20 p-4 rounded-lg border border-border/40">
                                {schedule.fajr_activity && <div className="flex gap-2"><span className="text-primary font-medium w-16">{t('itikaf.fajrActivity')}</span> <span>{schedule.fajr_activity}</span></div>}
                                {schedule.dhuhr_activity && <div className="flex gap-2"><span className="text-primary font-medium w-16">{t('itikaf.dhuhrActivity')}</span> <span>{schedule.dhuhr_activity}</span></div>}
                                {schedule.asr_activity && <div className="flex gap-2"><span className="text-primary font-medium w-16">{t('itikaf.asrActivity')}</span> <span>{schedule.asr_activity}</span></div>}
                                {schedule.maghrib_activity && <div className="flex gap-2"><span className="text-primary font-medium w-16">{t('itikaf.maghribActivity')}</span> <span>{schedule.maghrib_activity}</span></div>}
                                {schedule.isha_activity && <div className="flex gap-2"><span className="text-primary font-medium w-16">{t('itikaf.ishaActivity')}</span> <span>{schedule.isha_activity}</span></div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                      <h3 className="font-bold mb-4 flex items-center gap-2"><FiStar className="text-primary" /> {t('itikaf.details')}</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-border/50">
                          <span className="text-muted-foreground">{t('itikaf.capacity')}</span>
                          <span className="font-medium">{selectedProgram.capacity} {t('itikaf.people')}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border/50">
                          <span className="text-muted-foreground">{t('itikaf.registered')}</span>
                          <span className="font-medium">{selectedProgram.participant_count} {t('itikaf.people')}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border/50">
                          <span className="text-muted-foreground">{t('itikaf.registrationFee')}</span>
                          <span className="font-medium">{selectedProgram.fee > 0 ? `${selectedProgram.fee} ETB` : t('itikaf.freeRegistration')}</span>
                        </div>
                      </div>
                      {selectedProgram.is_registration_open && !selectedProgram.is_full ? (
                        <Button
                          className="w-full mt-6"
                          onClick={() => {
                            if (isRegistered(selectedProgram.id)) {
                              toast.info(t('itikaf.alreadyRegisteredToast'));
                            } else {
                              setShowRegistrationForm(true);
                            }
                          }}
                          disabled={isRegistered(selectedProgram.id)}
                          variant={isRegistered(selectedProgram.id) ? "outline" : "primary"}
                        >
                          {isRegistered(selectedProgram.id) ? t('itikaf.alreadyRegistered') : t('itikaf.registerNow')}
                        </Button>
                      ) : (
                        <Button className="w-full mt-6" disabled variant="outline">{t('itikaf.registrationClosed')}</Button>
                      )}
                    </div>

                    {selectedProgram.requirements && (
                      <div>
                        <h4 className="font-bold mb-2 flex items-center gap-2 text-sm"><FiCheckCircle className="text-primary" /> {t('itikaf.requirements')}</h4>
                        <div className="text-sm text-muted-foreground bg-muted/10 p-4 rounded-lg border border-border/50">
                          {selectedProgram.requirements}
                        </div>
                      </div>
                    )}

                    {selectedProgram.what_to_bring && (
                      <div>
                        <h4 className="font-bold mb-2 flex items-center gap-2 text-sm"><FiBookOpen className="text-primary" /> {t('itikaf.whatToBring')}</h4>
                        <div className="text-sm text-muted-foreground bg-muted/10 p-4 rounded-lg border border-border/50">
                          {selectedProgram.what_to_bring}
                        </div>
                      </div>
                    )}
                  </div>


                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Modal */}
      <AnimatePresence>
        {showRegistrationForm && selectedProgram && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-background w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/10">
                <h3 className="font-bold text-xl">{t('itikaf.registerForItikaf')} {selectedProgram.title}</h3>
                <button onClick={() => setShowRegistrationForm(false)} className="text-muted-foreground hover:text-foreground">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t('itikaf.emergencyContact')} <span className="text-red-500">*</span></label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder={t('contact.fullName')}
                      value={registrationData.emergency_contact}
                      onChange={(e) => setRegistrationData({ ...registrationData, emergency_contact: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t('itikaf.emergencyPhone')} <span className="text-red-500">*</span></label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder={t('itikaf.phonePlaceholder')}
                      value={registrationData.emergency_phone}
                      onChange={(e) => setRegistrationData({ ...registrationData, emergency_phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t('itikaf.specialRequirements')}</label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder={t('itikaf.specialRequirements')}
                      value={registrationData.special_requirements}
                      onChange={(e) => setRegistrationData({ ...registrationData, special_requirements: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t('itikaf.notes')}</label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder={t('itikaf.notes')}
                      value={registrationData.notes}
                      onChange={(e) => setRegistrationData({ ...registrationData, notes: e.target.value })}
                    />
                  </div>
                </div>

                {selectedProgram?.fee > 0 && (
                  <div className="pt-4 border-t border-border/50 mt-4">
                    <PaymentMethodSelector
                      selectedMethod={paymentMethod}
                      onMethodChange={(method) => {
                        setPaymentMethod(method);
                        if (method !== 'manual_qr') setProofFile(null);
                      }}
                      onFileChange={setProofFile}
                      amount={parseFloat(selectedProgram.fee)}
                    />
                  </div>
                )}
              </div>
              <div className="p-6 pt-0 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowRegistrationForm(false)}>{t('common.cancel')}</Button>
                <Button
                  className="flex-1"
                  onClick={() => handleRegister(selectedProgram.id)}
                  disabled={!registrationData.emergency_contact || !registrationData.emergency_phone || registering}
                  isLoading={registering}
                >
                  {t('itikaf.completeRegistration')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
});

Itikaf.displayName = 'Itikaf';
export default Itikaf;