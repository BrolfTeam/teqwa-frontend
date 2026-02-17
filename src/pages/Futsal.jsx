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
    FiInfo,
    FiGrid,
    FiList,
    FiAward
} from 'react-icons/fi';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';
import Hero from '@/components/ui/Hero';
import Navbar from '@/components/layout/Navbar';
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
import { format } from 'date-fns';
import headerBg from '@/assets/futsal4.png';

// Skeleton Component for loading states
const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-muted/40 rounded-xl ${className}`} />
);

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
            <Navbar />

            {/* Hero Section with Premium Design */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                </div>

                <div className="max-container px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-4xl mx-auto mb-16"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 tracking-wide uppercase">
                            Premium Sports Experience
                        </span>
                        <h1 className="text-4xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
                            The Future of <br />
                            <span className="text-primary italic">Futsal Booking</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            Experience elite-level futsal at Mujemaa Teqwa. Seamless booking, premium turf, and a vibrant community await.
                        </p>
                    </motion.div>

                    {/* Interactive Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                        {[
                            { label: 'Live Available', value: availableSlots.length, icon: FiActivity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                            { label: 'Weekly Sessions', value: '112+', icon: FiClock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                            { label: 'Court Quality', value: 'FIFA Standard', icon: FiAward, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                            { label: 'Active Players', value: '800+', icon: FiUsers, color: 'text-primary', bg: 'bg-primary/10' },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-card/40 backdrop-blur-md border border-border/50 p-8 rounded-[2rem] hover:border-primary/40 transition-all group relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`} />
                                <stat.icon className={`w-10 h-10 ${stat.color} mb-6 group-hover:scale-110 transition-transform relative z-10`} />
                                <h3 className="text-3xl font-bold mb-2 relative z-10">{stat.value}</h3>
                                <p className="text-sm text-muted-foreground font-medium relative z-10">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Sticky Booking Bar */}
                    <div className="sticky top-24 z-40 mb-16 px-2">
                        <div className="bg-card/70 backdrop-blur-xl border border-border/60 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-6 md:p-10">
                            <div className="flex flex-col lg:flex-row gap-10 items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="h-20 w-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center border border-primary/20">
                                        <FiCalendar className="w-10 h-10 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold tracking-tight">Select Match Date</h2>
                                        <p className="text-muted-foreground font-medium">Ready for your next competitive match?</p>
                                    </div>
                                </div>

                                <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
                                    <DatePicker
                                        selectedDate={new Date(selectedDate)}
                                        onDateSelect={handleDateSelect}
                                        className="w-full sm:w-[350px]"
                                    />
                                    <Button
                                        variant={showBookingHistory ? "default" : "outline"}
                                        onClick={() => setShowBookingHistory(!showBookingHistory)}
                                        className="rounded-2xl h-[58px] px-8 font-semibold border-primary/20 hover:bg-primary/5"
                                    >
                                        <FiClock className="w-5 h-5 mr-3" />
                                        {showBookingHistory ? "View Available Slots" : "My Recent Bookings"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Content Area */}
                    {showBookingHistory ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-[2.5rem] p-8 md:p-12"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-3xl font-bold">Booking History</h2>
                                <Badge variant="secondary" className="px-4 py-1.5 rounded-full">{bookings.length} Sessions</Badge>
                            </div>
                            <BookingHistory bookings={bookings} onRefresh={fetchBookings} />
                        </motion.div>
                    ) : (
                        <div className="space-y-16">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <h3 className="text-3xl font-bold mb-2">Available Sessions</h3>
                                    <p className="text-muted-foreground text-lg">Pick a time that works for your team</p>
                                </div>
                                <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border/50">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-background shadow-lg text-primary translate-y-[-1px]' : 'text-muted-foreground hover:bg-background/40'}`}
                                    >
                                        <FiGrid className="w-4 h-4" />
                                        Grid
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-background shadow-lg text-primary translate-y-[-1px]' : 'text-muted-foreground hover:bg-background/40'}`}
                                    >
                                        <FiList className="w-4 h-4" />
                                        List
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <Skeleton key={i} className="h-64 rounded-[2rem]" />
                                    ))}
                                </div>
                            ) : slots.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-32 bg-muted/20 rounded-[3rem] border-2 border-dashed border-border/50"
                                >
                                    <div className="p-8 bg-background rounded-full w-28 h-28 mx-auto mb-8 flex items-center justify-center shadow-2xl">
                                        <FiCalendar className="w-12 h-12 text-muted-foreground/50" />
                                    </div>
                                    <h4 className="text-2xl font-bold mb-4">No Matches Found</h4>
                                    <p className="text-muted-foreground max-w-sm mx-auto mb-10 text-lg leading-relaxed">
                                        There are no available slots for {format(new Date(selectedDate), 'EEEE, MMMM do')}.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedDate(today)}
                                        className="rounded-full px-10 py-7 text-lg h-auto border-2 hover:bg-primary hover:text-white hover:border-primary transition-all font-bold"
                                    >
                                        Check Today's Availability
                                    </Button>
                                </motion.div>
                            ) : (
                                <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 max-w-5xl mx-auto'}`}>
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
                </div>
            </section>

            {/* Premium Booking Modal */}
            <Modal
                open={isBookingModalOpen}
                onClose={() => {
                    setIsBookingModalOpen(false);
                    setSelectedSlot(null);
                    setErrors({});
                }}
                title={t('futsal.confirmBooking')}
                size="lg"
            >
                {selectedSlot && (
                    <div className="space-y-8 py-4">
                        {/* Summary Header */}
                        <div className="relative overflow-hidden bg-primary rounded-[2rem] p-8 text-white shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)]">
                            <IslamicPattern className="opacity-10 scale-150" />
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4">
                                        <FiClock className="w-10 h-10 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-4xl font-black mb-1">{selectedSlot.time}</div>
                                        <div className="text-white/80 font-medium flex items-center gap-2">
                                            <FiCalendar className="w-4 h-4" />
                                            {format(new Date(selectedSlot.date || selectedDate), 'EEEE, MMMM do, yyyy')}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center md:text-right bg-black/10 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/20">
                                    <div className="text-xs uppercase tracking-[0.2em] font-bold text-white/70 mb-1">Price</div>
                                    <div className="text-4xl font-black">{selectedSlot.price} <span className="text-sm font-bold">ETB</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                {/* Recurring Feature Section */}
                                <div className={`p-6 rounded-[2rem] border-2 transition-all ${isRecurring ? 'border-primary bg-primary/5' : 'border-border/50 bg-muted/20 hover:border-primary/30'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${isRecurring ? 'bg-primary text-white' : 'bg-background border border-border text-muted-foreground'}`}>
                                                <FiRefreshCw className={`w-6 h-6 ${isRecurring ? 'animate-spin-slow' : ''}`} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">Recurring Match Contract</h4>
                                                <p className="text-sm text-muted-foreground font-medium">Auto-reserve this slot weekly</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={isRecurring}
                                                onChange={(e) => setIsRecurring(e.target.checked)}
                                            />
                                            <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                        </label>
                                    </div>

                                    {isRecurring && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mt-6 pt-6 border-t border-primary/20"
                                        >
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold ml-1">MATCH DURATION</label>
                                                    <select
                                                        className="w-full bg-background border-2 border-border/50 rounded-2xl px-4 py-3 font-bold focus:border-primary transition-all outline-none"
                                                        value={recurringDuration.value}
                                                        onChange={(e) => setRecurringDuration({ type: 'weeks', value: parseInt(e.target.value) })}
                                                    >
                                                        <option value={4}>4 Matching Sessions</option>
                                                        <option value={12}>12 Matching Sessions</option>
                                                        <option value={24}>24 Matching Sessions</option>
                                                    </select>
                                                </div>
                                                <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
                                                    <div className="text-xs font-bold text-primary/70 uppercase tracking-widest mb-1">Contract Total</div>
                                                    <div className="text-2xl font-black text-primary">
                                                        {(parseFloat(selectedSlot.price) * recurringDuration.value).toLocaleString()} ETB
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Booking Information Form */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <h3 className="text-xl font-bold flex items-center gap-3">
                                            Contact Information
                                            {isAuthenticated ? (
                                                <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">Member</Badge>
                                            ) : (
                                                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 px-3 py-1">Guest</Badge>
                                            )}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField label="Full Name" required>
                                            <input
                                                name="contactName"
                                                value={form.contactName}
                                                onChange={handleFormChange}
                                                placeholder="John Doe"
                                                className={`w-full bg-muted/30 border-2 rounded-[1.2rem] px-5 py-4 font-medium focus:bg-background focus:border-primary transition-all outline-none ${errors.contactName ? 'border-red-500 bg-red-50/50' : 'border-border/50'}`}
                                            />
                                        </FormField>

                                        <FormField label="Email Address" required>
                                            <input
                                                type="email"
                                                name="contactEmail"
                                                value={form.contactEmail}
                                                onChange={handleFormChange}
                                                placeholder="john@example.com"
                                                className={`w-full bg-muted/30 border-2 rounded-[1.2rem] px-5 py-4 font-medium focus:bg-background focus:border-primary transition-all outline-none ${errors.contactEmail ? 'border-red-500 bg-red-50/50' : 'border-border/50'}`}
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
                                                    className={`w-full bg-muted/30 border-2 rounded-[1.2rem] px-5 py-4 font-medium focus:bg-background focus:border-primary transition-all outline-none ${errors.playerCount ? 'border-red-500' : 'border-border/50'}`}
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">Players</div>
                                            </div>
                                        </FormField>

                                        <FormField label="Phone Number (Required for confirmation)" required>
                                            <input
                                                type="tel"
                                                name="contactPhone"
                                                value={form.contactPhone}
                                                onChange={handleFormChange}
                                                placeholder="+251 912 345 678"
                                                className={`w-full bg-muted/30 border-2 rounded-[1.2rem] px-5 py-4 font-medium focus:bg-background focus:border-primary transition-all outline-none ${errors.contactPhone ? 'border-red-500' : 'border-border/50'}`}
                                            />
                                        </FormField>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Payment Selection Wrapper */}
                                <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-[2rem] p-6 shadow-xl">
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

                                {/* Dynamic Rules & Policy from Settings */}
                                <div className={`p-6 rounded-[2rem] border-2 transition-all ${errors.agreeToRules ? 'bg-red-50 border-red-500 ring-2 ring-red-500/20' : 'bg-primary/5 border-primary/20'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className="pt-1">
                                            <input
                                                type="checkbox"
                                                id="agreeToRules"
                                                name="agreeToRules"
                                                checked={form.agreeToRules}
                                                onChange={handleFormChange}
                                                className="w-6 h-6 rounded-lg border-2 border-primary text-primary focus:ring-primary shadow-sm cursor-pointer"
                                            />
                                        </div>
                                        <label htmlFor="agreeToRules" className="text-sm font-bold flex-1 cursor-pointer">
                                            Accept Rules & Booking Policies
                                            <div className="mt-4 p-4 bg-background/80 backdrop-blur-sm rounded-2xl border border-primary/10 text-xs text-muted-foreground space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar">
                                                {futsalSettings ? (
                                                    <>
                                                        <div>
                                                            <div className="text-primary font-black mb-1 uppercase tracking-tighter">Official Rules</div>
                                                            <p className="whitespace-pre-line leading-relaxed">{futsalSettings.rules}</p>
                                                        </div>
                                                        <div className="pt-2 border-t border-border/50">
                                                            <div className="text-primary font-black mb-1 uppercase tracking-tighter">Cancellation Policy</div>
                                                            <p className="leading-relaxed">{futsalSettings.booking_policy}</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="animate-pulse flex space-y-3 flex-col">
                                                        <div className="h-3 bg-muted rounded w-1/2"></div>
                                                        <div className="h-2 bg-muted rounded w-full"></div>
                                                        <div className="h-2 bg-muted rounded w-5/6"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-10 border-t border-border/50">
                            <button
                                onClick={() => {
                                    setIsBookingModalOpen(false);
                                    setSelectedSlot(null);
                                    setErrors({});
                                }}
                                className="text-muted-foreground font-black hover:text-foreground transition-colors uppercase tracking-widest text-xs"
                                disabled={isSubmitting}
                            >
                                Discard Booking
                            </button>
                            <Button
                                onClick={handleBook}
                                size="lg"
                                className="w-full sm:w-auto min-w-[320px] h-[72px] rounded-3xl text-xl font-black shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <FiLoader className="w-6 h-6 mr-3 animate-spin" />
                                        Creating Your Match...
                                    </>
                                ) : (
                                    <>
                                        <FiCheckCircle className="w-6 h-6 mr-3" />
                                        Complete Payment
                                    </>
                                )}
                            </Button>
                        </div>

                        {errors.form && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-5 bg-red-500/10 border-2 border-red-500/20 text-red-500 rounded-3xl flex items-center gap-4 mt-6"
                            >
                                <FiAlertCircle className="w-6 h-6 shrink-0" />
                                <p className="font-bold text-sm tracking-tight">{errors.form}</p>
                            </motion.div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
});

Futsal.displayName = 'Futsal';

export default Futsal;
