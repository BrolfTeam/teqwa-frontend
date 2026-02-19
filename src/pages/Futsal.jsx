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

// Weekly Timetable Component
const WeeklyTimetable = memo(({ slots, selectedSlots, onSlotClick, startDate, loading }) => {
    const { t } = useTranslation();
    const weekDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            days.push(date);
        }
        return days;
    }, [startDate]);

    // Unique time slots from the data
    const timeRows = useMemo(() => {
        const times = new Set();
        slots.forEach(s => {
            const timeStr = `${s.start_time.substring(0, 5)}`;
            times.add(timeStr);
        });
        return Array.from(times).sort();
    }, [slots]);

    const getSlotAt = (date, timeStr) => {
        const dStr = date.toISOString().split('T')[0];
        return slots.find(s => s.date === dStr && s.start_time.startsWith(timeStr));
    };

    if (loading && slots.length === 0) {
        return (
            <div className="grid grid-cols-8 gap-2 min-h-[400px]">
                {Array.from({ length: 40 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden border border-border/40 bg-card/30 backdrop-blur-sm shadow-xl rounded-2xl">
            <div className="overflow-x-auto scrollbar-hide">
                <div className="min-w-[800px] md:min-w-full">
                    {/* Header */}
                    <div className="grid grid-cols-8 border-b border-border/40 bg-muted/30">
                        <div className="p-4 border-r border-border/40 font-semibold text-center text-sm text-muted-foreground uppercase tracking-widest">
                            Time
                        </div>
                        {weekDays.map((day, i) => (
                            <div key={i} className="p-4 text-center border-r border-border/40 last:border-r-0">
                                <div className="text-xs text-muted-foreground uppercase mb-1">{format(day, 'EEE')}</div>
                                <div className="text-lg font-bold">{format(day, 'dd')}</div>
                            </div>
                        ))}
                    </div>

                    {/* Body */}
                    <div className="relative">
                        {timeRows.map((time, rowIdx) => (
                            <div key={time} className="grid grid-cols-8 border-b border-border/20 last:border-b-0 hover:bg-primary/5 transition-colors group">
                                <div className="p-3 md:p-4 border-r border-border/40 flex items-center justify-center font-bold text-xs md:text-sm text-primary group-hover:scale-110 transition-transform bg-muted/20">
                                    {time}
                                </div>
                                {weekDays.map((day, colIdx) => {
                                    const slot = getSlotAt(day, time);
                                    const isSelected = selectedSlots.some(s => s.id === slot?.id);

                                    return (
                                        <div key={colIdx} className="p-1 border-r border-border/20 last:border-r-0 min-h-[80px]">
                                            {slot ? (
                                                <button
                                                    disabled={!slot.available && !isSelected}
                                                    onClick={() => onSlotClick(slot)}
                                                    className={`
                                                    w-full h-full rounded-xl p-2 text-left transition-all duration-300 flex flex-col justify-between
                                                    ${!slot.available
                                                            ? 'bg-red-500/10 text-red-700/60 cursor-not-allowed border border-red-200/20'
                                                            : isSelected
                                                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[0.98] border-2 border-white'
                                                                : 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 hover:scale-[1.02] border border-emerald-500/20'
                                                        }
                                                `}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[10px] font-bold uppercase opacity-80">
                                                            {slot.location.substring(0, 10)}
                                                        </span>
                                                        {slot.available && !isSelected && <FiCheckCircle className="w-3 h-3 text-emerald-500" />}
                                                        {isSelected && <FiCheckCircle className="w-4 h-4 text-white" />}
                                                        {!slot.available && <FiXCircle className="w-3 h-3 text-red-500 opacity-50" />}
                                                    </div>
                                                    <div className="font-bold text-sm">
                                                        {slot.available ? (isSelected ? 'Selected' : `${slot.price} ETB`) : 'Booked'}
                                                    </div>
                                                </button>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 text-[10px] italic">
                                                    N/A
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                        {loading && (
                            <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center z-50">
                                <LoadingSpinner />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});
WeeklyTimetable.displayName = 'WeeklyTimetable';

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
}
);
BookingHistory.displayName = 'BookingHistory';

const Futsal = memo(() => {
    const { t, i18n } = useTranslation();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);

    // State Management
    const [selectedDate, setSelectedDate] = useState(today);
    const [weekStartDate, setWeekStartDate] = useState(today);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [futsalSettings, setFutsalSettings] = useState(null);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringDuration, setRecurringDuration] = useState({ type: 'months', value: 1 });
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

    // Fetch slots for selected date or week
    const fetchSlots = useCallback(async (start) => {
        setLoading(true);
        try {
            const end = new Date(start);
            end.setDate(end.getDate() + 7);
            const data = await dataService.getFutsalSlots({
                start_date: start,
                end_date: end.toISOString().split('T')[0]
            });
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
        fetchSlots(weekStartDate);
    }, [weekStartDate, fetchSlots]);

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
        setWeekStartDate(dateString);
        setSelectedSlots([]);
    };

    const handleSlotSelect = (slot) => {
        if (!slot.available) return;

        setSelectedSlots(prev => {
            const exists = prev.find(s => s.id === slot.id);
            if (exists) {
                return prev.filter(s => s.id !== slot.id);
            }
            return [...prev, slot];
        });
    };

    const handleBookingReady = () => {
        if (selectedSlots.length === 0) {
            toast.error("Please select at least one slot");
            return;
        }

        setForm(prev => ({
            ...prev,
            contactName: isAuthenticated && user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : prev.contactName,
            contactEmail: isAuthenticated && user ? user.email : prev.contactEmail,
            contactPhone: isAuthenticated && user ? user.phone : prev.contactPhone,
            agreeToRules: false
        }));

        setIsRecurring(false);
        setRecurringDuration({ type: 'months', value: 1 });
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
        if (selectedSlots.length === 0) return;

        if (paymentMethod === 'manual_qr' && !proofFile) {
            toast.error(t('payment.proofRequired'));
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            // Collective validation for primary fields
            const baseInfo = {
                contactName: form.contactName,
                contactEmail: form.contactEmail,
                contactPhone: form.contactPhone,
                agreeToRules: form.agreeToRules
            };

            if (isRecurring) {
                const formData = new FormData();
                formData.append('slot_ids', JSON.stringify(selectedSlots.map(s => s.id)));
                formData.append('duration_months', recurringDuration.value);
                formData.append('contact_name', baseInfo.contactName);
                formData.append('contact_email', baseInfo.contactEmail);
                formData.append('contact_phone', baseInfo.contactPhone || '');
                formData.append('payment_method', paymentMethod);
                if (paymentMethod === 'manual_qr' && proofFile) {
                    formData.append('proof_image', proofFile);
                }

                const response = await dataService.createContractBooking(formData);
                const contractId = response?.contract_id;

                if (paymentMethod === 'card' && contractId) {
                    toast.success("Contract created. Redirecting to payment...");
                } else {
                    toast.success(t('futsal.contractCreated'));
                }
            } else {
                for (const slot of selectedSlots) {
                    const formData = new FormData();
                    formData.append('contact_name', baseInfo.contactName);
                    formData.append('contact_email', baseInfo.contactEmail);
                    formData.append('contact_phone', baseInfo.contactPhone || '');
                    formData.append('player_count', slot.max_players || 12);
                    formData.append('agree_to_rules', baseInfo.agreeToRules);
                    formData.append('payment_method', paymentMethod);
                    if (paymentMethod === 'manual_qr' && proofFile) {
                        formData.append('proof_image', proofFile);
                    }

                    await dataService.bookFutsalSlot(slot.id, formData);
                }
                toast.success(t('futsal.bookingSubmitted'));
            }

            setIsBookingModalOpen(false);
            setSelectedSlots([]);
            setProofFile(null);
            setPaymentMethod('manual_qr');

            // Refresh data
            dataService.clearCacheByPattern('getFutsalSlots');
            dataService.clearCacheByPattern('getMyFutsalBookings');
            fetchSlots(weekStartDate);
            fetchBookings();

        } catch (error) {
            console.error('Booking error:', error);
            const message = error?.message || (typeof error?.data === 'string' ? error.data : 'An unexpected error occurred');
            setErrors({ form: message });
            toast.error(message);
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
                                    selectedDate={new Date(weekStartDate)}
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
                                    {showBookingHistory ? "View Schedule" : "My Bookings"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {showBookingHistory ? (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-10 w-1 bg-primary rounded-full" />
                                <h2 className="text-2xl font-bold tracking-tight">Your Booking History</h2>
                            </div>
                            <BookingHistory bookings={bookings} onRefresh={fetchBookings} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="timetable"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-10 w-1 bg-primary rounded-full" />
                                        <h2 className="text-2xl font-bold tracking-tight">Weekly Schedule</h2>
                                    </div>
                                    <p className="text-muted-foreground">Select one or more slots to start your booking.</p>
                                </div>
                                <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-xl border border-border/50">
                                    <div className="flex items-center gap-2 px-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                        <span className="text-xs font-medium">Available</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/30" />
                                        <span className="text-xs font-medium">Booked</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-2">
                                        <div className="w-3 h-3 rounded-full bg-primary" />
                                        <span className="text-xs font-medium">Selected</span>
                                    </div>
                                </div>
                            </div>

                            <WeeklyTimetable
                                slots={slots}
                                selectedSlots={selectedSlots}
                                onSlotClick={handleSlotSelect}
                                startDate={weekStartDate}
                                loading={loading}
                            />

                            {/* Selection Bar */}
                            <AnimatePresence>
                                {selectedSlots.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 100 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 100 }}
                                        className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-[90%] max-w-4xl"
                                    >
                                        <div className="bg-primary text-primary-foreground rounded-2xl shadow-2xl p-3 sm:p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 border-2 border-white/20 backdrop-blur-md">
                                            <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                                                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white/20 rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl flex-shrink-0">
                                                    {selectedSlots.length}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-base sm:text-lg leading-tight truncate">
                                                        {selectedSlots.length === 1 ? 'Slot Selected' : 'Slots Selected'}
                                                    </div>
                                                    <div className="text-primary-foreground/80 text-xs sm:text-sm">
                                                        Total: {selectedSlots.reduce((acc, s) => acc + (parseFloat(s.price) || 0), 0)} ETB
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
                                                <Button
                                                    variant="secondary"
                                                    className="flex-1 md:flex-none h-11 sm:h-12 px-4 sm:px-8 font-bold text-sm sm:text-base"
                                                    onClick={handleBookingReady}
                                                >
                                                    Continue
                                                    <FiArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="h-11 w-11 sm:h-12 sm:w-12 p-0 hover:bg-white/10 flex-shrink-0"
                                                    onClick={() => setSelectedSlots([])}
                                                >
                                                    <FiXCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* Booking Modal */}
            <Modal
                open={isBookingModalOpen}
                onClose={() => {
                    setIsBookingModalOpen(false);
                    setErrors({});
                }}
                title={t('futsal.confirmBooking')}
                size="lg"
            >
                <div className="space-y-6">
                    {/* Slots Summary */}
                    <div className="bg-gradient-to-br from-primary to-primary-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <div className="relative z-10">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <FiList className="w-5 h-5" />
                                Selected Sessions ({selectedSlots.length})
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {selectedSlots.map((slot, idx) => (
                                    <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                                        <div className="font-bold flex justify-between">
                                            <span>{slot.time}</span>
                                            <span className="text-white/70">{slot.price} ETB</span>
                                        </div>
                                        <div className="text-xs text-white/80">{format(new Date(slot.date), 'EEE, MMM dd')}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-end">
                                <div>
                                    <div className="text-xs text-white/60 uppercase">Total Amount</div>
                                    <div className="text-3xl font-bold">{selectedSlots.reduce((acc, s) => acc + (parseFloat(s.price) || 0), 0)} ETB</div>
                                </div>
                                <Badge className="bg-white text-primary font-bold px-4 py-1.5 rounded-full ring-4 ring-white/10">
                                    {isRecurring ? 'Subscription' : 'One-time Payment'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Recurring Option */}
                    <div className={`p-5 rounded-2xl border-2 transition-all ${isRecurring ? 'border-primary bg-primary/5 shadow-inner' : 'border-border/50 hover:border-primary/30'}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1">
                                <div className={`p-2.5 sm:p-3 rounded-xl flex-shrink-0 ${isRecurring ? 'bg-primary text-white shadow-lg' : 'bg-muted text-muted-foreground'}`}>
                                    <FiRefreshCw className={`w-5 h-5 sm:w-6 sm:h-6 ${isRecurring ? 'animate-spin-slow' : ''}`} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-base sm:text-lg truncate">Multi-match Subscription</h4>
                                    <p className="text-[11px] sm:text-sm text-muted-foreground line-clamp-1">Lock these slots for weeks/months</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer scale-100 sm:scale-110 flex-shrink-0">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isRecurring}
                                    onChange={(e) => setIsRecurring(e.target.checked)}
                                />
                                <div className="w-11 h-6 sm:w-12 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-sm"></div>
                            </label>
                        </div>

                        {isRecurring && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-6 pt-6 border-t border-primary/20"
                            >
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                        <FiCalendar className="w-4 h-4" />
                                        Subscription Duration
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: '1 Month', value: 1 },
                                            { label: '3 Months', value: 3 },
                                            { label: '6 Months', value: 6 },
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setRecurringDuration({ type: 'months', value: opt.value })}
                                                className={`py-3 rounded-xl border-2 font-bold transition-all ${recurringDuration.value === opt.value ? 'border-primary bg-primary text-white' : 'border-border/50 hover:border-primary/50'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 flex items-center gap-3">
                                        <FiInfo className="text-primary w-5 h-5 flex-shrink-0" />
                                        <p className="text-xs text-primary/80 font-medium">
                                            This will reserve {selectedSlots.length} weekly slot(s) for the next {recurringDuration.value} month(s).
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Contact Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Full Name" required error={errors.contactName}>
                            <input
                                name="contactName"
                                value={form.contactName}
                                onChange={handleFormChange}
                                placeholder="Enter your full name"
                                className="input-premium"
                            />
                        </FormField>
                        <FormField label="Phone Number" required error={errors.contactPhone}>
                            <input
                                name="contactPhone"
                                value={form.contactPhone}
                                onChange={handleFormChange}
                                placeholder="e.g. 0911..."
                                className="input-premium"
                            />
                        </FormField>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border/10">
                        <h4 className="font-bold flex items-center gap-2 text-base sm:text-lg">
                            <FiDollarSign className="w-5 h-5 text-primary" />
                            Payment Selection
                        </h4>
                        <div className="bg-card rounded-2xl border border-border/30 p-1 sm:p-2">
                            <PaymentMethodSelector
                                selectedMethod={paymentMethod}
                                onMethodChange={setPaymentMethod}
                                onFileChange={setProofFile}
                                amount={selectedSlots.reduce((acc, s) => acc + (parseFloat(s.price) || 0), 0) * (isRecurring ? recurringDuration.value * 4 : 1)}
                                showManualOptions={true}
                            />
                        </div>
                    </div>

                    {/* Agreement */}
                    <div className="pt-4 border-t border-border/50">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${form.agreeToRules ? 'bg-primary border-primary' : 'border-border/60 group-hover:border-primary/50'}`}>
                                <input
                                    type="checkbox"
                                    name="agreeToRules"
                                    checked={form.agreeToRules}
                                    onChange={handleFormChange}
                                    className="sr-only"
                                />
                                {form.agreeToRules && <FiCheckCircle className="text-white w-4 h-4" />}
                            </div>
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                                I agree to the <span className="text-primary hover:underline">Court Rules & Regulations</span>
                            </span>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-6">
                        <Button
                            variant="outline"
                            className="flex-1 py-6 h-auto rounded-2xl font-bold"
                            onClick={() => setIsBookingModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-[2] py-6 h-auto rounded-2xl font-bold shadow-xl shadow-primary/20"
                            onClick={handleBook}
                            disabled={isSubmitting || !form.agreeToRules}
                        >
                            {isSubmitting ? (
                                <>
                                    <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FiCheckCircle className="w-5 h-5 mr-2" />
                                    {paymentMethod === 'card' ? 'Pay with Chapa' : 'Verify Booking'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
});

export default Futsal;
