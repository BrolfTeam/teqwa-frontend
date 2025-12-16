import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dataService } from '@/lib/dataService';
import { toast } from 'sonner';

export default function BookingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [slot, setSlot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('test@example.com');

    useEffect(() => {
        const fetchSlot = async () => {
            try {
                const data = await dataService.getFutsalSlot(id);
                setSlot(data);
            } catch (error) {
                console.error('Failed to fetch slot:', error);
                toast.error('Failed to load slot details');
            } finally {
                setLoading(false);
            }
        };
        fetchSlot();
    }, [id]);

    if (loading) return <div className="container mx-auto py-8 text-center">Loading slot details...</div>;
    if (!slot) return <div className="container mx-auto py-8 text-center">Slot not found</div>;

    const handleBooking = async () => {
        try {
            await dataService.bookFutsalSlot(slot.id);
            toast.success('Booking confirmed successfully!');
            navigate('/bookings/user');
        } catch (error) {
            console.error('Booking failed:', error);
            toast.error('Booking failed. Please try again.');
        }
    };

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-2xl font-semibold mb-4">Booking: {slot.time} on {slot.date}</h2>
            <div className="bg-white p-6 rounded shadow">
                <p>Price: {slot.price} ETB</p>
                <div className="mt-4">
                    <label className="block text-sm mb-1">Your email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
                </div>
                <div className="mt-4">
                    <button onClick={handleBooking} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">Confirm Booking</button>
                </div>
            </div>
        </div>
    );
}
