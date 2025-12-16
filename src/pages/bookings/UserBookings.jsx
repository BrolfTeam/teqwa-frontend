import { useState, useEffect } from 'react';
import { dataService } from '@/lib/dataService';
import Pagination from '@/components/ui/Pagination';
import { toast } from 'sonner';

export default function UserBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const data = await dataService.getMyFutsalBookings();
                setBookings(data);
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
                toast.error('Failed to load your bookings');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const total = bookings.length;
    const start = (page - 1) * pageSize;
    const paged = bookings.slice(start, start + pageSize);

    if (loading) {
        return <div className="container mx-auto py-8 text-center">Loading bookings...</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>
            {bookings.length === 0 ? (
                <div className="text-muted-foreground">You have no bookings yet.</div>
            ) : (
                <div className="space-y-4">
                    {paged.map(b => (
                        <div key={b.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
                            <div>
                                <div className="font-medium">{b.type ? b.type.toUpperCase() : 'BOOKING'} - {b.slotId || b.id}</div>
                                <div className="text-sm text-muted-foreground">Status: {b.status}</div>
                                <div className="text-xs text-muted-foreground">{new Date(b.createdAt || b.created_at).toLocaleDateString()}</div>
                            </div>
                            <div>
                                <button className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">View</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {total > pageSize && (
                <Pagination total={total} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(sz) => { setPageSize(sz); setPage(1); }} />
            )}
        </div>
    );
}
