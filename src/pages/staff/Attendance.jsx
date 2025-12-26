import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiCalendar, FiRefreshCw, FiUserCheck, FiUserX, FiClock, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import staffService from '@/services/staffService';
import { AdminModuleHeader } from '@/components/admin/AdminModuleHeader';

const Attendance = memo(() => {
    const { t } = useTranslation();
    const [staff, setStaff] = useState([]);
    const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const response = await staffService.getAttendance(date);
            const data = response.data || [];
            setStaff(data);

            // Calculate stats
            const s = data.reduce((acc, curr) => {
                acc[curr.status || 'absent']++;
                acc.total++;
                return acc;
            }, { present: 0, absent: 0, late: 0, total: 0 });
            setStats(s);
        } catch (error) {
            console.error('Failed to load attendance:', error);
            toast.error(t('staff.attendance.failedToLoad'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [date]);

    const handleUpdateAttendance = async (staffId, status) => {
        try {
            await staffService.updateAttendance(staffId, date, status);
            toast.success(t('staff.attendance.attendanceUpdated'));
            fetchData();
        } catch (error) {
            toast.error(t('staff.attendance.failedToUpdate'));
        }
    };

    const statsCards = [
        { label: t('staff.attendance.totalStaff'), value: stats.total, icon: FiUsers, color: 'from-blue-500 to-indigo-600' },
        { label: t('staff.attendance.present'), value: stats.present, icon: FiUserCheck, color: 'from-emerald-500 to-teal-600' },
        { label: t('staff.attendance.late'), value: stats.late, icon: FiClock, color: 'from-amber-400 to-orange-500' },
        { label: t('staff.attendance.absent'), value: stats.absent, icon: FiUserX, color: 'from-red-500 to-rose-600' },
    ];

    if (loading && !refreshing) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <div className="mt-4 text-emerald-600 font-bold animate-pulse">{t('common.loading')}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <div className="container px-4 py-8 max-w-7xl mx-auto">
                <AdminModuleHeader
                    title={t('staff.attendance.title')}
                    subtitle={t('staff.attendance.viewEditRecords') || "Monitor and manage staff daily attendance and punctuality."}
                />

                {/* Operations Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row gap-4 mb-10"
                >
                    <div className="relative flex-1 group">
                        <FiCalendar className="absolute left-5 top-1/2 transform -translate-y-1/2 text-emerald-500 group-hover:scale-110 transition-transform" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-gray-700"
                        />
                    </div>
                    <Button
                        onClick={fetchData}
                        variant="outline"
                        disabled={refreshing}
                        className="rounded-3xl h-full px-10 border-white/20 bg-white/40 backdrop-blur-xl shadow-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all font-black text-lg"
                    >
                        <FiRefreshCw className={`mr-3 ${refreshing ? 'animate-spin' : ''}`} />
                        {t('staff.attendance.refresh')}
                    </Button>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {statsCards.map((card, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="overflow-hidden border-white/20 bg-white/40 backdrop-blur-xl shadow-xl relative group h-full">
                                <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${card.color}`} />
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                                            <card.icon className="w-6 h-6" />
                                        </div>
                                        <FiTrendingUp className="text-gray-200 group-hover:text-emerald-500/20 transition-colors w-10 h-10" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
                                        <h3 className="text-4xl font-black text-gray-800 tracking-tighter">{card.value}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Attendance List */}
                <Card className="rounded-[2.5rem] border-white/20 bg-white/40 backdrop-blur-xl shadow-2xl overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-emerald-600/5">
                                        <th className="px-8 py-6 text-left text-xs font-black text-emerald-600 uppercase tracking-widest">{t('userManagement.name')}</th>
                                        <th className="px-8 py-6 text-left text-xs font-black text-emerald-600 uppercase tracking-widest">Role</th>
                                        <th className="px-8 py-6 text-center text-xs font-black text-emerald-600 uppercase tracking-widest">{t('userManagement.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/20">
                                    <AnimatePresence mode="popLayout">
                                        {staff.length > 0 ? staff.map((s, idx) => (
                                            <motion.tr
                                                key={s.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="hover:bg-white/50 transition-colors"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center font-black text-emerald-700">
                                                            {s.name?.[0]?.toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-gray-800">{s.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-tight border border-gray-200">
                                                        {s.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {[
                                                            { value: 'present', label: t('staff.attendance.markPresent'), icon: FiUserCheck, color: 'text-emerald-500 hover:bg-emerald-50 border-emerald-100' },
                                                            { value: 'late', label: t('staff.attendance.markLate'), icon: FiClock, color: 'text-amber-500 hover:bg-amber-50 border-amber-100' },
                                                            { value: 'absent', label: t('staff.attendance.markAbsent'), icon: FiUserX, color: 'text-red-500 hover:bg-red-50 border-red-100' },
                                                        ].map((action) => (
                                                            <button
                                                                key={action.value}
                                                                onClick={() => handleUpdateAttendance(s.id, action.value)}
                                                                title={action.label}
                                                                className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-2 font-bold text-sm ${s.status === action.value
                                                                        ? action.color.replace('text-', 'bg-').replace('hover:', '').replace('/100', '/10') + ' ring-4 ring-current/10 scale-105 shadow-sm'
                                                                        : 'bg-white/50 border-transparent text-gray-400 hover:border-emerald-200'
                                                                    } ${action.color}`}
                                                            >
                                                                <action.icon className="w-5 h-5" />
                                                                <span className="hidden sm:inline">{action.value.charAt(0).toUpperCase() + action.value.slice(1)}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <FiUsers className="w-16 h-16 text-gray-200 mb-4" />
                                                        <p className="text-xl font-black text-gray-400">{t('staff.attendance.noStaffFound')}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
});

Attendance.displayName = 'Attendance';
export default Attendance;
