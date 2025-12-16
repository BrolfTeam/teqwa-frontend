import React from 'react';

export default function Alert({ type = 'info', children, className = '' }) {
    const base = 'p-4 rounded-md flex items-start gap-3';
    const styles = {
        info: 'bg-blue-50 text-blue-800',
        success: 'bg-green-50 text-green-800',
        warn: 'bg-yellow-50 text-yellow-800',
        error: 'bg-red-50 text-red-800',
    };

    return (
        <div className={`${base} ${styles[type] || styles.info} ${className}`} role="alert">
            <div className="flex-1">{children}</div>
        </div>
    );
}
