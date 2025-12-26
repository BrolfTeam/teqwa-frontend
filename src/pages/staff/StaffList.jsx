import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiMail, FiPhone, FiUsers, FiClock } from 'react-icons/fi';
import { dataService } from '@/lib/dataService';
import Pagination from '@/components/ui/Pagination';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/Card';
import { AdminModuleHeader } from '@/components/admin/AdminModuleHeader';

const StaffList = memo(() => {
    const { t } = useTranslation();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const data = await dataService.getStaff();
                setStaff(data);
            } catch (error) {
                console.error('Failed to fetch staff:', error);
                toast.error(t('staff.failedToLoadList') || 'Failed to load staff list');
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, [t]);

    const total = staff.length;
    const start = (page - 1) * pageSize;
    const paged = staff.slice(start, start + pageSize);

    if (loading) {
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
                    title={t('dashboard.admin.staffManagement')}
                    subtitle={t('staff.manageStaffSubtitle') || "View and manage the staff directory and roles."}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <AnimatePresence mode="popLayout">
                        {paged.map((s, index) => (
                            <motion.div
                                key={s.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="h-full hover:shadow-2xl transition-all duration-500 border-white/20 bg-white/40 backdrop-blur-xl group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border shadow-sm ${s.active ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' : 'bg-gray-500/10 text-gray-600 border-gray-200'}`}>
                                            {s.active ? t('common.active') : t('common.inactive')}
                                        </div>
                                    </div>

                                    <CardContent className="p-6 pt-8">
                                        <div className="flex items-center space-x-4 mb-6">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                                                <span className="text-2xl font-black text-white">
                                                    {(s.name?.[0] || '?').toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl text-gray-800 leading-tight">
                                                    {s.name}
                                                </h3>
                                                <p className="text-sm text-emerald-600 font-bold">{s.role}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center text-sm text-gray-500 font-medium truncate italic">
                                                <FiMail className="w-4 h-4 mr-3 text-emerald-500" />
                                                {s.email}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500 font-medium">
                                                <FiPhone className="w-4 h-4 mr-3 text-emerald-500" />
                                                {s.phone}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {staff.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-20 text-center"
                    >
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-6">
                            <FiUsers className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-gray-400">{t('staff.noStaffFound')}</h3>
                    </motion.div>
                ) : (
                    <div className="bg-white/40 backdrop-blur-xl p-4 rounded-[2rem] border border-white/20 shadow-xl">
                        <Pagination
                            total={total}
                            page={page}
                            pageSize={pageSize}
                            onPageChange={setPage}
                            onPageSizeChange={(sz) => { setPageSize(sz); setPage(1); }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
});

StaffList.displayName = 'StaffList';
export default StaffList;
