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
    FiArrowLeft,
    FiArrowRight,
    FiRefreshCw,
    FiEye,
    FiAlertCircle,
    FiInfo,
    FiGrid,
    FiList,
    FiAward,
    FiHeart
} from 'react-icons/fi';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';
import Hero from '@/components/ui/Hero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import { LoadingSpinner } from '@/components/ui';
import { dataService } from '@/lib/dataService';
import paymentService from '@/services/paymentService';
import { formSchemas } from '@/lib/validation';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import headerBg from '@/assets/futsal4.png';

// Skeleton Component for loading states
const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-muted/40 rounded-xl ${className}`} />
);

const STATUS_COLORS = {
    available: 'bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-emerald-500/20',
    booked: 'bg-red-100/50 text-red-700 dark:bg-red-500/10 dark:text-red-400 ring-1 ring-red-500/20',
    pending: 'bg-amber-100/50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 ring-1 ring-amber-500/20',
    confirmed: 'bg-blue-100/50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 ring-1 ring-blue-500/20',
    cancelled: 'bg-gray-100/50 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400 ring-1 ring-gray-500/20',
    completed: 'bg-primary/10 text-primary ring-1 ring-primary/20'
};

const STATUS_ICONS = {
    available: FiCheckCircle,
    booked: FiXCircle,
    pending: FiClock,
    confirmed: FiCheckCircle,
    cancelled: FiXCircle,
    completed: FiAward
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
// DatePicker Component (using CalendarView internally)
const DatePicker = ({ selectedDate, onDateSelect, className }) => {
    return (
        <div className={className}>
            <CalendarView selectedDate={selectedDate} onDateSelect={onDateSelect} />
        </div>
    );
};

// Time Slot Card Component
const SlotCard = memo(({ slot, onSelect, isSelected, viewMode, index }) => {
    const { t } = useTranslation();
    const status = slot.available ? 'available' : 'booked';
    const StatusIcon = STATUS_ICONS[status];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={slot.available ? { y: -5 } : {}}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Card
                className={`
                    relative overflow-hidden transition-all duration-300 border
                    ${isSelected
                        ? 'ring-2 ring-primary border-primary shadow-lg scale-[1.02]'
                        : 'border-border/40 hover:border-primary/30 hover:shadow-xl'
                    }
                    ${!slot.available ? 'opacity-80' : 'bg-card/50 backdrop-blur-sm'}
                `}
                onClick={() => slot.available && onSelect(slot)}
            >
                {/* Decorative gradient blob */}
                {slot.available && (
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                )}

                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="px-2.5 py-0.5 h-6 text-xs font-medium border-primary/20 bg-primary/5 text-primary">
                                    {slot.category || 'Standard Match'}
                                </Badge>
                                {!slot.available && (
                                    <Badge variant="destructive" className="h-6 px-2.5">
                                        Booked
                                    </Badge>
                                )}
                            </div>

                            <h3 className="text-xl font-bold tracking-tight text-foreground">
                                {slot.time}
                            </h3>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground/80">
                                <span className="flex items-center gap-1.5">
                                    <FiUsers className="w-4 h-4 text-primary/70" />
                                    {t('futsal.maxPlayers', { count: slot.max_players || 12 })}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <FiDollarSign className="w-4 h-4 text-primary/70" />
                                    {slot.price} ETB
                                </span>
                            </div>
                        </div>

                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center transition-colors
                            ${slot.available
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-red-500/10 text-red-600 dark:text-red-400'
                            }
                        `}>
                            <StatusIcon className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border/40">
                        <Button
                            className={`w-full group relative overflow-hidden ${slot.available
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-primary/25'
                                : 'bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed'
                                }`}
                            disabled={!slot.available}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (slot.available) onSelect(slot);
                            }}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2 font-semibold">
                                {slot.available ? (
                                    <>
                                        {t('futsal.bookNow')}
                                        <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                ) : (
                                    <>
                                        {t('futsal.unavailable')}
                                        <FiXCircle className="w-4 h-4" />
                                    </>
                                )}
                            </span>
                            {slot.available && (
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
});
SlotCard.displayName = 'SlotCard';

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
                                                {t('common.viewDetails')}
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
    const { t, i18n } = useTranslation();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);

    // State Management
    const [selectedDate, setSelectedDate] = useState(today);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [futsalSettings, setFutsalSettings] = useState(null);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringDuration, setRecurringDuration] = useState({ type: 'weeks', value: 4 });
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('manual_qr');
    const [proofFile, setProofFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        playerCount: 12,
        notes: '',
        agreeToRules: false
    });

    const [errors, setErrors] = useState({});

    // Fetch Futsal Settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await dataService.getFutsalSettings();
                setFutsalSettings(data);
            } catch (err) {
                console.error('Error fetching futsal settings:', err);
            }
        };
        fetchSettings();
    }, []);

    // Pre-fill form if user is authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            setForm(prev => ({
                ...prev,
                contactName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || '',
                contactEmail: user.email || '',
                contactPhone: user.phone || prev.contactPhone
            }));
        }
    }, [isAuthenticated, user]);
    const [bookings, setBookings] = useState([]);
    const [showBookingHistory, setShowBookingHistory] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'calendar'

    // Fetch slots for selected date
    const fetchSlots = useCallback(async (date) => {
        setLoading(true);
        try {
            const data = await dataService.getFutsalSlots({ date });
            setSlots(Array.isArray(data) ? data : data?.data || []);
        } catch (error) {
            console.error('Failed to fetch slots:', error);
            toast.error(t('futsal.slotsLoadFailed'));
            setSlots([]);
        } finally {
            setLoading(false);
        }
    }, [t]);

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
        setSelectedSlot(slot);
        setForm(prev => ({
            ...prev,
            slotId: slot.id,
            date: slot.date || selectedDate,
            contactName: isAuthenticated && user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : prev.contactName,
            contactEmail: isAuthenticated && user ? user.email : prev.contactEmail,
            contactPhone: isAuthenticated && user ? user.phone : prev.contactPhone,
            playerCount: slot.max_players || 12,
            agreeToRules: false
        }));
        // Reset recurring state
        setIsRecurring(false);
        setRecurringDuration({ type: 'weeks', value: 4 });
        setErrors({});
        setIsBookingModalOpen(true);
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

        if (paymentMethod === 'manual_qr' && !proofFile) {
            toast.error(t('payment.proofRequired'));
            return;
        }

        setIsSubmitting(true);
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

            if (isRecurring) {
                // Handle Recurring Contract Booking
                const contractPayload = {
                    slot_id: parsed.slotId,
                    duration_weeks: recurringDuration.type === 'weeks' ? recurringDuration.value : 0,
                    duration_months: recurringDuration.type === 'months' ? recurringDuration.value : 0,
                    contact_name: parsed.contactName, // Pass these to backend to create user if needed or for reference
                    contact_email: parsed.contactEmail,
                    contact_phone: parsed.contactPhone || ''
                };

                const response = await dataService.createContractBooking(contractPayload);

                // If successful, we might need payment for the contract.
                // Creating contract usually implies immediate approval or payment.
                // The current backend implementation just creates bookings.
                // If payment is needed, we should handle it here.
                // For now, assume manual_qr is default for contracts or handle similarly.

                toast.success(t('futsal.contractCreated'));
                // Redirect or show success
            } else if (paymentMethod === 'manual_qr') {
                const formData = new FormData();
                formData.append('contact_name', parsed.contactName);
                formData.append('contact_email', parsed.contactEmail);
                formData.append('contact_phone', parsed.contactPhone || '');
                formData.append('player_count', parsed.playerCount);
                formData.append('agree_to_rules', parsed.agreeToRules);
                formData.append('payment_method', 'manual_qr');
                formData.append('proof_image', proofFile);

                await dataService.bookFutsalSlot(parsed.slotId, formData);

                toast.success(t('futsal.bookingSubmitted'));
            } else {
                // Prepare API payload
                const apiPayload = {
                    contact_name: parsed.contactName,
                    contact_email: parsed.contactEmail,
                    contact_phone: parsed.contactPhone || '',
                    player_count: parsed.playerCount,
                    agree_to_rules: parsed.agreeToRules,
                    payment_method: 'card'
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
                        toast.success(t('futsal.bookingCreatedRedirecting'));
                        window.location.href = paymentResponse.checkout_url;
                        return;
                    }
                } catch (paymentError) {
                    console.error('Payment initialization error:', paymentError);
                    toast.error(t('futsal.bookingPaymentFailed'));
                }

                toast.success('Booking confirmed successfully!');
            }

            setIsBookingModalOpen(false);
            setSelectedSlot(null);
            setProofFile(null);
            setPaymentMethod('card');

            // Refresh data
            dataService.clearCacheByPattern('getFutsalSlots');
            dataService.clearCacheByPattern('getMyFutsalBookings');
            fetchSlots(selectedDate);
            fetchBookings();

        } catch (error) {
            console.error('Booking error:', error);
            if (error?.errors || (error?.data && typeof error.data === 'object' && !Array.isArray(error.data))) {
                const validationErrors = {};

                // Handle Zod errors (array of objects with path/message)
                if (Array.isArray(error?.errors)) {
                    error.errors.forEach(e => {
                        validationErrors[e.path.join('.')] = e.message;
                    });
                }
                // Handle standard API field errors (object with field: [messages] or field: message)
                else if (error?.data) {
                    Object.entries(error.data).forEach(([key, value]) => {
                        validationErrors[key] = Array.isArray(value) ? value[0] : value;
                    });
                }

                setErrors(validationErrors);
            } else {
                const message = error?.message || (typeof error?.data === 'string' ? error.data : 'An unexpected error occurred');
                setErrors({ form: message });
                toast.error(message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20 overflow-x-hidden">
            {/* Hero Section — refined for 'Islamic professional' tone */}
            <Hero
                title="Community Futsal"
                titleHighlight="Strengthen Brotherhood"
                description="More than just a game. A space to connect, stay active, and build lasting bonds in a premium, private environment."
                backgroundImage={headerBg}
                actions={[
                    {
                        label: 'Book Your Slot',
                        href: '#booking-section',
                        variant: 'primary',
                    },
                    ...(isAuthenticated ? [{
                        label: 'My Bookings',
                        onClick: () => setShowBookingHistory(true),
                        variant: 'outline',
                    }] : []),
                ]}
            />

            {/* Stats Section — aligned with Teqwa values */}
            <section className="container container-padding py-12 -mt-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Daily Gatherings', value: 'Active Jamaa\'ah', icon: FiUsers, color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-200/50' },
                        { label: 'Facility Quality', value: 'Premium & Private', icon: FiAward, color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-200/50' },
                        { label: 'Community', value: 'Growing Brotherhood', icon: FiHeart, color: 'text-rose-600', bg: 'bg-rose-500/10', border: 'border-rose-200/50' },
                        { label: 'Live Slots', value: `${availableSlots.length} Available`, icon: FiActivity, color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-200/50' },
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={`bg-card/50 backdrop-blur-sm border ${stat.border} p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold tracking-tight mb-1">{stat.value}</h3>
                            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Booking Section */}
            <section id="booking-section" className="container container-padding pb-20">
                {/* Date Picker & Bar */}
                <div className="bg-card border border-border/50 shadow-sm rounded-2xl p-6 md:p-8 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

                    <div className="relative flex flex-col lg:flex-row gap-8 items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
                                <FiCalendar className="w-7 h-7 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight mb-1">Select Schedule</h2>
                                <p className="text-muted-foreground text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Book your session locally
                                </p>
                            </div>
                        </div>

                        <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
                            <div className="relative z-20">
                                <DatePicker
                                    selectedDate={new Date(selectedDate)}
                                    onDateSelect={handleDateSelect}
                                    className="w-full sm:w-[320px] shadow-sm"
                                />
                            </div>
                            {isAuthenticated && (
                                <Button
                                    variant={showBookingHistory ? "default" : "outline"}
                                    onClick={() => setShowBookingHistory(!showBookingHistory)}
                                    className="rounded-xl h-[48px] px-6 font-semibold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                                >
                                    <FiClock className="w-4 h-4 mr-2" />
                                    {showBookingHistory ? "View Available Slots" : "My Bookings"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Dynamic Content Area */}
                {showBookingHistory ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Booking History</h2>
                                <p className="text-muted-foreground">Track your upcoming and past matches</p>
                            </div>
                            <Badge variant="secondary" className="px-3 py-1 rounded-full h-8 text-sm">
                                {bookings.length} Sessions
                            </Badge>
                        </div>
                        <BookingHistory bookings={bookings} onRefresh={fetchBookings} />
                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6">
                            <div>
                                <h3 className="text-2xl font-bold mb-1">Available Times</h3>
                                <p className="text-muted-foreground">
                                    {format(new Date(selectedDate), 'EEEE, MMMM do, yyyy')}
                                </p>
                            </div>
                            <div className="flex bg-muted/30 p-1 rounded-xl border border-border/40">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:bg-background/40'}`}
                                >
                                    <FiGrid className="w-4 h-4" />
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:bg-background/40'}`}
                                >
                                    <FiList className="w-4 h-4" />
                                    List
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <Skeleton key={i} className="h-[240px] rounded-2xl" />
                                ))}
                            </div>
                        ) : slots.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-24 bg-card/30 rounded-3xl border border-dashed border-border/50"
                            >
                                <div className="p-6 bg-background rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg ring-4 ring-primary/5">
                                    <FiCalendar className="w-10 h-10 text-muted-foreground/40" />
                                </div>
                                <h4 className="text-xl font-bold mb-2">No Matches Scheduled</h4>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                                    All slots are booked for this date. Check another day for an open court, insha'Allah.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedDate(today)}
                                    className="rounded-full px-8 py-6 h-auto border-primary/20 hover:bg-primary hover:text-white hover:border-primary transition-all font-semibold shadow-sm hover:shadow-md"
                                >
                                    Check Today's Availability
                                </Button>
                            </motion.div>
                        ) : (
                            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-3xl mx-auto'}`}>
                                <AnimatePresence mode="popLayout">
                                    {slots.map((slot, index) => (
                                        <SlotCard
                                            key={slot.id}
                                            slot={slot}
                                            onSelect={handleSlotSelect}
                                            index={index}
                                            viewMode={viewMode}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Booking Modal — single-column vertical flow, matching Membership/Donations */}
            <Modal
                open={isBookingModalOpen}
                onClose={() => {
                    setIsBookingModalOpen(false);
                    setSelectedSlot(null);
                    setErrors({});
                }}
                title={t('futsal.confirmBooking')}
                size="md"
            >
                {selectedSlot && (
                    <div className="space-y-6">
                        {/* Slot Summary */}
                        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-5 text-white">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/20 rounded-lg p-3">
                                        <FiClock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{selectedSlot.time}</div>
                                        <div className="text-white/80 text-sm flex items-center gap-1.5">
                                            <FiCalendar className="w-3.5 h-3.5" />
                                            {format(new Date(selectedSlot.date || selectedDate), 'EEEE, MMMM do, yyyy')}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right bg-white/10 px-5 py-3 rounded-xl">
                                    <div className="text-xs uppercase tracking-wider text-white/70 font-semibold">Price</div>
                                    <div className="text-2xl font-bold">{selectedSlot.price} <span className="text-sm">ETB</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Recurring Option */}
                        <div className={`p-4 rounded-xl border-2 transition-all ${isRecurring ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isRecurring ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                        <FiRefreshCw className={`w-5 h-5 ${isRecurring ? 'animate-spin-slow' : ''}`} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Recurring Match Contract</h4>
                                        <p className="text-xs text-muted-foreground">Auto-reserve this slot weekly</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={isRecurring}
                                        onChange={(e) => setIsRecurring(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            {isRecurring && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-4 pt-4 border-t border-primary/20"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase">Sessions</label>
                                            <select
                                                className="w-full bg-background border-2 border-border/50 rounded-lg px-3 py-2 text-sm font-medium focus:border-primary transition-all outline-none"
                                                value={recurringDuration.value}
                                                onChange={(e) => setRecurringDuration({ type: 'weeks', value: parseInt(e.target.value) })}
                                            >
                                                <option value={4}>4 Sessions</option>
                                                <option value={12}>12 Sessions</option>
                                                <option value={24}>24 Sessions</option>
                                            </select>
                                        </div>
                                        <div className="bg-primary/10 rounded-lg p-3 border border-primary/20 flex flex-col justify-center">
                                            <div className="text-xs font-semibold text-primary/70 uppercase">Total</div>
                                            <div className="text-xl font-bold text-primary">
                                                {(parseFloat(selectedSlot.price) * recurringDuration.value).toLocaleString()} ETB
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold flex items-center gap-2">
                                Contact Information
                                {isAuthenticated ? (
                                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Member</Badge>
                                ) : (
                                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">Guest</Badge>
                                )}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Full Name" required>
                                    <input
                                        name="contactName"
                                        value={form.contactName}
                                        onChange={handleFormChange}
                                        placeholder="John Doe"
                                        className={`w-full bg-background border-2 rounded-xl px-4 py-3 text-sm focus:border-primary transition-all outline-none ${errors.contactName ? 'border-red-500 bg-red-50/50' : 'border-border'}`}
                                    />
                                </FormField>

                                <FormField label="Email Address" required>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        value={form.contactEmail}
                                        onChange={handleFormChange}
                                        placeholder="john@example.com"
                                        className={`w-full bg-background border-2 rounded-xl px-4 py-3 text-sm focus:border-primary transition-all outline-none ${errors.contactEmail ? 'border-red-500 bg-red-50/50' : 'border-border'}`}
                                    />
                                </FormField>

                                <FormField label="Players Count" required>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="playerCount"
                                            value={form.playerCount}
                                            onChange={handleFormChange}
                                            min="1"
                                            max={selectedSlot.max_players || 12}
                                            className={`w-full bg-background border-2 rounded-xl px-4 py-3 text-sm focus:border-primary transition-all outline-none ${errors.playerCount ? 'border-red-500' : 'border-border'}`}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">Players</div>
                                    </div>
                                </FormField>

                                <FormField label="Phone Number" required>
                                    <input
                                        type="tel"
                                        name="contactPhone"
                                        value={form.contactPhone}
                                        onChange={handleFormChange}
                                        placeholder="+251 912 345 678"
                                        className={`w-full bg-background border-2 rounded-xl px-4 py-3 text-sm focus:border-primary transition-all outline-none ${errors.contactPhone ? 'border-red-500' : 'border-border'}`}
                                    />
                                </FormField>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="pt-4 border-t border-border/50">
                            <PaymentMethodSelector
                                selectedMethod={paymentMethod}
                                onMethodChange={(method) => {
                                    setPaymentMethod(method);
                                    if (method !== 'manual_qr') setProofFile(null);
                                }}
                                onFileChange={setProofFile}
                                amount={parseFloat(selectedSlot.price) * (isRecurring ? recurringDuration.value : 1)}
                            />
                        </div>

                        {/* Rules & Policy */}
                        <div className={`p-4 rounded-xl border-2 transition-all ${errors.agreeToRules ? 'bg-red-50 border-red-500' : 'bg-primary/5 border-primary/20'}`}>
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="agreeToRules"
                                    name="agreeToRules"
                                    checked={form.agreeToRules}
                                    onChange={handleFormChange}
                                    className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-primary mt-0.5 cursor-pointer"
                                />
                                <label htmlFor="agreeToRules" className="text-sm font-medium flex-1 cursor-pointer">
                                    Accept Rules & Booking Policies
                                    <div className="mt-3 p-3 bg-background/80 rounded-lg border border-primary/10 text-xs text-muted-foreground space-y-3 max-h-[150px] overflow-y-auto">
                                        {futsalSettings ? (
                                            <>
                                                <div>
                                                    <div className="text-primary font-bold mb-1 uppercase text-[10px] tracking-wider">Official Rules</div>
                                                    <p className="whitespace-pre-line leading-relaxed">{futsalSettings.rules}</p>
                                                </div>
                                                <div className="pt-2 border-t border-border/50">
                                                    <div className="text-primary font-bold mb-1 uppercase text-[10px] tracking-wider">Cancellation Policy</div>
                                                    <p className="leading-relaxed">{futsalSettings.booking_policy}</p>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="animate-pulse flex space-y-2 flex-col">
                                                <div className="h-3 bg-muted rounded w-1/2"></div>
                                                <div className="h-2 bg-muted rounded w-full"></div>
                                                <div className="h-2 bg-muted rounded w-5/6"></div>
                                            </div>
                                        )}
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Error Message */}
                        {errors.form && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl flex items-center gap-3">
                                <FiAlertCircle className="w-5 h-5 shrink-0" />
                                <p className="text-sm font-medium">{errors.form}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setIsBookingModalOpen(false);
                                    setSelectedSlot(null);
                                    setErrors({});
                                }}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleBook}
                                disabled={isSubmitting}
                                className="min-w-[160px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FiCheckCircle className="w-4 h-4 mr-2" />
                                        Complete Payment
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
