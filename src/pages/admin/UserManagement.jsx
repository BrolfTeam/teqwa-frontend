import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiEdit, FiTrash2, FiShield, FiSearch, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { apiService } from '@/lib/apiService';
import { LoadingSpinner } from '@/components/ui';
import { useTranslation } from 'react-i18next';

const ROLE_OPTIONS = [
    { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-700' },
    { value: 'staff', label: 'Staff', color: 'bg-blue-100 text-blue-700' },
    { value: 'member', label: 'Member', color: 'bg-green-100 text-green-700' },
    { value: 'visitor', label: 'Visitor', color: 'bg-gray-100 text-gray-700' },
];

export default function UserManagement() {
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
            toast.error('Failed to load users. Make sure you have admin permissions.');
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
            // Update user endpoint - only send fields that can be updated
            const updateData = {
                first_name: editingUser.first_name,
                last_name: editingUser.last_name,
                email: editingUser.email,
                phone: editingUser.phone,
                role: editingUser.role,
            };
            await apiService.patch(`/accounts/users/${editingUser.id}/`, updateData);
            toast.success('User updated successfully');
            setShowEditModal(false);
            setEditingUser(null);
            fetchUsers();
            // Dispatch event to refresh dashboard
            window.dispatchEvent(new CustomEvent('custom:data-change', { detail: { type: 'user:updated' } }));
        } catch (error) {
            console.error('Failed to update user:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Failed to update user';
            toast.error(errorMsg);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        
        try {
            await apiService.delete(`/accounts/users/${userId}/`);
            toast.success('User deleted successfully');
            fetchUsers();
            window.dispatchEvent(new CustomEvent('custom:data-change', { detail: { type: 'user:deleted' } }));
        } catch (error) {
            console.error('Failed to delete user:', error);
            toast.error('Failed to delete user');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await apiService.patch(`/accounts/users/${userId}/`, { role: newRole });
            toast.success('User role updated successfully');
            fetchUsers();
            window.dispatchEvent(new CustomEvent('custom:data-change', { detail: { type: 'user:updated' } }));
        } catch (error) {
            console.error('Failed to update role:', error);
            toast.error('Failed to update role');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = 
            u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">User Management</h1>
                    <p className="text-muted-foreground">Manage users and their roles</p>
                </div>
                <Button onClick={fetchUsers} variant="outline" title={t('common.refresh')}>
                    <FiRefreshCw className="mr-2" />
                    {t('common.refresh')}
                </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search users by name, email, or username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2 border rounded-lg bg-background"
                        >
                            <option value="all">All Roles</option>
                            {ROLE_OPTIONS.map(role => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Users List */}
            <div className="grid gap-4">
                {filteredUsers.map((user) => {
                    const roleInfo = ROLE_OPTIONS.find(r => r.value === user.role) || ROLE_OPTIONS[3];
                    return (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <FiUsers className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">
                                                    {user.first_name} {user.last_name} {user.id === currentUser?.id && '(You)'}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                                <p className="text-xs text-muted-foreground">@{user.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                disabled={user.id === currentUser?.id}
                                                className={`px-3 py-1 rounded-full text-xs font-medium border ${roleInfo.color} ${user.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                {ROLE_OPTIONS.map(role => (
                                                    <option key={role.value} value={role.value}>{role.label}</option>
                                                ))}
                                            </select>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEditUser(user)}
                                            >
                                                <FiEdit className="mr-1" />
                                                Edit
                                            </Button>
                                            {user.id !== currentUser?.id && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <FiTrash2 />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {filteredUsers.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <FiUsers className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No users found</p>
                    </CardContent>
                </Card>
            )}

            {/* Edit Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-background rounded-lg shadow-xl max-w-md w-full p-6"
                    >
                        <h2 className="text-2xl font-bold mb-4">Edit User</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">First Name</label>
                                <input
                                    type="text"
                                    value={editingUser.first_name || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Last Name</label>
                                <input
                                    type="text"
                                    value={editingUser.last_name || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editingUser.email || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={editingUser.phone || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select
                                    value={editingUser.role}
                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg bg-background"
                                >
                                    {ROLE_OPTIONS.map(role => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button onClick={handleSaveUser} className="flex-1">Save Changes</Button>
                            <Button variant="outline" onClick={() => { setShowEditModal(false); setEditingUser(null); }} className="flex-1">
                                Cancel
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

