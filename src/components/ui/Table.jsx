import React from 'react';

export default function Table({ columns = [], data = [] }) {
    return (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-md shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{col.title}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr key={idx} className="border-t border-gray-100 dark:border-gray-700">
                            {columns.map(col => (
                                <td key={col.key} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{col.render ? col.render(row) : row[col.key]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
