import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUsers, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import staffService from '@/services/staffService';
import { LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export default function Attendance() {
    const { user } = useAuth();
    const today = new Date().toISOString().slice(0, 10);
    const [date, setDate] = useState(today);
    const [attendance, setAttendance] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0 });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [staffResponse, attendanceResponse] = await Promise.all([
                staffService.getStaff({ active: 'true' }),
                staffService.getAttendance({ date })
            ]);
            const staffData = staffResponse.data || staffResponse || [];
            const attendanceData = attendanceResponse.data || attendanceResponse || [];
            
            setStaff(staffData);
            setAttendance(attendanceData);

            // Calculate stats
            const present = attendanceData.filter(a => a.status === 'present').length;
            const absent = attendanceData.filter(a => a.status === 'absent').length;
            const late = attendanceData.filter(a => a.status === 'late').length;
            setStats({ present, absent, late, total: staffData.length });
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [date]);

    const toggleStatus = async (staffId, newStatus) => {
        try {
            await staffService.toggleAttendance({ date, staff_id: staffId, status: newStatus });
            toast.success('Attendance updated');
            fetchData();
            // Dispatch event to refresh dashboard
            window.dispatchEvent(new CustomEvent('custom:data-change', { detail: { type: 'staff:attendance:changed' } }));
        } catch (error) {
            console.error('Failed to update attendance:', error);
            toast.error('Failed to update attendance');
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Attendance Management</h1>
                    <p className="text-muted-foreground">View and edit staff attendance records</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="px-4 py-2 border rounded-lg bg-background"
                    />
                    <Button onClick={fetchData} variant="outline">
                        <FiRefreshCw className="mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Present</p>
                                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                            </div>
                            <FiCheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Absent</p>
                                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                            </div>
                            <FiXCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Late</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.late}</p>
                            </div>
                            <FiClock className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Staff</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <FiUsers className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance List */}
            <div className="grid gap-4">
                {staff.map((s) => {
                    const rec = attendance.find(a => a.staff_id === s.id || a.staff?.id === s.id);
                    const status = rec?.status || 'absent';
                    const checkIn = rec?.check_in || null;
                    const checkOut = rec?.check_out || null;
                    
                    return (
                        <motion.div
                            key={s.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                status === 'present' ? 'bg-green-100 text-green-600' :
                                                status === 'late' ? 'bg-orange-100 text-orange-600' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                                {status === 'present' ? <FiCheckCircle className="h-6 w-6" /> :
                                                 status === 'late' ? <FiClock className="h-6 w-6" /> :
                                                 <FiXCircle className="h-6 w-6" />}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{s.name}</h3>
                                                <p className="text-sm text-muted-foreground">{s.role}</p>
                                                {checkIn && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Check-in: {new Date(checkIn).toLocaleTimeString()}
                                                        {checkOut && ` | Check-out: ${new Date(checkOut).toLocaleTimeString()}`}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={status}
                                                onChange={(e) => toggleStatus(s.id, e.target.value)}
                                                className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                                                    status === 'present' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    status === 'late' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                    'bg-gray-50 text-gray-700 border-gray-200'
                                                }`}
                                            >
                                                <option value="absent">Absent</option>
                                                <option value="present">Present</option>
                                                <option value="late">Late</option>
                                            </select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {staff.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <FiUsers className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No staff members found</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
