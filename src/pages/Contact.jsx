import { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPaperPlane } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { CONTACT_INFO } from '@/config/constants';
import { siteConfig } from '@/config/site';
import { apiService } from '@/lib/apiService';
import { useTranslation } from 'react-i18next';

// Simple validation helpers
const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
const validateNotEmpty = (v) => typeof v === 'string' && v.trim().length > 0;

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: null, message: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // client-side validation
    const newErrors = {};
    if (!validateNotEmpty(formData.name)) newErrors.name = t('contact.pleaseEnterName');
    if (!validateEmail(formData.email)) newErrors.email = t('contact.pleaseEnterEmail');
    if (!validateNotEmpty(formData.message)) newErrors.message = t('contact.pleaseEnterMessage');

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      // Real API call
      await apiService.post('/contact/', formData);

      setSubmitStatus({
        success: true,
        message: t('contact.messageSent')
      });

      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Clear success message after 6 seconds
      setTimeout(() => setSubmitStatus({ success: null, message: '' }), 6000);
    } catch (error) {
      console.error('Contact submission error:', error);
      setSubmitStatus({ success: false, message: t('contact.messageFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="text-2xl text-brand-green" />,
      title: t('contact.ourLocation'),
      content: CONTACT_INFO.address,
      link: CONTACT_INFO.mapLink,
      linkText: t('contact.viewOnMap')
    },
    {
      icon: <FaPhone className="text-2xl text-brand-green" />,
      title: t('contact.phoneNumber'),
      content: CONTACT_INFO.phone,
      link: `tel:${CONTACT_INFO.phone.replace(/[^0-9+]/g, '')}`,
      linkText: t('contact.callNow')
    },
    {
      icon: <FaEnvelope className="text-2xl text-brand-green" />,
      title: t('contact.emailAddress'),
      content: CONTACT_INFO.email,
      link: `mailto:${CONTACT_INFO.email}`,
      linkText: t('contact.sendEmail')
    },
    {
      icon: <FaClock className="text-2xl text-brand-green" />,
      title: t('contact.workingHours'),
      content: t('contact.workingHoursContent'),
      subContent: t('contact.fridayHours'),
      link: '/prayer-times',
      linkText: t('contact.viewPrayerTimes')
    }
  ];

  const socialLinks = [
    { icon: <FaFacebook />, url: siteConfig.links.facebook, label: 'Facebook' },
    { icon: <FaTwitter />, url: siteConfig.links.twitter, label: 'Twitter' },
    { icon: <FaInstagram />, url: siteConfig.links.instagram, label: 'Instagram' },
    { icon: <FaLinkedin />, url: siteConfig.links.linkedin || '#', label: 'LinkedIn' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-deep to-brand-green text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('contact.title')}</h1>
          <p className="text-lg max-w-2xl mx-auto">{t('contact.subtitle')}</p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((item, index) => (
              <motion.div
                key={index}
                className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-border/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-12 h-12 bg-brand-green/10 rounded-full flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground mb-2">{item.content}</p>
                {item.subContent && <p className="text-sm text-muted-foreground mb-3">{item.subContent}</p>}
                <a
                  href={item.link}
                  className="text-primary hover:underline inline-flex items-center mt-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.linkText}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border/50">
              <div className="md:flex">
                {/* Contact Form */}
                <div className="md:w-1/2 p-6 md:p-10 bg-gradient-to-br from-card/5 to-primary/5">
                  <h2 className="text-2xl font-extrabold text-card-foreground mb-3">{t('contact.sendUsMessage')}</h2>
                  <p className="text-sm text-muted-foreground mb-6">{t('contact.contactDescription')}</p>

                  {submitStatus.message && (
                    <div
                      className={`p-4 mb-6 rounded-lg ${submitStatus.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:border-emerald-700 dark:text-emerald-200' : 'bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-900 dark:border-rose-700 dark:text-rose-200'}`}
                      role="status"
                    >
                      {submitStatus.message}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-card-foreground font-medium mb-1">{t('contact.fullName')} <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        aria-invalid={errors.name ? 'true' : 'false'}
                        aria-describedby={errors.name ? 'error-name' : undefined}
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-rose-300 ring-rose-100 dark:ring-rose-900' : 'border-input'} bg-background focus:outline-none focus:ring-2 focus:ring-ring`}
                      />
                      {errors.name && <p id="error-name" className="text-rose-600 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div className="mb-4">
                      <label htmlFor="email" className="block text-card-foreground font-medium mb-1">{t('contact.emailAddress')} <span className="text-rose-500">*</span></label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={errors.email ? 'error-email' : undefined}
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-rose-300 ring-rose-100 dark:ring-rose-900' : 'border-input'} bg-background focus:outline-none focus:ring-2 focus:ring-ring`}
                      />
                      {errors.email && <p id="error-email" className="text-rose-600 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div className="mb-4">
                      <label htmlFor="subject" className="block text-card-foreground font-medium mb-1">{t('contact.subject')}</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="message" className="block text-card-foreground font-medium mb-1">{t('contact.message')} <span className="text-rose-500">*</span></label>
                      <textarea
                        id="message"
                        name="message"
                        rows="5"
                        aria-invalid={errors.message ? 'true' : 'false'}
                        aria-describedby={errors.message ? 'error-message' : undefined}
                        value={formData.message}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.message ? 'border-rose-300 ring-rose-100 dark:ring-rose-900' : 'border-input'} bg-background focus:outline-none focus:ring-2 focus:ring-ring`}
                      ></textarea>
                      {errors.message && <p id="error-message" className="text-rose-600 text-sm mt-1">{errors.message}</p>}
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                        leftIcon={FaPaperPlane}
                        variant="primary"
                        size="lg"
                      >
                        {isSubmitting ? t('contact.sending') : t('contact.sendMessage')}
                      </Button>

                      <Button
                        type="button"
                        onClick={() => { setFormData({ name: '', email: '', subject: '', message: '' }); setErrors({}); }}
                        variant="ghost"
                        size="sm"
                      >
                        {t('contact.clear')}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Map */}
                <div className="md:w-1/2 p-4 bg-card">
                  <div className="h-full p-6">
                    <h3 className="text-lg font-semibold text-card-foreground mb-3">{t('contact.visitMuJemea')}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t('contact.visitDescription')}</p>

                    {/* Google Maps embed */}
                    <div className="w-full rounded-lg overflow-hidden shadow-sm border border-border/50 bg-card">
                      <iframe
                        title="MUJEMA’ TEQWA MOSQUE Map"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.4707832745844!2d38.76304407501!3d9.019896891016!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85f3e7a7a7a7%3A0x1234567890abcdef!2sMUJEMA’%20TEQWA%20MOSQUE!5e0!3m2!1sen!2set!4v1234567890123!5m2!1sen!2set"
                        className="w-full h-64 md:h-80 border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <Button asChild variant="outline" size="sm">
                        <a href={CONTACT_INFO.mapLink} target="_blank" rel="noopener noreferrer">
                          {t('contact.openInGoogleMaps')}
                        </a>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <a href={`tel:${CONTACT_INFO.phone.replace(/[^0-9+]/g, '')}`}>
                          {t('contact.callUs')}
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-card-foreground mb-4">{t('contact.frequentlyAskedQuestions')}</h2>
            <p className="text-muted-foreground">{t('contact.faqSubtitle')}</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: t('contact.prayerTimesQuestion'),
                answer: t('contact.prayerTimesAnswer')
              },
              {
                question: t('contact.quranClassesQuestion'),
                answer: t('contact.quranClassesAnswer')
              },
              {
                question: t('contact.donateQuestion'),
                answer: t('contact.donateAnswer')
              },
              {
                question: t('contact.parkingQuestion'),
                answer: t('contact.parkingAnswer')
              },
              {
                question: t('contact.marriageQuestion'),
                answer: t('contact.marriageAnswer')
              }
            ].map((faq, index) => (
              <div key={index} className="bg-card rounded-lg shadow-md overflow-hidden border border-border/50">
                <button className="w-full px-6 py-4 text-left focus:outline-none">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm md:text-base font-medium text-card-foreground">{faq.question}</h3>
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div className="px-6 pb-4">
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-card-foreground mb-6">{t('contact.connectWithUs')}</h2>
          <div className="flex justify-center space-x-4">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                whileHover={{ y: -3 }}
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-xl">{social.icon}</span>
              </motion.a>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-base font-medium text-card-foreground mb-2">{t('contact.joinMailingList')}</h3>
            <div className="max-w-md mx-auto flex">
              <input
                type="email"
                placeholder={t('contact.yourEmailAddress')}
                className="flex-grow px-4 py-2 border border-input rounded-l-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              <Button variant="primary" className="rounded-l-none">
                {t('contact.subscribe')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
