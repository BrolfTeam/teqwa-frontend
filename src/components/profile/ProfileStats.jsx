import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiCalendar, FiHeart, FiUsers, FiAward } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export const ProfileStats = ({ statsData }) => {
    const { t } = useTranslation();

    const stats = [
        {
            label: t('profile.upcomingEvents'),
            value: statsData?.counts?.upcoming_events || '0',
            icon: <FiCalendar className="h-6 w-6" />,
            color: "bg-emerald-500",
            lightColor: "bg-emerald-50"
        },
        {
            label: t('profile.donationsMade'),
            value: statsData?.donation_stats?.total_amount ? `${statsData.donation_stats.total_amount} ETB` : '0 ETB',
            icon: <FiHeart className="h-6 w-6" />,
            color: "bg-teal-500",
            lightColor: "bg-teal-50"
        },
        {
            label: t('profile.communityPoints'),
            value: statsData?.points || '0',
            icon: <FiAward className="h-6 w-6" />,
            color: "bg-green-600",
            lightColor: "bg-green-50"
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
        >
            <Card className="shadow-2xl border-white/20 bg-white/40 backdrop-blur-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-white/20 p-6">
                    <CardTitle className="text-xl font-bold flex items-center space-x-2">
                        <FiAward className="text-emerald-600" />
                        <span>{t('profile.statsTitle')}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className={`flex items-center justify-between p-4 ${stat.lightColor} rounded-2xl border border-white transition-all hover:scale-[1.02] cursor-default`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`p-3 ${stat.color} rounded-xl shadow-lg ring-4 ring-white`}>
                                    <div className="text-white">{stat.icon}</div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                                    <span className="text-xl font-black text-gray-800">{stat.value}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </CardContent>
            </Card>
        </motion.div>
    );
};
