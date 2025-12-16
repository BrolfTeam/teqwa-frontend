import { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPaperPlane } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { CONTACT_INFO } from '@/config/constants';
import { apiService } from '@/lib/apiService';

// Simple validation helpers
const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
const validateNotEmpty = (v) => typeof v === 'string' && v.trim().length > 0;

const Contact = () => {
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
    if (!validateNotEmpty(formData.name)) newErrors.name = 'Please enter your full name.';
    if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address.';
    if (!validateNotEmpty(formData.message)) newErrors.message = 'Please enter a message.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      // Real API call
      await apiService.post('/contact/', formData);

      setSubmitStatus({
        success: true,
        message: 'Jazaakallahu khairan — your message has been sent. We will get back to you soon.'
      });

      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Clear success message after 6 seconds
      setTimeout(() => setSubmitStatus({ success: null, message: '' }), 6000);
    } catch (error) {
      console.error('Contact submission error:', error);
      setSubmitStatus({ success: false, message: 'Failed to send message. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="text-2xl text-brand-green" />,
      title: 'Our Location',
      content: CONTACT_INFO.address,
      link: CONTACT_INFO.mapLink,
      linkText: 'View on Map'
    },
    {
      icon: <FaPhone className="text-2xl text-brand-green" />,
      title: 'Phone Number',
      content: CONTACT_INFO.phone,
      link: `tel:${CONTACT_INFO.phone.replace(/[^0-9+]/g, '')}`,
      linkText: 'Call Now'
    },
    {
      icon: <FaEnvelope className="text-2xl text-brand-green" />,
      title: 'Email Address',
      content: CONTACT_INFO.email,
      link: `mailto:${CONTACT_INFO.email}`,
      linkText: 'Send Email'
    },
    {
      icon: <FaClock className="text-2xl text-brand-green" />,
      title: 'Working Hours',
      content: 'Monday - Sunday: 5:00 AM - 10:00 PM',
      subContent: 'Friday: Special hours for Jumu\'ah prayer',
      link: '/prayer-times',
      linkText: 'View Prayer Times'
    }
  ];

  const socialLinks = [
    { icon: <FaFacebook />, url: '#', label: 'Facebook' },
    { icon: <FaTwitter />, url: '#', label: 'Twitter' },
    { icon: <FaInstagram />, url: '#', label: 'Instagram' },
    { icon: <FaLinkedin />, url: '#', label: 'LinkedIn' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-deep to-brand-green text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg max-w-2xl mx-auto">We'd love to hear from you. Reach out to us with any questions or feedback.</p>
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
                  <h2 className="text-2xl font-extrabold text-card-foreground mb-3">Send Us a Message</h2>
                  <p className="text-sm text-muted-foreground mb-6">MuJemea At-Tekwa — Addis Ababa, Ethiopia. We're here to help the community. Please share your inquiry and we'll reply soon.</p>

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
                      <label htmlFor="name" className="block text-card-foreground font-medium mb-1">Full Name <span className="text-rose-500">*</span></label>
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
                      <label htmlFor="email" className="block text-card-foreground font-medium mb-1">Email Address <span className="text-rose-500">*</span></label>
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
                      <label htmlFor="subject" className="block text-card-foreground font-medium mb-1">Subject</label>
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
                      <label htmlFor="message" className="block text-card-foreground font-medium mb-1">Message <span className="text-rose-500">*</span></label>
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
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>

                      <Button
                        type="button"
                        onClick={() => { setFormData({ name: '', email: '', subject: '', message: '' }); setErrors({}); }}
                        variant="ghost"
                        size="sm"
                      >
                        Clear
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Map */}
                <div className="md:w-1/2 p-4 bg-card">
                  <div className="h-full p-6">
                    <h3 className="text-lg font-semibold text-card-foreground mb-3">Visit MuJemea At-Tekwa</h3>
                    <p className="text-sm text-muted-foreground mb-4">MuJemea At-Tekwa, Addis Ababa, Ethiopia — find us at the center of the community.</p>

                    {/* Google Maps embed */}
                    <div className="w-full rounded-lg overflow-hidden shadow-sm border border-border/50 bg-card">
                      <iframe
                        title="MuJemea At-Tekwa Map"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.4707832745844!2d38.76304407501!3d9.019896891016!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85f3e7a7a7a7%3A0x1234567890abcdef!2sMuJemea%20At-Tekwa!5e0!3m2!1sen!2set!4v1234567890123!5m2!1sen!2set"
                        className="w-full h-64 md:h-80 border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <Button asChild variant="outline" size="sm">
                        <a href={CONTACT_INFO.mapLink} target="_blank" rel="noopener noreferrer">
                          Open in Google Maps
                        </a>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <a href={`tel:${CONTACT_INFO.phone.replace(/[^0-9+]/g, '')}`}>
                          Call Us
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
            <h2 className="text-2xl md:text-3xl font-bold text-card-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Find answers to common questions about our services and facilities.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: 'What are the prayer times at the mosque?',
                answer: 'Our prayer times vary throughout the year. Please check our Prayer Times page for the most up-to-date schedule.'
              },
              {
                question: 'Do you offer Quran classes for children?',
                answer: 'Yes, we offer Quran classes for children of all ages. Please visit our Education page for more information.'
              },
              {
                question: 'How can I donate to the mosque?',
                answer: 'You can donate online through our secure portal or visit the mosque office to make a donation in person.'
              },
              {
                question: 'Is there parking available?',
                answer: 'Yes, we have a dedicated parking lot for visitors. Additional street parking is also available.'
              },
              {
                question: 'Do you offer marriage services?',
                answer: 'Yes, we provide Islamic marriage services. Please contact the office to schedule an appointment with the Imam.'
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
          <h2 className="text-xl md:text-2xl font-bold text-card-foreground mb-6">Connect With Us</h2>
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
            <h3 className="text-base font-medium text-card-foreground mb-2">Join Our Mailing List</h3>
            <div className="max-w-md mx-auto flex">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-2 border border-input rounded-l-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              <Button variant="primary" className="rounded-l-none">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
