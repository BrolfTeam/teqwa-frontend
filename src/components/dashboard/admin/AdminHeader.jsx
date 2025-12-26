import { motion } from 'framer-motion';
import { FiShield, FiRefreshCw, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import IslamicPattern from '@/components/ui/IslamicPattern';
import { useTranslation } from 'react-i18next';

const AdminHeader = ({ refreshing, onRefresh, itemVariants }) => {
    const { t } = useTranslation();

    return (
        <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-[2rem] bg-zinc-900 text-white p-6 md:p-10 shadow-2xl border border-white/5"
        >
            <IslamicPattern color="white" className="mix-blend-overlay" opacity={0.07} />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                        <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                            <FiShield className="h-8 w-8 text-red-500" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            {t('dashboard.admin.title')}
                        </h1>
                    </div>
                    <p className="text-zinc-400 text-lg font-medium">{t('dashboard.overview')}</p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 w-full md:w-auto">
                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md rounded-2xl flex-1 md:flex-none"
                    >
                        <FiRefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? t('common.loading') : t('common.refresh')}
                    </Button>

                    <Link to="/profile" className="flex-1 md:flex-none">
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 rounded-2xl"
                        >
                            <FiUser className="mr-2 h-5 w-5" />
                            {t('common.profile')}
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminHeader;
