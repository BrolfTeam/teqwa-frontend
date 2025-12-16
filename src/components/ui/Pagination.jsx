import React from 'react';

export default function Pagination({ total, page, pageSize, onPageChange, onPageSizeChange }) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);

    if (total === 0) return null;

    return (
        <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className={`btn btn-sm ${page <= 1 ? '' : 'btn btn-sm btn-secondary'}`}>
                    Prev
                </button>

                <div className="flex items-center gap-1">
                    {pages.map(p => (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`${p === page ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline'}`}>
                            {p}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className={`btn btn-sm ${page >= totalPages ? '' : 'btn btn-sm btn-secondary'}`}>
                    Next
                </button>
            </div>

            <div className="flex items-center gap-2 text-sm">
                <label className="text-sm">Per page:</label>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="border rounded px-2 py-1">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
            </div>
        </div>
    );
}
