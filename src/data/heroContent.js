/**
 * Hero Section Content Configuration
 * Easy to update and manage all hero slide content
 */

import mesjidBg from '@/assets/mesjid2.jpg';
import headerBg from '@/assets/background.png';
import jumeaImage from '@/assets/jumea.jpg';
import futsalImage from '@/assets/futsal4.jpg';

// Import Itikaf images - Vite handles special characters in filenames
// Using direct imports - the apostrophe in the filename should work
import itikafImage from '@/assets/metakif.jpg';
import itikafImage2 from '@/assets/mutakif1.jpg';

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

// Helper function to check if it's Ramadan (simplified - can be enhanced with Hijri calendar)
export const isRamadan = () => {
  const today = new Date();
  const month = today.getMonth(); // 0-11
  const year = today.getFullYear();
  
  // Approximate Ramadan dates (this should be replaced with actual Hijri calendar calculation)
  // For 2024: March 11 - April 9
  // For 2025: March 1 - March 30
  // This is a placeholder - implement proper Hijri calendar integration
  
  // For now, return false - implement proper calculation
  return false;
  
  // Example implementation (needs proper Hijri calendar):
  // const ramadanStart = new Date(year, 2, 11); // March 11
  // const ramadanEnd = new Date(year, 3, 9); // April 9
  // return today >= ramadanStart && today <= ramadanEnd;
};

// Default hero slides
export const defaultHeroSlides = [
  {
    id: 'welcome',
    type: 'default',
    image: mesjidBg,
    alt: "Mosque Interior",
    badge: "Welcome to Teqwa",
    title: "Experience the Beauty of",
    titleHighlight: "Islamic Community",
    subtitle: "Join us in our daily prayers, educational programs, and community events to strengthen your faith and connection with Allah.",
    cta: { label: "Explore Programs", link: "/events", icon: "arrow" },
    secondaryCta: { label: "About Us", link: "/about" },
    priority: 1
  },
  {
    id: 'community',
    type: 'default',
    image: headerBg,
    alt: "Community Gathering",
    badge: "MuJemea At-Tekwa",
    title: "Building a Strong",
    titleHighlight: "Faith Community",
    subtitle: "Together we grow in faith, knowledge, and service to our community and beyond.",
    cta: { label: "Join Us", link: "/membership", icon: "users" },
    secondaryCta: { label: "Learn More", link: "/about" },
    priority: 2
  }
];

