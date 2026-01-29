import { useState, useEffect, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiSearch, FiRefreshCw, FiFilter, FiDownload, FiDollarSign, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { dataService } from '@/lib/dataService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { AdminModuleHeader } from '@/components/admin/AdminModuleHeader';
import { Badge } from '@/components/ui/Badge';

const DonationManagement = memo(() => {
    const { t } = useTranslation();
    const [donations, setDonations] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [donationsData, statsData] = await Promise.all([
                dataService.getAllDonations(),
                dataService.getDonationStats()
            ]);

            setDonations(Array.isArray(donationsData) ? donationsData : (donationsData?.data || []));
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch donation data:', error);
            toast.error(t('donations.failedToLoad') || 'Failed to load donations');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const filteredDonations = useMemo(() => {
        return donations.filter(d => {
            const donorName = (d.donor_name || 'Anonymous').toLowerCase();
            const donorEmail = (d.donor_email || '').toLowerCase();
            const matchesSearch = donorName.includes(searchTerm.toLowerCase()) ||
                donorEmail.includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [donations, searchTerm, statusFilter]);

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'success':
                return <Badge variant="success" size="sm" className="capitalize">{status}</Badge>;
            case 'pending':
            case 'processing':
                return <Badge variant="warning" size="sm" className="capitalize">{status}</Badge>;
            case 'failed':
            case 'error':
                return <Badge variant="error" size="sm" className="capitalize">{status}</Badge>;
            default:
                return <Badge variant="secondary" size="sm" className="capitalize">{status || 'Unknown'}</Badge>;
        }
    };

    if (loading && !refreshing) {
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
        <div className="max-w-full space-y-8">
            <AdminModuleHeader
                title={t('dashboard.admin.donationManagement') || "Donation Management"}
                subtitle={t('donations.manageSubtitle') || "Track and monitor community contributions and campaign progress."}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Donations</p>
                                <h3 className="text-3xl font-black mt-1 tabular-nums">
                                    {stats?.total_amount?.toLocaleString() || 0} <span className="text-sm font-bold text-emerald-600">ETB</span>
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <FiTrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Donors Count</p>
                                <h3 className="text-3xl font-black mt-1 tabular-nums">
                                    {stats?.donors_count || iterations?.length || 0}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <FiUsers className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active Causes</p>
                                <h3 className="text-3xl font-black mt-1 tabular-nums">
                                    {donations.reduce((acc, d) => acc.add(d.cause?.id), new Set()).size || 0}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                                <FiHeart className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions Bar */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardContent className="p-4 flex flex-col lg:flex-row gap-4 justify-between items-center">
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <div className="relative group w-full sm:w-80">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder={t('donations.searchPlaceholder') || "Search donor name or email..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                        <div className="relative w-full sm:w-48">
                            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-8 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                            >
                                <option value="all">{t('donations.allStatus') || 'All Status'}</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full lg:w-auto">
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            className="flex-1 lg:flex-none border-dashed"
                        >
                            <FiRefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            {t('common.refresh')}
                        </Button>
                        <Button variant="outline" className="flex-1 lg:flex-none">
                            <FiDownload className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Donor</th>
                                <th className="px-6 py-4">Cause</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            <AnimatePresence>
                                {filteredDonations.map((donation, index) => (
                                    <motion.tr
                                        key={donation.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="bg-card hover:bg-muted/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-lg">
                                                    {(donation.donor_name?.[0] || 'A').toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-foreground">
                                                        {donation.donor_name || 'Anonymous'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{donation.donor_email || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">
                                                {donation.cause?.title || 'General Donation'}
                                            </div>
                                            <div className="text-xs text-muted-foreground italic truncate max-w-[200px]">
                                                {donation.message || ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-black text-emerald-600 tabular-nums">
                                                {donation.amount} {donation.currency || 'ETB'}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                                                {donation.payment_method || 'Chapa'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(donation.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-foreground">
                                                {new Date(donation.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground tabular-nums">
                                                {new Date(donation.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded select-all">
                                                {donation.reference || donation.id?.toString().slice(0, 8) || 'N/A'}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                {filteredDonations.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                            <FiHeart className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No donations found</h3>
                        <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
                    </div>
                )}
                <div className="px-6 py-4 border-t border-border/50 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                    <div>Showing {filteredDonations.length} contributions</div>
                    <div className="flex gap-4">
                        <span className="font-bold text-emerald-600">Total Visible: {filteredDonations.reduce((acc, d) => acc + parseFloat(d.amount), 0).toLocaleString()} ETB</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

DonationManagement.displayName = 'DonationManagement';
export default DonationManagement;
