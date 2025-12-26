import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Link } from 'react-router-dom';
import { FiUsers, FiClock, FiCheckSquare, FiActivity, FiSettings } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const ManagementGrid = ({ itemVariants }) => {
    const { t } = useTranslation();

    const managementLinks = [
        {
            to: "/admin/users",
            label: t('dashboard.admin.userManagement'),
            sub: t('admin.userManagement.manageUsers'),
            icon: <FiUsers />,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-l-blue-500'
        },
        {
            to: "/staff/attendance",
            label: t('staff.attendance.title'),
            sub: t('staff.attendance.viewEditRecords'),
            icon: <FiClock />,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            border: 'border-l-green-500'
        },
        {
            to: "/staff/tasks",
            label: t('staff.tasks.title'),
            sub: t('staff.tasks.manageAssignReview'),
            icon: <FiCheckSquare />,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            border: 'border-l-purple-500'
        },
        {
            to: "/staff/reports",
            label: t('staff.reports.title'),
            sub: t('staff.reports.viewReports'),
            icon: <FiActivity />,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            border: 'border-l-orange-500'
        },
        {
            to: "/admin/settings",
            label: t('dashboard.admin.systemSettings'),
            sub: t('admin.settings.title'),
            icon: <FiSettings />,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            border: 'border-l-red-500'
        },
        {
            to: "/staff",
            label: t('dashboard.admin.staffManagement'),
            sub: t('dashboard.admin.staffManagement'),
            icon: <FiUsers />,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            border: 'border-l-amber-500'
        },
    ];

    return (
        <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-zinc-800 dark:text-white px-1">
                <FiSettings className="text-blue-500" />
                {t('dashboard.admin.quickActions')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managementLinks.map((link, i) => (
                    <Link key={i} to={link.to}>
                        <motion.div whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}>
                            <Card className={`border-l-4 ${link.border} shadow-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-2xl hover:shadow-emerald-500/5 transition-all overflow-hidden`}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${link.bg} ${link.color}`}>
                                            {link.icon}
                                        </div>
                                        <CardTitle className="text-lg font-bold">{link.label}</CardTitle>
                                    </div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-medium">{link.sub}</p>
                                </CardHeader>
                            </Card>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </motion.div>
    );
};

export default ManagementGrid;
