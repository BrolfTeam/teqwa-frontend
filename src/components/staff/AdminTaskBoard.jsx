import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiCheck, FiX, FiFilter, FiUser } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import staffService from '@/services/staffService';
// Dialog import removed - using custom implementation or Modal component
import { Modal } from '@/components/ui';

const AdminTaskBoard = ({ tasks, staffs, onUpdate }) => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');

    const handleApprove = async (taskId) => {
        try {
            await staffService.updateTaskStatus(taskId, 'approve');
            toast.success("Task approved");
            // Dispatch event to refresh dashboard
            window.dispatchEvent(new CustomEvent('custom:data-change', { detail: { type: 'staff:task:updated' } }));
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error("Failed to approve task");
        }
    };

    const handleReject = async (taskId) => {
        try {
            await staffService.updateTaskStatus(taskId, 'reject');
            toast.success("Task rejected");
            // Dispatch event to refresh dashboard
            window.dispatchEvent(new CustomEvent('custom:data-change', { detail: { type: 'staff:task:updated' } }));
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error("Failed to reject task");
        }
    };

    const filteredTasks = tasks?.filter(t => filterStatus === 'all' || t.status === filterStatus) || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    {['all', 'pending', 'submitted', 'in_progress'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${filterStatus === status ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                }`}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <FiPlus className="mr-2" /> New Task
                </Button>
            </div>

            {/* Create Task Modal */}
            <Modal 
                open={isCreateOpen} 
                onClose={() => {
                    setIsCreateOpen(false);
                }} 
                title="Assign New Task"
            >
                <CreateTaskForm 
                    staffs={staffs} 
                    onSuccess={() => { 
                        setIsCreateOpen(false);
                        if (onUpdate) onUpdate();
                    }} 
                />
            </Modal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map(task => (
                    <Card key={task.id} className="relative border-border/50 bg-card/50">
                        {task.status === 'submitted' && (
                            <div className="absolute top-2 right-2 flex gap-1">
                                <Button size="xs" variant="ghost" className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-100" title="Approve" onClick={() => handleApprove(task.id)}>
                                    <FiCheck />
                                </Button>
                                <Button size="xs" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-100" title="Reject" onClick={() => handleReject(task.id)}>
                                    <FiX />
                                </Button>
                            </div>
                        )}
                        <CardContent className="p-4 pt-5">
                            <div className="flex items-start justify-between mb-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${task.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                    task.status === 'submitted' ? 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                    {task.status.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-muted-foreground">{task.due_date}</span>
                            </div>
                            <p className="font-medium line-clamp-2 mb-3">{task.task}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border/50 pt-3">
                                <FiUser className="h-3 w-3" />
                                <span>{task.assigned_to_name}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

const CreateTaskForm = ({ staffs: propsStaffs, onSuccess }) => {
    const [formData, setFormData] = useState({
        task: '',
        assigned_to: '',
        priority: 'medium',
        due_date: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [staffs, setStaffs] = useState(propsStaffs || []);
    
    const resetForm = () => {
        setFormData({
            task: '',
            assigned_to: '',
            priority: 'medium',
            due_date: ''
        });
        setErrors({});
    };

    // Fetch staff if not provided or if empty
    useEffect(() => {
        const fetchStaff = async () => {
            if (!propsStaffs || propsStaffs.length === 0) {
                try {
                    const staffData = await staffService.getStaff({ active: 'true' });
                    if (staffData?.data && staffData.data.length > 0) {
                        setStaffs(staffData.data);
                    } else {
                        // Fallback: fetch all staff
                        const allStaffData = await staffService.getStaff();
                        setStaffs(allStaffData?.data || []);
                    }
                } catch (error) {
                    console.error('Failed to fetch staff for task assignment:', error);
                    toast.error('Failed to load staff list');
                }
            } else {
                setStaffs(propsStaffs);
            }
        };
        fetchStaff();
    }, [propsStaffs]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        
        // Validate form
        const newErrors = {};
        if (!formData.task || !formData.task.trim()) {
            newErrors.task = "Task description is required";
        }
        if (!formData.assigned_to) {
            newErrors.assigned_to = "Please select a staff member";
        }
        if (!formData.due_date) {
            newErrors.due_date = "Due date is required";
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill in all required fields");
            return;
        }
        
        // Validate due date is not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(formData.due_date);
        if (selectedDate < today) {
            setErrors({ due_date: "Due date cannot be in the past" });
            toast.error("Due date cannot be in the past");
            return;
        }
        
        setLoading(true);
        try {
            // Ensure assigned_to is a number (StaffMember ID)
            const assignedToId = parseInt(formData.assigned_to);
            if (isNaN(assignedToId)) {
                toast.error("Invalid staff member selected");
                setErrors({ assigned_to: "Please select a valid staff member" });
                setLoading(false);
                return;
            }
            
            const taskData = {
                task: formData.task.trim(),
                assigned_to: assignedToId,
                priority: formData.priority,
                due_date: formData.due_date
            };
            
            console.log('Creating task with data:', taskData);
            const response = await staffService.createTask(taskData);
            console.log('Task created successfully:', response);
            
            toast.success("Task assigned successfully");
            
            // Reset form
            resetForm();
            
            // Dispatch event to refresh dashboard
            window.dispatchEvent(new CustomEvent('custom:data-change', { detail: { type: 'staff:task:created' } }));
            
            // Call onSuccess to close modal and refresh
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Task creation error:', error);
            console.error('Error response:', error.response);
            
            // Handle validation errors from backend
            if (error.response?.data) {
                const backendErrors = error.response.data;
                const fieldErrors = {};
                
                // Map backend field errors
                Object.keys(backendErrors).forEach(key => {
                    if (Array.isArray(backendErrors[key])) {
                        fieldErrors[key] = backendErrors[key][0];
                    } else if (typeof backendErrors[key] === 'string') {
                        fieldErrors[key] = backendErrors[key];
                    }
                });
                
                if (Object.keys(fieldErrors).length > 0) {
                    setErrors(fieldErrors);
                }
                
                const errorMessage = backendErrors.error || 
                                    backendErrors.message || 
                                    backendErrors.non_field_errors?.[0] ||
                                    Object.values(fieldErrors)[0] ||
                                    "Failed to create task";
                toast.error(errorMessage);
            } else {
                toast.error(error.message || "Failed to create task. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">
                    Task Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    className={`w-full p-2 rounded-md border bg-background ${
                        errors.task ? 'border-red-500' : 'border-border'
                    }`}
                    rows="3"
                    required
                    value={formData.task}
                    onChange={e => {
                        setFormData({ ...formData, task: e.target.value });
                        if (errors.task) setErrors({ ...errors, task: null });
                    }}
                    placeholder="Enter task description..."
                ></textarea>
                {errors.task && <p className="text-xs text-red-500 mt-1">{errors.task}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Assign To <span className="text-red-500">*</span>
                    </label>
                    <select
                        className={`w-full p-2 rounded-md border bg-background ${
                            errors.assigned_to ? 'border-red-500' : 'border-border'
                        }`}
                        required
                        value={formData.assigned_to}
                        onChange={e => {
                            setFormData({ ...formData, assigned_to: e.target.value });
                            if (errors.assigned_to) setErrors({ ...errors, assigned_to: null });
                        }}
                    >
                        <option value="">Select Staff</option>
                        {staffs && Array.isArray(staffs) && staffs.length > 0 ? (
                            staffs.map(s => {
                                const staffName = s.name || s.user?.get_full_name || `${s.user?.first_name || ''} ${s.user?.last_name || ''}`.trim() || `Staff #${s.id}`;
                                const staffRole = s.role ? ` (${s.role})` : '';
                                return (
                                    <option key={s.id} value={s.id}>
                                        {staffName}{staffRole}
                                    </option>
                                );
                            })
                        ) : (
                            <option value="" disabled>
                                {staffs === undefined ? 'Loading staff...' : 'No staff members available'}
                            </option>
                        )}
                    </select>
                    {errors.assigned_to && <p className="text-xs text-red-500 mt-1">{errors.assigned_to}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Due Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        className={`w-full p-2 rounded-md border bg-background ${
                            errors.due_date ? 'border-red-500' : 'border-border'
                        }`}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.due_date}
                        onChange={e => {
                            setFormData({ ...formData, due_date: e.target.value });
                            if (errors.due_date) setErrors({ ...errors, due_date: null });
                        }}
                    />
                    {errors.due_date && <p className="text-xs text-red-500 mt-1">{errors.due_date}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <div className="flex gap-4">
                    {['low', 'medium', 'high', 'urgent'].map(p => (
                        <label key={p} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="priority"
                                value={p}
                                checked={formData.priority === p}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                            />
                            <span className="capitalize text-sm">{p}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={loading || !formData.task || !formData.assigned_to || !formData.due_date}
                >
                    {loading ? (
                        <>
                            <span className="animate-spin mr-2">⏳</span>
                            Assigning...
                        </>
                    ) : (
                        'Assign Task'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default AdminTaskBoard;
