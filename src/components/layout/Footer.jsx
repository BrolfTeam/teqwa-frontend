import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiMail,
  FiMapPin,
  FiPhone,
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiYoutube,
  FiHeart,
  FiClock
} from 'react-icons/fi';
import { FiMessageCircle } from 'react-icons/fi';
import logo from '@/assets/logo.png';
import IslamicPattern from '@/components/ui/IslamicPattern';
import { siteConfig } from '@/config/site';
import { useTranslation } from '@/hooks/useTranslation';

const Footer = memo(() => {
  const { t, translate } = useTranslation();
  const currentYear = new Date().getFullYear();


  const socialLinks = [
    {
      name: 'Facebook',
      url: siteConfig.links?.facebook || '#',
      icon: FiFacebook,
      color: 'hover:text-blue-600 dark:hover:text-blue-400'
    },
    {
      name: 'Telegram',
      url: 'https://t.me/Teqwa_02',
      icon: FiMessageCircle,
      color: 'hover:text-blue-500 dark:hover:text-blue-400'
    },
    {
      name: 'Instagram',
      url: siteConfig.links?.instagram || '#',
      icon: FiInstagram,
      color: 'hover:text-pink-600 dark:hover:text-pink-400'
    },
    {
      name: 'YouTube',
      url: siteConfig.links?.youtube || '#',
      icon: FiYoutube,
      color: 'hover:text-red-600 dark:hover:text-red-400'
    }
  ];

  const quickLinks = [
    { name: t('footer.home'), href: '/' },
    { name: t('footer.aboutUs'), href: '/about' },
    { name: t('footer.prayerTimes'), href: '/prayer-times' },
    { name: t('footer.events'), href: '/events' },
    { name: t('footer.contact'), href: '/contact' }
  ];

  const services = [
    { name: t('footer.donations'), href: '/donate' },
    { name: t('footer.futsalBooking'), href: '/futsal' },
    { name: t('footer.educationalServices'), href: '/education' },
    { name: t('footer.itikafPrograms'), href: '/itikaf' },
    { name: t('footer.gallery'), href: '/gallery' }
  ];

  const resources = [
    { name: t('footer.qiblaDirection'), href: '/qibla' },
    { name: t('footer.islamicCalendar'), href: '/islamic-calendar' },
    { name: t('footer.newsUpdates'), href: '/news' }
  ];

  return (
    <footer className="relative border-t border-border bg-gradient-to-b from-background via-muted/20 to-muted/40 overflow-hidden">
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <IslamicPattern />
      </div>

      {/* Main Footer Content */}
      <div className="relative container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src={logo}
                  alt={siteConfig.name}
                  className="h-12 w-auto rounded-full transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {siteConfig.name}
                </h3>
                <p className="text-xs text-muted-foreground">{siteConfig.slogan}</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              {siteConfig.description || 'A welcoming place of worship, learning, and community for Muslims in Addis Ababa.'}
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-4 pt-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      w-10 h-10 rounded-lg bg-muted border border-border/50
                      flex items-center justify-center
                      text-muted-foreground transition-all duration-300
                      hover:bg-primary/10 hover:border-primary/50 hover:shadow-md
                      ${social.color}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-foreground mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-foreground mb-4">{t('footer.services')}</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.href}>
                  <Link
                    to={service.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-200" />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-foreground mb-4">{t('footer.contactUs')}</h4>
            <div className="space-y-4">
              {/* Address */}
              <div className="flex items-start gap-3 group">
                <div className="mt-0.5 p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <FiMapPin className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{siteConfig.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {siteConfig.contact?.address || 'Addis Ababa, Ethiopia'}
                  </p>
                </div>
              </div>

              {/* Email */}
              <a
                href={`mailto:${siteConfig.contact?.email || 'info@mujea-at-tekwa.org'}`}
                className="flex items-start gap-3 group"
              >
                <div className="mt-0.5 p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <FiMail className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {siteConfig.contact?.email || 'info@mujea-at-tekwa.org'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{t('footer.generalInquiries')}</p>
                </div>
              </a>

              {/* Phone */}
              <a
                href={`tel:${(siteConfig.contact?.phone || '+251 11 123 4567').replace(/[^0-9+]/g, '')}`}
                className="flex items-start gap-3 group"
              >
                <div className="mt-0.5 p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <FiPhone className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {siteConfig.contact?.phone || '+251 11 123 4567'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{t('footer.officeHours')}</p>
                </div>
              </a>

              {/* Working Hours */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-lg bg-primary/10">
                  <FiClock className="h-4 w-4 text-primary flex-shrink-0" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{t('footer.openDaily')}</p>
                  <p className="text-xs text-muted-foreground mt-1">5:00 AM - 10:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Section */}
        {resources.length > 0 && (
          <div className="pt-8 border-t border-border/50 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">{t('footer.resources')}</h4>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {resources.map((resource) => (
                    <Link
                      key={resource.href}
                      to={resource.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {resource.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                © {currentYear} <span className="font-semibold text-foreground">{siteConfig.name}</span>. {t('footer.allRightsReserved')}.
              </p>
              <span className="hidden md:inline">•</span>
              <p className="flex items-center gap-1.5">
                {t('footer.builtWith')} <FiHeart className="w-4 h-4 text-red-500" /> {t('footer.forCommunity')}
              </p>
            </div>

          </div>

          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-muted-foreground/80">
            <p>{t('footer.poweredBy')}</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-primary transition-colors">
                {t('footer.privacyPolicy')}
              </Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-primary transition-colors">
                {t('footer.termsOfService')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
export default Footer;
