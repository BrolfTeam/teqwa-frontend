import { useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import staffService from '@/services/staffService';
import AdminTaskBoard from '@/components/staff/AdminTaskBoard';
import StaffTaskBoard from '@/components/staff/StaffTaskBoard';
import { AdminModuleHeader } from '@/components/admin/AdminModuleHeader';
import { toast } from 'sonner';

const Tasks = memo(() => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const isAdmin = user?.role === 'admin';

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await staffService.getTasks();
            setTasks(response.data || []);
        } catch (error) {
            console.error('Failed to load tasks:', error);
            toast.error(t('staff.tasks.failedToLoad'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <div className="mt-4 text-emerald-600 font-bold animate-pulse">{t('staff.tasks.loadingTasks')}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <div className="container px-4 py-8 max-w-7xl mx-auto">
                <AdminModuleHeader
                    title={t('staff.tasks.title')}
                    subtitle={isAdmin ? t('staff.tasks.manageAssignReview') : t('staff.tasks.viewUpdateTasks')}
                />

                <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
                    {isAdmin ? (
                        <AdminTaskBoard tasks={tasks} onUpdate={fetchTasks} />
                    ) : (
                        <StaffTaskBoard tasks={tasks} onTaskUpdate={fetchTasks} />
                    )}
                </div>
            </div>
        </div>
    );
});

Tasks.displayName = 'Tasks';
export default Tasks;
