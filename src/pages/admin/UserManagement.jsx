import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiEdit, FiTrash2, FiSearch, FiRefreshCw, FiMoreVertical } from 'react-icons/fi';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { apiService } from '@/lib/apiService';
import { useTranslation } from 'react-i18next';
import { AdminModuleHeader } from '@/components/admin/AdminModuleHeader';

const ROLE_OPTIONS = [
    { value: 'admin', label: 'Admin', color: 'bg-red-500/10 text-red-600 border-red-200' },
    { value: 'staff', label: 'Staff', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    { value: 'member', label: 'Member', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
    { value: 'visitor', label: 'Visitor', color: 'bg-gray-500/10 text-gray-600 border-gray-200' },
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

    const handleRoleChange = async (userId, newRole) => {
        try {
            await apiService.patch(`/accounts/users/${userId}/`, { role: newRole });
            toast.success(t('userManagement.roleUpdated'));
            fetchUsers();
            window.dispatchEvent(new CustomEvent('custom:data-change', { detail: { type: 'user:updated' } }));
        } catch (error) {
            console.error('Failed to update role:', error);
            toast.error(t('userManagement.failedToUpdateRole'));
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
                    title={t('dashboard.admin.userManagement')}
                    subtitle={t('userManagement.manageUsersSubtitle') || "Manage community members, staff, and administrators."}
                />

                {/* Filters Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="mb-8 shadow-xl border-white/20 bg-white/40 backdrop-blur-xl overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative group">
                                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder={t('userManagement.searchPlaceholder') || "Search by name, email, or username..."}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white/50 border-2 border-transparent focus:border-emerald-500/30 focus:bg-white rounded-2xl transition-all outline-none text-gray-700 font-medium"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="px-6 py-3 bg-white/50 border-2 border-transparent focus:border-emerald-500/30 focus:bg-white rounded-2xl transition-all outline-none text-gray-700 font-bold cursor-pointer"
                                    >
                                        <option value="all">{t('userManagement.allRoles') || "All Roles"}</option>
                                        {ROLE_OPTIONS.map(role => (
                                            <option key={role.value} value={role.value}>{t(`common.${role.value}`) || role.label}</option>
                                        ))}
                                    </select>
                                    <Button
                                        onClick={fetchUsers}
                                        variant="outline"
                                        className="rounded-2xl h-full px-6 border-2 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                                    >
                                        <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                                        {t('common.refresh')}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Users List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredUsers.map((user, index) => {
                            const roleInfo = ROLE_OPTIONS.find(r => r.value === user.role) || ROLE_OPTIONS[3];
                            return (
                                <motion.div
                                    key={user.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="h-full hover:shadow-2xl transition-all duration-500 border-white/20 bg-white/40 backdrop-blur-xl group overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-4">
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border shadow-sm ${roleInfo.color}`}>
                                                {t(`common.${user.role}`) || roleInfo.label}
                                            </div>
                                        </div>

                                        <CardContent className="p-6 pt-8">
                                            <div className="flex items-center space-x-4 mb-6">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                                                    <span className="text-2xl font-black text-white">
                                                        {(user.first_name?.[0] || user.username?.[0] || '?').toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-xl text-gray-800 leading-tight">
                                                        {user.first_name} {user.last_name}
                                                        {user.id === currentUser?.id && <span className="ml-2 text-xs text-emerald-600 font-bold opacity-60">({t('common.you')})</span>}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 font-medium">@{user.username}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-8">
                                                <div className="flex items-center text-sm text-gray-500 font-medium truncate">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                                                        <FiSearch className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    {user.email}
                                                </div>
                                                {user.phone && (
                                                    <div className="flex items-center text-sm text-gray-500 font-medium">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                                                            <FiRefreshCw className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                        {user.phone}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEditUser(user)}
                                                    className="flex-1 rounded-xl font-bold hover:bg-emerald-50 border-2"
                                                >
                                                    <FiEdit className="mr-2" />
                                                    {t('common.edit')}
                                                </Button>
                                                {user.id !== currentUser?.id && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="rounded-xl font-bold text-red-500 hover:bg-red-50 hover:text-red-600 px-3"
                                                    >
                                                        <FiTrash2 />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {filteredUsers.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-20 text-center"
                    >
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-6">
                            <FiUsers className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-gray-400">{t('userManagement.noUsersFound')}</h3>
                    </motion.div>
                )}

                {/* Edit Modal */}
                <AnimatePresence>
                    {showEditModal && editingUser && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-8 relative border border-white/20"
                            >
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="absolute top-6 right-6 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <FiRefreshCw className="w-6 h-6 text-gray-400 rotate-45" />
                                </button>

                                <div className="mb-8">
                                    <h2 className="text-3xl font-black text-gray-800 mb-2">{t('userManagement.editUser')}</h2>
                                    <p className="text-gray-500 font-medium">{t('userManagement.editUserSubtitle') || "Update user profile and permissions."}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">{t('userManagement.name')}</label>
                                            <input
                                                type="text"
                                                value={editingUser.first_name || ''}
                                                onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                                                className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 focus:border-emerald-500/30 focus:bg-white rounded-2xl transition-all outline-none font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">Last Name</label>
                                            <input
                                                type="text"
                                                value={editingUser.last_name || ''}
                                                onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                                                className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 focus:border-emerald-500/30 focus:bg-white rounded-2xl transition-all outline-none font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">{t('userManagement.email')}</label>
                                        <input
                                            type="email"
                                            value={editingUser.email || ''}
                                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                            className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 focus:border-emerald-500/30 focus:bg-white rounded-2xl transition-all outline-none font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">{t('userManagement.phone')}</label>
                                        <input
                                            type="text"
                                            value={editingUser.phone || ''}
                                            onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                            className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 focus:border-emerald-500/30 focus:bg-white rounded-2xl transition-all outline-none font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">{t('userManagement.role')}</label>
                                        <select
                                            value={editingUser.role}
                                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                            className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 focus:border-emerald-500/30 focus:bg-white rounded-2xl transition-all outline-none font-bold cursor-pointer"
                                        >
                                            {ROLE_OPTIONS.map(role => (
                                                <option key={role.value} value={role.value}>{t(`common.${role.value}`) || role.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-10">
                                    <Button onClick={handleSaveUser} className="flex-1 h-14 rounded-2xl font-black text-lg bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all">
                                        {t('common.saveChanges') || "Save Changes"}
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1 h-14 rounded-2xl font-black text-lg border-2 hover:bg-gray-50">
                                        {t('common.cancel')}
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
});

UserManagement.displayName = 'UserManagement';
export default UserManagement;

