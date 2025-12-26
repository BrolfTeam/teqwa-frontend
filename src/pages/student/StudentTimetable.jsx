import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiCalendar, FiMapPin, FiUser, FiChevronLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { dataService } from '@/lib/dataService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import IslamicPattern from '@/components/ui/IslamicPattern';

const StudentTimetable = memo(() => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [timetable, setTimetable] = useState({});

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                setLoading(true);
                const response = await dataService.getStudentTimetable();
                const data = Array.isArray(response.data) ? response.data : response.data?.data || [];

                // Group by day
                const grouped = data.reduce((acc, item) => {
                    const day = item.day.toLowerCase();
                    if (!acc[day]) acc[day] = [];
                    acc[day].push(item);
                    return acc;
                }, {});

                // Sort times within days
                Object.keys(grouped).forEach(day => {
                    grouped[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
                });

                setTimetable(grouped);
            } catch (error) {
                console.error('Failed to fetch timetable:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTimetable();
    }, []);

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" asChild className="p-2 h-auto">
                    <Link to="/dashboard">
                        <FiChevronLeft className="h-6 w-6" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">{t('dashboard.student.viewFullTimetable')}</h1>
                    <p className="text-muted-foreground">Your weekly academic schedule</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {days.map(day => (
                    <motion.div
                        key={day}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <h3 className="text-xl font-bold capitalize flex items-center gap-2 px-2">
                            <FiCalendar className="text-blue-500" />
                            {t(`common.days.${day}`)}
                        </h3>
                        <div className="space-y-3">
                            {timetable[day]?.length > 0 ? (
                                timetable[day].map((item) => (
                                    <Card key={item.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-4 space-y-3">
                                            <div>
                                                <div className="font-bold text-lg text-primary">{item.course?.code || 'N/A'}</div>
                                                <div className="text-sm font-medium">{item.course?.service?.title || 'Course'}</div>
                                            </div>
                                            <div className="space-y-1 text-xs text-muted-foreground font-medium">
                                                <div className="flex items-center gap-2">
                                                    <FiClock className="h-3 w-3" />
                                                    {item.start_time} - {item.end_time}
                                                </div>
                                                {item.location && (
                                                    <div className="flex items-center gap-2">
                                                        <FiMapPin className="h-3 w-3" />
                                                        {item.location}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <FiUser className="h-3 w-3" />
                                                    {item.instructor_name || 'TBA'}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="p-8 text-center text-sm text-muted-foreground bg-secondary/20 rounded-xl border border-dashed">
                                    No classes
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
});

StudentTimetable.displayName = 'StudentTimetable';
export default StudentTimetable;
