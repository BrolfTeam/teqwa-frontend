import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FiCalendar,
    FiClock,
    FiMapPin,
    FiDollarSign,
    FiCheckCircle,
    FiXCircle,
    FiLoader,
    FiUsers,
    FiActivity,
    FiShield,
    FiArrowLeft,
    FiArrowRight,
    FiChevronDown,
    FiChevronUp,
    FiEdit,
    FiTrash2,
    FiRefreshCw,
    FiEye,
    FiAlertCircle,
    FiInfo
} from 'react-icons/fi';
import Hero from '@/components/ui/Hero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import { LoadingSpinner } from '@/components/ui';
import IslamicPattern from '@/components/ui/IslamicPattern';
import { dataService } from '@/lib/dataService';
import paymentService from '@/services/paymentService';
import { formSchemas } from '@/lib/validation';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import headerBg from '@/assets/futsal4.png';

const STATUS_COLORS = {
    available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    booked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
};

const STATUS_ICONS = {
    available: FiCheckCircle,
    booked: FiXCircle,
    pending: FiAlertCircle,
    confirmed: FiCheckCircle,
    cancelled: FiXCircle,
    completed: FiCheckCircle
};

// Helper function for safe translations
const getTranslation = (t, key, fallback) => {
  const translation = t(key, { defaultValue: fallback });
  if (translation === key && key.includes('.')) {
    return fallback;
  }
  return translation;
};

