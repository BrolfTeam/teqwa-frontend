import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBookOpen, FiUsers, FiHeart, FiCalendar, FiSun, FiMoon, FiCoffee, FiActivity } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Hero from '@/components/ui/Hero';
import { useTranslation } from 'react-i18next';
import mesjidBg from '@/assets/mesjid2.jpg';

const Services = () => {
    const { t } = useTranslation();
    
    const services = [
        {
            id: 'daily-prayers',
            title: t('services.dailyPrayers'),
            description: t('services.dailyPrayersDesc'),
            icon: FiSun,
            link: '/prayer-times',
            action: t('services.viewTimes')
        },
        {
            id: 'friday-prayer',
            title: t('services.jummahPrayer'),
            description: t('services.jummahPrayerDesc'),
            icon: FiUsers,
            link: '/prayer-times',
            action: t('services.learnMore')
        },
        {
            id: 'islamic-education',
            title: t('services.islamicEducation'),
            description: t('services.islamicEducationDesc'),
            icon: FiBookOpen,
            link: '/education',
            action: t('services.classes')
        },
        {
            id: 'charity-zakat',
            title: t('services.charityZakat'),
            description: t('services.charityZakatDesc'),
            icon: FiHeart,
            link: '/donations',
            action: t('services.donate')
        },
        {
            id: 'matrimonial',
            title: t('services.matrimonialServices'),
            description: t('services.matrimonialServicesDesc'),
            icon: FiHeart,
            link: '/contact',
            action: t('services.contactUs')
        },
        {
            id: 'funeral',
            title: t('services.funeralServices'),
            description: t('services.funeralServicesDesc'),
            icon: FiMoon,
            link: '/contact',
            action: t('services.contactUs')
        },
        {
            id: 'counseling',
            title: t('services.counseling'),
            description: t('services.counselingDesc'),
            icon: FiCoffee,
            link: '/contact',
            action: t('services.request')
        },
        {
            id: 'community-events',
            title: t('services.communityEvents'),
            description: t('services.communityEventsDesc'),
            icon: FiCalendar,
            link: '/events',
            action: t('services.events')
        },
        {
            id: 'youth-programs',
            title: t('services.youthPrograms'),
            description: t('services.youthProgramsDesc'),
            icon: FiActivity,
            link: '/membership',
            action: t('services.join')
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Hero
                title={t('services.title')}
                description={t('services.subtitle')}
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
                    <h2 className="text-3xl font-bold mb-4">{t('services.needSpecificService')}</h2>
                    <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                        {t('services.contactSubtitle')}
                    </p>
                    <Button asChild variant="primary" size="lg">
                        <Link to="/contact">{t('services.getInTouch')}</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default Services;
