import { memo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FiSun,
  FiX,
  FiDollarSign,
  FiBarChart2,
  FiMail,
  FiPhone
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
import { useTranslation } from 'react-i18next';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';

const TeacherDashboard = memo(() => {
    const { t } = useTranslation();
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
    
    // Modal states
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showStudentsModal, setShowStudentsModal] = useState(false);
    const [showReportsModal, setShowReportsModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [courseFormData, setCourseFormData] = useState({
        title: '',
        description: '',
        service_type: '',
        schedule: '',
        duration: '',
        capacity: '',
        level: '',
        age_group: '',
        fee: '0',
        is_free: false,
        start_date: '',
        end_date: '',
        service: null // For courses - link to parent service
    });
    const [availableServices, setAvailableServices] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch prayer times
            const prayerData = await prayerTimesService.getCurrentAndNextPrayer();
            setNextPrayer(prayerData.next);
            setTimeRemaining(prayerTimesService.formatTimeRemaining(prayerData.timeToNext));

            // Fetch both services and courses where user is instructor
            const [servicesResponse, coursesResponse] = await Promise.all([
                dataService.getEducationServices({ active: true }).catch(() => ({ data: [] })),
                dataService.getCourses({ active: true }).catch(() => ({ data: [] }))
            ]);
            
            const allServices = Array.isArray(servicesResponse) ? servicesResponse : (servicesResponse?.data || []);
            const allCourses = Array.isArray(coursesResponse) ? coursesResponse : (coursesResponse?.data || []);
            
            // Helper function to check if user is instructor
            const isInstructor = (item) => {
                if (!item || !user?.id) return false;
                const instructorId = item.instructor?.id || item.instructor;
                return instructorId === user.id;
            };
            
            // Filter services and courses where user is instructor
            const myInstructorServices = allServices.filter(isInstructor);
            const myInstructorCourses = allCourses.filter(course => {
                // Check if course instructor matches
                if (isInstructor(course)) return true;
                // Check if course's service instructor matches
                if (course.service) {
                    const service = typeof course.service === 'object' ? course.service : 
                                   allServices.find(s => s.id === course.service);
                    return isInstructor(service);
                }
                return false;
            });
            
            // Combine services and courses, prioritizing courses
            const combinedCourses = [...myInstructorCourses, ...myInstructorServices.map(s => ({ ...s, isService: true }))];
            setMyCourses(combinedCourses);

            // Fetch enrollments for my courses
            const myServiceIds = myInstructorServices.map(s => s.id);
            const myCourseIds = myInstructorCourses.map(c => c.id);
            const allMyIds = [...myServiceIds, ...myCourseIds];
            let myEnrollments = [];
            
            // Try to fetch enrollments for teacher's courses
            try {
                const enrollmentsResponse = await dataService.getAllEducationEnrollments({}, { showError: false }).catch(() => ({ data: [] }));
                
                const allEnrollments = Array.isArray(enrollmentsResponse) 
                    ? enrollmentsResponse 
                    : (enrollmentsResponse?.data || []);
                
                // Filter enrollments for courses/services where this teacher is the instructor
                myEnrollments = allEnrollments.filter(e => {
                    const serviceId = e.service?.id || e.service || e.service_id;
                    const courseId = e.course?.id || e.course || e.course_id;
                    return allMyIds.includes(serviceId) || allMyIds.includes(courseId);
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
            const uniqueStudents = myEnrollments.length > 0 
                ? new Set(myEnrollments.map(e => e.user || e.user_id || e.user?.id)).size 
                : 0;
            const totalCourses = combinedCourses.length;
            const totalEnrollments = myEnrollments.length;
            const pendingGrading = myEnrollments.filter(e => 
                e.status === 'pending' || e.status === 'confirmed'
            ).length;

            setStats({
                totalStudents: uniqueStudents,
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

    // Course management functions
    const openCourseModal = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setCourseFormData({
                title: course.title || '',
                description: course.description || '',
                service_type: course.service_type || '',
                schedule: course.schedule || '',
                duration: course.duration || '',
                capacity: course.capacity || '',
                level: course.level || '',
                age_group: course.age_group || '',
                fee: course.fee || '0',
                is_free: course.is_free || false,
                start_date: course.start_date ? new Date(course.start_date).toISOString().slice(0, 16) : '',
                end_date: course.end_date ? new Date(course.end_date).toISOString().slice(0, 16) : '',
                service: course.service?.id || course.service || null
            });
        } else {
            setEditingCourse(null);
            setCourseFormData({
                title: '',
                description: '',
                service_type: '',
                schedule: '',
                duration: '',
                capacity: '',
                level: '',
                age_group: '',
                fee: '0',
                is_free: false,
                start_date: '',
                end_date: '',
                service: null
            });
        }
        setShowCourseModal(true);
    };

    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = {
                ...courseFormData,
                instructor: user?.id,
                capacity: parseInt(courseFormData.capacity) || 10,
                fee: parseFloat(courseFormData.fee) || 0,
            };

            // Remove service field if creating new course (will be set by backend or selected)
            if (!editingCourse && !formData.service) {
                delete formData.service;
            }

            if (editingCourse) {
                // Update existing course/service
                if (editingCourse.isService) {
                    await apiService.updateService(editingCourse.id, formData);
                } else {
                    await apiService.updateCourse(editingCourse.id, formData);
                }
                toast.success(t('dashboard.teacher.courseUpdated'));
            } else {
                // Create new course (prefer course over service)
                try {
                    await apiService.createCourse(formData);
                    toast.success(t('dashboard.teacher.courseCreated'));
                } catch (courseError) {
                    // If course creation fails, try creating as service
                    if (courseError.status === 404 || courseError.status === 400) {
                        await apiService.createService(formData);
                        toast.success(t('dashboard.teacher.courseCreated'));
                    } else {
                        throw courseError;
                    }
                }
            }

            setShowCourseModal(false);
            setEditingCourse(null);
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to save course:', error);
            const errorMessage = error.data?.detail || error.data?.message || error.message || t('dashboard.teacher.courseSaveFailed');
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCourseFormChange = (field, value) => {
        setCourseFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

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
            label: t('dashboard.teacher.myCourses'), 
            value: stats.totalCourses, 
            icon: <FiBookOpen className="h-6 w-6" />, 
            color: 'text-blue-500', 
            bg: 'bg-blue-500/10'
        },
        { 
            label: t('dashboard.teacher.totalStudents'), 
            value: stats.totalStudents, 
            icon: <FiUsers className="h-6 w-6" />, 
            color: 'text-green-500', 
            bg: 'bg-green-500/10' 
        },
        { 
            label: t('dashboard.teacher.totalEnrollments'), 
            value: studentEnrollments.length, 
            icon: <FiUsers className="h-6 w-6" />, 
            color: 'text-orange-500', 
            bg: 'bg-orange-500/10'
        },
        { 
            label: t('dashboard.teacher.pendingGrading'), 
            value: stats.pendingGrading, 
            icon: <FiFileText className="h-6 w-6" />, 
            color: 'text-purple-500', 
            bg: 'bg-purple-500/10'
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
                        <span className="font-arabic text-xl mb-1 block opacity-90">{t('dashboard.greeting')}</span>
                        <h1 className="text-3xl font-bold mb-2">{t('dashboard.teacher.teacherDashboard')}</h1>
                        <p className="opacity-90 max-w-xl">
                            {t('dashboard.teacher.welcome')}, {user?.first_name || user?.username}! {t('dashboard.teacher.teacherDashboard')}
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

                    return content;
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
                                    <FiBookOpen className="text-blue-500" /> {t('dashboard.teacher.myCoursesList')}
                                </CardTitle>
                                <Button size="sm" variant="outline" onClick={() => openCourseModal()}>
                                    <FiPlus className="h-4 w-4 mr-2" />
                                    {t('dashboard.teacher.manageCourse')}
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {myCourses.length > 0 ? (
                                    <div className="space-y-3">
                                        {myCourses.slice(0, 5).map((course) => {
                                            const enrollmentsCount = studentEnrollments.filter(e => 
                                                (e.service === course.id || e.service?.id === course.id) ||
                                                (e.course === course.id || e.course?.id === course.id)
                                            ).length;
                                            const courseTitle = course.title || course.name;
                                            const courseType = course.service_type_display || course.service_type || course.service?.service_type_display;
                                            return (
                                                <div key={course.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-sm">{courseTitle}</div>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {courseType} • {enrollmentsCount} {t('dashboard.teacher.students')}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${
                                                                course.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                                            }`}>
                                                                {course.status || 'active'}
                                                            </span>
                                                            {course.schedule && (
                                                                <span className="text-xs text-muted-foreground">{course.schedule}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button size="xs" variant="ghost" onClick={() => openCourseModal(course)} title={t('dashboard.teacher.editCourse')}>
                                                            <FiEdit />
                                                        </Button>
                                                        <Button size="xs" variant="ghost" onClick={() => {
                                                            const courseEnrollments = studentEnrollments.filter(e => 
                                                                (e.service === course.id || e.service?.id === course.id) ||
                                                                (e.course === course.id || e.course?.id === course.id)
                                                            );
                                                            setShowStudentsModal(true);
                                                        }} title={t('dashboard.teacher.viewStudents')}>
                                                            <FiUsers />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {myCourses.length > 5 && (
                                            <div className="text-center pt-2">
                                                <Button variant="ghost" size="sm" onClick={() => setShowCourseModal(true)} className="text-sm text-primary hover:underline">
                                                    {t('common.viewAll')} {myCourses.length} {t('dashboard.teacher.myCoursesList')}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <FiBookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                                        <p className="text-muted-foreground mb-4">{t('dashboard.teacher.noCourses')}</p>
                                        <Button variant="outline" onClick={() => openCourseModal()}>
                                            <FiPlus className="h-4 w-4 mr-2" />
                                            {t('dashboard.teacher.manageCourse')}
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
                                    <FiUsers className="text-green-500" /> {t('dashboard.teacher.studentEnrollments')}
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
                                    <div className="text-center py-6">
                                        <FiUsers className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                                        <p className="text-muted-foreground">{t('dashboard.teacher.noEnrollments')}</p>
                                    </div>
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
                                    <FiFileText className="text-orange-500" /> {t('dashboard.teacher.pendingGrading')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {stats.pendingGrading > 0 ? (
                                    <div className="space-y-3">
                                        <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-sm text-orange-900 dark:text-orange-100">
                                                        {stats.pendingGrading} {t('dashboard.teacher.pendingSubmissions')}
                                                    </p>
                                                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                                                        {t('dashboard.teacher.enrollmentsNeedReview')}
                                                    </p>
                                                </div>
                                                <FiFileText className="h-6 w-6 text-orange-500" />
                                            </div>
                                        </div>
                                        <Button variant="outline" className="w-full" onClick={() => setShowStudentsModal(true)}>
                                            <FiFileText className="w-4 h-4 mr-2" />
                                            {t('dashboard.teacher.reviewEnrollments')}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <FiCheckCircle className="h-8 w-8 text-green-500/50 mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            {t('dashboard.teacher.noPendingSubmissions')}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t('dashboard.teacher.allEnrollmentsReviewed')}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div variants={itemVariants}>
                        <Card className="shadow-md border-border/50">
                            <CardHeader className="border-b border-border/40 pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <FiActivity className="text-indigo-500" /> {t('dashboard.quickActions')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-2">
                                <Button variant="outline" className="w-full justify-start" onClick={() => openCourseModal()}>
                                    <FiPlus className="w-4 h-4 mr-2" />
                                    {t('dashboard.teacher.manageCourse')}
                                </Button>
                                <Button variant="outline" className="w-full justify-start" onClick={() => setShowStudentsModal(true)}>
                                    <FiUsers className="w-4 h-4 mr-2" />
                                    {t('dashboard.teacher.viewStudents')}
                                </Button>
                                {stats.pendingGrading > 0 && (
                                    <Button variant="outline" className="w-full justify-start" onClick={() => setShowStudentsModal(true)}>
                                        <FiFileText className="w-4 h-4 mr-2" />
                                        {t('dashboard.teacher.reviewEnrollments')}
                                        <span className="ml-auto text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
                                            {stats.pendingGrading}
                                        </span>
                                    </Button>
                                )}
                                <Button variant="outline" className="w-full justify-start" onClick={() => setShowReportsModal(true)}>
                                    <FiTrendingUp className="w-4 h-4 mr-2" />
                                    {t('dashboard.teacher.viewReports')}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Course Management Modal */}
            <Modal 
                open={showCourseModal} 
                onClose={() => {
                    setShowCourseModal(false);
                    setEditingCourse(null);
                }} 
                title={editingCourse ? t('dashboard.teacher.editCourse') : t('dashboard.teacher.createCourse')}
                size="lg"
            >
                <form onSubmit={handleCourseSubmit} className="space-y-4">
                    <FormField label={t('dashboard.teacher.courseTitle')} required>
                        <input
                            type="text"
                            value={courseFormData.title}
                            onChange={(e) => handleCourseFormChange('title', e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            required
                        />
                    </FormField>

                    <FormField label={t('dashboard.teacher.description')}>
                        <textarea
                            value={courseFormData.description}
                            onChange={(e) => handleCourseFormChange('description', e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                            rows={3}
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t('dashboard.teacher.serviceType')} required>
                            <select
                                value={courseFormData.service_type}
                                onChange={(e) => handleCourseFormChange('service_type', e.target.value)}
                                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            >
                                <option value="">{t('dashboard.teacher.selectType')}</option>
                                <option value="quran_recitation">{t('education.quranRecitation')}</option>
                                <option value="quran_memorization">{t('education.quranMemorizationHifz')}</option>
                                <option value="tajweed">{t('education.tajweed')}</option>
                                <option value="hadith">{t('education.hadithStudies')}</option>
                                <option value="fiqh">{t('education.fiqh')}</option>
                                <option value="tafseer">{t('education.tafseer')}</option>
                            </select>
                        </FormField>

                        <FormField label={t('dashboard.teacher.level')} required>
                            <select
                                value={courseFormData.level}
                                onChange={(e) => handleCourseFormChange('level', e.target.value)}
                                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            >
                                <option value="">{t('dashboard.teacher.selectLevel')}</option>
                                <option value="beginner">{t('education.beginner')}</option>
                                <option value="intermediate">{t('education.intermediate')}</option>
                                <option value="advanced">{t('education.advanced')}</option>
                            </select>
                        </FormField>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t('dashboard.teacher.ageGroup')} required>
                            <select
                                value={courseFormData.age_group}
                                onChange={(e) => handleCourseFormChange('age_group', e.target.value)}
                                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            >
                                <option value="">{t('dashboard.teacher.selectAgeGroup')}</option>
                                <option value="children">{t('education.children')}</option>
                                <option value="teens">{t('education.teens')}</option>
                                <option value="adults">{t('education.adults')}</option>
                                <option value="seniors">{t('education.seniors')}</option>
                            </select>
                        </FormField>

                        <FormField label={t('dashboard.teacher.capacity')} required>
                            <input
                                type="number"
                                value={courseFormData.capacity}
                                onChange={(e) => handleCourseFormChange('capacity', e.target.value)}
                                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                min="1"
                                required
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t('dashboard.teacher.schedule')} required>
                            <input
                                type="text"
                                value={courseFormData.schedule}
                                onChange={(e) => handleCourseFormChange('schedule', e.target.value)}
                                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g., Monday, Wednesday, Friday 2:00 PM"
                                required
                            />
                        </FormField>

                        <FormField label={t('dashboard.teacher.duration')} required>
                            <input
                                type="text"
                                value={courseFormData.duration}
                                onChange={(e) => handleCourseFormChange('duration', e.target.value)}
                                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g., 3 months"
                                required
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t('dashboard.teacher.startDate')} required>
                            <input
                                type="datetime-local"
                                value={courseFormData.start_date}
                                onChange={(e) => handleCourseFormChange('start_date', e.target.value)}
                                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </FormField>

                        <FormField label={t('dashboard.teacher.endDate')} required>
                            <input
                                type="datetime-local"
                                value={courseFormData.end_date}
                                onChange={(e) => handleCourseFormChange('end_date', e.target.value)}
                                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t('dashboard.teacher.fee')}>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={courseFormData.fee}
                                    onChange={(e) => handleCourseFormChange('fee', e.target.value)}
                                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                                    min="0"
                                    step="0.01"
                                    disabled={courseFormData.is_free}
                                />
                                <span className="text-sm text-muted-foreground">ETB</span>
                            </div>
                        </FormField>

                        <FormField label={t('dashboard.teacher.isFree')}>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={courseFormData.is_free}
                                    onChange={(e) => {
                                        handleCourseFormChange('is_free', e.target.checked);
                                        if (e.target.checked) {
                                            handleCourseFormChange('fee', '0');
                                        }
                                    }}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">{t('dashboard.teacher.freeCourse')}</span>
                            </label>
                        </FormField>
                    </div>

                    {!editingCourse && availableServices.length > 0 && (
                        <FormField label={t('dashboard.teacher.linkToService')}>
                            <select
                                value={courseFormData.service || ''}
                                onChange={(e) => handleCourseFormChange('service', e.target.value || null)}
                                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="">{t('dashboard.teacher.noServiceLink')}</option>
                                {availableServices.map(service => (
                                    <option key={service.id} value={service.id}>
                                        {service.title} ({service.service_type_display || service.service_type})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('dashboard.teacher.serviceLinkHint')}
                            </p>
                        </FormField>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => {
                            setShowCourseModal(false);
                            setEditingCourse(null);
                        }}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? t('common.loading') : (editingCourse ? t('common.save') : t('dashboard.teacher.createCourse'))}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Students View Modal */}
            <Modal 
                open={showStudentsModal} 
                onClose={() => setShowStudentsModal(false)} 
                title={t('dashboard.teacher.viewStudents')}
                size="lg"
            >
                <div className="space-y-4">
                    {studentEnrollments.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-muted-foreground">
                                    {t('dashboard.teacher.totalEnrollments')}: {studentEnrollments.length}
                                </p>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto space-y-2">
                                {studentEnrollments.map((enrollment) => {
                                    const course = myCourses.find(c => 
                                        c.id === enrollment.service || c.id === enrollment.service?.id ||
                                        c.id === enrollment.course || c.id === enrollment.course?.id
                                    );
                                    const studentName = enrollment.user_name || enrollment.user?.get_full_name || 
                                                        (enrollment.user?.first_name && enrollment.user?.last_name 
                                                            ? `${enrollment.user.first_name} ${enrollment.user.last_name}`
                                                            : enrollment.user?.username) || 'Student';
                                    const enrollmentDate = enrollment.enrollment_date || enrollment.created_at || enrollment.enrolled_at;
                                    
                                    return (
                                        <div key={enrollment.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="font-semibold text-sm">{studentName}</div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {course?.title || course?.name || 'Course'}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <select
                                                            value={enrollment.status || 'pending'}
                                                            onChange={(e) => handleEnrollmentStatusUpdate(enrollment.id, e.target.value)}
                                                            className={`text-xs px-2 py-1 rounded border-0 cursor-pointer ${
                                                                enrollment.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                                            }`}
                                                        >
                                                            <option value="pending">{t('dashboard.teacher.pending')}</option>
                                                            <option value="confirmed">{t('dashboard.teacher.confirmed')}</option>
                                                            <option value="cancelled">{t('dashboard.teacher.cancelled')}</option>
                                                        </select>
                                                        {enrollmentDate && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(enrollmentDate).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {enrollment.user?.email && (
                                                        <a href={`mailto:${enrollment.user.email}`} className="p-1 hover:bg-secondary rounded transition-colors" title={enrollment.user.email}>
                                                            <FiMail className="h-4 w-4 text-muted-foreground" />
                                                        </a>
                                                    )}
                                                    {enrollment.user?.phone && (
                                                        <a href={`tel:${enrollment.user.phone}`} className="p-1 hover:bg-secondary rounded transition-colors" title={enrollment.user.phone}>
                                                            <FiPhone className="h-4 w-4 text-muted-foreground" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <FiUsers className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                            <p className="text-muted-foreground">{t('dashboard.teacher.noEnrollments')}</p>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Reports Modal */}
            <Modal 
                open={showReportsModal} 
                onClose={() => setShowReportsModal(false)} 
                title={t('dashboard.teacher.viewReports')}
                size="lg"
            >
                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">{t('dashboard.teacher.totalCourses')}</div>
                            <div className="text-2xl font-bold mt-1">{stats.totalCourses}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">{t('dashboard.teacher.totalStudents')}</div>
                            <div className="text-2xl font-bold mt-1">{stats.totalStudents}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">{t('dashboard.teacher.totalEnrollments')}</div>
                            <div className="text-2xl font-bold mt-1">{studentEnrollments.length}</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-sm text-muted-foreground">{t('dashboard.teacher.pendingGrading')}</div>
                            <div className="text-2xl font-bold mt-1">{stats.pendingGrading}</div>
                        </Card>
                    </div>

                    {/* Course Breakdown */}
                    <div>
                        <h4 className="font-semibold mb-3">{t('dashboard.teacher.courseBreakdown')}</h4>
                        <div className="space-y-2">
                            {myCourses.map(course => {
                                const courseEnrollments = studentEnrollments.filter(e => 
                                    (e.service === course.id || e.service?.id === course.id) ||
                                    (e.course === course.id || e.course?.id === course.id)
                                );
                                const enrollmentRate = course.capacity > 0 
                                    ? ((courseEnrollments.length / course.capacity) * 100).toFixed(0)
                                    : 0;
                                return (
                                    <div key={course.id} className="p-3 rounded-lg bg-secondary/30 border border-border/50 p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="font-semibold text-sm">{course.title || course.name}</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {courseEnrollments.length} / {course.capacity} {t('dashboard.teacher.students')}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold">{enrollmentRate}%</div>
                                                <div className="text-xs text-muted-foreground">{t('dashboard.teacher.full')}</div>
                                            </div>
                                        </div>
                                        <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-primary transition-all"
                                                style={{ width: `${Math.min(enrollmentRate, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Enrollment Status Breakdown */}
                    <div>
                        <h4 className="font-semibold mb-3">{t('dashboard.teacher.enrollmentStatus')}</h4>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                                <span className="text-sm">{t('dashboard.teacher.confirmed')}</span>
                                <span className="font-semibold">
                                    {studentEnrollments.filter(e => e.status === 'confirmed').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                                <span className="text-sm">{t('dashboard.teacher.pending')}</span>
                                <span className="font-semibold">
                                    {studentEnrollments.filter(e => e.status === 'pending').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20">
                                <span className="text-sm">{t('dashboard.teacher.cancelled')}</span>
                                <span className="font-semibold">
                                    {studentEnrollments.filter(e => e.status === 'cancelled').length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
});

TeacherDashboard.displayName = 'TeacherDashboard';
export default TeacherDashboard;
