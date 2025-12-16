import { useState, useEffect } from 'react';
import { dataService } from '@/lib/dataService';
import { toast } from 'sonner';

export default function WorkingHours() {
    const [staff, setStaff] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [staffData, logsData] = await Promise.all([
                dataService.getStaff(),
                dataService.getStaffHours()
            ]);
            setStaff(staffData);
            setLogs(logsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load working hours');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleClockIn = async (id) => {
        try {
            await dataService.clockIn(id);
            toast.success('Clocked in successfully');
            fetchData();
        } catch (error) {
            console.error('Clock in failed:', error);
            toast.error('Failed to clock in');
        }
    };

    const handleClockOut = async (id) => {
        try {
            await dataService.clockOut(id);
            toast.success('Clocked out successfully');
            fetchData();
        } catch (error) {
            console.error('Clock out failed:', error);
            toast.error('Failed to clock out');
        }
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-2xl font-semibold mb-4">Working Hours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staff.map(s => (
                    <div key={s.id} className="p-4 bg-white rounded-xl shadow-sm border border-border/50">
                        <div className="font-medium text-lg">{s.name} <span className="text-sm text-muted-foreground">({s.role})</span></div>
                        <div className="mt-3 space-x-2">
                            <button onClick={() => handleClockIn(s.id)} className="btn btn-sm btn-primary">Clock In</button>
                            <button onClick={() => handleClockOut(s.id)} className="btn btn-sm btn-secondary">Clock Out</button>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-semibold text-sm mb-2">Recent logs</h4>
                            <div className="space-y-2">
                                {logs.filter(l => l.staffId === s.id).length > 0 ? (
                                    logs.filter(l => l.staffId === s.id).map(l => (
                                        <div key={l.id} className="text-sm text-muted-foreground">{l.date} — {l.checkIn} to {l.checkOut || '—'} ({l.totalHours || 0}h)</div>
                                    ))
                                ) : (
                                    <div className="text-sm text-muted-foreground italic">No recent logs</div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
