import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import IslamicPattern from '@/components/ui/IslamicPattern';

export const AdminModuleHeader = ({ title, subtitle }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-10 p-8 rounded-3xl overflow-hidden shadow-2xl border border-white/20"
        >
            {/* Background with Glassmorphism and Islamic Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 opacity-90" />
            <div className="absolute inset-0 opacity-10">
                <IslamicPattern />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="text-white hover:bg-white/10 p-0 h-auto font-bold flex items-center space-x-2 group"
                    >
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        <span>{t('dashboard.admin.backToDashboard')}</span>
                    </Button>

                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            {title}
                        </h1>
                        <p className="text-emerald-50/80 font-medium max-w-2xl">
                            {subtitle}
                        </p>
                    </div>
                </div>

                {/* Optional decorative element or additional actions can go here */}
                <div className="hidden lg:block">
                    <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center rotate-12">
                        <div className="-rotate-12">
                            <IslamicPattern className="w-12 h-12 text-white/40" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
