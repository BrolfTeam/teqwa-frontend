/**
 * Hero Section Content Configuration
 * Easy to update and manage all hero slide content
 */

import mesjidBg from '@/assets/mesjid2.jpg';
import headerBg from '@/assets/background.png';
import jumeaImage from '@/assets/jumea.jpg';
import futsalImage from '@/assets/futsal4.jpg';

import itikafImage from '@/assets/metakif.jpg';
import itikafImage2 from '@/assets/mutakif1.jpg';
import { isRamadan as checkRamadan, getStoredHijriAdjustment } from '@/utils/hijriUtils';

// Helper function to check if today is Friday (Jumu'ah)
export const isJumuah = () => {
  const today = new Date();
  return today.getDay() === 5; // Friday is day 5 (0 = Sunday, 5 = Friday)
};

// Get Jumuah khatib/imam info (can be fetched from API or localStorage)
export const getJumuahKhatib = () => {
  try {
    const stored = localStorage.getItem('jumuah_khatib');
    if (stored) {
      const khatib = JSON.parse(stored);
      // Return khatib info with photo/avatar support
      return {
        name: khatib.name || '',
        title: khatib.title || '',
        photo: khatib.photo || null // Profile photo URL or base64
      };
    }
  } catch (e) {
    console.error('Error reading khatib info:', e);
  }
  return null; // Default: no khatib info
};

// Helper function to check if it's Ramadan
export const isRamadan = () => {
  const adjustment = getStoredHijriAdjustment();
  return checkRamadan(new Date(), adjustment);
};

// Default hero slides - now a function that accepts translation function
export const getDefaultHeroSlides = (t) => [
  {
    id: 'welcome',
    type: 'default',
    image: mesjidBg,
    alt: "Mosque Interior",
    badge: t('hero.welcomeToTeqwa'),
    title: t('hero.experienceBeauty'),
    titleHighlight: t('hero.islamicCommunity'),
    subtitle: t('hero.joinUsSubtitle'),
    cta: { label: t('hero.explorePrograms'), link: "/events", icon: "arrow" },
    secondaryCta: { label: t('hero.aboutUs'), link: "/about" },
    priority: 1
  },
  {
    id: 'community',
    type: 'default',
    image: headerBg,
    alt: "Community Gathering",
    badge: t('hero.mujeaAtTekwa'),
    title: t('hero.buildingStrong'),
    titleHighlight: t('hero.faithCommunity'),
    subtitle: t('hero.togetherWeGrow'),
    cta: { label: t('common.joinUs'), link: "/membership", icon: "users" },
    secondaryCta: { label: t('common.learnMore'), link: "/about" },
    priority: 2
  }
];

// Jumu'ah (Friday) specific slides - Dynamic with khatib info
export const getJumuahSlides = (t) => {
  const khatibInfo = getJumuahKhatib();
  const subtitle = khatibInfo
    ? t('hero.todayKhutbah', { name: khatibInfo.name || 'Imam' })
    : t('hero.jumuahSubtitle');

  return [
    {
      id: 'jumuah',
      type: 'occasion',
      image: jumeaImage,
      alt: "Jumu'ah Prayer",
      badge: t('hero.blessedFriday'),
      title: t('hero.bestDayIs'),
      titleHighlight: t('hero.friday'),
      subtitle: subtitle,
      cta: { label: t('hero.prayerTimes'), link: "/prayer-times", icon: "calendar" },
      secondaryCta: {
        label: t('hero.readSurahKahf'),
        link: "https://quran.com/18",
        external: true,
        icon: "book"
      },
      khatib: khatibInfo,
      priority: 10, // High priority for special days
      occasion: 'jumuah'
    }
  ];
};

// Ramadan specific slides - now a function
export const getRamadanSlides = (t, siteConfig = null) => {
  const taraweehImams = siteConfig?.taraweeh_imams || [];
  const imamsText = taraweehImams.length > 0
    ? `Taraweeh imams: ${taraweehImams.join(', ')}`
    : "Join us for Taraweeh prayers and community iftars.";

  return [
    {
      id: 'ramadan',
      type: 'occasion',
      image: headerBg,
      alt: "Ramadan Kareem",
      badge: "Ramadan Kareem",
      title: "Welcome to the Month of",
      titleHighlight: "Mercy & Quran",
      subtitle: `May Allah accept our fasting, prayers, and charity in this blessed month. ${imamsText}`,
      cta: { label: t('prayer.prayerTimes'), link: "/prayer-times", icon: "calendar" },
      secondaryCta: { label: t('events.title'), link: "/events" },
      priority: 10,
      occasion: 'ramadan'
    },
    {
      id: 'itikaf-ramadan',
      type: 'itikaf',
      image: itikafImage2,
      alt: "I'tikaf Program",
      badge: t('itikaf.ramadanSpecial'),
      title: t('itikaf.experienceSpiritual'),
      titleHighlight: t('itikaf.itikafRetreat'),
      subtitle: t('itikaf.ramadanItikafSubtitle'),
      cta: { label: t('itikaf.registerForItikaf'), link: "/itikaf", icon: "book" },
      secondaryCta: { label: t('common.learnMore'), link: "/itikaf" },
      priority: 9,
      occasion: 'ramadan'
    }
  ];
};