// Calendar Component
const CalendarView = memo(({ selectedDate, onDateSelect, minDate }) => {
    const { t } = useTranslation();
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
    const today = useMemo(() => new Date(), []);
    
    const getDaysInMonth = useCallback((date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        const days = [];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        
        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }
        
        return days;
    }, []);
    
    const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth, getDaysInMonth]);
    
    const monthNames = [
        getTranslation(t, 'islamicCalendar.monthNames.january', 'January'),
        getTranslation(t, 'islamicCalendar.monthNames.february', 'February'),
        getTranslation(t, 'islamicCalendar.monthNames.march', 'March'),
        getTranslation(t, 'islamicCalendar.monthNames.april', 'April'),
        getTranslation(t, 'islamicCalendar.monthNames.may', 'May'),
        getTranslation(t, 'islamicCalendar.monthNames.june', 'June'),
        getTranslation(t, 'islamicCalendar.monthNames.july', 'July'),
        getTranslation(t, 'islamicCalendar.monthNames.august', 'August'),
        getTranslation(t, 'islamicCalendar.monthNames.september', 'September'),
        getTranslation(t, 'islamicCalendar.monthNames.october', 'October'),
        getTranslation(t, 'islamicCalendar.monthNames.november', 'November'),
        getTranslation(t, 'islamicCalendar.monthNames.december', 'December')
    ];
    
    const weekDays = [
        getTranslation(t, 'islamicCalendar.dayNamesShort.sun', 'Sun'),
        getTranslation(t, 'islamicCalendar.dayNamesShort.mon', 'Mon'),
        getTranslation(t, 'islamicCalendar.dayNamesShort.tue', 'Tue'),
        getTranslation(t, 'islamicCalendar.dayNamesShort.wed', 'Wed'),
        getTranslation(t, 'islamicCalendar.dayNamesShort.thu', 'Thu'),
        getTranslation(t, 'islamicCalendar.dayNamesShort.fri', 'Fri'),
        getTranslation(t, 'islamicCalendar.dayNamesShort.sat', 'Sat')
    ];
    
    const navigateMonth = (direction) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };
    
    const isDateDisabled = (date) => {
        if (!date) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };
    
    const isSelected = (date) => {
        if (!date) return false;
        return date.toDateString() === new Date(selectedDate).toDateString();
    };
    
    const isToday = (date) => {
        if (!date) return false;
        return date.toDateString() === today.toDateString();
    };
    
    return (
        <div className="bg-background rounded-2xl border border-border/50 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigateMonth(-1)}
                        className="p-2 rounded-lg hover:bg-background/50 transition-colors"
                        aria-label="Previous month"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-lg font-semibold">
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                    <button
                        onClick={() => navigateMonth(1)}
                        className="p-2 rounded-lg hover:bg-background/50 transition-colors"
                        aria-label="Next month"
                    >
                        <FiArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            <div className="p-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                            {day}
                        </div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                    {days.map((date, index) => {
                        if (!date) {
                            return <div key={`empty-${index}`} className="aspect-square" />;
                        }
                        
                        const disabled = isDateDisabled(date);
                        const selected = isSelected(date);
                        const todayDate = isToday(date);
                        
                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => !disabled && onDateSelect(date)}
                                disabled={disabled}
                                className={`
                                    aspect-square rounded-lg text-sm font-medium
                                    transition-all duration-200
                                    ${disabled 
                                        ? 'text-muted-foreground/30 cursor-not-allowed' 
                                        : selected
                                            ? 'bg-primary text-primary-foreground shadow-md scale-105'
                                            : todayDate
                                                ? 'bg-primary/10 text-primary border-2 border-primary'
                                                : 'hover:bg-muted text-foreground hover:scale-105'
                                    }
                                `}
                                aria-label={`Select ${date.toLocaleDateString()}`}
                            >
                                {date.getDate()}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});
CalendarView.displayName = 'CalendarView';

// Time Slot Card Component
const TimeSlotCard = memo(({ slot, onSelect, isSelected }) => {
    const { t } = useTranslation();
    const status = slot.available ? 'available' : 'booked';
    const StatusIcon = STATUS_ICONS[status];
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                className={`
                    cursor-pointer transition-all duration-300
                    ${isSelected ? 'ring-2 ring-primary shadow-lg' : ''}
                    ${slot.available 
                        ? 'border-primary/20 hover:border-primary/40 hover:shadow-md' 
                        : 'opacity-75 border-border/30 cursor-not-allowed'
                    }
                `}
                onClick={() => slot.available && onSelect(slot)}
            >
                <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-primary/10 rounded-lg p-2">
                                    <FiClock className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{slot.time}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide">{t('futsal.timeSlot')}</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm">
                                <FiMapPin className="w-4 h-4" />
                                <span>{slot.location || t('futsal.mainCourt')}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-3 text-muted-foreground text-sm">
                                <FiUsers className="w-4 h-4" />
                                <span>{t('futsal.maxPlayers', { count: slot.max_players || 12 })}</span>
                            </div>
                        </div>
                        
                        <Badge className={STATUS_COLORS[status]}>
                            <StatusIcon className="w-3.5 h-3.5 mr-1" />
                            {slot.available ? t('futsal.available') : t('futsal.booked')}
                        </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">{t('futsal.price')}</div>
                            <div className="text-2xl font-bold text-primary">{slot.price}</div>
                            <div className="text-xs text-muted-foreground">{t('futsal.etb')}</div>
                        </div>
                        
                        <Button
                            disabled={!slot.available}
                            variant={slot.available ? 'primary' : 'ghost'}
                            size="sm"
                            className="min-w-[100px]"
                        >
                            {slot.available ? (
                                <>
                                    <FiCheckCircle className="w-4 h-4 mr-2" />
                                    {t('futsal.bookNow')}
                                </>
                            ) : (
                                <>
                                    <FiXCircle className="w-4 h-4 mr-2" />
                                    {t('futsal.unavailable')}
                                </>
                            )}
                        </Button>
                    </div>
                    
                    {!slot.available && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500" />
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
});
TimeSlotCard.displayName = 'TimeSlotCard';

// Booking History Component
const BookingHistory = memo(({ bookings, onRefresh }) => {
    return (
        <div className="grid gap-4">
            {bookings.map((booking) => {
                const StatusIcon = STATUS_ICONS[booking.status] || FiInfo;
                const slot = booking.slot_info || booking.slot;
                
                return (
                    <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-primary/10 rounded-lg p-2">
                                                <FiClock className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg">
                                                    {slot?.time || 'Time slot'}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {slot?.date ? new Date(slot.date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) : ''}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <FiMapPin className="w-4 h-4" />
                                                {slot?.location || 'Main Court'}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <FiUsers className="w-4 h-4" />
                                                {booking.player_count || 0} players
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <FiDollarSign className="w-4 h-4" />
                                                {slot?.price || '0'} ETB
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <Badge className={STATUS_COLORS[booking.status] || STATUS_COLORS.pending}>
                                            <StatusIcon className="w-3.5 h-3.5 mr-1" />
                                            {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Pending'}
                                        </Badge>
                                        
                                        {booking.status === 'pending' && (
                                            <Button variant="outline" size="sm">
                                                <FiEye className="w-4 h-4 mr-2" />
                                                View Details
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
});
BookingHistory.displayName = 'BookingHistory';

const Futsal = memo(() => {
    const { t } = useTranslation();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);
    
    // State Management
    const [selectedDate, setSelectedDate] = useState(today);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [showBookingHistory, setShowBookingHistory] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'calendar'
    
    // Form State
    const [form, setForm] = useState({
        slotId: '',
        date: today,
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        playerCount: 6,
        agreeToRules: false
    });
    const [errors, setErrors] = useState({});
    const [isBooking, setIsBooking] = useState(false);
    
    // Fetch slots for selected date
    const fetchSlots = useCallback(async (date) => {
        setLoading(true);
        try {
            const data = await dataService.getFutsalSlots({ date });
            setSlots(Array.isArray(data) ? data : data?.data || []);
        } catch (error) {
            console.error('Failed to fetch slots:', error);
            toast.error('Failed to load futsal slots');
            setSlots([]);
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Fetch user bookings
    const fetchBookings = useCallback(async () => {
        if (!isAuthenticated) return;
        
        try {
            const data = await dataService.getMyFutsalBookings();
            setBookings(Array.isArray(data) ? data : data?.data || []);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        }
    }, [isAuthenticated]);
    
    // Effects
    useEffect(() => {
        fetchSlots(selectedDate);
    }, [selectedDate, fetchSlots]);
    
    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);
    
    // Computed values
    const availableSlots = useMemo(() => 
        slots.filter(s => s.available), 
        [slots]
    );
    
    const bookedSlots = useMemo(() => 
        slots.filter(s => !s.available), 
        [slots]
    );
    
    // Handlers
    const handleDateSelect = (date) => {
        const dateString = date.toISOString().split('T')[0];
        setSelectedDate(dateString);
        setSelectedSlot(null);
    };
    
    const handleSlotSelect = (slot) => {
        if (!isAuthenticated) {
            toast.error('Please login to book a slot');
            navigate('/login');
            return;
        }
        
        setSelectedSlot(slot);
        setForm(prev => ({
            ...prev,
            slotId: slot.id,
            date: slot.date || selectedDate,
            contactName: user?.first_name && user?.last_name 
                ? `${user.first_name} ${user.last_name}` 
                : user?.username || '',
            contactEmail: user?.email || '',
            contactPhone: user?.phone || '',
            playerCount: Math.min(slot.max_players || 12, 6)
        }));
        setErrors({});
        setBookingModalOpen(true);
    };
    
    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };
    
    const handleBook = async () => {
        if (!selectedSlot) return;
        
        setIsBooking(true);
        setErrors({});
        
        try {
            // Validate form
            const parsed = formSchemas.futsalBooking.parse({
                slotId: String(form.slotId),
                date: form.date,
                startTime: selectedSlot.start_time || selectedSlot.time?.split('-')[0] || '',
                endTime: selectedSlot.end_time || selectedSlot.time?.split('-')[1] || '',
                playerCount: Number(form.playerCount),
                contactName: form.contactName,
                contactEmail: form.contactEmail,
                contactPhone: form.contactPhone,
                agreeToRules: form.agreeToRules
            });
            
            // Prepare API payload
            const apiPayload = {
                contact_name: parsed.contactName,
                contact_email: parsed.contactEmail,
                contact_phone: parsed.contactPhone || '',
                player_count: parsed.playerCount,
                agree_to_rules: parsed.agreeToRules
            };
            
            // Create booking
            const bookingResponse = await dataService.bookFutsalSlot(parsed.slotId, apiPayload);
            const booking = bookingResponse?.data || bookingResponse;
            
            if (!booking?.id) {
                throw new Error('Failed to create booking');
            }
            
            // Initialize payment
            try {
                const price = parseFloat(selectedSlot.price) || 0;
                const paymentResponse = await paymentService.initializePayment({
                    amount: price,
                    currency: 'ETB',
                    email: parsed.contactEmail,
                    first_name: parsed.contactName.split(' ')[0],
                    last_name: parsed.contactName.split(' ').slice(1).join(' ') || '',
                    phone_number: parsed.contactPhone || '0900000000',
                    content_type_model: 'futsalbooking',
                    object_id: booking.id
                });
                
                if (paymentResponse?.checkout_url) {
                    toast.success('Booking created! Redirecting to payment...');
                    window.location.href = paymentResponse.checkout_url;
                    return;
                }
            } catch (paymentError) {
                console.error('Payment initialization error:', paymentError);
                toast.error('Booking created but payment initialization failed. Please check your bookings.');
            }
            
            toast.success('Booking confirmed successfully!');
            setBookingModalOpen(false);
            setSelectedSlot(null);
            
            // Refresh data
            dataService.clearCacheByPattern('getFutsalSlots');
            dataService.clearCacheByPattern('getMyFutsalBookings');
            fetchSlots(selectedDate);
            fetchBookings();
            
        } catch (error) {
            console.error('Booking error:', error);
            if (error?.errors) {
                const validationErrors = {};
                error.errors.forEach(e => {
                    validationErrors[e.path.join('.')] = e.message;
                });
                setErrors(validationErrors);
            } else {
                setErrors({ form: error.message || 'An unexpected error occurred' });
                toast.error(error.message || 'Booking failed. Please try again.');
            }
        } finally {
            setIsBooking(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
            {/* Hero Section */}
            <Hero
                title={t('futsal.title')}
                titleHighlight={t('futsal.bookNow')}
                align="left"
                description={t('futsal.bookSubtitle')}
                backgroundImage={headerBg}
                primaryAction={<a href="#booking-section">{t('futsal.bookNow')}</a>}
                secondaryAction={<a href="#features">{t('common.learnMore')}</a>}
            />
            
            {/* Features Section */}
            <section id="features" className="container mx-auto px-4 py-16">
                <div className="bg-muted/30 rounded-3xl p-8 md:p-16 relative overflow-hidden">
                    <IslamicPattern className="opacity-[0.02]" />
                    <div className="max-w-5xl mx-auto relative z-10">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('futsal.whyPlayHere.title')}</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                                {t('futsal.whyPlayHere.description')}
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { icon: FiActivity, title: t('futsal.whyPlayHere.professionalCourt.title'), desc: t('futsal.whyPlayHere.professionalCourt.description') },
                                { icon: FiDollarSign, title: t('futsal.whyPlayHere.affordableRates.title'), desc: t('futsal.whyPlayHere.affordableRates.description') },
                                { icon: FiUsers, title: t('futsal.whyPlayHere.communityHub.title'), desc: t('futsal.whyPlayHere.communityHub.description') },
                                { icon: FiShield, title: t('futsal.whyPlayHere.safeEnvironment.title'), desc: t('futsal.whyPlayHere.safeEnvironment.description') }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: i * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="bg-background rounded-xl w-14 h-14 flex items-center justify-center mx-auto mb-4 shadow-md border border-border/50">
                                        <feature.icon className="w-7 h-7 text-primary" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Booking Section */}
            <section id="booking-section" className="container mx-auto px-4 py-12">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold mb-2">{t('futsal.bookYourSlotTitle')}</h2>
                        <p className="text-muted-foreground text-lg">{t('futsal.bookSubtitle')}</p>
                    </div>
                    
                    {/* Date Selection & View Toggle */}
                    <Card className="mb-8 p-6 bg-muted/30 border-border/50">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-3">
                                    <div className="bg-background rounded-xl p-3 border border-border/50 shadow-sm">
                                        <FiCalendar className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground block mb-1">
                                            {t('futsal.selectDate')}
                                        </label>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => {
                                                setSelectedDate(e.target.value);
                                                setSelectedSlot(null);
                                            }}
                                            min={today}
                                            className="bg-background border border-border/50 rounded-lg px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={viewMode === 'grid' ? 'primary' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                    >
                                        {t('futsal.gridView')}
                                    </Button>
                                    <Button
                                        variant={viewMode === 'calendar' ? 'primary' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('calendar')}
                                    >
                                        {t('futsal.calendarView')}
                                    </Button>
                                </div>
                            </div>
                            
                            {loading ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <FiLoader className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">{t('common.loading')}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 flex-wrap">
                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                        <FiCheckCircle className="w-3.5 h-3.5 mr-1" />
                                        {availableSlots.length} {t('futsal.available')}
                                    </Badge>
                                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                        <FiXCircle className="w-3.5 h-3.5 mr-1" />
                                        {bookedSlots.length} {t('futsal.booked')}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {slots.length} {t('futsal.timeSlot')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Card>
                    
                    {/* Calendar and Slots Grid */}
                    <div className="grid lg:grid-cols-4 gap-6 mb-8">
                        {/* Calendar View */}
                        {viewMode === 'calendar' && (
                            <div className="lg:col-span-1">
                                <CalendarView
                                    selectedDate={selectedDate}
                                    onDateSelect={handleDateSelect}
                                    minDate={today}
                                />
                            </div>
                        )}
                        
                        {/* Time Slots Grid */}
                        <div className={viewMode === 'calendar' ? 'lg:col-span-3' : 'lg:col-span-4'}>
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <LoadingSpinner size="lg" />
                                    <p className="text-muted-foreground mt-4">{t('futsal.loadingSlots')}</p>
                                </div>
                            ) : slots.length === 0 ? (
                                <Card className="p-12 text-center">
                                    <div className="max-w-md mx-auto">
                                        <FiCalendar className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold mb-2">{t('futsal.noSlotsAvailable')}</h3>
                                        <p className="text-muted-foreground mb-6">
                                            {t('futsal.noSlotsMessage')}
                                        </p>
                                        <Button onClick={() => setSelectedDate(today)} variant="outline">
                                            <FiCalendar className="w-4 h-4 mr-2" />
                                            {t('futsal.viewTodaySlots')}
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    <AnimatePresence mode="wait">
                                        {slots.map((slot) => (
                                            <TimeSlotCard
                                                key={slot.id}
                                                slot={slot}
                                                onSelect={handleSlotSelect}
                                                isSelected={selectedSlot?.id === slot.id}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Booking History Section */}
            {isAuthenticated && bookings.length > 0 && (
                <section className="container mx-auto px-4 py-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('futsal.bookingHistory')}</h2>
                                <p className="text-muted-foreground">View and manage your futsal bookings</p>
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => setShowBookingHistory(!showBookingHistory)}
                                size="sm"
                            >
                                {showBookingHistory ? (
                                    <>
                                        <FiChevronUp className="w-4 h-4 mr-2" />
                                        Hide History
                                    </>
                                ) : (
                                    <>
                                        <FiChevronDown className="w-4 h-4 mr-2" />
                                        Show History
                                    </>
                                )}
                            </Button>
                        </div>
                        
                        <AnimatePresence>
                            {showBookingHistory && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <BookingHistory bookings={bookings} onRefresh={fetchBookings} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>
            )}
            
            {/* Booking Modal */}
            <Modal
                open={bookingModalOpen}
                onClose={() => {
                    setBookingModalOpen(false);
                    setSelectedSlot(null);
                    setErrors({});
                }}
                title={t('futsal.confirmBooking')}
                size="lg"
            >
                {selectedSlot && (
                    <div className="space-y-6">
                        {/* {t('futsal.bookingSummary')} */}
                        <Card className="bg-muted/30 border-primary/20">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-primary/10 rounded-lg p-2">
                                                <FiClock className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold">{selectedSlot.time}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {new Date(selectedSlot.date || selectedDate).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <FiMapPin className="w-4 h-4" />
                                                {selectedSlot.location || 'Main Court'}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <FiUsers className="w-4 h-4" />
                                                Max {selectedSlot.max_players || 12} players
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-background rounded-xl p-5 border border-border/50 min-w-[140px]">
                                        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t('donations.donationAmount')}</div>
                                        <div className="text-3xl font-bold text-primary">{selectedSlot.price}</div>
                                        <div className="text-xs text-muted-foreground">ETB</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Booking Form */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">{t('contact.sendUsMessage')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Contact Name" required>
                                    <input
                                        name="contactName"
                                        value={form.contactName}
                                        onChange={handleFormChange}
                                        placeholder="Enter your full name"
                                        className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all ${
                                            errors['contactName'] ? 'border-red-500' : 'border-border'
                                        }`}
                                    />
                                    {errors['contactName'] && (
                                        <div className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                                            <FiXCircle className="w-3.5 h-3.5" />
                                            {errors['contactName']}
                                        </div>
                                    )}
                                </FormField>
                                
                                <FormField label="Contact Email" required>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        value={form.contactEmail}
                                        onChange={handleFormChange}
                                        placeholder="your.email@example.com"
                                        className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all ${
                                            errors['contactEmail'] ? 'border-red-500' : 'border-border'
                                        }`}
                                    />
                                    {errors['contactEmail'] && (
                                        <div className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                                            <FiXCircle className="w-3.5 h-3.5" />
                                            {errors['contactEmail']}
                                        </div>
                                    )}
                                </FormField>
                                
                                <FormField label="Number of Players" required>
                                    <input
                                        type="number"
                                        name="playerCount"
                                        value={form.playerCount}
                                        onChange={handleFormChange}
                                        min="1"
                                        max={selectedSlot.max_players || 12}
                                        placeholder="6"
                                        className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all ${
                                            errors['playerCount'] ? 'border-red-500' : 'border-border'
                                        }`}
                                    />
                                    {errors['playerCount'] && (
                                        <div className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                                            <FiXCircle className="w-3.5 h-3.5" />
                                            {errors['playerCount']}
                                        </div>
                                    )}
                                </FormField>
                                
                                <FormField label="Phone Number (Optional)">
                                    <input
                                        type="tel"
                                        name="contactPhone"
                                        value={form.contactPhone}
                                        onChange={handleFormChange}
                                        placeholder="+251 9XX XXX XXXX"
                                        className="w-full border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    />
                                </FormField>
                            </div>
                        </div>
                        
                        {/* Terms and Conditions */}
                        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="agreeToRules"
                                    name="agreeToRules"
                                    checked={form.agreeToRules}
                                    onChange={handleFormChange}
                                    className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/50"
                                />
                                <label htmlFor="agreeToRules" className="text-sm text-foreground cursor-pointer flex-1">
                                    I agree to the booking rules and terms. I understand that payment is required to confirm this booking and the booking may be cancelled if payment is not completed.
                                </label>
                            </div>
                            {errors['agreeToRules'] && (
                                <div className="text-red-600 text-sm mt-2 ml-7 flex items-center gap-1">
                                    <FiXCircle className="w-3.5 h-3.5" />
                                    {errors['agreeToRules']}
                                </div>
                            )}
                        </div>
                        
                        {/* Error Message */}
                        {errors['form'] && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2">
                                <FiAlertCircle className="w-5 h-5 text-red-600" />
                                <span className="text-sm text-red-600">{errors['form']}</span>
                            </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border/50">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setBookingModalOpen(false);
                                    setSelectedSlot(null);
                                    setErrors({});
                                }}
                                size="md"
                                disabled={isBooking}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleBook}
                                size="md"
                                className="min-w-[180px]"
                                disabled={isBooking}
                            >
                                {isBooking ? (
                                    <>
                                        <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FiCheckCircle className="w-4 h-4 mr-2" />
                                        {t('common.submit')} & {t('donations.donate')} {selectedSlot.price} ETB
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
});

Futsal.displayName = 'Futsal';
export default Futsal;
