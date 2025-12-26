import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

// Sub-components
import AdminHeader from './admin/AdminHeader';
import AdminStats from './admin/AdminStats';
import ManagementGrid from './admin/ManagementGrid';
import ModuleTabs from './admin/ModuleTabs';
import RecentActivity from './admin/RecentActivity';

// Services & Hooks
import { useAuth } from '@/context/AuthContext';
import dashboardService from '@/services/dashboardService';
import staffService from '@/services/staffService';
import { dataService } from '@/lib/dataService';
import { useTranslation } from 'react-i18next';

const AdminDashboard = memo(() => {
    const { t } = useTranslation();
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

            setStats(dashboardResult || {});
            setStaffReports(reportsResult || {});
            lastRefreshRef.current = Date.now();
        } catch (e) {
            console.error('Failed to fetch dashboard stats:', e);
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
        fetchStats(true);
        fetchModuleData();

        refreshIntervalRef.current = setInterval(() => {
            fetchStats(false);
            fetchModuleData();
        }, 30000);

        const handleDataChange = (event) => {
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

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                const timeSinceLastRefresh = Date.now() - lastRefreshRef.current;
                if (timeSinceLastRefresh > 60000) {
                    fetchStats(false);
                }
            }
        };

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

        return () => {
            if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
            window.removeEventListener('dashboard:refresh', handleDataChange);
            window.removeEventListener('custom:data-change', handleDataChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchStats]);

    useEffect(() => {
        if (location.pathname === '/dashboard') {
            const timeSinceLastRefresh = Date.now() - lastRefreshRef.current;
            if (timeSinceLastRefresh > 10000) fetchStats(false);
        }
    }, [location.pathname, fetchStats]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-12 px-4">
                <div className="animate-pulse space-y-12">
                    <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-[3rem]"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div>)}
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
            className="max-w-7xl mx-auto space-y-12 pb-20 px-4"
        >
            <AdminHeader
                refreshing={refreshing}
                onRefresh={() => fetchStats(true)}
                itemVariants={itemVariants}
            />

            <AdminStats
                stats={stats}
                staffReports={staffReports}
                itemVariants={itemVariants}
            />

            <ManagementGrid
                itemVariants={itemVariants}
            />

            <ModuleTabs
                bookings={bookings}
                donations={donations}
                enrollments={enrollments}
                moduleLoading={moduleLoading}
                fetchModuleData={fetchModuleData}
                itemVariants={itemVariants}
            />

            <RecentActivity
                activities={stats?.recent_activities}
                itemVariants={itemVariants}
            />
        </motion.div>
    );
});

AdminDashboard.displayName = 'AdminDashboard';
export default AdminDashboard;
