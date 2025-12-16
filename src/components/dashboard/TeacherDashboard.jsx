import { memo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiBookOpen, 
  FiUsers, 
  FiFileText, 
  FiAward, 
  FiCalendar, 
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit,
  FiPlus,
  FiArrowRight,
  FiTrendingUp,
  FiActivity,
  FiMessageSquare,
  FiSun
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import IslamicPattern from '@/components/ui/IslamicPattern';
import { prayerTimesService } from '@/lib/prayerTimesService';
import { dataService } from '@/lib/dataService';
import { apiService } from '@/lib/apiService';
import { toast } from 'sonner';
import verses from '@/lib/verses.json';

const TeacherDashboard = memo(() => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [myCourses, setMyCourses] = useState([]);
    const [studentEnrollments, setStudentEnrollments] = useState([]);
    const [pendingSubmissions, setPendingSubmissions] = useState([]);
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalCourses: 0,
        pendingGrading: 0,
        averageGrade: 0
    });
    const [nextPrayer, setNextPrayer] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [dailyVerse, setDailyVerse] = useState(verses[0]);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch prayer times
            const prayerData = await prayerTimesService.getCurrentAndNextPrayer();
            setNextPrayer(prayerData.next);
            setTimeRemaining(prayerTimesService.formatTimeRemaining(prayerData.timeToNext));

            // Fetch courses where user is instructor
            const coursesResponse = await dataService.getEducationServices({ active: true }).catch(() => ({ data: [] }));
            const allCourses = Array.isArray(coursesResponse) ? coursesResponse : (coursesResponse?.data || []);
            const myInstructorCourses = allCourses.filter(course => course.instructor === user?.id);
            setMyCourses(myInstructorCourses);

            // Fetch enrollments for my courses
            // Only try if user has admin/staff permissions for this endpoint
            const myCourseIds = myInstructorCourses.map(c => c.id);
            let myEnrollments = [];
            
            // Try to fetch enrollments for teacher's courses
            // Note: getAllEducationEnrollments may require admin/staff permissions
            // If permission is denied, we'll gracefully handle it without showing errors
            try {
                const enrollmentsResponse = await dataService.getAllEducationEnrollments({}, { showError: false }).catch(() => ({ data: [] }));
                
                const allEnrollments = Array.isArray(enrollmentsResponse) 
                    ? enrollmentsResponse 
                    : (enrollmentsResponse?.data || []);
                
                // Filter enrollments for courses where this teacher is the instructor
                myEnrollments = allEnrollments.filter(e => {
                    const serviceId = e.service?.id || e.service || e.service_id;
                    return myCourseIds.includes(serviceId);
                });
                
                setStudentEnrollments(myEnrollments);
            } catch (error) {
                // Silent fail - teachers may not have permission to view all enrollments
                console.log('Note: Teacher may not have permission to view all enrollments');
                setStudentEnrollments([]);
            }

            // For pending submissions, we can't access student submissions endpoint directly
            // This would require a teacher-specific endpoint on the backend
            // For now, we'll set empty array and show a message that grading features need backend support
            setPendingSubmissions([]);

            // Calculate stats
            const totalStudents = myEnrollments.length > 0 
                ? new Set(myEnrollments.map(e => e.user || e.user_id)).size 
                : 0; // If we don't have enrollment data, show 0
            const totalCourses = myInstructorCourses.length;
            const pendingGrading = 0; // Cannot determine without teacher-specific endpoint

            setStats({
                totalStudents,
                totalCourses,
                pendingGrading,
                averageGrade: 0 // Would need API endpoint for this
            });

            // Random verse
            const randomIndex = Math.floor(Math.random() * verses.length);
            setDailyVerse(verses[randomIndex]);

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            // Don't show error toast for permission errors - they're expected
            if (error.status !== 403) {
                toast.error('Failed to load dashboard data');
            }
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchDashboardData();

        // Update prayer time every minute
        const timer = setInterval(async () => {
            const data = await prayerTimesService.getCurrentAndNextPrayer();
            setNextPrayer(data.next);
            setTimeRemaining(prayerTimesService.formatTimeRemaining(data.timeToNext));
        }, 60000);

        return () => clearInterval(timer);
    }, [fetchDashboardData]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="animate-pulse space-y-8">
                    <div className="h-32 bg-muted rounded-2xl"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-lg"></div>)}
                    </div>
                </div>
            </div>
        );
    }

    const dashboardStats = [
        { 
            label: 'My Courses', 
            value: stats.totalCourses, 
            icon: <FiBookOpen className="h-6 w-6" />, 
            color: 'text-blue-500', 
            bg: 'bg-blue-500/10',
            to: '/education'
        },
        { 
            label: 'Total Students', 
            value: stats.totalStudents, 
            icon: <FiUsers className="h-6 w-6" />, 
            color: 'text-green-500', 
            bg: 'bg-green-500/10' 
        },
        { 
            label: 'Total Enrollments', 
            value: studentEnrollments.length, 
            icon: <FiUsers className="h-6 w-6" />, 
            color: 'text-orange-500', 
            bg: 'bg-orange-500/10'
        },
        { 
            label: 'My Courses', 
            value: myCourses.length, 
            icon: <FiBookOpen className="h-6 w-6" />, 
            color: 'text-purple-500', 
            bg: 'bg-purple-500/10',
            to: '/education'
        },
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto space-y-8"
        >
            {/* Welcome Header */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white p-8 shadow-lg">
                <IslamicPattern color="white" className="mix-blend-overlay" opacity={0.1} />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <span className="font-arabic text-xl mb-1 block opacity-90">As-salamu alaykum</span>
                        <h1 className="text-3xl font-bold mb-2">Teacher Dashboard</h1>
                        <p className="opacity-90 max-w-xl">
                            Welcome back, {user?.first_name || user?.username}! Manage your courses and students.
                        </p>
                        <p className="opacity-75 text-sm mt-2">
                            {dailyVerse.text} <span className="italic">- {dailyVerse.reference}</span>
                        </p>
                    </div>
                    <div className="text-right md:text-center bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                        <div className="flex items-center gap-2 text-sm opacity-90 justify-end md:justify-center mb-1">
                            <FiClock className="h-4 w-4" />
                            <span>Next: {nextPrayer?.name || 'Fajr'}</span>
                        </div>
                        <div className="text-xl font-bold">{nextPrayer?.formatted || '--:--'}</div>
                        <div className="text-xs opacity-75 mt-1">{timeRemaining}</div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {dashboardStats.map((stat, i) => {
                    const content = (
                        <Card key={i} className="border-border/50 bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all hover:shadow-lg">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                                    <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                                    {stat.icon}
                                </div>
                            </CardContent>
                        </Card>
                    );

                    return stat.to ? (
                        <Link key={i} to={stat.to}>
                            {content}
                        </Link>
                    ) : content;
                })}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - My Courses */}
                <div className="lg:col-span-2 space-y-6">
                    {/* My Courses */}
                    <motion.div variants={itemVariants}>
                        <Card className="shadow-md border-border/50">
                            <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <FiBookOpen className="text-blue-500" /> My Courses
                                </CardTitle>
                                <Button asChild size="sm" variant="outline">
                                    <Link to="/education">
                                        <FiPlus className="h-4 w-4 mr-2" />
                                        Manage Courses
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {myCourses.length > 0 ? (
                                    <div className="space-y-3">
                                        {myCourses.slice(0, 5).map((course) => {
                                            const enrollmentsCount = studentEnrollments.filter(e => e.service === course.id).length;
                                            return (
                                                <div key={course.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-sm">{course.title}</div>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {course.service_type_display || course.service_type} • {enrollmentsCount} students
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${
                                                                course.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                                            }`}>
                                                                {course.status}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">{course.schedule}</span>
                                                        </div>
                                                    </div>
                                                    <Link to={`/education/${course.id}`}>
                                                        <Button size="xs" variant="ghost">
                                                            <FiArrowRight />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                        {myCourses.length > 5 && (
                                            <div className="text-center pt-2">
                                                <Link to="/education" className="text-sm text-primary hover:underline">
                                                    View all {myCourses.length} courses
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <FiBookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                                        <p className="text-muted-foreground mb-4">No courses assigned yet</p>
                                        <Button asChild variant="outline">
                                            <Link to="/education">
                                                <FiPlus className="h-4 w-4 mr-2" />
                                                Create Course
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Recent Enrollments */}
                    <motion.div variants={itemVariants}>
                        <Card className="shadow-md border-border/50">
                            <CardHeader className="border-b border-border/40 pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <FiUsers className="text-green-500" /> Recent Student Enrollments
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {studentEnrollments.length > 0 ? (
                                    <div className="space-y-3">
                                        {studentEnrollments.slice(0, 5).map((enrollment) => {
                                            const course = myCourses.find(c => c.id === enrollment.service);
                                            return (
                                                <div key={enrollment.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50">
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-sm">{enrollment.user_name || enrollment.user?.username || 'Student'}</div>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {course?.title || 'Course'} • {new Date(enrollment.enrollment_date || enrollment.created_at).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${
                                                                enrollment.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                                            }`}>
                                                                {enrollment.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-6">No enrollments yet</p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Right Column - Quick Actions & Pending Items */}
                <div className="space-y-6">
                    {/* Pending Grading */}
                    <motion.div variants={itemVariants}>
                        <Card className="shadow-md border-border/50">
                            <CardHeader className="border-b border-border/40 pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <FiFileText className="text-orange-500" /> Pending Grading
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="text-center py-6">
                                    <FiFileText className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Grading features require backend endpoints for teachers to view student submissions.
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Contact administrator to enable teacher access to student submissions and grading.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div variants={itemVariants}>
                        <Card className="shadow-md border-border/50">
                            <CardHeader className="border-b border-border/40 pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <FiActivity className="text-indigo-500" /> Quick Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-2">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link to="/education">
                                        <FiPlus className="w-4 h-4 mr-2" />
                                        Create New Course
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" disabled>
                                    <FiFileText className="w-4 h-4 mr-2" />
                                    Create Assignment
                                    <span className="ml-auto text-xs text-muted-foreground">Coming soon</span>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" disabled>
                                    <FiAward className="w-4 h-4 mr-2" />
                                    Schedule Exam
                                    <span className="ml-auto text-xs text-muted-foreground">Coming soon</span>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" disabled>
                                    <FiTrendingUp className="w-4 h-4 mr-2" />
                                    View Grades
                                    <span className="ml-auto text-xs text-muted-foreground">Coming soon</span>
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
});

TeacherDashboard.displayName = 'TeacherDashboard';
export default TeacherDashboard;
