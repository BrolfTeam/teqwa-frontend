import { memo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiBookOpen, FiCalendar, FiClock, FiFileText, FiCheckCircle, FiXCircle,
    FiMessageSquare, FiBell, FiTrendingUp, FiAlertCircle, FiSend, FiUser,
    FiMail, FiDownload, FiUpload, FiAward, FiBarChart2, FiEdit, FiEye, FiActivity
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import IslamicPattern from '@/components/ui/IslamicPattern';
import { dataService } from '@/lib/dataService';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';

const StudentDashboard = memo(() => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [timetable, setTimetable] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [exams, setExams] = useState([]);
    const [grades, setGrades] = useState(null);
    const [messages, setMessages] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    
    // Modal states
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissionContent, setSubmissionContent] = useState('');
    const [submissionFiles, setSubmissionFiles] = useState([]);
    const [messageData, setMessageData] = useState({ recipient_id: '', subject: '', message: '', course_id: '' });

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const [statsData, timetableData, assignmentsData, examsData, gradesData, messagesData, announcementsData] = await Promise.all([
                dataService.getStudentDashboardStats().catch(() => ({ data: {} })),
                dataService.getStudentTimetable().catch(() => ({ data: [] })),
                dataService.getStudentAssignments().catch(() => ({ data: [] })),
                dataService.getStudentExams().catch(() => ({ data: [] })),
                dataService.getStudentGrades().catch(() => ({ data: [], average_percentage: 0 })),
                dataService.getStudentMessages().catch(() => ({ data: [] })),
                dataService.getStudentAnnouncements().catch(() => ({ data: [] }))
            ]);

            setStats(statsData.data || {});
            setTimetable(Array.isArray(timetableData.data) ? timetableData.data : timetableData.data?.data || []);
            setAssignments(Array.isArray(assignmentsData.data) ? assignmentsData.data : assignmentsData.data?.data || []);
            setExams(Array.isArray(examsData.data) ? examsData.data : examsData.data?.data || []);
            setGrades(gradesData.data || { data: [], average_percentage: 0 });
            setMessages(Array.isArray(messagesData.data) ? messagesData.data : messagesData.data?.data || []);
            setAnnouncements(Array.isArray(announcementsData.data) ? announcementsData.data : announcementsData.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleSubmitAssignment = async () => {
        if (!selectedAssignment) return;

        try {
            await dataService.submitAssignment(selectedAssignment.id, {
                content: submissionContent,
                files: submissionFiles
            });
            toast.success('Assignment submitted successfully!');
            setShowSubmissionModal(false);
            setSelectedAssignment(null);
            setSubmissionContent('');
            setSubmissionFiles([]);
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to submit assignment:', error);
            toast.error('Failed to submit assignment');
        }
    };

    const handleSendMessage = async () => {
        if (!messageData.recipient_id || !messageData.subject || !messageData.message) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            await dataService.sendMessage(messageData);
            toast.success('Message sent successfully!');
            setShowMessageModal(false);
            setMessageData({ recipient_id: '', subject: '', message: '', course_id: '' });
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        }
    };

    const handleMarkMessageRead = async (messageId) => {
        try {
            await dataService.markMessageRead(messageId);
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to mark message as read:', error);
        }
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-lg"></div>)}
                    </div>
                </div>
            </div>
        );
    }

    const dashboardStats = [
        { label: 'Courses', value: stats?.courses_count || 0, icon: <FiBookOpen className="h-6 w-6" />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Pending Assignments', value: stats?.pending_assignments || 0, icon: <FiFileText className="h-6 w-6" />, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { label: 'Overdue', value: stats?.overdue_assignments || 0, icon: <FiAlertCircle className="h-6 w-6" />, color: 'text-red-500', bg: 'bg-red-500/10' },
        { label: 'Upcoming Exams', value: stats?.upcoming_exams || 0, icon: <FiCalendar className="h-6 w-6" />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ];

    const upcomingExams = exams.filter(exam => new Date(exam.exam_date) > new Date()).slice(0, 3);
    const recentAssignments = assignments.slice(0, 5);
    const todayTimetable = timetable.filter(item => {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        return item.day.toLowerCase() === today;
    });

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto space-y-8"
        >
            {/* Welcome Header */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 shadow-lg">
                <IslamicPattern color="white" className="mix-blend-overlay" opacity={0.05} />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <FiBookOpen className="h-8 w-8" />
                        <h1 className="text-3xl font-bold">Student Dashboard</h1>
                    </div>
                    <p className="text-blue-100">Welcome back, {user?.first_name || user?.username}! Manage your studies and track your progress.</p>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {dashboardStats.map((stat, i) => (
                    <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm">
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
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Timetable & Assignments */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Today's Timetable */}
                    <motion.div variants={itemVariants}>
                        <Card className="shadow-md border-border/50">
                            <CardHeader className="border-b border-border/40 pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <FiClock className="text-blue-500" /> Today's Schedule
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {todayTimetable.length > 0 ? (
                                    <div className="space-y-3">
                                        {todayTimetable.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50">
                                                <div className="flex-1">
                                                    <div className="font-semibold">{item.course?.code || 'N/A'}</div>
                                                    <div className="text-sm text-muted-foreground">{item.course?.service?.title || 'Course'}</div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {item.start_time} - {item.end_time} {item.location && `• ${item.location}`}
                                                    </div>
                                                </div>
                                                <div className="text-sm font-medium">{item.instructor_name || 'TBA'}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-6">No classes scheduled for today</p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Recent Assignments */}
                    <motion.div variants={itemVariants}>
                        <Card className="shadow-md border-border/50">
                            <CardHeader className="border-b border-border/40 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <FiFileText className="text-yellow-500" /> Assignments
                                    </CardTitle>
                                    <Link to="/student/assignments" className="text-sm text-primary hover:underline">View All</Link>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {recentAssignments.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentAssignments.map((assignment) => {
                                            const isOverdue = assignment.is_overdue;
                                            const dueDate = new Date(assignment.due_date);
                                            return (
                                                <div key={assignment.id} className={`p-4 rounded-lg border ${isOverdue ? 'border-red-500/50 bg-red-50/50 dark:bg-red-950/10' : 'border-border/50 bg-secondary/30'}`}>
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-semibold">{assignment.title}</h4>
                                                                {isOverdue && (
                                                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                                        Overdue
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {assignment.course?.code || 'N/A'} • Due: {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground mt-1">{assignment.description?.substring(0, 100)}...</div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setSelectedAssignment(assignment);
                                                                    setShowSubmissionModal(true);
                                                                }}
                                                            >
                                                                <FiUpload className="w-4 h-4 mr-1" />
                                                                Submit
                                                            </Button>
                                                            <Button size="sm" variant="ghost" asChild>
                                                                <Link to={`/student/assignments/${assignment.id}`}>
                                                                    <FiEye className="w-4 h-4" />
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-6">No assignments available</p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Right Column - Quick Info */}
                <div className="space-y-6">
                    {/* Upcoming Exams */}
                    <motion.div variants={itemVariants}>
                        <Card className="shadow-md border-border/50">
                            <CardHeader className="border-b border-border/40 pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <FiCalendar className="text-purple-500" /> Upcoming Exams
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {upcomingExams.length > 0 ? (
                                    <div className="space-y-3">
                                        {upcomingExams.map((exam) => {
                                            const examDate = new Date(exam.exam_date);
                                            return (
                                                <div key={exam.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                                                    <div className="font-semibold text-sm mb-1">{exam.title}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {exam.course?.code || 'N/A'} • {examDate.toLocaleDateString()} {examDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">Duration: {exam.duration_minutes} minutes</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-6 text-sm">No upcoming exams</p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Grades Summary */}
                    <motion.div variants={itemVariants}>
                        <Card className="shadow-md border-border/50">
                            <CardHeader className="border-b border-border/40 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <FiAward className="text-green-500" /> Grades
                                    </CardTitle>
                                    <Link to="/student/grades" className="text-sm text-primary hover:underline">View All</Link>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {grades?.average_percentage > 0 ? (
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <div className="text-4xl font-bold text-primary">{grades.average_percentage.toFixed(1)}%</div>
                                            <div className="text-sm text-muted-foreground mt-1">Average Grade</div>
                                        </div>
                                        <div className="text-sm text-muted-foreground text-center">
                                            {grades.data?.length || 0} graded items
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-6 text-sm">No grades available yet</p>
                                )}
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
                                <Button variant="outline" className="w-full justify-start" onClick={() => setShowMessageModal(true)}>
                                    <FiSend className="w-4 h-4 mr-2" />
                                    Message Teacher
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link to="/student/timetable">
                                        <FiClock className="w-4 h-4 mr-2" />
                                        View Full Timetable
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link to="/student/submissions">
                                        <FiFileText className="w-4 h-4 mr-2" />
                                        My Submissions
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Announcements */}
            <motion.div variants={itemVariants}>
                <Card className="shadow-md border-border/50">
                    <CardHeader className="border-b border-border/40 pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <FiBell className="text-orange-500" /> Announcements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {announcements.length > 0 ? (
                            <div className="space-y-3">
                                {announcements.slice(0, 5).map((announcement) => (
                                    <div key={announcement.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold">{announcement.title}</h4>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                        announcement.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        announcement.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                        {announcement.priority}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">{announcement.content}</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {announcement.author?.full_name || 'Admin'} • {new Date(announcement.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-6">No announcements</p>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Submission Modal */}
            <Modal open={showSubmissionModal} onClose={() => setShowSubmissionModal(false)} title="Submit Assignment">
                {selectedAssignment && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg">{selectedAssignment.title}</h3>
                            <p className="text-sm text-muted-foreground">{selectedAssignment.course?.code || 'N/A'}</p>
                        </div>
                        <FormField label="Submission Content">
                            <textarea
                                value={submissionContent}
                                onChange={(e) => setSubmissionContent(e.target.value)}
                                className="w-full border rounded-lg px-4 py-2 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                placeholder="Enter your submission content..."
                            />
                        </FormField>
                        <FormField label="Files (URLs)">
                            <input
                                type="text"
                                value={submissionFiles.join(', ')}
                                onChange={(e) => setSubmissionFiles(e.target.value.split(',').map(f => f.trim()).filter(f => f))}
                                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                placeholder="Enter file URLs separated by commas"
                            />
                        </FormField>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setShowSubmissionModal(false)}>Cancel</Button>
                            <Button onClick={handleSubmitAssignment}>
                                <FiUpload className="w-4 h-4 mr-2" />
                                Submit Assignment
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Message Modal */}
            <Modal open={showMessageModal} onClose={() => setShowMessageModal(false)} title="Message Teacher">
                <div className="space-y-4">
                    <FormField label="Recipient (Teacher ID)" required>
                        <input
                            type="number"
                            value={messageData.recipient_id}
                            onChange={(e) => setMessageData({ ...messageData, recipient_id: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            placeholder="Enter teacher user ID"
                        />
                    </FormField>
                    <FormField label="Subject" required>
                        <input
                            type="text"
                            value={messageData.subject}
                            onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            placeholder="Message subject"
                        />
                    </FormField>
                    <FormField label="Message" required>
                        <textarea
                            value={messageData.message}
                            onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            placeholder="Enter your message..."
                        />
                    </FormField>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setShowMessageModal(false)}>Cancel</Button>
                        <Button onClick={handleSendMessage}>
                            <FiSend className="w-4 h-4 mr-2" />
                            Send Message
                        </Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
});

StudentDashboard.displayName = 'StudentDashboard';
export default StudentDashboard;

