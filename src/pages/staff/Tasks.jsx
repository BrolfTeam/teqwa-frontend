import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import staffService from '@/services/staffService';
import AdminTaskBoard from '@/components/staff/AdminTaskBoard';
import StaffTaskBoard from '@/components/staff/StaffTaskBoard';
import { LoadingSpinner } from '@/components/ui';
import { toast } from 'sonner';

export default function Tasks() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [staffs, setStaffs] = useState([]); // For admin to assign
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            // Fetch tasks
            const tasksData = await staffService.getTasks();
            setTasks(tasksData.data || []);

            // If Admin, fetch staff list for assignment dropdown
            if (user?.role === 'admin') {
                try {
                    const staffData = await staffService.getStaff({ active: 'true' });
                    setStaffs(staffData.data || []);
                    if (!staffData.data || staffData.data.length === 0) {
                        // Fallback: try fetching all staff if active filter returns nothing
                        const allStaffData = await staffService.getStaff();
                        setStaffs(allStaffData.data || []);
                    }
                } catch (error) {
                    console.error("Failed to fetch staff:", error);
                    // Try fetching all staff as fallback
                    try {
                        const allStaffData = await staffService.getStaff();
                        setStaffs(allStaffData.data || []);
                    } catch (fallbackError) {
                        console.error("Failed to fetch staff (fallback):", fallbackError);
                        setStaffs([]);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch task data", error);
            toast.error("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-2">Task Management</h1>
            <p className="text-muted-foreground mb-8">
                {user?.role === 'admin'
                    ? 'Manage, assign, and review staff tasks.'
                    : 'View and update your assigned tasks.'}
            </p>

            {user?.role === 'admin' ? (
                <AdminTaskBoard
                    tasks={tasks}
                    staffs={staffs}
                    onUpdate={fetchData}
                />
            ) : (
                <StaffTaskBoard
                    tasks={tasks}
                    onTaskUpdate={fetchData}
                />
            )}
        </div>
    );
}
