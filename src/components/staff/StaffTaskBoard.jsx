import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiCheckSquare, FiAlertCircle, FiPlay, FiSend, FiCheck } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import staffService from '@/services/staffService';
import { useAuth } from '@/context/AuthContext';

const StaffTaskBoard = ({ tasks, onTaskUpdate }) => {
    // If tasks are passed as props, use them, else fetch? 
    // Ideally parent fetches and passes, or we fetch here.
    // Let's assume passed for now, or fetch if null.
    // For simplicity with dashboard integration, I'll allow internal fetching too.

    return (
        <div className="space-y-4">
            {tasks && tasks.length > 0 ? (
                tasks.map(task => (
                    <TaskCard key={task.id} task={task} onUpdate={onTaskUpdate} />
                ))
            ) : (
                <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border">
                    <FiCheckSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No tasks assigned</p>
                </div>
            )}
        </div>
    );
};

const TaskCard = ({ task, onUpdate }) => {
    const [loading, setLoading] = useState(false);

    const handleAction = async (action) => {
        try {
            setLoading(true);
            await staffService.updateTaskStatus(task.id, action);
            toast.success(`Task ${action}ed successfully`);
            // Dispatch event to refresh dashboard
            const eventType = action === 'submit' ? 'staff:task:completed' : 'staff:task:updated';
            window.dispatchEvent(new CustomEvent('custom:data-change', { detail: { type: eventType } }));
            if (onUpdate) onUpdate();
        } catch (error) {
            // Error handling, especially for the constraint "No Check-in"
            const msg = error.response?.data?.error || error.message || "Action failed";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (s) => {
        switch (s) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
            case 'accepted': return 'bg-blue-500/10 text-blue-600 border-blue-200';
            case 'in_progress': return 'bg-purple-500/10 text-purple-600 border-purple-200';
            case 'submitted': return 'bg-orange-500/10 text-orange-600 border-orange-200';
            case 'completed': return 'bg-green-500/10 text-green-600 border-green-200';
            case 'rejected': return 'bg-red-500/10 text-red-600 border-red-200';
            default: return 'bg-secondary text-muted-foreground';
        }
    }

    return (
        <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="hover:shadow-md transition-shadow border-border/60">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(task.status)}`}>
                                {task.status.replace('_', ' ')}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${task.priority === 'urgent' ? 'bg-red-100 text-red-700 border-red-200' :
                                    task.priority === 'high' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                        'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                {task.priority} Priority
                            </span>
                        </div>
                        <h4 className="font-semibold text-lg">{task.task}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><FiClock className="h-3 w-3" /> Due {task.due_date}</span>
                            {task.assigned_by_name && <span>By: {task.assigned_by_name}</span>}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                        {task.status === 'pending' && (
                            <Button size="sm" onClick={() => handleAction('accept')} disabled={loading}>
                                Accept
                            </Button>
                        )}

                        {(task.status === 'accepted' || task.status === 'rejected') && (
                            <Button size="sm" onClick={() => handleAction('start')} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                                <FiPlay className="mr-1 h-3 w-3" /> Start Work
                            </Button>
                        )}

                        {task.status === 'in_progress' && (
                            <Button size="sm" onClick={() => handleAction('submit')} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <FiSend className="mr-1 h-3 w-3" /> Submit
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default StaffTaskBoard;
