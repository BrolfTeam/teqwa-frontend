import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { useTranslation } from 'react-i18next';
import { FiUsers, FiHeart, FiClock, FiCheckSquare, FiShield } from 'react-icons/fi';

const AdminStats = ({ stats, staffReports, itemVariants }) => {
    const { t } = useTranslation();

    const adminStats = [
        {
            label: t('dashboard.admin.totalUsers'),
            value: (stats?.counts?.users || 0).toLocaleString(),
            icon: <FiUsers className="h-6 w-6" />,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            label: t('dashboard.admin.totalStaff'),
            value: (stats?.counts?.staff || 0).toLocaleString(),
            icon: <FiUsers className="h-6 w-6" />,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        },
        {
            label: t('dashboard.admin.totalDonations'),
            value: `${(stats?.donation_stats?.total_amount || 0).toLocaleString()} ${stats?.donation_stats?.currency || 'ETB'}`,
            icon: <FiHeart className="h-6 w-6" />,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10'
        },
    ];

    const taskTotal = staffReports?.tasks?.total || 0;
    const taskCompleted = staffReports?.tasks?.completed || 0;
    const completionRate = taskTotal > 0 ? Math.round((taskCompleted / taskTotal) * 100) : 0;

    const staffOverview = [
        {
            label: t('dashboard.admin.present'),
            value: staffReports?.today?.present_count || 0,
            sub: `${staffReports?.today?.total_staff || 0} ${t('dashboard.admin.totalStaffCount')}`,
            icon: <FiUsers className="h-5 w-5" />,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        {
            label: `${t('dashboard.admin.late')} / ${t('dashboard.admin.absent')}`,
            value: `${staffReports?.today?.late_count || 0} / ${staffReports?.today?.absent_count || 0}`,
            icon: <FiClock className="h-5 w-5" />,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10'
        },
        {
            label: t('dashboard.admin.taskCompletionRate'),
            value: `${completionRate}%`,
            sub: `${staffReports?.tasks?.completed || 0} / ${taskTotal} ${t('staff.tasks.title')}`,
            icon: <FiCheckSquare className="h-5 w-5" />,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
        {
            label: t('staff.tasks.title'),
            value: staffReports?.tasks?.overdue || 0,
            icon: <FiShield className="h-5 w-5" />,
            color: 'text-red-500',
            bg: 'bg-red-500/10'
        },
    ];

    return (
        <div className="space-y-8">
            {/* Staff Attendance Grid */}
            <motion.div variants={itemVariants}>
                <h3 className="text-xl font-bold mb-5 flex items-center gap-3 text-zinc-800 dark:text-white px-1">
                    <FiUsers className="text-emerald-500" />
                    {t('dashboard.admin.todayAttendance')}
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {staffOverview.map((stat, i) => (
                        <motion.div key={i} whileHover={{ y: -5 }} className="h-full">
                            <Card className="h-full border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden hover:shadow-emerald-500/5 hover:border-emerald-500/20 transition-all">
                                <CardContent className="p-5 flex flex-col justify-between h-full">
                                    <div className={`p-3 w-fit rounded-2xl ${stat.bg} ${stat.color} mb-4`}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black tracking-tight">{stat.value}</h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">{stat.label}</p>
                                        {stat.sub && <p className="text-xs text-zinc-400 mt-1 italic">{stat.sub}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* General System Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {adminStats.map((stat, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }}>
                        <Card className="border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-xl rounded-3xl hover:shadow-emerald-500/5 transition-all overflow-hidden border-b-4 border-b-transparent hover:border-b-emerald-500">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">{stat.label}</p>
                                    <h3 className="text-3xl font-black mt-2 tracking-tight">{stat.value}</h3>
                                </div>
                                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-lg shadow-black/5`}>
                                    {stat.icon}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default AdminStats;
