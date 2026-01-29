import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiBook, FiClock, FiUsers, FiCalendar, FiUser, FiDollarSign, FiFilter, FiCheckCircle, FiAward, FiArrowRight, FiBarChart2, FiFileText, FiBookOpen, FiGrid } from 'react-icons/fi';
import { FaDownload, FaShare } from 'react-icons/fa';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { dataService } from '@/lib/dataService';
import paymentService from '@/services/paymentService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import Hero from '@/components/ui/Hero';
import educationBg from '@/assets/mesjid2.jpg';
import IslamicPattern from '@/components/ui/IslamicPattern';
import Modal from '@/components/ui/Modal';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';

const Education = () => {
    const { t } = useTranslation();
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Payment UI State
    const [selectedService, setSelectedService] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('manual_qr');
    const [proofFile, setProofFile] = useState(null);

    // ... (rest of state and logic unrelated to UI structure)

    // Filter states
    const [filters, setFilters] = useState({
        serviceType: '',
        level: '',
        ageGroup: '',
        status: 'active'
    });

    const serviceTypes = [
        { value: 'daily_qirat', label: t('education.dailyQirat') },
        { value: 'community_quran', label: t('education.communityQuran') },
        { value: 'friday_khutba', label: t('education.fridayKhutba') },
        { value: 'quran_recitation', label: t('education.quranRecitation') },
        { value: 'quran_memorization', label: t('education.quranMemorizationHifz') },
        { value: 'arabic_language', label: t('education.arabicLanguage') },
        { value: 'islamic_studies', label: t('education.islamicStudies') },
        { value: 'tajweed', label: t('education.tajweed') },
        { value: 'fiqh', label: t('education.fiqh') },
        { value: 'hadith', label: t('education.hadithStudies') },
        { value: 'tafseer', label: t('education.tafseer') },
        { value: 'ders_program', label: t('education.dersProgram') }
    ];

    const levels = [
        { value: 'beginner', label: t('education.beginner') },
        { value: 'intermediate', label: t('education.intermediate') },
        { value: 'advanced', label: t('education.advanced') }
    ];

    const ageGroups = [
        { value: 'children', label: t('education.children') },
        { value: 'teens', label: t('education.teens') },
        { value: 'adults', label: t('education.adults') },
        { value: 'seniors', label: t('education.seniors') }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [services, filters]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const servicesData = await dataService.getEducationServices();
            setServices(servicesData?.data || servicesData || []);

            if (user) {
                try {
                    const enrollmentsData = await dataService.getMyEnrollments();
                    setMyEnrollments(enrollmentsData?.data || enrollmentsData || []);
                } catch (error) {
                    console.error('Failed to fetch enrollments:', error);
                }
            }
        } catch (error) {
            // Silently handle rate limiting (429)
            if (error.status === 429) {
                console.warn('Rate limited, returning empty services list');
                setServices([]);
            } else {
                console.error('Failed to fetch education services:', error);
                toast.error(t('education.failedToLoadServices'));
                setServices([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...services];

        if (filters.serviceType) {
            filtered = filtered.filter(s => s.service_type === filters.serviceType);
        }
        if (filters.level) {
            filtered = filtered.filter(s => s.level === filters.level);
        }
        if (filters.ageGroup) {
            filtered = filtered.filter(s => s.age_group === filters.ageGroup);
        }
        if (filters.status) {
            filtered = filtered.filter(s => s.status === filters.status);
        }

        setFilteredServices(filtered);
    };

    const handleEnrollClick = (service) => {
        if (!user) {
            toast.error(t('education.pleaseLogin'));
            return;
        }

        if (service.is_free || !service.fee || service.fee <= 0) {
            processEnrollment(service, 'free');
        } else {
            setSelectedService(service);
            setPaymentMethod('card');
            setProofFile(null);
            setIsPaymentModalOpen(true);
        }
    };

    const processEnrollment = async (service, method) => {
        try {
            setEnrolling(service.id);

            let enrollmentResponse;

            if (method === 'manual_qr') {
                if (!proofFile) {
                    toast.error(t('payment.proofRequired'));
                    setEnrolling(null);
                    return;
                }

                const formData = new FormData();
                formData.append('payment_method', 'manual_qr');
                formData.append('proof_image', proofFile);

                enrollmentResponse = await dataService.enrollInService(service.id, formData);
                toast.success(t('education.enrollmentSubmitted'));
            } else {
                // Card or Free
                const apiPayload = {
                    payment_method: method === 'free' ? 'free' : 'card'
                };

                enrollmentResponse = await dataService.enrollInService(service.id, apiPayload);

                // Handle Payment if not free and card
                if (method === 'card' && !service.is_free && service.fee > 0 && enrollmentResponse && (enrollmentResponse.data?.id || enrollmentResponse.id)) {
                    try {
                        const objId = enrollmentResponse.data?.id || enrollmentResponse.id;
                        const paymentResponse = await paymentService.initializePayment({
                            amount: parseFloat(service.fee),
                            currency: 'ETB',
                            email: user.email,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            content_type_model: 'serviceenrollment', // Verify model name in backend
                            object_id: objId
                        });

                        if (paymentResponse && paymentResponse.checkout_url) {
                            toast.success(t('education.enrollmentSuccessRedirect'));
                            window.location.href = paymentResponse.checkout_url;
                            return;
                        }
                    } catch (paymentError) {
                        console.error('Payment initialization error:', paymentError);
                        toast.error(t('education.enrollmentPaymentFailed'));
                    }
                } else {
                    toast.success(t('education.enrollSucceeded'));
                }
            }

            // Success actions (if not redirected)
            if (user?.role === 'student') {
                setTimeout(() => {
                    toast.info('View your courses and assignments in the Student Dashboard!', {
                        action: {
                            label: 'Go to Dashboard',
                            onClick: () => navigate('/dashboard')
                        }
                    });
                }, 1000);
            }

            setIsPaymentModalOpen(false);
            setSelectedService(null);
            fetchData(); // Refresh data

        } catch (error) {
            const errorMessage = error.message || 'Failed to enroll in service';
            toast.error(errorMessage);
            console.error(error);
        } finally {
            setEnrolling(null);
        }
    };

    const isEnrolled = (serviceId) => {
        return myEnrollments.some(e => e.service?.id === serviceId || e.service === serviceId);
    };

    const downloadServiceDetails = (service) => {
        try {
            const lines = [];
            lines.push(`Title: ${service.title}`);
            if (service.instructor) lines.push(`Instructor: ${service.instructor.first_name} ${service.instructor.last_name}`);
            if (service.schedule) lines.push(`Schedule: ${service.schedule}`);
            if (service.duration) lines.push(`Duration: ${service.duration}`);
            lines.push(`Capacity: ${service.enrolled_count || 0} / ${service.capacity}`);
            lines.push(`Fee: ${service.is_free ? 'Free' : `${service.fee} ETB`}`);
            lines.push('');
            lines.push('Description:');
            lines.push(service.description || '');

            const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const safeTitle = (service.title || 'service').replace(/[^a-z0-9\-\_]/gi, '_').slice(0, 80);
            a.download = `${safeTitle}-details.txt`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            toast.success('Downloaded service details');
        } catch (err) {
            console.error('Download failed', err);
            toast.error('Failed to download');
        }
    };

    const shareService = async (service) => {
        try {
            const url = `${window.location.origin}/education/${service.id}`;
            const text = `${service.title}\n${service.description || ''}\nSchedule: ${service.schedule || ''}\n${url}`;
            if (navigator.share) {
                await navigator.share({ title: service.title, text, url });
                toast.success(t('education.sharedSuccessfully'));
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(url);
                toast.success(t('education.linkCopied'));
            } else {
                // Fallback create temporary input
                const input = document.createElement('input');
                input.value = url;
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                input.remove();
                toast.success(t('education.linkCopied'));
            }
        } catch (err) {
            console.error('Share failed', err);
            toast.error(t('education.failedToShare'));
        }
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            full: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
            cancelled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.active}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-background font-sans">
            {/* Hero Section */}
            <Hero
                title={t('education.heroPrefix')}
                titleHighlight={t('education.educationalPrograms')}
                align="left"
                description={t('education.enhanceKnowledge')}
                backgroundImage={educationBg}
                primaryAction={<a href="#courses">{t('education.browseCourses')}</a>}
                secondaryAction={<Link to="/contact">{t('contact.title')}</Link>}
            />

            {/* Why Learn With Us Section */}
            <section className="container container-padding py-16 -mt-10 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: FiUsers, title: t('education.featureCards.expertInstructors.title'), desc: t('education.featureCards.expertInstructors.description') },
                        { icon: FiBook, title: t('education.featureCards.structuredCurriculum.title'), desc: t('education.featureCards.structuredCurriculum.description') },
                        { icon: FiClock, title: t('education.featureCards.flexibleSchedules.title'), desc: t('education.featureCards.flexibleSchedules.description') },
                        { icon: FiAward, title: t('education.featureCards.certification.title'), desc: t('education.featureCards.certification.description') }
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

            {/* Filters Section */}
            <section className="container container-padding py-8" id="courses">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FiFilter className="h-5 w-5" />
                                {t('education.filterServices')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Service Type Filter */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">{t('education.serviceType')}</label>
                                    <select
                                        value={filters.serviceType}
                                        onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">{t('education.allTypes')}</option>
                                        {serviceTypes.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Level Filter */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">{t('education.level')}</label>
                                    <select
                                        value={filters.level}
                                        onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">{t('education.allLevels')}</option>
                                        {levels.map(level => (
                                            <option key={level.value} value={level.value}>{level.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Age Group Filter */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">{t('education.ageGroup')}</label>
                                    <select
                                        value={filters.ageGroup}
                                        onChange={(e) => setFilters({ ...filters, ageGroup: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">{t('education.allAges')}</option>
                                        {ageGroups.map(age => (
                                            <option key={age.value} value={age.value}>{age.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">{t('education.status')}</label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="">{t('education.allStatus')}</option>
                                        <option value="active">{t('education.active')}</option>
                                        <option value="full">{t('education.full')}</option>
                                        <option value="completed">{t('education.completed')}</option>
                                    </select>
                                </div>
                            </div>

                            {/* Clear Filters Button */}
                            {(filters.serviceType || filters.level || filters.ageGroup || (filters.status && filters.status !== 'active')) && (
                                <div className="mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFilters({ serviceType: '', level: '', ageGroup: '', status: 'active' })}
                                    >
                                        {t('common.clear')}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Services Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : filteredServices.length === 0 ? (
                    <motion.div
                        className="text-center py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <FiBook className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">{t('education.noServicesFound')}</h3>
                        <p className="text-muted-foreground">
                            {services.length === 0
                                ? t('education.noServicesAvailable')
                                : t('education.tryAdjustingFilters')}
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredServices.map((service, index) => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Card className="h-full flex flex-col card-hover" hoverable gradient>
                                    <div className="h-2 bg-gradient-to-r from-primary via-accent to-secondary rounded-t-xl" />

                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <CardTitle className="text-xl font-bold text-balance leading-tight flex-1">
                                                {service.title}
                                            </CardTitle>
                                            {getStatusBadge(service.status)}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {service.description}
                                        </p>
                                    </CardHeader>

                                    <CardContent className="flex-1 space-y-3">
                                        {/* Service Type */}
                                        <div className="flex items-center text-sm">
                                            <div className="p-2 bg-primary/10 rounded-lg mr-3">
                                                <FiBook className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="font-medium">
                                                {serviceTypes.find(t => t.value === service.service_type)?.label || service.service_type}
                                            </span>
                                        </div>

                                        {/* Instructor */}
                                        <div className="flex items-center text-sm">
                                            <div className="p-2 bg-accent/10 rounded-lg mr-3">
                                                <FiUser className="h-4 w-4 text-accent-foreground" />
                                            </div>
                                            <span>
                                                {t('education.instructor')}: {service.instructor?.first_name} {service.instructor?.last_name}
                                            </span>
                                        </div>

                                        {/* Schedule */}
                                        <div className="flex items-center text-sm">
                                            <div className="p-2 bg-secondary/10 rounded-lg mr-3">
                                                <FiClock className="h-4 w-4 text-secondary-foreground" />
                                            </div>
                                            <span>{service.schedule}</span>
                                        </div>

                                        {/* Duration */}
                                        <div className="flex items-center text-sm">
                                            <div className="p-2 bg-primary/10 rounded-lg mr-3">
                                                <FiCalendar className="h-4 w-4 text-primary" />
                                            </div>
                                            <span>{service.duration}</span>
                                        </div>

                                        {/* Capacity */}
                                        <div className="flex items-center text-sm">
                                            <div className="p-2 bg-accent/10 rounded-lg mr-3">
                                                <FiUsers className="h-4 w-4 text-accent-foreground" />
                                            </div>
                                            <span>
                                                {service.enrolled_count || 0} / {service.capacity} {t('common.enrolled')}
                                            </span>
                                        </div>

                                        {/* Fee */}
                                        <div className="flex items-center text-sm">
                                            <div className="p-2 bg-secondary/10 rounded-lg mr-3">
                                                <FiDollarSign className="h-4 w-4 text-secondary-foreground" />
                                            </div>
                                            <span className="font-semibold">
                                                {service.is_free ? t('common.free') : `${service.fee} ETB`}
                                            </span>
                                        </div>

                                        {/* Level & Age Group */}
                                        <div className="flex gap-2 flex-wrap pt-2">
                                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                                {levels.find(l => l.value === service.level)?.label || service.level}
                                            </span>
                                            <span className="px-2 py-1 bg-accent/10 text-accent-foreground text-xs rounded-full">
                                                {ageGroups.find(a => a.value === service.age_group)?.label || service.age_group}
                                            </span>
                                        </div>
                                    </CardContent>

                                    <CardFooter>
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="flex-shrink-0 flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => downloadServiceDetails(service)}
                                                    className="px-3 h-9 flex items-center"
                                                    aria-label="Download service details"
                                                >
                                                    <FaDownload className="h-4 w-4 mr-2" />
                                                    <span className="text-sm">{t('common.download')}</span>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => shareService(service)}
                                                    className="px-3 h-9 flex items-center"
                                                    aria-label={t('education.shareService')}
                                                >
                                                    <FaShare className="h-4 w-4 mr-2" />
                                                    <span className="text-sm">{t('common.share')}</span>
                                                </Button>
                                            </div>

                                            <div className="flex-1">
                                                {isEnrolled(service.id) ? (
                                                    <Button variant="outline" className="w-full" disabled>
                                                        <FiCheckCircle className="h-4 w-4 mr-2" />
                                                        {t('education.alreadyEnrolled')}
                                                    </Button>
                                                ) : service.status === 'full' ? (
                                                    <Button variant="outline" className="w-full" disabled>
                                                        {t('education.serviceFull')}
                                                    </Button>
                                                ) : service.status !== 'active' ? (
                                                    <Button variant="outline" className="w-full" disabled>
                                                        {t('education.notAvailable')}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="primary"
                                                        className="w-full"
                                                        onClick={() => handleEnrollClick(service)}
                                                        disabled={enrolling === service.id}
                                                    >
                                                        {enrolling === service.id ? t('education.enrolling') : t('education.enrollNow')}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* My Enrollments Section - Integrated with Student Dashboard */}
                {user && myEnrollments.length > 0 && (
                    <motion.div
                        className="mt-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-3xl font-bold mb-2">{t('education.myEnrollments')}</h2>
                                <p className="text-muted-foreground">
                                    {user.role === 'student'
                                        ? 'Access your courses, assignments, and grades from your Student Dashboard'
                                        : 'Manage your enrolled courses'}
                                </p>
                            </div>
                            {user.role === 'student' && (
                                <Button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center gap-2"
                                >
                                    <FiGrid className="h-4 w-4" />
                                    Go to Student Dashboard
                                </Button>
                            )}
                        </div>

                        {/* Student Dashboard Quick Access - Only for students */}
                        {user.role === 'student' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="mb-8"
                            >
                                <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FiBarChart2 className="text-blue-500" />
                                            Quick Access to Your Dashboard
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <Link to="/dashboard" className="group">
                                                <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-border hover:border-blue-500 transition-all cursor-pointer">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                                                            <FiCalendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <span className="font-semibold text-sm">Timetable</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">View your class schedule</p>
                                                </div>
                                            </Link>
                                            <Link to="/dashboard" className="group">
                                                <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-border hover:border-purple-500 transition-all cursor-pointer">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform">
                                                            <FiFileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <span className="font-semibold text-sm">Assignments</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">View and submit assignments</p>
                                                </div>
                                            </Link>
                                            <Link to="/dashboard" className="group">
                                                <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-border hover:border-green-500 transition-all cursor-pointer">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:scale-110 transition-transform">
                                                            <FiAward className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                        </div>
                                                        <span className="font-semibold text-sm">Grades</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Check your grades</p>
                                                </div>
                                            </Link>
                                            <Link to="/dashboard" className="group">
                                                <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-border hover:border-orange-500 transition-all cursor-pointer">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:scale-110 transition-transform">
                                                            <FiBookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                                        </div>
                                                        <span className="font-semibold text-sm">{t('education.myCourses')}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">View all courses</p>
                                                </div>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myEnrollments.map((enrollment, index) => {
                                const isConfirmed = enrollment.status === 'confirmed';
                                const service = services.find(s => s.id === (enrollment.service?.id || enrollment.service));

                                return (
                                    <motion.div
                                        key={enrollment.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <Card className={`card-hover h-full flex flex-col ${isConfirmed && user.role === 'student' ? 'border-l-4 border-l-blue-500' : ''}`} hoverable>
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <CardTitle className="text-lg flex-1">
                                                        {enrollment.service?.title || service?.title || 'Service'}
                                                    </CardTitle>
                                                    {isConfirmed && user.role === 'student' && (
                                                        <FiCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
                                                    )}
                                                </div>
                                                <div className="flex gap-2 mt-2 flex-wrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${enrollment.status === 'confirmed'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : enrollment.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        {enrollment.status}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${enrollment.payment_status === 'paid'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        }`}>
                                                        Payment: {enrollment.payment_status}
                                                    </span>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-1">
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {t('education.enrolled')}: {new Date(enrollment.enrollment_date || enrollment.created_at).toLocaleDateString()}
                                                </p>
                                                {service && (
                                                    <div className="space-y-2 text-sm">
                                                        {service.schedule && (
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <FiClock className="h-4 w-4" />
                                                                <span>{service.schedule}</span>
                                                            </div>
                                                        )}
                                                        {service.instructor && (
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <FiUser className="h-4 w-4" />
                                                                <span>{t('education.instructor')}: {service.instructor.first_name} {service.instructor.last_name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {enrollment.notes && (
                                                    <p className="text-sm mt-3 p-2 bg-muted rounded">{enrollment.notes}</p>
                                                )}
                                            </CardContent>
                                            <CardFooter className="pt-4 border-t">
                                                {isConfirmed && user.role === 'student' ? (
                                                    <Button
                                                        onClick={() => navigate('/dashboard')}
                                                        className="w-full flex items-center justify-center gap-2"
                                                        variant="primary"
                                                    >
                                                        <FiArrowRight className="h-4 w-4" />
                                                        Go to Course Dashboard
                                                    </Button>
                                                ) : enrollment.status === 'pending' ? (
                                                    <div className="w-full text-center text-sm text-muted-foreground">
                                                        Waiting for confirmation...
                                                    </div>
                                                ) : (
                                                    <div className="w-full text-center text-sm text-muted-foreground">
                                                        {t('education.enrollmentCancelled')}
                                                    </div>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Additional CTA for students */}
                        {user.role === 'student' && myEnrollments.filter(e => e.status === 'confirmed').length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="mt-8"
                            >
                                <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-xl font-bold mb-2">Ready to start learning?</h3>
                                                <p className="text-blue-100">
                                                    Access your timetable, assignments, exams, and grades all in one place
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => navigate('/dashboard')}
                                                variant="secondary"
                                                size="lg"
                                                className="whitespace-nowrap"
                                            >
                                                <FiGrid className="h-5 w-5 mr-2" />
                                                Open Student Dashboard
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </section>

            <Modal
                open={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title={t('education.completeEnrollment') || "Complete Enrollment"}
                size="md"
            >
                <div className="space-y-6">
                    {selectedService && (
                        <div className="bg-muted/30 p-4 rounded-lg border border-border">
                            <h3 className="font-semibold text-lg">{selectedService.title}</h3>
                            <p className="text-2xl font-bold text-primary">{selectedService.fee} ETB</p>
                            <p className="text-sm text-muted-foreground">{selectedService.schedule}</p>
                        </div>
                    )}

                    <PaymentMethodSelector
                        selectedMethod={paymentMethod}
                        onMethodChange={(method) => {
                            setPaymentMethod(method);
                            if (method !== 'manual_qr') setProofFile(null);
                        }}
                        onFileChange={setProofFile}
                        amount={parseFloat(selectedService?.fee || 0)}
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button
                            variant="ghost"
                            onClick={() => setIsPaymentModalOpen(false)}
                            disabled={!!enrolling}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={() => processEnrollment(selectedService, paymentMethod)}
                            disabled={!!enrolling}
                            isLoading={!!enrolling}
                        >
                            {t('common.confirm')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Education;
