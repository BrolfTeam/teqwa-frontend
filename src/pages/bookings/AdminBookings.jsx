import { useState, useEffect } from 'react';
import { dataService } from '@/lib/dataService';
import Pagination from '@/components/ui/Pagination';
import { toast } from 'sonner';

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await dataService.getAllFutsalBookings();
            setBookings(data);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleUpdate = async (id, status) => {
        try {
            await dataService.updateFutsalBookingStatus(id, status);
            toast.success(`Booking ${status} successfully`);
            fetchBookings(); // Refresh list
        } catch (error) {
            console.error('Failed to update booking:', error);
            toast.error('Failed to update booking status');
        }
    };

    const total = bookings.length;
    const start = (page - 1) * pageSize;
    const paged = bookings.slice(start, start + pageSize);

    if (loading) {
        return <div className="container mx-auto py-8 text-center">Loading bookings...</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-2xl font-semibold mb-4">Admin Bookings</h2>
            <div className="space-y-4">
                {paged.map(b => (
                    <div key={b.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
                        <div>
                            <div className="font-medium">{b.type ? b.type.toUpperCase() : 'BOOKING'} - {b.slotId || b.id}</div>
                            <div className="text-sm text-muted-foreground">User: {b.user || b.user_email || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">Status: {b.status}</div>
                        </div>
                        <div className="space-x-2">
                            <button onClick={() => handleUpdate(b.id, 'approved')} className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm">Approve</button>
                            <button onClick={() => handleUpdate(b.id, 'rejected')} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Reject</button>
                        </div>
                    </div>
                ))}
            </div>
            {total > pageSize && (
                <Pagination total={total} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(sz) => { setPageSize(sz); setPage(1); }} />
            )}
        </div>
    );
}
