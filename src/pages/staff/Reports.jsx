import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiUsers, FiClock, FiCheckSquare, FiDownload, FiRefreshCw, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import staffService from '@/services/staffService';
import dashboardService from '@/services/dashboardService';
import { LoadingSpinner } from '@/components/ui';

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('daily'); // daily, weekly, monthly
    const [reports, setReports] = useState(null);
    const [dashboardStats, setDashboardStats] = useState(null);

    useEffect(() => {
        fetchReports();
    }, [period]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const [reportsData, statsData] = await Promise.all([
                staffService.getReports({ period }),
                dashboardService.getStats()
            ]);
            setReports(reportsData.data || reportsData);
            setDashboardStats(statsData.data);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = () => {
        if (!reports) return;
        
        const rows = [
            ['Metric', 'Value'],
            ['Period', period],
            ['Total Staff', reports.today?.total_staff || 0],
            ['Present Today', reports.today?.present_count || 0],
            ['Late Today', reports.today?.late_count || 0],
            ['Absent Today', reports.today?.absent_count || 0],
            ['Total Tasks', reports.tasks?.total || 0],
            ['Completed Tasks', reports.tasks?.completed || 0],
            ['Pending Tasks', reports.tasks?.pending || 0],
            ['Overdue Tasks', reports.tasks?.overdue || 0],
            ['Hours Worked', reports.hours_worked || 0],
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `staff-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Report exported successfully');
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const taskCompletionRate = reports?.tasks?.total > 0 
        ? Math.round((reports.tasks.completed / reports.tasks.total) * 100) 
        : 0;

    const attendanceRate = reports?.today?.total_staff > 0
        ? Math.round((reports.today.present_count / reports.today.total_staff) * 100)
        : 0;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
                    <p className="text-muted-foreground">View comprehensive staff performance reports</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-2 border rounded-lg bg-background"
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                    <Button onClick={fetchReports} variant="outline">
                        <FiRefreshCw className="mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={exportCSV}>
                        <FiDownload className="mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Total Staff</p>
                                <p className="text-3xl font-bold">{reports?.today?.total_staff || 0}</p>
                            </div>
                            <FiUsers className="h-10 w-10 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Present Today</p>
                                <p className="text-3xl font-bold text-green-600">{reports?.today?.present_count || 0}</p>
                                <p className="text-xs text-muted-foreground mt-1">{attendanceRate}% attendance rate</p>
                            </div>
                            <FiCheckSquare className="h-10 w-10 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Task Completion</p>
                                <p className="text-3xl font-bold text-purple-600">{taskCompletionRate}%</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {reports?.tasks?.completed || 0} / {reports?.tasks?.total || 0} tasks
                                </p>
                            </div>
                            <FiTrendingUp className="h-10 w-10 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Hours Worked</p>
                                <p className="text-3xl font-bold">{reports?.hours_worked?.toFixed(1) || 0}</p>
                                <p className="text-xs text-muted-foreground mt-1">This {period}</p>
                            </div>
                            <FiClock className="h-10 w-10 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Report */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FiUsers className="text-blue-500" />
                            Attendance Report
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                <span className="font-medium">Present</span>
                                <span className="text-2xl font-bold text-green-600">{reports?.today?.present_count || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                                <span className="font-medium">Late</span>
                                <span className="text-2xl font-bold text-orange-600">{reports?.today?.late_count || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                <span className="font-medium">Absent</span>
                                <span className="text-2xl font-bold text-red-600">{reports?.today?.absent_count || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Task Report */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FiCheckSquare className="text-purple-500" />
                            Task Report
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                                <span className="font-medium">Total Tasks</span>
                                <span className="text-2xl font-bold">{reports?.tasks?.total || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                <span className="font-medium">Completed</span>
                                <span className="text-2xl font-bold text-green-600">{reports?.tasks?.completed || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                                <span className="font-medium">Pending</span>
                                <span className="text-2xl font-bold text-yellow-600">{reports?.tasks?.pending || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                <span className="font-medium">Overdue</span>
                                <span className="text-2xl font-bold text-red-600">{reports?.tasks?.overdue || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
