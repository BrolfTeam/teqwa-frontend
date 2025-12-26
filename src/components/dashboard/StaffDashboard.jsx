import { memo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiCheckSquare, FiFileText, FiSun, FiUser, FiArrowRight, FiActivity, FiUsers, FiBookOpen, FiShield } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import IslamicPattern from '@/components/ui/IslamicPattern';
import { prayerTimesService } from '@/lib/prayerTimesService';
import dashboardService from '@/services/dashboardService';
import staffService from '@/services/staffService';
import verses from '@/lib/verses.json';
import AttendanceWidget from '@/components/staff/AttendanceWidget';
import { hasPermission, getAccessLevel, getAccessibleFeatures } from '@/lib/permissions';
import { useTranslation } from 'react-i18next';

const StaffDashboard = memo(() => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const accessLevel = getAccessLevel(user);
    const accessibleFeatures = getAccessibleFeatures(user);
    const [currentPrayer, setCurrentPrayer] = useState(null);
    const [nextPrayer, setNextPrayer] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [hijriDate, setHijriDate] = useState('');
    const [dailyVerse, setDailyVerse] = useState(verses[0]);
    const [stats, setStats] = useState(null);
    const [staffReports, setStaffReports] = useState(null); // New state for detailed reports
    const [todaysTasks, setTodaysTasks] = useState([]); // New state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all data in parallel
                const [prayerData, prayerFormatted, dashboardData, reportData] = await Promise.all([
                    prayerTimesService.getCurrentAndNextPrayer(),
                    prayerTimesService.getFormattedPrayerTimes(),
                    dashboardService.getStats(),
                    staffService.getReports({ period: 'daily' })
                ]);

                setCurrentPrayer(prayerData.current);
                setNextPrayer(prayerData.next);
                setTimeRemaining(prayerTimesService.formatTimeRemaining(prayerData.timeToNext));
                setHijriDate(prayerFormatted.hijriDate);

                setStats(dashboardData.data);
                setStaffReports(reportData.data);

                // Fetch active tasks (pending and in_progress) - fetch separately since backend doesn't support comma-separated
                try {
                    const [pendingTasks, inProgressTasks] = await Promise.all([
                        staffService.getTasks({ status: 'pending' }),
                        staffService.getTasks({ status: 'in_progress' })
                    ]);

                    // Combine and filter for today's tasks or high priority
                    const allActiveTasks = [
                        ...(pendingTasks.data || []),
                        ...(inProgressTasks.data || [])
                    ];

                    // Sort by priority and due date, show most urgent first
                    const sortedTasks = allActiveTasks.sort((a, b) => {
                        if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
                        if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
                        if (a.due_date && b.due_date) {
                            return new Date(a.due_date) - new Date(b.due_date);
                        }
                        return 0;
                    });

                    setTodaysTasks(sortedTasks);
                } catch (error) {
                    console.error("Failed to fetch tasks:", error);
                    setTodaysTasks([]);
                }

                const randomIndex = Math.floor(Math.random() * verses.length);
                setDailyVerse(verses[randomIndex]);

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const timer = setInterval(async () => {
            const data = await prayerTimesService.getCurrentAndNextPrayer();
            setNextPrayer(data.next);
            setTimeRemaining(prayerTimesService.formatTimeRemaining(data.timeToNext));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const today = new Date();
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="animate-pulse space-y-8">
                    <div className="h-32 bg-muted rounded-2xl"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="h-64 bg-muted rounded-lg"></div>
                        <div className="md:col-span-2 space-y-6">
                            <div className="h-32 bg-muted rounded-lg"></div>
                            <div className="h-48 bg-muted rounded-lg"></div>
                        </div>
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
            {/* Staff Welcome */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white p-8 shadow-lg">
                <IslamicPattern color="white" className="mix-blend-overlay" opacity={0.1} />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <span className="font-arabic text-xl mb-1 block opacity-90 text-amber-400">{t('dashboard.staff.jazakAllahKhair')}</span>
                        <h1 className="text-3xl font-bold mb-2">{t('dashboard.staff.welcome')}, {user?.first_name || t('dashboard.staff.staffMember')}</h1>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium uppercase tracking-wider border border-white/20">
                                {user?.staff_profile?.role ? `${user.staff_profile.role.charAt(0).toUpperCase() + user.staff_profile.role.slice(1)}` : (user?.role || t('dashboard.staff.staffMember'))} {t('dashboard.staff.panel')}
                            </span>
                            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium uppercase tracking-wider border border-white/20">
                                {accessLevel.charAt(0).toUpperCase() + accessLevel.slice(1)} {t('dashboard.staff.access')}
                            </span>
                            {staffReports?.today?.attendance_status && (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider border ${staffReports.today.attendance_status === 'present' ? 'bg-green-500/20 border-green-400 text-green-200' : 'bg-red-500/20 border-red-400 text-red-200'
                                    }`}>
                                    {t('dashboard.staff.status')}: {staffReports.today.attendance_status}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Attendance Widget - REPLACES Quick Actions partially */}
                <motion.div variants={itemVariants} className="md:col-span-1 h-full">
                    <AttendanceWidget
                        staffId={user?.staff_profile?.id}
                        onAttendanceChange={async () => {
                            // Refresh dashboard data after attendance change
                            try {
                                const [dashboardData, reportData] = await Promise.all([
                                    dashboardService.getStats(),
                                    staffService.getReports({ period: 'daily' })
                                ]);
                                setStats(dashboardData.data);
                                setStaffReports(reportData.data);
                            } catch (error) {
                                console.error("Failed to refresh dashboard:", error);
                            }
                        }}
                    />
                </motion.div>

                {/* Today's Tasks & Next Prayer */}
                <motion.div variants={itemVariants} className="md:col-span-2 flex flex-col gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
                        {/* Next Prayer */}
                        <Card className="h-full border-primary/20 shadow-lg relative overflow-hidden flex flex-col justify-center">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                    <FiClock className="h-4 w-4 text-primary" /> {t('dashboard.nextPrayer')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mt-2">
                                    <span className="text-4xl font-bold text-primary">{nextPrayer?.name || 'Fajr'}</span>
                                    <p className="text-lg text-muted-foreground mt-1">{t('dashboard.timeRemaining')}: {timeRemaining}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Task Summary Widget */}
                        <Card className="h-full border-border/50 shadow-md">
                            <CardHeader className="pb-2 border-b border-border/30">
                                <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex justify-between items-center">
                                    <span className="flex items-center gap-2"><FiCheckSquare className="h-4 w-4 text-violet-500" /> {t('dashboard.staff.tasksOverview')}</span>
                                    <Link to="/staff/tasks" className="text-xs text-primary hover:underline">{t('common.viewAll')}</Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{t('dashboard.staff.pending')}</span>
                                    <span className="font-bold text-lg">{staffReports?.tasks?.pending || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{t('dashboard.staff.completedToday')}</span>
                                    <span className="font-bold text-lg text-green-600">{staffReports?.tasks?.completed || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{t('dashboard.staff.detailedReport')}</span>
                                    <Link to="/staff/reports"><FiArrowRight className="h-4 w-4 text-muted-foreground hover:text-primary" /></Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Active Tasks List */}
                    <Card className="flex-1 shadow-md border-border/50">
                        <CardHeader className="border-b border-border/40 pb-4">
                            <CardTitle className="text-lg font-bold">{t('dashboard.staff.todaysPriorityTasks')}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {todaysTasks.length > 0 ? (
                                <div className="space-y-3">
                                    {todaysTasks.slice(0, 3).map(task => (
                                        <div key={task.id} className="flex justify-between items-center p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition border border-border/30">
                                            <div>
                                                <p className="font-medium text-sm line-clamp-1">{task.task}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase border ${task.priority === 'urgent' ? 'border-red-200 text-red-600 bg-red-50' : task.priority === 'high' ? 'border-orange-200 text-orange-600 bg-orange-50' : 'border-slate-200 text-slate-500 bg-slate-50'
                                                        }`}>{task.priority || 'normal'}</span>
                                                    {task.due_date && (
                                                        <span className="text-xs text-muted-foreground">{t('dashboard.student.due')}: {new Date(task.due_date).toLocaleDateString()}</span>
                                                    )}
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${task.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                        {task.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <Link to="/staff/tasks">
                                                <Button size="xs" variant="ghost"><FiArrowRight /></Button>
                                            </Link>
                                        </div>
                                    ))}
                                    {todaysTasks.length > 3 && (
                                        <p className="text-center text-xs text-muted-foreground mt-2">+{todaysTasks.length - 3} {t('staff.tasks.title')}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <FiCheckSquare className="mx-auto h-8 w-8 mb-2 opacity-20" />
                                    <p>{t('dashboard.staff.noActiveTasks')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Quick Access Actions - Based on Permissions */}
            {accessibleFeatures.length > 0 && (
                <motion.div variants={itemVariants}>
                    <Card className="shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
                        <CardHeader className="border-b border-border/40 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FiActivity className="text-blue-500" /> {t('dashboard.quickActions')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {hasPermission(user, 'view_attendance') && (
                                    <Link to="/staff/attendance">
                                        <Card className="hover:shadow-lg transition-all border-l-4 border-l-green-500 cursor-pointer">
                                            <CardContent className="p-4 flex flex-col items-center text-center">
                                                <FiClock className="h-8 w-8 text-green-500 mb-2" />
                                                <span className="font-medium text-sm">{t('dashboard.staff.attendance')}</span>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                )}

                                {hasPermission(user, 'view_all_tasks') && (
                                    <Link to="/staff/tasks">
                                        <Card className="hover:shadow-lg transition-all border-l-4 border-l-purple-500 cursor-pointer">
                                            <CardContent className="p-4 flex flex-col items-center text-center">
                                                <FiCheckSquare className="h-8 w-8 text-purple-500 mb-2" />
                                                <span className="font-medium text-sm">{t('dashboard.staff.tasks')}</span>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                )}

                                {hasPermission(user, 'view_reports') && (
                                    <Link to="/staff/reports">
                                        <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500 cursor-pointer">
                                            <CardContent className="p-4 flex flex-col items-center text-center">
                                                <FiFileText className="h-8 w-8 text-blue-500 mb-2" />
                                                <span className="font-medium text-sm">{t('dashboard.staff.reports')}</span>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                )}

                                {hasPermission(user, 'manage_bookings') && (
                                    <Link to="/bookings">
                                        <Card className="hover:shadow-lg transition-all border-l-4 border-l-orange-500 cursor-pointer">
                                            <CardContent className="p-4 flex flex-col items-center text-center">
                                                <FiCalendar className="h-8 w-8 text-orange-500 mb-2" />
                                                <span className="font-medium text-sm">{t('dashboard.staff.bookings')}</span>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                )}

                                {hasPermission(user, 'manage_students') && (
                                    <Link to="/students">
                                        <Card className="hover:shadow-lg transition-all border-l-4 border-l-indigo-500 cursor-pointer">
                                            <CardContent className="p-4 flex flex-col items-center text-center">
                                                <FiUsers className="h-8 w-8 text-indigo-500 mb-2" />
                                                <span className="font-medium text-sm">{t('dashboard.staff.students')}</span>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                )}

                                {hasPermission(user, 'manage_courses') && (
                                    <Link to="/education">
                                        <Card className="hover:shadow-lg transition-all border-l-4 border-l-amber-500 cursor-pointer">
                                            <CardContent className="p-4 flex flex-col items-center text-center">
                                                <FiBookOpen className="h-8 w-8 text-amber-500 mb-2" />
                                                <span className="font-medium text-sm">{t('dashboard.staff.courses')}</span>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Recent Activity Feed */}
            {hasPermission(user, 'view_reports') && (
                <motion.div variants={itemVariants}>
                    <Card className="shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
                        <CardHeader className="border-b border-border/40 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FiActivity className="text-blue-500" /> {t('dashboard.recentActivity')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {stats?.recent_activities?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {stats.recent_activities.slice(0, 6).map((activity, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                                            <div className="bg-primary/10 p-2 rounded-full mt-1 shrink-0">
                                                <FiActivity className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm text-foreground truncate">{activity.description}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(activity.timestamp || activity.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-6">{t('dashboard.staff.noRecentActivity')}</p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    );
});

StaffDashboard.displayName = 'StaffDashboard';
export default StaffDashboard;