// Jumu'ah (Friday) specific slides - Dynamic with khatib info
export const getJumuahSlides = () => {
  const khatibInfo = getJumuahKhatib();
  const subtitle = khatibInfo 
    ? `Today's Khutbah will be delivered by ${khatibInfo.name || 'Imam'}. Don't forget to read Surah Al-Kahf and send Salawat upon the Prophet (ﷺ) today. Join us for the blessed Jumu'ah prayer.`
    : "Don't forget to read Surah Al-Kahf and send Salawat upon the Prophet (ﷺ) today. Join us for the blessed Jumu'ah prayer.";
  
  return [
    {
      id: 'jumuah',
      type: 'occasion',
      image: jumeaImage,
      alt: "Jumu'ah Prayer",
      badge: "Jumu'ah Mubarak",
      title: "The Best Day is",
      titleHighlight: "Friday",
      subtitle: subtitle,
      cta: { label: "Prayer Times", link: "/prayer-times", icon: "calendar" },
      secondaryCta: { 
        label: "Read Surah Kahf", 
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

// Ramadan specific slides
export const ramadanSlides = [
  {
    id: 'ramadan',
    type: 'occasion',
    image: headerBg,
    alt: "Ramadan Kareem",
    badge: "Ramadan Kareem",
    title: "Welcome to the Month of",
    titleHighlight: "Mercy & Quran",
    subtitle: "May Allah accept our fasting, prayers, and charity in this blessed month. Join us for Taraweeh prayers and community iftars.",
    cta: { label: "Prayer Schedule", link: "/prayer-times", icon: "calendar" },
    secondaryCta: { label: "Iftar Program", link: "/events" },
    priority: 10,
    occasion: 'ramadan'
  },
  {
    id: 'itikaf-ramadan',
    type: 'itikaf',
    image: itikafImage2,
    alt: "I'tikaf Program",
    badge: "Ramadan Special",
    title: "Experience Spiritual",
    titleHighlight: "I'tikaf Retreat",
    subtitle: "Join our I'tikaf program during the last 10 days of Ramadan. Purify your soul and seek Laylat al-Qadr in the blessed environment of the mosque.",
    cta: { label: "Register for I'tikaf", link: "/itikaf", icon: "book" },
    secondaryCta: { label: "Learn More", link: "/itikaf" },
    priority: 9,
    occasion: 'ramadan'
  }
];

// Service-specific slides
export const serviceSlides = [
  {
    id: 'donation',
    type: 'donation',
    image: headerBg,
    alt: "Support Our Community",
    badge: "Make a Difference",
    title: "Support Our",
    titleHighlight: "Community Initiatives",
    subtitle: "Your generous donations help us maintain the mosque, support educational programs, and serve the community. Every contribution makes a difference.",
    cta: { label: "Donate Now", link: "/donations", icon: "heart" },
    secondaryCta: { label: "View Causes", link: "/donations" },
    priority: 5
  },
  {
    id: 'booking',
    type: 'booking',
    image: futsalImage,
    alt: "Futsal Booking",
    badge: "Book Your Slot",
    title: "Reserve Your",
    titleHighlight: "Futsal Court",
    subtitle: "Book your preferred time slot for our futsal court. Available for community members and their families. Easy online booking system.",
    cta: { label: "Book Now", link: "/futsal", icon: "calendar" },
    secondaryCta: { label: "View Schedule", link: "/futsal" },
    priority: 4
  },
  {
    id: 'itikaf',
    type: 'itikaf',
    image: itikafImage,
    alt: "I'tikaf Program",
    badge: "Spiritual Retreat",
    title: "Join Our",
    titleHighlight: "I'tikaf Program",
    subtitle: "Experience the spiritual benefits of I'tikaf. Spend dedicated time in the mosque for worship, reflection, and connection with Allah.",
    cta: { label: "Register Now", link: "/itikaf", icon: "book" },
    secondaryCta: { label: "Learn More", link: "/itikaf" },
    priority: 6
  }
];

/**
 * Get hero slides based on current date and dynamic content
 * @param {Array} events - Featured events from API
 * @param {Array} campaigns - Active donation campaigns from API
 * @returns {Array} Array of hero slides
 */
export const getHeroSlides = (events = [], campaigns = []) => {
  const slides = [];
  
  // Add occasion-specific slides first (highest priority)
  if (isJumuah()) {
    slides.push(...getJumuahSlides());
  }
  
  if (isRamadan()) {
    slides.push(...ramadanSlides);
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
      badge: "Upcoming Event",
      title: event.title,
      titleHighlight: "",
      subtitle: event.description?.substring(0, 120) + '...' || "Join us for this special gathering.",
      date: event.date,
      time: event.time,
      location: event.location,
      cta: { label: "Register Now", link: `/events/${event.id}`, icon: "calendar" },
      secondaryCta: { label: "View Details", link: `/events/${event.id}` },
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
      badge: "Active Campaign",
      title: campaign.name || campaign.title,
      titleHighlight: "",
      subtitle: campaign.description?.substring(0, 120) + '...' || "Support our community initiatives.",
      target: campaign.target_amount,
      raised: campaign.raised_amount || 0,
      cta: { label: "Donate Now", link: "/donations", icon: "heart" },
      secondaryCta: { label: "Learn More", link: `/donations?cause=${campaign.id}` },
      priority: 8
    }));
  slides.push(...campaignSlides);
  
  // Add service slides
  slides.push(...serviceSlides);
  
  // Add default slides
  slides.push(...defaultHeroSlides);
  
  // Sort by priority (higher first) and return top 6 slides
  return slides
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .slice(0, 6);
};

export default {
  defaultHeroSlides,
  getJumuahSlides,
  ramadanSlides,
  serviceSlides,
  getHeroSlides,
  isJumuah,
  isRamadan,
  getJumuahKhatib
};

