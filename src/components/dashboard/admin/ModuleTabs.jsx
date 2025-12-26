import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiHeart, FiBookOpen, FiCheck, FiX, FiLoader, FiDatabase } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { dataService } from '@/lib/dataService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const ModuleTabs = ({
    bookings,
    donations,
    enrollments,
    moduleLoading,
    fetchModuleData,
    itemVariants
}) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('bookings');

    const tabs = [
        { id: 'bookings', label: t('dashboard.admin.recentBookings'), icon: <FiCalendar />, count: bookings.length, color: 'text-blue-500' },
        { id: 'donations', label: t('dashboard.admin.recentDonations'), icon: <FiHeart />, count: donations.length, color: 'text-rose-500' },
        { id: 'enrollments', label: t('dashboard.admin.recentEnrollments'), icon: <FiBookOpen />, count: enrollments.length, color: 'text-purple-500' },
    ];

    const renderEmpty = (message) => (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-zinc-100 dark:bg-zinc-800/50 p-6 rounded-full mb-4">
                <FiDatabase className="w-8 h-8 text-zinc-400" />
            </div>
            <p className="text-zinc-500 font-medium">{message}</p>
        </div>
    );

    const renderLoading = () => (
        <div className="flex flex-col items-center justify-center py-12">
            <FiLoader className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
            <p className="text-zinc-500 animate-pulse">{t('common.loading')}...</p>
        </div>
    );

    return (
        <motion.div variants={itemVariants}>
            <Card className="border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="border-b border-black/5 dark:border-white/5 pb-0 px-8 pt-8">
                    <div className="flex items-center justify-between mb-6">
                        <CardTitle className="text-2xl font-black flex items-center gap-3">
                            <FiDatabase className="text-emerald-500" />
                            {t('dashboard.admin.moduleManagement')}
                        </CardTitle>
                    </div>

                    {/* Styled Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all whitespace-nowrap font-bold text-sm ${activeTab === tab.id
                                        ? 'bg-zinc-900 text-white shadow-xl scale-105'
                                        : 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                                    }`}
                            >
                                <span className={activeTab === tab.id ? 'text-emerald-400' : tab.color}>{tab.icon}</span>
                                {tab.label}
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTab === tab.id ? 'bg-emerald-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                                    }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </CardHeader>

                <CardContent className="p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'bookings' && (
                                <div className="space-y-4">
                                    {moduleLoading.bookings ? renderLoading() : bookings.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {bookings.slice(0, 6).map((booking) => (
                                                <div key={booking.id} className="flex items-center justify-between p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-white/5 hover:border-emerald-500/30 transition-all hover:shadow-lg">
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <div className="font-black text-zinc-800 dark:text-zinc-100 truncate">{booking.contact_name || booking.user || 'Unknown User'}</div>
                                                        <div className="text-xs text-zinc-400 mt-1 font-bold uppercase tracking-wider tabular-nums">
                                                            {booking.slot?.time || booking.time || 'N/A'} • {booking.slot?.date || booking.date || 'N/A'}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${booking.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                                                                booking.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                                                                    'bg-rose-500/10 text-rose-600'
                                                            }`}>
                                                            {booking.status || 'pending'}
                                                        </span>
                                                        {booking.status === 'pending' && (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    onClick={async () => {
                                                                        try {
                                                                            await dataService.updateFutsalBookingStatus(booking.id, 'approved');
                                                                            toast.success(t('bookings.confirmed'));
                                                                            fetchModuleData();
                                                                        } catch (e) {
                                                                            toast.error(t('bookings.errorUpdating'));
                                                                        }
                                                                    }}
                                                                    className="h-9 w-9 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl"
                                                                >
                                                                    <FiCheck className="w-5 h-5" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    onClick={async () => {
                                                                        try {
                                                                            await dataService.updateFutsalBookingStatus(booking.id, 'rejected');
                                                                            toast.success(t('bookings.cancelled'));
                                                                            fetchModuleData();
                                                                        } catch (e) {
                                                                            toast.error(t('bookings.errorUpdating'));
                                                                        }
                                                                    }}
                                                                    className="h-9 w-9 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-xl"
                                                                >
                                                                    <FiX className="w-5 h-5" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : renderEmpty('No bookings found')}
                                </div>
                            )}

                            {activeTab === 'donations' && (
                                <div className="space-y-4">
                                    {moduleLoading.donations ? renderLoading() : donations.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {donations.slice(0, 6).map((donation) => (
                                                <div key={donation.id} className="flex items-center justify-between p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-white/5">
                                                    <div className="flex-1 min-w-0 px-2">
                                                        <div className="font-black text-zinc-800 dark:text-zinc-100 truncate">{donation.donor_name || 'Anonymous'}</div>
                                                        <div className="text-xs text-zinc-400 mt-1 font-bold uppercase tracking-wider italic">
                                                            {donation.cause?.title || 'General Donation'}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                                        <span className="text-lg font-black text-emerald-600 tabular-nums">
                                                            {donation.amount} {donation.currency || 'ETB'}
                                                        </span>
                                                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${donation.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                                                            }`}>
                                                            {donation.status || 'pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : renderEmpty(t('dashboard.admin.noDonations'))}
                                </div>
                            )}

                            {activeTab === 'enrollments' && (
                                <div className="space-y-4">
                                    {moduleLoading.enrollments ? renderLoading() : enrollments.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {enrollments.slice(0, 6).map((enrollment) => (
                                                <div key={enrollment.id} className="flex items-center justify-between p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-white/5">
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <div className="font-black text-zinc-800 dark:text-zinc-100 truncate">{enrollment.user?.username || enrollment.user?.email || 'Unknown User'}</div>
                                                        <div className="text-xs text-zinc-400 mt-1 font-bold uppercase tracking-wider truncate">
                                                            {enrollment.service?.title || 'Education Service'}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${enrollment.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                                                                enrollment.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                                                                    'bg-rose-500/10 text-rose-600'
                                                            }`}>
                                                            {enrollment.status || 'pending'}
                                                        </span>
                                                        {enrollment.status === 'pending' && (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    onClick={async () => {
                                                                        try {
                                                                            await dataService.updateEnrollmentStatus(enrollment.id, 'confirmed');
                                                                            toast.success('Enrollment confirmed');
                                                                            fetchModuleData();
                                                                        } catch (e) {
                                                                            toast.error('Failed to update enrollment');
                                                                        }
                                                                    }}
                                                                    className="h-9 w-9 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl"
                                                                >
                                                                    <FiCheck className="w-5 h-5" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    onClick={async () => {
                                                                        try {
                                                                            await dataService.updateEnrollmentStatus(enrollment.id, 'cancelled');
                                                                            toast.success('Enrollment cancelled');
                                                                            fetchModuleData();
                                                                        } catch (e) {
                                                                            toast.error('Failed to update enrollment');
                                                                        }
                                                                    }}
                                                                    className="h-9 w-9 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-xl"
                                                                >
                                                                    <FiX className="w-5 h-5" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : renderEmpty(t('dashboard.admin.noEnrollments'))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ModuleTabs;