// Service-specific slides - now a function
export const getServiceSlides = (t) => [
  {
    id: 'donation',
    type: 'donation',
    image: headerBg,
    alt: "Support Our Community",
    badge: "Make a Difference",
    title: t('donations.supportCommunity').split(' ').slice(0, 2).join(' '),
    titleHighlight: t('donations.supportCommunity').split(' ').slice(2).join(' '),
    subtitle: t('donations.donationSubtitle'),
    cta: { label: t('donations.donateNow'), link: "/donations", icon: "heart" },
    secondaryCta: { label: t('donations.viewCauses'), link: "/donations" },
    priority: 5
  },
  {
    id: 'booking',
    type: 'booking',
    image: futsalImage,
    alt: "Futsal Booking",
    badge: t('futsal.bookYourSlot'),
    title: t('futsal.bookYourSlot'),
    titleHighlight: t('futsal.futsalCourt'),
    subtitle: t('futsal.bookSubtitle'),
    cta: { label: t('futsal.bookNow'), link: "/futsal", icon: "calendar" },
    secondaryCta: { label: t('futsal.viewSchedule'), link: "/futsal" },
    priority: 4
  },
  {
    id: 'itikaf',
    type: 'itikaf',
    image: itikafImage,
    alt: "I'tikaf Program",
    badge: t('itikaf.spiritualRetreat'),
    title: t('itikaf.joinItikaf'),
    titleHighlight: t('itikaf.itikafProgram'),
    subtitle: t('itikaf.itikafSubtitle'),
    cta: { label: t('itikaf.registerNow'), link: "/itikaf", icon: "book" },
    secondaryCta: { label: t('common.learnMore'), link: "/itikaf" },
    priority: 6
  }
];

/**
 * Get hero slides based on current date and dynamic content
 * @param {Array} events - Featured events from API
 * @param {Array} campaigns - Active donation campaigns from API
 * @param {Function} t - Translation function from i18next
 * @param {Object} siteConfig - Site configuration from API
 * @returns {Array} Array of hero slides
 */
export const getHeroSlides = (events = [], campaigns = [], t, siteConfig = null) => {
  const slides = [];

  // Add occasion-specific slides first (highest priority)
  if (isJumuah()) {
    slides.push(...getJumuahSlides(t));
  }

  if (isRamadan()) {
    slides.push(...getRamadanSlides(t, siteConfig));
  }

  // Add featured events as slides
  const eventSlides = events
    .filter(e => e.featured)
    .slice(0, 2)
    .map(event => ({
      id: `event-${event.id}`,
      type: 'event',
      image: event.image || mesjidBg,
      alt: event.title,
      badge: t('events.upcomingEvents'),
      title: event.title,
      titleHighlight: "",
      subtitle: event.description?.substring(0, 120) + '...' || t('events.title'),
      date: event.date,
      time: event.time,
      location: event.location,
      cta: { label: t('events.registerNow'), link: `/events/${event.id}`, icon: "calendar" },
      secondaryCta: { label: t('events.viewDetails'), link: `/events/${event.id}` },
      priority: 7
    }));
  slides.push(...eventSlides);

  // Add donation campaigns as slides
  const campaignSlides = campaigns
    .filter(c => c.status === 'active')
    .slice(0, 1)
    .map(campaign => ({
      id: `campaign-${campaign.id}`,
      type: 'campaign',
      image: campaign.image || headerBg,
      alt: campaign.name || campaign.title,
      badge: t('donations.activeCampaigns'),
      title: campaign.name || campaign.title,
      titleHighlight: "",
      subtitle: campaign.description?.substring(0, 120) + '...' || t('donations.supportCommunity'),
      target: campaign.target_amount,
      raised: campaign.raised_amount || 0,
      cta: { label: t('donations.donateNow'), link: "/donations", icon: "heart" },
      secondaryCta: { label: t('common.learnMore'), link: `/donations?cause=${campaign.id}` },
      priority: 8
    }));
  slides.push(...campaignSlides);

  // Add service slides
  slides.push(...getServiceSlides(t));

  // Add default slides
  slides.push(...getDefaultHeroSlides(t));

  // Sort by priority (higher first) and return top 6 slides
  return slides
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .slice(0, 6);
};

export default {
  getDefaultHeroSlides,
  getJumuahSlides,
  getRamadanSlides,
  getServiceSlides,
  getHeroSlides,
  isJumuah,
  isRamadan,
  getJumuahKhatib
};

