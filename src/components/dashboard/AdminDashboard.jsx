import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiSettings, FiActivity, FiShield, FiDatabase, FiSun, FiCalendar, FiClock, FiHeart, FiBookOpen, FiMail, FiImage, FiArrowRight, FiCheckSquare, FiRefreshCw, FiDollarSign, FiUser, FiX, FiCheck, FiLoader } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import IslamicPattern from '@/components/ui/IslamicPattern';
import dashboardService from '@/services/dashboardService';
import staffService from '@/services/staffService';
import { dataService } from '@/lib/dataService';
import { toast } from 'sonner';

const AdminDashboard = memo(() => {
    const { user } = useAuth();
    const location = useLocation();
    const [stats, setStats] = useState(null);
    const [staffReports, setStaffReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const refreshIntervalRef = useRef(null);
    const lastRefreshRef = useRef(Date.now());
    
    // Module management data
    const [bookings, setBookings] = useState([]);
    const [donations, setDonations] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [moduleLoading, setModuleLoading] = useState({ bookings: true, donations: true, enrollments: true });

    const fetchStats = useCallback(async (showLoading = false) => {
        try {
            if (showLoading) setRefreshing(true);
            const [dashboardResult, reportsResult] = await Promise.all([
                dashboardService.getStats(),
                staffService.getReports({ period: 'daily' })
            ]);
            
            // Services return the data object directly (already extracted from response.data if needed)
            setStats(dashboardResult || {});
            setStaffReports(reportsResult || {});
            lastRefreshRef.current = Date.now();
        } catch (e) {
            console.error('Failed to fetch dashboard stats:', e);
            // Set empty data structure with proper defaults to prevent errors
            setStats({ 
                counts: { users: 0, staff: 0 }, 
                donation_stats: { total_amount: 0, currency: 'ETB' } 
            });
            setStaffReports({ 
                today: { present_count: 0, late_count: 0, absent_count: 0, total_staff: 0 },
                tasks: { total: 0, completed: 0, overdue: 0 }
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const fetchModuleData = useCallback(async () => {
        // Fetch bookings
        try {
            setModuleLoading(prev => ({ ...prev, bookings: true }));
            const bookingsData = await dataService.getAllFutsalBookings().catch(() => ({ data: [] }));
            // Handle API response format: { data: [...], message: "...", count: ... }
            const bookingsList = Array.isArray(bookingsData) ? bookingsData : (bookingsData?.data || bookingsData || []);
            setBookings(bookingsList);
        } catch (e) {
            console.error('Failed to fetch bookings:', e);
            setBookings([]);
        } finally {
            setModuleLoading(prev => ({ ...prev, bookings: false }));
        }

        // Fetch donations
        try {
            setModuleLoading(prev => ({ ...prev, donations: true }));
            const donationsData = await dataService.getAllDonations().catch(() => ({ data: [] }));
            // Handle API response format: { data: [...], message: "...", count: ... }
            const donationsList = Array.isArray(donationsData) ? donationsData : (donationsData?.data || donationsData || []);
            setDonations(donationsList);
        } catch (e) {
            console.error('Failed to fetch donations:', e);
            setDonations([]);
        } finally {
            setModuleLoading(prev => ({ ...prev, donations: false }));
        }

        // Fetch enrollments
        try {
            setModuleLoading(prev => ({ ...prev, enrollments: true }));
            const enrollmentsData = await dataService.getAllEducationEnrollments().catch(() => ({ data: [] }));
            // Handle API response format: { data: [...], message: "...", count: ... }
            const enrollmentsList = Array.isArray(enrollmentsData) ? enrollmentsData : (enrollmentsData?.data || enrollmentsData || []);
            setEnrollments(enrollmentsList);
        } catch (e) {
            console.error('Failed to fetch enrollments:', e);
            setEnrollments([]);
        } finally {
            setModuleLoading(prev => ({ ...prev, enrollments: false }));
        }
    }, []);

    useEffect(() => {
        // Initial fetch
        fetchStats(true);
        fetchModuleData();

        // Set up auto-refresh every 30 seconds
        refreshIntervalRef.current = setInterval(() => {
            fetchStats(false);
            fetchModuleData();
        }, 30000);

        // Listen for custom events that indicate data changes
        const handleDataChange = (event) => {
            // Refresh when relevant events occur
            const eventTypes = [
                'staff:attendance:changed',
                'staff:task:created',
                'staff:task:updated',
                'staff:task:completed',
                'donation:created',
                'donation:completed',
                'user:created',
                'staff:created',
                'dashboard:refresh'
            ];
            
            if (eventTypes.includes(event.detail?.type)) {
                fetchStats(false);
            }
        };

        // Listen for visibility change (when user switches back to tab)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Refresh if it's been more than 1 minute since last refresh
                const timeSinceLastRefresh = Date.now() - lastRefreshRef.current;
                if (timeSinceLastRefresh > 60000) {
                    fetchStats(false);
                }
            }
        };

        // Listen for focus (when user clicks back into window)
        const handleFocus = () => {
            const timeSinceLastRefresh = Date.now() - lastRefreshRef.current;
            if (timeSinceLastRefresh > 60000) {
                fetchStats(false);
            }
        };

        window.addEventListener('dashboard:refresh', handleDataChange);
        window.addEventListener('custom:data-change', handleDataChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        // Cleanup
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
            window.removeEventListener('dashboard:refresh', handleDataChange);
            window.removeEventListener('custom:data-change', handleDataChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchStats]);

    // Refresh when navigating back to dashboard
    useEffect(() => {
        if (location.pathname === '/dashboard') {
            const timeSinceLastRefresh = Date.now() - lastRefreshRef.current;
            if (timeSinceLastRefresh > 10000) { // Refresh if more than 10 seconds since last refresh
                fetchStats(false);
            }
        }
    }, [location.pathname, fetchStats]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    const adminStats = [
        { label: 'Total Users', value: (stats?.counts?.users || 0).toLocaleString(), icon: <FiUsers className="h-6 w-6" />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Total Staff', value: (stats?.counts?.staff || 0).toLocaleString(), icon: <FiUsers className="h-6 w-6" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Total Donations', value: `${(stats?.donation_stats?.total_amount || 0).toLocaleString()} ${stats?.donation_stats?.currency || 'ETB'}`, icon: <FiHeart className="h-6 w-6" />, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    ];

    // Calculate Task Completion Rate
    const taskTotal = staffReports?.tasks?.total || 0;
    const taskCompleted = staffReports?.tasks?.completed || 0;
    const completionRate = taskTotal > 0 ? Math.round((taskCompleted / taskTotal) * 100) : 0;

    const staffOverview = [
        { label: 'Present Today', value: staffReports?.today?.present_count || 0, sub: `${staffReports?.today?.total_staff || 0} Total`, icon: <FiUsers className="h-5 w-5" />, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'Late / Absent', value: `${staffReports?.today?.late_count || 0} / ${staffReports?.today?.absent_count || 0}`, icon: <FiClock className="h-5 w-5" />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { label: 'Task Completion', value: `${completionRate}%`, sub: `${staffReports?.tasks?.completed || 0} / ${taskTotal} Tasks`, icon: <FiCheckSquare className="h-5 w-5" />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'Overdue Tasks', value: staffReports?.tasks?.overdue || 0, icon: <FiShield className="h-5 w-5" />, color: 'text-red-500', bg: 'bg-red-500/10' },
    ];

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="animate-pulse space-y-8">
                    <div className="h-32 bg-muted rounded-2xl"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-lg"></div>)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-lg"></div>)}
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
            className="max-w-6xl mx-auto space-y-8"
        >
            {/* Admin Welcome */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-zinc-900 text-white p-8 shadow-lg border border-zinc-800">
                <IslamicPattern color="white" className="mix-blend-overlay" opacity={0.05} />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <FiShield className="h-8 w-8 text-red-500" />
                            <h1 className="text-3xl font-bold">Admin Console</h1>
                        </div>
                        <p className="text-zinc-400">System Overview & Management</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchStats(true)}
                            disabled={refreshing}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white"
                        >
                            <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        <Link to="/profile" className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition flex items-center gap-2 text-sm">
                            <FiUsers /> My Profile
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Staff Overview Grid (New) */}
            <motion.div variants={itemVariants}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><FiUsers /> Staff Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {staffOverview.map((stat, i) => (
                        <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-4 flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`p-2 rounded-full ${stat.bg} ${stat.color}`}>
                                        {stat.icon}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                                    {stat.sub && <p className="text-[10px] text-muted-foreground mt-1">{stat.sub}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </motion.div>

            {/* General Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {adminStats.map((stat, i) => (
                    <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                                <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                                {stat.icon}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            {/* Recent Admin Activity */}
            <motion.div variants={itemVariants}>
                <Card className="shadow-md border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="border-b border-border/40 pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FiActivity className="text-blue-500" /> Recent System Activity (You)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {stats?.recent_activities && stats.recent_activities.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {stats.recent_activities.slice(0, 6).map((activity, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                                        <div className="bg-primary/10 p-2 rounded-full mt-1 shrink-0">
                                            <FiActivity className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm text-foreground truncate">{activity.description}</p>
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

            {/* Staff Access Levels Info Card */}
            <motion.div variants={itemVariants}>
                <Card className="border-l-4 border-l-indigo-500 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FiShield className="text-indigo-500" /> Staff Access Levels
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Staff members have different access levels based on their role</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                <div className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Basic Access</div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <div>• View attendance</div>
                                    <div>• Own tasks only</div>
                                    <div className="font-medium mt-2">Roles: Maintenance, Security, Volunteer</div>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                                <div className="font-semibold text-purple-700 dark:text-purple-300 mb-2">High Access</div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <div>• All basic features</div>
                                    <div>• Manage courses & students</div>
                                    <div>• Assign tasks</div>
                                    <div className="font-medium mt-2">Roles: Imam, Teacher, Administrator</div>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                                <div className="font-semibold text-green-700 dark:text-green-300 mb-2">Teacher Access</div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <div>• Full course management</div>
                                    <div>• Student grading</div>
                                    <div>• Assignments & exams</div>
                                    <div className="font-medium mt-2">Special: Teacher Dashboard</div>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                                <div className="font-semibold text-red-700 dark:text-red-300 mb-2">Admin Access</div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <div>• Full system access</div>
                                    <div>• User management</div>
                                    <div>• System settings</div>
                                    <div className="font-medium mt-2">Role: Admin only</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border/50">
                            <p className="text-sm text-muted-foreground mb-3">
                                <strong>Note:</strong> To change a staff member's access level, update their staff profile role in Staff Management.
                                Teachers automatically get access to the Teacher Dashboard for managing educational services.
                            </p>
                            <div className="flex gap-2">
                                <Link to="/staff" className="flex-1">
                                    <Button variant="outline" className="w-full">
                                        <FiUsers className="mr-2" />
                                        Manage Staff & Roles
                                    </Button>
                                </Link>
                                <Link to="/admin/users" className="flex-1">
                                    <Button variant="outline" className="w-full">
                                        <FiUsers className="mr-2" />
                                        Manage All Users
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Admin Management Grid */}
            <motion.div variants={itemVariants}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* User & Role Management */}
                    <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FiUsers className="text-blue-500" /> User Management
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Manage users & roles</p>
                        </CardHeader>
                        <CardContent>
                            <Link to="/admin/users" className="block w-full p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition text-center font-medium text-sm text-blue-700 dark:text-blue-300">
                                <FiUsers className="inline mr-2" />
                                Manage Users & Roles
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Attendance Management */}
                    <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FiClock className="text-green-500" /> Attendance Management
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">View & edit all attendance</p>
                        </CardHeader>
                        <CardContent>
                            <Link to="/staff/attendance" className="block w-full p-3 rounded-lg bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/40 transition text-center font-medium text-sm text-green-700 dark:text-green-300">
                                <FiClock className="inline mr-2" />
                                View/Edit Attendance
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Task Management */}
                    <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FiCheckSquare className="text-purple-500" /> Task Management
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Create & assign tasks</p>
                        </CardHeader>
                        <CardContent>
                            <Link to="/staff/tasks" className="block w-full p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/40 transition text-center font-medium text-sm text-purple-700 dark:text-purple-300">
                                <FiCheckSquare className="inline mr-2" />
                                Create & Assign Tasks
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Reports & Analytics */}
                    <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FiActivity className="text-orange-500" /> Reports & Analytics
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">View reports & analytics</p>
                        </CardHeader>
                        <CardContent>
                            <Link to="/staff/reports" className="block w-full p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/40 transition text-center font-medium text-sm text-orange-700 dark:text-orange-300">
                                <FiActivity className="inline mr-2" />
                                View Reports
                            </Link>
                        </CardContent>
                    </Card>

                    {/* System Settings */}
                    <Card className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FiSettings className="text-red-500" /> System Settings
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Configure system settings</p>
                        </CardHeader>
                        <CardContent>
                            <Link to="/admin/settings" className="block w-full p-3 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 transition text-center font-medium text-sm text-red-700 dark:text-red-300">
                                <FiSettings className="inline mr-2" />
                                System Settings
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Staff Operations */}
                    <Card className="border-l-4 border-l-amber-500 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FiUsers className="text-amber-500" /> Staff Operations
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">Manage staff members</p>
                        </CardHeader>
                        <CardContent>
                            <Link to="/staff" className="block w-full p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/40 transition text-center font-medium text-sm text-amber-700 dark:text-amber-300">
                                <FiUsers className="inline mr-2" />
                                Manage Staff
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>

            {/* Module Management Section */}
            <motion.div variants={itemVariants}>
                <Card className="border-l-4 border-l-indigo-500 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FiDatabase className="text-indigo-500" /> Module Management
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Manage all system modules and user activities</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Bookings Management */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <FiCalendar className="text-blue-500" /> Futsal Bookings
                                    <span className="text-sm font-normal text-muted-foreground">({bookings.length})</span>
                                </h3>
                                <Link to="/bookings" className="text-sm text-primary hover:underline">View All</Link>
                            </div>
                            {moduleLoading.bookings ? (
                                <div className="flex items-center justify-center py-8">
                                    <FiLoader className="w-5 h-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : bookings.length > 0 ? (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {bookings.slice(0, 5).map((booking) => (
                                        <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">{booking.contact_name || booking.user || 'Unknown User'}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {booking.slot?.time || booking.time || 'N/A'} • {booking.slot?.date || booking.date || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    booking.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                    {booking.status || 'pending'}
                                                </span>
                                                {booking.status === 'pending' && (
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={async () => {
                                                                try {
                                                                    await dataService.updateFutsalBookingStatus(booking.id, 'approved');
                                                                    toast.success('Booking approved');
                                                                    fetchModuleData();
                                                                } catch (e) {
                                                                    toast.error('Failed to update booking');
                                                                }
                                                            }}
                                                            className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                                                        >
                                                            <FiCheck className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={async () => {
                                                                try {
                                                                    await dataService.updateFutsalBookingStatus(booking.id, 'rejected');
                                                                    toast.success('Booking rejected');
                                                                    fetchModuleData();
                                                                } catch (e) {
                                                                    toast.error('Failed to update booking');
                                                                }
                                                            }}
                                                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                                        >
                                                            <FiX className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-4 text-sm">No bookings found</p>
                            )}
                        </div>

                        {/* Donations Management */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <FiHeart className="text-rose-500" /> Donations
                                    <span className="text-sm font-normal text-muted-foreground">({donations.length})</span>
                                </h3>
                                <Link to="/donations" className="text-sm text-primary hover:underline">View All</Link>
                            </div>
                            {moduleLoading.donations ? (
                                <div className="flex items-center justify-center py-8">
                                    <FiLoader className="w-5 h-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : donations.length > 0 ? (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {donations.slice(0, 5).map((donation) => (
                                        <div key={donation.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">{donation.donor_name || 'Anonymous'}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {donation.cause?.title || 'General Donation'} • {new Date(donation.created_at || donation.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-primary">
                                                    {donation.amount} {donation.currency || 'ETB'}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    donation.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    donation.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                                }`}>
                                                    {donation.status || 'pending'}
                                                </span>
                                            </div>
                                        </div>
                            ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-4 text-sm">No donations found</p>
                            )}
                        </div>

                        {/* Education Enrollments Management */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <FiBookOpen className="text-purple-500" /> Education Enrollments
                                    <span className="text-sm font-normal text-muted-foreground">({enrollments.length})</span>
                                </h3>
                                <Link to="/education" className="text-sm text-primary hover:underline">View All</Link>
                            </div>
                            {moduleLoading.enrollments ? (
                                <div className="flex items-center justify-center py-8">
                                    <FiLoader className="w-5 h-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : enrollments.length > 0 ? (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {enrollments.slice(0, 5).map((enrollment) => (
                                        <div key={enrollment.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">{enrollment.user?.username || enrollment.user?.email || 'Unknown User'}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {enrollment.service?.title || 'Education Service'} • {new Date(enrollment.created_at || enrollment.enrolled_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    enrollment.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    enrollment.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                                }`}>
                                                    {enrollment.status || 'pending'}
                                                </span>
                                                {enrollment.status === 'pending' && (
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={async () => {
                                                                try {
                                                                    await dataService.updateEnrollmentStatus(enrollment.id, 'confirmed');
                                                                    toast.success('Enrollment confirmed');
                                                                    fetchModuleData();
                                                                } catch (e) {
                                                                    toast.error('Failed to update enrollment');
                                                                }
                                                            }}
                                                            className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                                                        >
                                                            <FiCheck className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={async () => {
                                                                try {
                                                                    await dataService.updateEnrollmentStatus(enrollment.id, 'cancelled');
                                                                    toast.success('Enrollment cancelled');
                                                                    fetchModuleData();
                                                                } catch (e) {
                                                                    toast.error('Failed to update enrollment');
                                                                }
                                                            }}
                                                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                                        >
                                                            <FiX className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-4 text-sm">No enrollments found</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
});

AdminDashboard.displayName = 'AdminDashboard';
export default AdminDashboard;
