import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiEdit, FiTrash2, FiSearch, FiRefreshCw, FiMoreVertical, FiCheckCircle, FiXCircle, FiFilter, FiDownload } from 'react-icons/fi';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { apiService } from '@/lib/apiService';
import { useTranslation } from 'react-i18next';
import { AdminModuleHeader } from '@/components/admin/AdminModuleHeader';
import { Badge } from '@/components/ui/Badge';

const ROLE_OPTIONS = [
    { value: 'admin', label: 'Admin', variant: 'error' },
    { value: 'staff', label: 'Staff', variant: 'warning' },
    { value: 'member', label: 'Member', variant: 'success' },
    { value: 'visitor', label: 'Visitor', variant: 'secondary' },
    { value: 'student', label: 'Student', variant: 'primary' },
    { value: 'parent', label: 'Parent', variant: 'accent' },
];

const UserManagement = memo(() => {
    const { t } = useTranslation();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await apiService.get('/accounts/users/');
            setUsers(response.data?.data || response.data || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error(t('userManagement.failedToLoad'));
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (user) => {
        setEditingUser({ ...user });
        setShowEditModal(true);
    };

    const handleSaveUser = async () => {
        try {
            const updateData = {
                first_name: editingUser.first_name,
                last_name: editingUser.last_name,
                email: editingUser.email,
                phone: editingUser.phone,
                role: editingUser.role,
            };
            await apiService.patch(`/accounts/users/${editingUser.id}/`, updateData);
            toast.success(t('userManagement.userUpdated'));
            setShowEditModal(false);
            setEditingUser(null);
            fetchUsers();
            window.dispatchEvent(new CustomEvent('custom:data-change', { detail: { type: 'user:updated' } }));
        } catch (error) {
            console.error('Failed to update user:', error);
            toast.error(t('userManagement.failedToUpdate'));
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm(t('userManagement.sureToDelete'))) return;

        try {
            await apiService.delete(`/accounts/users/${userId}/`);
            toast.success(t('userManagement.userDeleted'));
            fetchUsers();
            window.dispatchEvent(new CustomEvent('custom:data-change', { detail: { type: 'user:deleted' } }));
        } catch (error) {
            console.error('Failed to delete user:', error);
            toast.error(t('userManagement.failedToDelete'));
        }
    };

    const filteredUsers = users.filter(u => {
        const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
        const matchesSearch =
            u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fullName.includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role) => {
        const option = ROLE_OPTIONS.find(r => r.value === role) || ROLE_OPTIONS[3];
        return <Badge variant={option.variant} size="sm" className="capitalize">{t(`common.${role}`) || option.label}</Badge>;
    };

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
        <div className="max-w-full space-y-6">
            <AdminModuleHeader
                title={t('dashboard.admin.userManagement')}
                subtitle={t('userManagement.manageUsersSubtitle') || "Manage community members, staff, and administrators."}
            />

            {/* Actions Bar */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardContent className="p-4 flex flex-col lg:flex-row gap-4 justify-between items-center">
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <div className="relative group w-full sm:w-80">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder={t('userManagement.searchPlaceholder') || "Search users..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                        <div className="relative w-full sm:w-48">
                            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full pl-10 pr-8 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                            >
                                <option value="all">{t('userManagement.allRoles')}</option>
                                {ROLE_OPTIONS.map(role => (
                                    <option key={role.value} value={role.value}>{t(`common.${role.value}`) || role.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full lg:w-auto">
                        <Button
                            variant="outline"
                            onClick={fetchUsers}
                            className="flex-1 lg:flex-none border-dashed"
                        >
                            <FiRefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            <AnimatePresence>
                                {filteredUsers.map((user, index) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="bg-card hover:bg-muted/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                                                    {(user.first_name?.[0] || user.username?.[0] || '?').toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-foreground flex items-center gap-2">
                                                        {user.first_name} {user.last_name}
                                                        {user.id === currentUser?.id && <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-1">You</span>}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-foreground">{user.email}</span>
                                                {user.phone && <span className="text-xs text-muted-foreground">{user.phone}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {user.is_verified ? (
                                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    <FiCheckCircle className="mr-1 h-3 w-3" /> Verified
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                                                    <FiXCircle className="mr-1 h-3 w-3" /> Unverified
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEditUser(user)}
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-emerald-600"
                                                >
                                                    <FiEdit className="h-4 w-4" />
                                                </Button>
                                                {user.id !== currentUser?.id && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <FiTrash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                            <FiUsers className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No users found</h3>
                        <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
                    </div>
                )}
                <div className="px-6 py-4 border-t border-border/50 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                    <div>Showing {filteredUsers.length} users</div>
                    {/* Pagination could go here */}
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {showEditModal && editingUser && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-card rounded-2xl shadow-2xl w-full max-w-lg border border-border"
                        >
                            <div className="p-6 border-b border-border flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold">{t('userManagement.editUser')}</h2>
                                    <p className="text-sm text-muted-foreground">Update profile details</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
                                    <FiXCircle className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground">{t('userManagement.firstName')}</label>
                                        <input
                                            type="text"
                                            value={editingUser.first_name || ''}
                                            onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                                            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground">{t('userManagement.lastName')}</label>
                                        <input
                                            type="text"
                                            value={editingUser.last_name || ''}
                                            onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                                            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase text-muted-foreground">{t('userManagement.email')}</label>
                                    <input
                                        type="email"
                                        value={editingUser.email || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase text-muted-foreground">{t('userManagement.phone')}</label>
                                    <input
                                        type="text"
                                        value={editingUser.phone || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase text-muted-foreground">{t('userManagement.role')}</label>
                                    <select
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    >
                                        {ROLE_OPTIONS.map(role => (
                                            <option key={role.value} value={role.value}>{t(`common.${role.value}`) || role.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="p-6 border-t border-border flex gap-3 bg-muted/10 rounded-b-2xl">
                                <Button onClick={handleSaveUser} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                                    {t('common.saveChanges')}
                                </Button>
                                <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                                    {t('common.cancel')}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
});

UserManagement.displayName = 'UserManagement';
export default UserManagement;
