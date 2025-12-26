import { memo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiUsers,
    FiCalendar,
    FiBook,
    FiAward,
    FiClock,
    FiMail,
    FiBell,
    FiTrendingUp,
    FiUser,
    FiActivity,
    FiHeart,
    FiMapPin
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import IslamicPattern from '@/components/ui/IslamicPattern';
import { prayerTimesService } from '@/lib/prayerTimesService';
import dashboardService from '@/services/dashboardService';
import verses from '@/lib/verses.json';
import { useTranslation } from 'react-i18next';

const ParentDashboard = memo(() => {
    const { t } = useTranslation();
    const { user } = useAuth();

    // State for dynamic content
    const [currentPrayer, setCurrentPrayer] = useState(null);
    const [nextPrayer, setNextPrayer] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [hijriDate, setHijriDate] = useState('');
    const [dailyVerse, setDailyVerse] = useState(verses[0]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);

    // Data fetching function
    const fetchData = useCallback(async () => {
        try {
            // Get prayer times
            const data = await prayerTimesService.getCurrentAndNextPrayer();
            setCurrentPrayer(data.current);
            setNextPrayer(data.next);

            // Initial time remaining
            const remaining = prayerTimesService.formatTimeRemaining(data.timeToNext);
            setTimeRemaining(remaining);

            // Get Hijri date
            const prayerFormatted = await prayerTimesService.getFormattedPrayerTimes();
            setHijriDate(prayerFormatted.hijriDate);

            // Get Dashboard Stats
            const stats = await dashboardService.getStats();
            setDashboardStats(stats.data);

            // TODO: Fetch children data from API when available
            // For now, using placeholder
            setChildren([]);

            // Random Verse
            if (!dailyVerse) {
                const randomIndex = Math.floor(Math.random() * verses.length);
                setDailyVerse(verses[randomIndex]);
            }

        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, [dailyVerse]);

    // Initial load
    useEffect(() => {
        fetchData();

        // Timer for countdown
        const timer = setInterval(async () => {
            const data = await prayerTimesService.getCurrentAndNextPrayer();
            setNextPrayer(data.next);
            setTimeRemaining(prayerTimesService.formatTimeRemaining(data.timeToNext));
        }, 1000);

        return () => clearInterval(timer);
    }, [fetchData]);

    const today = new Date();
    const greeting = t('dashboard.greeting');

    const quickStats = [
        {
            label: t('dashboard.parent.myChildren'),
            value: children.length || '0',
            icon: <FiUsers className="h-6 w-6" />,
            color: 'primary',
            description: t('dashboard.parent.registeredStudents')
        },
        {
            label: t('dashboard.parent.upcomingEvents'),
            value: dashboardStats?.counts?.upcoming_events || '0',
            icon: <FiCalendar className="h-6 w-6" />,
            color: 'primary',
            description: t('dashboard.parent.communityEvents')
        },
        {
            label: t('dashboard.parent.totalDonations'),
            value: `${(dashboardStats?.donation_stats?.total_amount || 0).toLocaleString()} ETB`,
            icon: <FiHeart className="h-6 w-6" />,
            color: 'accent',
            description: t('dashboard.parent.yourContributions')
        },
        {
            label: t('dashboard.parent.messages'),
            value: dashboardStats?.unread_messages || '0',
            icon: <FiMail className="h-6 w-6" />,
            color: 'secondary',
            description: t('dashboard.parent.unreadNotifications')
        },
    ];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="animate-pulse space-y-8">
                    <div className="h-32 bg-muted rounded-2xl"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-lg"></div>)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-6xl mx-auto space-y-8 px-4"
        >
            {/* Welcome Header */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-purple-800 text-white p-8 shadow-lg">
                <IslamicPattern color="white" className="mix-blend-overlay" opacity={0.1} />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <span className="font-arabic text-xl mb-1 block opacity-90">{greeting}</span>
                        <h1 className="text-3xl font-bold mb-2">{t('dashboard.parent.parentDashboard')}</h1>
                        <p className="opacity-90 max-w-xl">
                            {t('dashboard.parent.welcomeBack')}, {user?.first_name || user?.username}! {t('dashboard.parent.stayConnected')}
                        </p>
                        <p className="opacity-75 text-sm mt-2">
                            {dailyVerse.text} <span className="italic">- {dailyVerse.reference}</span>
                        </p>
                    </div>
                    <div className="text-right md:text-center bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                        <div className="flex items-center gap-2 text-sm opacity-90 justify-end md:justify-center mb-1">
                            <FiClock className="h-4 w-4" />
                            <span>{today.toLocaleDateString(undefined, { weekday: 'long' })}</span>
                        </div>
                        <div className="text-2xl font-bold font-arabic">{hijriDate}</div>
                        <div className="text-sm opacity-75">{today.toLocaleDateString()}</div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats & Prayer Time */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Prayer Time Widget */}
                <motion.div variants={itemVariants} className="lg:col-span-1">
                    <Card className="h-full border-primary/20 shadow-lg bg-card/80 backdrop-blur-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <FiClock className="h-4 w-4 text-primary" /> {t('dashboard.nextPrayer')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-2">
                                <span className="text-3xl font-bold text-primary">{nextPrayer?.name || 'Fajr'}</span>
                                <p className="text-2xl font-mono text-foreground/80 mt-1">{nextPrayer?.formatted || '--:--'}</p>
                                <p className="text-xs text-muted-foreground mt-2">{t('dashboard.timeRemaining')}: {timeRemaining}</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Stats Cards */}
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quickStats.map((stat, index) => (
                        <motion.div key={index} variants={itemVariants}>
                            <Card className="h-full border-border/50 shadow-md hover:shadow-lg transition-all bg-card/60 backdrop-blur-sm hover:bg-card/80">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground font-medium mb-1">{stat.label}</p>
                                            <p className="text-2xl font-bold">{stat.value}</p>
                                            {stat.description && (
                                                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                                            )}
                                        </div>
                                        <div className={`p-3 rounded-full bg-${stat.color}/10 text-${stat.color}`}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Children Overview */}
                <motion.div variants={itemVariants}>
                    <Card className="h-full shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
                            <CardTitle className="flex items-center space-x-2 text-lg">
                                <FiUsers className="h-5 w-5 text-purple-500" />
                                <span>{t('dashboard.parent.myChildren')}</span>
                            </CardTitle>
                            <Button asChild variant="ghost" size="sm" className="hover:text-primary">
                                <Link to="/profile">{t('common.edit')}</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {children.length > 0 ? (
                                children.map((child) => (
                                    <div key={child.id} className="group p-4 border border-border/50 rounded-xl hover:bg-accent/5 hover:border-accent/40 transition-all cursor-default">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                {child.name}
                                            </h3>
                                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                {child.role || t('dashboard.student.studentDashboard')}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                            <div className="flex items-center space-x-1">
                                                <FiBook className="h-4 w-4" />
                                                <span>{child.courses_count || 0} Courses</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <FiTrendingUp className="h-4 w-4" />
                                                <span>Avg: {child.average_grade || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <FiUsers className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                                    <p className="text-muted-foreground mb-4">{t('dashboard.parent.noChildrenRegistered')}</p>
                                    <Button asChild size="sm" variant="outline">
                                        <Link to="/profile">Register Your Child</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Upcoming Events */}
                <motion.div variants={itemVariants}>
                    <Card className="h-full shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
                            <CardTitle className="flex items-center space-x-2 text-lg">
                                <FiCalendar className="h-5 w-5 text-primary" />
                                <span>Upcoming Events</span>
                            </CardTitle>
                            <Button asChild variant="ghost" size="sm" className="hover:text-primary">
                                <Link to="/events">View All</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {dashboardStats?.upcoming_events && dashboardStats.upcoming_events.length > 0 ? (
                                dashboardStats.upcoming_events.slice(0, 3).map((event) => (
                                    <div key={event.id} className="group p-4 border border-border/50 rounded-xl hover:bg-accent/5 hover:border-accent/40 transition-all cursor-default">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{event.title}</h3>
                                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">Soon</span>
                                        </div>
                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                            <div className="flex items-center space-x-1">
                                                <FiClock className="h-4 w-4" />
                                                <span>{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <FiMapPin className="h-4 w-4" />
                                                <span>{event.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-8">No upcoming events</p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Activity Feed */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <Card className="h-full shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <CardTitle className="flex items-center space-x-2 text-lg">
                                <FiActivity className="h-5 w-5 text-blue-500" />
                                <span>Recent Activity</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {dashboardStats?.recent_activities && dashboardStats.recent_activities.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboardStats.recent_activities.map((activity, index) => (
                                        <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0 border-border/50">
                                            <div className="bg-primary/10 p-2 rounded-full mt-1">
                                                <FiActivity className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-foreground">{activity.description}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(activity.timestamp || activity.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-6">No recent activity recorded.</p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { to: "/profile", icon: <FiUser className="h-6 w-6" />, label: "Manage Profile", color: "text-purple-500", bg: "bg-purple-500/10" },
                        { to: "/donate", icon: <FiHeart className="h-6 w-6" />, label: "Make Donation", color: "text-red-500", bg: "bg-red-500/10" },
                        { to: "/events", icon: <FiCalendar className="h-6 w-6" />, label: "View Events", color: "text-blue-500", bg: "bg-blue-500/10" },
                        { to: "/prayer-times", icon: <FiClock className="h-6 w-6" />, label: "Prayer Times", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    ].map((action, i) => (
                        <Link key={i} to={action.to} className="block h-full">
                            <Card className="h-full border-border/40 hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm group">
                                <CardContent className="h-full flex flex-col items-center justify-center p-6 gap-3 text-center">
                                    <div className={`p-3 rounded-full ${action.bg} ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                                        {action.icon}
                                    </div>
                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{action.label}</span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
});

ParentDashboard.displayName = 'ParentDashboard';
export default ParentDashboard;
