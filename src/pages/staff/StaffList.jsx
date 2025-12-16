import { useState, useEffect } from 'react';
import { dataService } from '@/lib/dataService';
import Pagination from '@/components/ui/Pagination';
import { toast } from 'sonner';

export default function StaffList() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const data = await dataService.getStaff();
                setStaff(data);
            } catch (error) {
                console.error('Failed to fetch staff:', error);
                toast.error('Failed to load staff list');
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, []);

    const total = staff.length;
    const start = (page - 1) * pageSize;
    const paged = staff.slice(start, start + pageSize);

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-2xl font-semibold mb-4">Staff Directory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {paged.map(s => (
                    <div key={s.id} className="p-5 bg-white rounded-xl shadow-sm border border-border/50 transition-all hover:shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-medium text-lg">{s.name}</div>
                                <div className="text-sm text-muted-foreground">{s.role}</div>
                            </div>
                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {s.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="mt-3 text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                {s.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                {s.phone}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Pagination total={total} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(sz) => { setPageSize(sz); setPage(1); }} />
        </div>
    );
}
