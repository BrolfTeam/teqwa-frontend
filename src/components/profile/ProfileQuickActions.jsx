import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiCalendar, FiHeart, FiUsers, FiArrowRight } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export const ProfileQuickActions = () => {
    const { t } = useTranslation();

    const actions = [
        {
            label: t('profile.myBookings'),
            href: "/bookings/user",
            icon: <FiCalendar />,
            color: "border-emerald-200 hover:bg-emerald-50 text-emerald-700"
        },
        {
            label: t('profile.makeDonation'),
            href: "/donate",
            icon: <FiHeart />,
            color: "border-teal-200 hover:bg-teal-50 text-teal-700"
        },
        {
            label: t('profile.browseEvents'),
            href: "/events",
            icon: <FiUsers />,
            color: "border-green-200 hover:bg-green-50 text-green-700"
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
        >
            <Card className="shadow-2xl border-white/20 bg-white/40 backdrop-blur-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-white/20 p-6">
                    <CardTitle className="text-xl font-bold flex items-center space-x-2">
                        <FiArrowRight className="text-emerald-600" />
                        <span>{t('profile.quickActions')}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            asChild
                            variant="outline"
                            className={`w-full h-14 justify-start text-base font-bold rounded-2xl border-2 transition-all duration-300 ${action.color}`}
                        >
                            <a href={action.href} className="flex items-center w-full">
                                <span className="p-2 bg-white rounded-lg shadow-sm mr-4 group-hover:scale-110 transition-transform">
                                    {action.icon}
                                </span>
                                <span className="flex-1">{action.label}</span>
                                <FiArrowRight className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </a>
                        </Button>
                    ))}
                </CardContent>
            </Card>
        </motion.div>
    );
};
