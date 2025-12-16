import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiCheckCircle, FiXCircle, FiPlay, FiSquare } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import staffService from '@/services/staffService';
import { useAuth } from '@/context/AuthContext';

const AttendanceWidget = ({ staffId, onAttendanceChange }) => {
    const { user } = useAuth();
    const [status, setStatus] = useState('absent'); // absent, present, completed
    const [checkInTime, setCheckInTime] = useState(null);
    const [checkOutTime, setCheckOutTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [elapsedTime, setElapsedTime] = useState('00:00:00');

    // Use passed staffId or try to infer from user if they are staff
    // ideally staffId passed from parent is best.
    const effectiveStaffId = staffId || user?.staff_profile?.id;

    useEffect(() => {
        if (effectiveStaffId || user?.role === 'staff') {
            fetchTodayAttendance();
        } else {
            setLoading(false);
        }
    }, [effectiveStaffId, user]);

    useEffect(() => {
        let timer;
        if (status === 'present' && checkInTime) {
            timer = setInterval(() => {
                const todayStr = new Date().toISOString().split('T')[0];
                // Handle HH:MM:SS format
                const start = new Date(`${todayStr}T${checkInTime}`);
                const now = new Date();
                const diff = now - start;

                if (diff > 0) {
                    const hours = Math.floor(diff / 3600000);
                    const minutes = Math.floor((diff % 3600000) / 60000);
                    const seconds = Math.floor((diff % 60000) / 1000);
                    setElapsedTime(
                        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                    );
                }
            }, 1000);
        } else {
            setElapsedTime('00:00:00');
        }
        return () => clearInterval(timer);
    }, [status, checkInTime]);

    const fetchTodayAttendance = async () => {
        try {
            // If we don't have ID, we rely on backend using request.user
            const params = { period: 'daily' };
            if (effectiveStaffId) params.staff_id = effectiveStaffId;

            const data = await staffService.getReports(params);

            if (data.data?.today) {
                const today = data.data.today;
                setCheckInTime(today.check_in);
                setCheckOutTime(today.check_out);

                if (today.attendance_status === 'present' && !today.check_out) {
                    setStatus('present');
                } else if (today.attendance_status === 'present' && today.check_out) {
                    setStatus('completed');
                } else {
                    setStatus('absent');
                }
            }
        } catch (error) {
            console.error("Failed to fetch attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClockIn = async () => {
        try {
            setLoading(true);
            await staffService.clockIn(effectiveStaffId);
            setStatus('present');
            toast.success("Checked in successfully!");
            fetchTodayAttendance();
            if (onAttendanceChange) onAttendanceChange();
            // Dispatch event to refresh dashboard
            window.dispatchEvent(new CustomEvent('custom:data-change', { detail: { type: 'staff:attendance:changed' } }));
        } catch (error) {
            toast.error("Failed to check in");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        try {
            setLoading(true);
            await staffService.clockOut(effectiveStaffId);
            setStatus('completed');
            toast.success("Checked out successfully!");
            fetchTodayAttendance();
            if (onAttendanceChange) onAttendanceChange();
            // Dispatch event to refresh dashboard
            window.dispatchEvent(new CustomEvent('custom:data-change', { detail: { type: 'staff:attendance:changed' } }));
        } catch (error) {
            toast.error("Failed to check out");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <FiClock className={status === 'present' ? "text-green-500 animate-pulse" : "text-muted-foreground"} />
                    Attendance
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 gap-6">
                {/* Big Button / Status Indicator */}
                <div className="relative">
                    {status === 'present' && (
                        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                    )}
                    <button
                        disabled={loading || status === 'completed'}
                        onClick={status === 'present' ? handleClockOut : handleClockIn}
                        className={`
                            relative w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 shadow-xl transition-all transform hover:scale-105 active:scale-95
                            ${status === 'present'
                                ? 'bg-green-500 text-white border-green-400'
                                : status === 'completed'
                                    ? 'bg-secondary text-muted-foreground border-border cursor-not-allowed'
                                    : 'bg-primary text-primary-foreground border-primary/50 hover:bg-primary/90'
                            }
                        `}
                    >
                        {status === 'present' ? (
                            <>
                                <FiSquare className="w-8 h-8 mb-1 fill-current" />
                                <span className="font-bold text-sm">Check Out</span>
                            </>
                        ) : status === 'completed' ? (
                            <>
                                <FiCheckCircle className="w-8 h-8 mb-1" />
                                <span className="font-bold text-sm">Done</span>
                            </>
                        ) : (
                            <>
                                <FiPlay className="w-8 h-8 mb-1 ml-1" />
                                <span className="font-bold text-sm">Check In</span>
                            </>
                        )}
                    </button>
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
                            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                    )}
                </div>

                {/* Timer & Info */}
                <div className="text-center space-y-1">
                    <div className="text-3xl font-mono font-bold tracking-wider">
                        {status === 'present' ? elapsedTime : (checkInTime || '--:--:--')}
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                        {status === 'present' ? 'Working Now' : status === 'completed' ? 'Shift Ended' : 'Not Checked In'}
                    </p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 w-full text-center mt-2 p-3 bg-secondary/30 rounded-xl">
                    <div>
                        <p className="text-xs text-muted-foreground">Start</p>
                        <p className="font-semibold">{checkInTime?.substring(0, 5) || '--:--'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">End</p>
                        <p className="font-semibold">{checkOutTime?.substring(0, 5) || '--:--'}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AttendanceWidget;
