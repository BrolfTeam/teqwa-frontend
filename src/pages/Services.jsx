import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBookOpen, FiUsers, FiHeart, FiCalendar, FiSun, FiMoon, FiCoffee, FiActivity } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Hero from '@/components/ui/Hero';
import mesjidBg from '@/assets/mesjid2.jpg';

const Services = () => {
    const services = [
        {
            id: 'daily-prayers',
            title: 'Daily Prayers',
            description: 'Five daily congregational prayers led by our Imams. Join us for Fajr, Dhuhr, Asr, Maghrib, and Isha.',
            icon: FiSun,
            link: '/prayer-times',
            action: 'View Times'
        },
        {
            id: 'friday-prayer',
            title: 'Jummah Prayer',
            description: 'Weekly Friday prayer. Khutbah starts at 6:30 LT followed by prayer.',
            icon: FiUsers,
            link: '/prayer-times',
            action: 'Learn More'
        },
        {
            id: 'islamic-education',
            title: 'Islamic Education',
            description: 'Classes for all ages, including Quran reading, Tajweed, and daily ders program for anyone who want to learn Islam.',
            icon: FiBookOpen,
            link: '/education',
            action: 'Classes'
        },
        {
            id: 'charity-zakat',
            title: 'Charity & Zakat',
            description: 'Distribution of Zakat and Sadaqah to those in need within our community and beyond.',
            icon: FiHeart,
            link: '/donations',
            action: 'Donate'
        },
        {
            id: 'matrimonial',
            title: 'Matrimonial Services',
            description: 'Nikah ceremonies and pre-marital counseling services to support building strong families. we will announce soon when the service is available.',
            icon: FiHeart,
            link: '/contact',
            action: 'Contact Us'
        },
        {
            id: 'funeral',
            title: 'Funeral Services',
            description: 'Janazah prayer and assistance with funeral arrangements for deceased community members. we will announce soon when the service is available.',
            icon: FiMoon,
            link: '/contact',
            action: 'Contact Us'
        },
        {
            id: 'counseling',
            title: 'Counseling',
            description: 'Religious and social counseling provided by our Imams for individuals and families. we will announce soon when the service is available.',
            icon: FiCoffee,
            link: '/contact',
            action: 'Request'
        },
        {
            id: 'community-events',
            title: 'Community Events',
            description: 'Regular gatherings, lectures, and social events to strengthen our community bonds.',
            icon: FiCalendar,
            link: '/events',
            action: 'Events'
        },
        {
            id: 'youth-programs',
            title: 'Youth Programs',
            description: 'Engaging activities, sports, and mentorship programs specifically designed for our youth. stay tuned for more information.',
            icon: FiActivity,
            link: '/membership',
            action: 'Join'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Hero
                title="Our Services"
                description="Serving the community with a wide range of religious, educational, and social services."
                backgroundImage={mesjidBg}
            />

            <section className="container container-padding py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className="h-full flex flex-col card-hover" hoverable>
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                        <service.icon className="w-6 h-6" />
                                    </div>
                                    <CardTitle>{service.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-muted-foreground leading-relaxed">
                                        {service.description}
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild variant="outline" className="w-full">
                                        <Link to={service.link}>
                                            {service.action}
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section className="bg-primary/5 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Need a specific service?</h2>
                    <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Contact us for custom arrangements or if you have questions about any of our facilities.
                    </p>
                    <Button asChild variant="primary" size="lg">
                        <Link to="/contact">Get in Touch</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default Services;
