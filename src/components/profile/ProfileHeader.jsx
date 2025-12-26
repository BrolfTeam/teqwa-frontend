import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiUser, FiCamera } from 'react-icons/fi';
import { IslamicPattern } from '@/components/ui/IslamicPattern';

export const ProfileHeader = ({ user }) => {
    const { t } = useTranslation();

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 p-8 md:p-12 mb-8 shadow-xl">
            {/* Background Decorative Element */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <IslamicPattern className="w-full h-full opacity-30" />
            </div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-10">
                {/* Avatar Section */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative group"
                >
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/30 p-1 bg-white/10 backdrop-blur-md overflow-hidden flex items-center justify-center">
                        {user?.profile?.avatar ? (
                            <img
                                src={user.profile.avatar}
                                alt={user.first_name || 'User'}
                                className="w-full h-full object-cover rounded-full shadow-inner"
                            />
                        ) : (
                            <FiUser className="w-16 h-16 md:w-20 md:h-20 text-white/80" />
                        )}

                        {/* Hover Edit Overlay (Placeholder for future upload feature) */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-full">
                            <FiCamera className="text-white w-6 h-6" />
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-400 border-4 border-emerald-600 rounded-full shadow-lg" />
                </motion.div>

                {/* User Details */}
                <div className="text-center md:text-left">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
                            {t('common.welcome')}, {user?.first_name || user?.username}!
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-emerald-50/80 text-lg md:text-xl font-medium max-w-xl"
                    >
                        {t('profile.subtitle')}
                    </motion.p>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6 flex flex-wrap justify-center md:justify-start gap-3"
                    >
                        <span className="px-4 py-1.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-semibold tracking-wide">
                            {user?.role?.toUpperCase() || t('auth.roleLabels.member')}
                        </span>
                        <span className="px-4 py-1.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-semibold tracking-wide">
                            {t('profile.memberSince')}: {user?.created_at ? new Date(user.created_at).getFullYear() : '2025'}
                        </span>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
