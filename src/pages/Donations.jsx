import { useState, memo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiDollarSign, FiCreditCard, FiCheck, FiUsers, FiHome, FiBook, FiSun, FiCheckCircle, FiShield, FiChevronDown, FiInfo } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Hero from '@/components/ui/Hero';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/lib/apiService';
import paymentService from '@/services/paymentService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import IslamicPattern from '@/components/ui/IslamicPattern';
import { DONATION_AMOUNTS } from '@/config/constants';
import { API_URL } from '@/config/env';



const donationAmounts = DONATION_AMOUNTS;

const Donations = memo(() => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const causeParam = searchParams.get('cause');
  const [activeTab, setActiveTab] = useState('overview');
  const [donationCategories, setDonationCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: '',
    anonymous: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Fetch donation causes from API
  useEffect(() => {
    const fetchDonationCauses = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDonationCauses();
        const causes = response.data || [];

        // Map API data to component format
        const mappedCategories = causes.map(cause => ({
          id: cause.id,
          title: cause.name || cause.title,
          description: cause.description,
          // Image can be a URL, data URL, or null - backend handles conversion
          image: cause.image || null,
          icon: getIconForCategory(cause.category || cause.name || cause.title),
          color: 'primary',
          target_amount: cause.target_amount,
          raised_amount: cause.raised_amount,
          progress_percentage: cause.progress_percentage,
        }));

        setDonationCategories(mappedCategories);
        if (mappedCategories.length > 0) {
          // Pre-select cause from URL parameter if provided, otherwise use first category
          const causeIdFromUrl = causeParam ? parseInt(causeParam, 10) : null;
          const matchingCause = causeIdFromUrl 
            ? mappedCategories.find(cat => cat.id === causeIdFromUrl)
            : null;
          setSelectedCategory(matchingCause ? matchingCause.id : mappedCategories[0].id);
        }
      } catch (error) {
        // Silently handle rate limiting (429)
        if (error.status === 429) {
          console.warn('Rate limited, returning empty donation causes');
          setDonationCategories([]);
        } else {
          console.error('Failed to fetch donation causes:', error);
          toast.error(t('donations.failedToLoadCauses'));
          setDonationCategories([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDonationCauses();
  }, [causeParam]);

  // Helper function to get icon based on category
  const getIconForCategory = (category) => {
    const categoryLower = (category || '').toLowerCase();
    if (categoryLower.includes('education')) return <FiBook className="h-6 w-6" />;
    if (categoryLower.includes('maintenance') || categoryLower.includes('facility')) return <FiHome className="h-6 w-6" />;
    if (categoryLower.includes('community')) return <FiUsers className="h-6 w-6" />;
    return <FiHeart className="h-6 w-6" />;
  };

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomAmount = (value) => {
    setCustomAmount(value);
    setIsCustom(true);
    setSelectedAmount(0);
  };

  const handleHeroAction = (tab) => {
    setActiveTab(tab);
    const element = document.getElementById('donation-tabs');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDonate = async () => {
    const amount = isCustom ? parseFloat(customAmount) : selectedAmount;

    if (!amount || amount < 1) {
      toast.error(t('donations.pleaseEnterAmount'));
      return;
    }

    if (!selectedCategory) {
      toast.error(t('donations.pleaseSelectCategory'));
      return;
    }

    if (!isAuthenticated && (!donorInfo.name || !donorInfo.email)) {
      toast.error(t('donations.pleaseFillContact'));
      return;
    }

    setIsProcessing(true);

    try {
      const donorName = isAuthenticated
        ? (user.name || [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username)
        : donorInfo.name;

      const donationData = {
        amount,
        cause: parseInt(selectedCategory, 10),
        method: 'card',
        message: `${t('donations.donation')} for ${donationCategories.find(c => c.id == selectedCategory)?.title || t('donations.generalFund')}`,
        donor_name: donorName,
        email: isAuthenticated ? user.email : donorInfo.email,
        phone: isAuthenticated ? (user.phone || '') : donorInfo.phone,
        anonymous: isAuthenticated ? false : donorInfo.anonymous
      };
      const response = await apiService.createDonation(donationData);

      // Initialize Payment
      if (response && response.data) {
        const donation = response.data;

        try {
          const nameParts = donorName.trim().split(' ');
          const firstName = nameParts[0];
          // Chapa/Backend requires last_name. Use '-' if no last name is available.
          const lastName = nameParts.slice(1).join(' ') || '-';

          const paymentPayload = {
            amount: amount,
            currency: 'ETB', // Default currency
            email: isAuthenticated ? user.email : donorInfo.email,
            first_name: isAuthenticated ? user.first_name || firstName : firstName,
            last_name: isAuthenticated ? user.last_name || lastName : lastName,
            content_type_model: 'donation',
            object_id: donation.id
          };

          const paymentResponse = await paymentService.initializePayment(paymentPayload);

          if (paymentResponse && paymentResponse.checkout_url) {
            toast.success(t('donations.redirectingToPayment'));
            window.location.href = paymentResponse.checkout_url;
            return; // Stop further execution as we redirect
          }
        } catch (paymentError) {
          console.error('Payment initialization error:', paymentError);
          toast.error(t('donations.donationRecordedPaymentFailed'));
        }
      }

      toast.success(t('donations.thankYouDonation', { amount }));

      // Dispatch event to refresh dashboard (only if donation was created successfully)
      // Note: For completed donations, we'll rely on payment success callback
      if (response?.data?.status === 'completed') {
        window.dispatchEvent(new CustomEvent('custom:data-change', { detail: { type: 'donation:completed' } }));
      } else {
        window.dispatchEvent(new CustomEvent('custom:data-change', { detail: { type: 'donation:created' } }));
      }

      // Reset form
      setSelectedAmount(100);
      setCustomAmount('');
      setIsCustom(false);
      if (!isAuthenticated) {
        setDonorInfo({ name: '', email: '', phone: '', anonymous: false });
      }
    } catch (error) {
      console.error('Donation failed:', error);
      let errorMsg = t('donations.paymentFailed');
      if (error.data) {
        // Format validation errors nicely
        const validations = Object.entries(error.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ');
        if (validations) errorMsg = `${t('donations.validationError')}: ${validations}`;
      }
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const finalAmount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount;

  return (
    <div className="space-y-0 pb-16 min-h-screen bg-background font-sans selection:bg-primary/20">
      <Hero
        title={t('donations.supportCommunity')}
        subtitle={t('donations.donationSubtitle')}
        backgroundImage="/assets/mesjid2.jpg"
        actions={[
          {
            label: t('donations.makeDonation'),
            onClick: () => handleHeroAction('donate'),
            variant: 'primary',
          },
          {
            label: t('donations.viewCauses'),
            onClick: () => handleHeroAction('causes'),
            variant: 'secondary',
          },
        ]}
      />

      {/* Navigation Dock */}
      <div id="donation-tabs" className="sticky top-6 z-40 flex justify-center px-4 mb-12 mt-8 pointer-events-none">
        <div className="bg-background/80 backdrop-blur-lg border border-border/50 shadow-lg rounded-full p-1.5 pointer-events-auto flex items-center gap-1">
          {[
            { id: 'overview', label: t('common.view') },
            { id: 'causes', label: t('donations.activeCampaigns') },
            { id: 'donate', label: t('donations.donateNow') }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 ${activeTab === tab.id
                ? 'text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {activeTab === tab.id && (
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

      <div className="container px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-24"
            >
              {/* Virtues of Charity Section */}
              <section className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <div className="inline-flex bg-primary/10 text-primary p-3 rounded-2xl">
                      <FiSun className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold">{t('donations.powerOfSadaqah')}</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {t('donations.sadaqahDescription')}
                    </p>
                    <ul className="space-y-3">
                      {[
                        t('donations.purifiesWealth'),
                        t('donations.extinguishesSins'),
                        t('donations.providesShade'),
                        t('donations.supportsNeedy')
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-foreground/80">
                          <FiCheckCircle className="text-primary w-5 h-5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Card className="bg-gradient-to-br from-primary/5 via-transparent to-accent/5 border-primary/10 p-2 overflow-hidden h-full">
                    <div className="relative rounded-lg overflow-hidden h-full min-h-[300px] flex items-center justify-center p-8">
                      <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm" />
                      <IslamicPattern className="opacity-20 text-primary" />
                      <div className="relative z-10 text-center">
                        <p className="text-2xl md:text-3xl font-arabic leading-loose mb-6">
                          مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ فِي كُلِّ سُنبُلَةٍ مِّائَةُ حَبَّةٍ
                        </p>
                        <p className="text-muted-foreground italic mb-4">
                          {t('donations.quranicVerseTranslation')}
                        </p>
                        <p className="text-sm font-bold text-primary">{t('donations.quranicReference')}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </section>

              {/* Why Contribute Section */}
              <section className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">{t('donations.whyContribute')}</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    {t('donations.whyContributeDesc')}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: FiShield, title: t('donations.hundredPercentSecure'), desc: t('donations.hundredPercentSecureDesc') },
                    { icon: FiCheckCircle, title: t('donations.transparent'), desc: t('donations.transparentDesc') },
                    { icon: FiHeart, title: t('donations.zakatEligible'), desc: t('donations.zakatEligibleDesc') },
                    { icon: FiUsers, title: t('donations.localImpact'), desc: t('donations.localImpactDesc') }
                  ].map((feature, index) => (
                    <Card key={index} className="text-center hover:bg-muted/50 transition-colors" hoverable>
                      <CardHeader>
                        <div className="mx-auto mb-3 p-4 rounded-xl bg-accent/10 text-accent-foreground w-16 h-16 flex items-center justify-center">
                          <feature.icon className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Impact Section */}
              <section className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-8">{t('donations.howDonationsHelp')}</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      title: t('donations.educationSupport'),
                      description: t('donations.educationSupportDesc'),
                      icon: FiBook
                    },
                    {
                      title: t('donations.communitySupport'),
                      description: t('donations.communitySupportDesc'),
                      icon: FiUsers
                    },
                    {
                      title: t('donations.maintenanceSupport'),
                      description: t('donations.maintenanceSupportDesc'),
                      icon: FiHome
                    },
                  ].map((item, index) => (
                    <Card key={index} className="text-center group hover:bg-muted/50 transition-colors" hoverable>
                      <CardHeader>
                        <div className="mx-auto mb-3 p-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                          <item.icon className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-xl font-bold text-foreground">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'causes' && (
            <motion.div
              key="causes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-6xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-center mb-8">{t('donations.chooseYourCause')}</h2>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="relative">
                    <IslamicPattern className="animate-spin-slow opacity-20 text-primary w-24 h-24" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                  </div>
                  <p className="mt-4 text-muted-foreground animate-pulse">{t('donations.loadingCauses')}</p>
                </div>
              ) : donationCategories.length === 0 ? (
                <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border">
                  <FiHeart className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">{t('donations.noActiveCauses')}</h3>
                  <p className="text-muted-foreground">{t('donations.noActiveCausesDesc')}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t('donations.generalDonationAvailable')}</p>
                  <Button variant="link" onClick={() => setActiveTab('donate')} className="mt-4">
                    {t('donations.goToDonationForm')}
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {donationCategories.map((category) => (
                    <Card
                      key={category.id}
                      hoverable
                      className={`cursor-pointer transition-all duration-300 h-full flex flex-col overflow-hidden ${selectedCategory === category.id
                        ? 'ring-2 ring-primary shadow-lg scale-[1.02]'
                        : ''
                        }`}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setActiveTab('donate');
                        setTimeout(() => {
                          const form = document.getElementById('donate-form');
                          if (form) form.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                    >
                      {/* Image Section */}
                      {category.image ? (
                        <div className="relative h-48 w-full overflow-hidden bg-muted">
                          <img
                            src={category.image}
                            alt={category.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              // Silently hide image and show fallback
                              e.target.style.display = 'none';
                              const fallback = e.target.parentElement?.querySelector('.image-fallback');
                              if (fallback) {
                                fallback.style.display = 'flex';
                              }
                            }}
                            onLoad={(e) => {
                              // Ensure image is visible on successful load
                              e.target.style.display = 'block';
                              const fallback = e.target.parentElement?.querySelector('.image-fallback');
                              if (fallback) {
                                fallback.style.display = 'none';
                              }
                            }}
                          />
                          {/* Fallback icon when image fails to load */}
                          <div className="image-fallback hidden absolute inset-0 items-center justify-center bg-primary/10">
                            <div className="p-4 rounded-full bg-primary/20 text-primary">
                              {category.icon}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 w-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                          <div className="p-4 rounded-full bg-primary/20 text-primary">
                            {category.icon}
                          </div>
                        </div>
                      )}
                      
                      <CardHeader className="text-center pb-4 pt-6">
                        <CardTitle className="text-lg leading-tight">{category.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground text-center line-clamp-3 mb-4">
                          {category.description}
                        </p>
                        
                        {/* Progress Bar (if target_amount exists) */}
                        {category.target_amount && category.target_amount > 0 && (
                          <div className="mb-4">
                            <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                              <span>
                                {parseFloat(category.raised_amount || 0).toLocaleString()} ETB {t('donations.raised')}
                              </span>
                              <span>
                                {parseFloat(category.progress_percentage || 0).toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-primary h-full transition-all duration-300"
                                style={{ width: `${Math.min(parseFloat(category.progress_percentage || 0), 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 text-center">
                              {t('donations.goal')}: {parseFloat(category.target_amount).toLocaleString()} ETB
                            </p>
                          </div>
                        )}
                        
                        <Button variant="ghost" className="w-full mt-4 text-primary hover:text-primary/80 group-hover:underline">
                          {t('donations.donateNow')}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'donate' && (
            <motion.div
              key="donate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
              id="donate-form"
            >
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Donation Form */}
                <div className="lg:col-span-2">
                  <Card className="shadow-xl border-border/50 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/20 rounded-xl p-3">
                          <FiHeart className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold">{t('donations.makeDonation')}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{t('donations.supportCommunitySubtitle')}</p>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6 space-y-8">
                      {/* Amount Selection */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-base font-semibold text-foreground">{t('donations.selectAmount')}</label>
                          <span className="text-xs text-muted-foreground">{t('donations.customAmount')}</span>
                        </div>
                        
                        {/* Quick Amount Buttons */}
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                          {donationAmounts.map((amount) => (
                            <motion.button
                              key={amount}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAmountSelect(amount)}
                              className={`
                                relative px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200
                                border-2
                                ${selectedAmount === amount && !isCustom
                                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                                  : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-primary/5'
                                }
                              `}
                            >
                              {selectedAmount === amount && !isCustom && (
                                <motion.div
                                  layoutId="selectedAmount"
                                  className="absolute inset-0 bg-primary rounded-xl"
                                  initial={false}
                                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                />
                              )}
                              <span className="relative z-10">{amount}</span>
                            </motion.button>
                          ))}
                        </div>
                        
                        {/* Custom Amount Input */}
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground group-focus-within:text-primary transition-colors">
                            <FiDollarSign className="w-5 h-5" />
                            <span className="text-sm font-medium">ETB</span>
                          </div>
                          <input
                            type="number"
                            placeholder={t('donations.enterCustomAmount')}
                            value={customAmount}
                            onChange={(e) => handleCustomAmount(e.target.value)}
                            onFocus={() => setIsCustom(true)}
                            className={`
                              w-full pl-20 pr-4 py-4 rounded-xl border-2 transition-all duration-200
                              bg-background text-foreground placeholder:text-muted-foreground
                              focus:ring-2 focus:ring-primary/20 focus:border-primary
                              ${isCustom && customAmount ? 'border-primary bg-primary/5' : 'border-border'}
                            `}
                            min="1"
                            step="1"
                          />
                          {isCustom && customAmount && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                              <FiCheckCircle className="w-5 h-5 text-primary" />
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Category Selection */}
                      <div className="space-y-3">
                        <label className="text-base font-semibold text-foreground">{t('donations.viewCauses')}</label>
                        <div className="relative">
                          <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-4 rounded-xl border-2 border-border bg-background text-foreground appearance-none cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
                          >
                            <option value="">{t('donations.activeCampaigns')}</option>
                            {donationCategories.map(c => (
                              <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <FiChevronDown className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </div>
                      </div>

                      {/* Donor Information */}
                      {!isAuthenticated && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-4 pt-4 border-t border-border/50"
                        >
                          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <FiUsers className="w-5 h-5 text-primary" />
                            {t('contact.sendUsMessage')}
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder={t('donations.fullName')}
                                value={donorInfo.name}
                                onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                                className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <input
                                type="email"
                                placeholder={t('donations.emailAddress')}
                                value={donorInfo.email}
                                onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                                className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <input
                              type="tel"
                              placeholder={t('donations.phoneNumber')}
                              value={donorInfo.phone}
                              onChange={(e) => setDonorInfo({ ...donorInfo, phone: e.target.value })}
                              className="w-full px-4 py-3.5 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          </div>
                          <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all duration-200 group">
                            <input
                              type="checkbox"
                              checked={donorInfo.anonymous}
                              onChange={(e) => setDonorInfo({ ...donorInfo, anonymous: e.target.checked })}
                              className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-foreground block">{t('donations.anonymous')}</span>
                              <span className="text-xs text-muted-foreground">{t('donations.anonymous')}</span>
                            </div>
                            <FiShield className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </label>
                        </motion.div>
                      )}

                      {/* Donate Button */}
                      <div className="pt-4 space-y-3">
                        <Button
                          onClick={handleDonate}
                          disabled={isProcessing || finalAmount < 1}
                          variant="primary"
                          size="xl"
                          className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
                        >
                          {isProcessing ? (
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>{t('donations.processing')}</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-3">
                              <FiCreditCard className="w-6 h-6" />
                              <span>{t('donations.donate')} {finalAmount} ETB</span>
                            </div>
                          )}
                        </Button>
                        
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <FiShield className="w-4 h-4" />
                          <span>{t('donations.securePaymentChapa')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Donation Summary Sidebar */}
                <div className="lg:col-span-1">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="sticky top-24 shadow-xl border-border/50 bg-gradient-to-br from-muted/30 to-background">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <FiCheckCircle className="w-5 h-5 text-primary" />
                          Donation Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Amount Display */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{t('donations.donationAmount')}</span>
                          </div>
                          <div className="text-3xl font-bold text-primary">
                            {finalAmount > 0 ? `${finalAmount}` : '0'} <span className="text-lg text-muted-foreground">ETB</span>
                          </div>
                        </div>

                        {/* Category Display */}
                        <div className="space-y-2 pt-4 border-t border-border/50">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t('donations.cause')}</span>
                            <span className="font-semibold text-foreground">
                              {donationCategories.find(c => c.id == selectedCategory)?.title || t('donations.generalFund')}
                            </span>
                          </div>
                        </div>

                        {/* Benefits List */}
                        <div className="pt-4 border-t border-border/50 space-y-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('donations.whatYouSupporting')}</p>
                          <ul className="space-y-2">
                            {[
                              t('donations.communityPrograms'),
                              t('donations.educationalServices'),
                              t('donations.facilityMaintenance'),
                              t('donations.worshipActivities')
                            ].map((item, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm text-foreground/80">
                                <FiCheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Info Box */}
                        <div className="pt-4 border-t border-border/50 bg-primary/5 rounded-xl p-4 space-y-2">
                          <div className="flex items-start gap-2">
                            <FiInfo className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-foreground">{t('donations.taxReceipt')}</p>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {t('donations.taxReceiptDesc')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

Donations.displayName = 'Donations';
export default Donations;