import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { FiActivity } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const RecentActivity = ({ activities, itemVariants }) => {
    const { t } = useTranslation();

    return (
        <motion.div variants={itemVariants}>
            <Card className="shadow-2xl border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="border-b border-black/5 dark:border-white/5 pb-4 px-8 pt-8">
                    <CardTitle className="flex items-center gap-3 text-xl font-black">
                        <FiActivity className="text-blue-500" />
                        {t('dashboard.recentActivity')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    {activities && activities.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activities.slice(0, 6).map((activity, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-white/5 hover:border-blue-500/20 transition-all">
                                    <div className="bg-blue-500/10 p-2.5 rounded-xl shrink-0">
                                        <FiActivity className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-zinc-800 dark:text-zinc-200 truncate">{activity.description}</p>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">
                                            {new Date(activity.timestamp || activity.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-zinc-400 font-medium">{t('dashboard.noActivity')}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default RecentActivity;
