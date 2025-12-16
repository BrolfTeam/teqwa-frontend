import { useState, useEffect } from 'react';
import { dataService } from '@/lib/dataService';
import { Link } from 'react-router-dom';
import Pagination from '@/components/ui/Pagination';
import { toast } from 'sonner';

export default function BookingList() {
    const today = new Date().toISOString().slice(0, 10);
    const [date] = useState(today);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);

    useEffect(() => {
        const fetchSlots = async () => {
            setLoading(true);
            try {
                const data = await dataService.getFutsalSlots({ date });
                setSlots(data);
            } catch (error) {
                console.error('Failed to fetch slots:', error);
                toast.error('Failed to load slots');
            } finally {
                setLoading(false);
            }
        };

        fetchSlots();
    }, [date]);

    const total = slots.length;
    const start = (page - 1) * pageSize;
    const paged = slots.slice(start, start + pageSize);

    if (loading) {
        return <div className="container mx-auto py-8 text-center">Loading slots...</div>;
    }

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-2xl font-semibold mb-4">Futsal Slots for {date}</h2>
            {slots.length === 0 ? (
                <div className="text-muted-foreground">No slots available for this date.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paged.map(s => (
                        <div key={s.id} className="p-4 bg-white rounded shadow">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-lg font-medium">{s.time}</div>
                                    <div className="text-sm text-muted-foreground">Price: {s.price} ETB</div>
                                </div>
                                <div>
                                    {s.available ? (
                                        <Link to={`/bookings/${s.id}`} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">Book</Link>
                                    ) : (
                                        <span className="px-4 py-2 bg-gray-200 rounded text-gray-500">Unavailable</span>
                                    )}
                                </div>
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
