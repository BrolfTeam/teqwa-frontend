import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiCheckCircle, FiClock, FiAlertCircle, FiChevronLeft, FiExternalLink, FiDownload } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { dataService } from '@/lib/dataService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const StudentSubmissions = memo(() => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                setLoading(true);
                const response = await dataService.getStudentSubmissions();
                setSubmissions(Array.isArray(response.data) ? response.data : response.data?.data || []);
            } catch (error) {
                console.error('Failed to fetch submissions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []);

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'graded':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200';
            case 'resubmit':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200';
            default:
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
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
                    <h1 className="text-3xl font-bold">{t('dashboard.student.mySubmissions')}</h1>
                    <p className="text-muted-foreground">History of your assignment submissions</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {submissions.length > 0 ? (
                    submissions.map((submission) => (
                        <motion.div
                            key={submission.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-shadow overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x border-border/40">
                                        {/* Main Info */}
                                        <div className="flex-1 p-6 space-y-3">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="text-xl font-bold">{submission.assignment?.title || 'Untitled Assignment'}</h3>
                                                    <div className="text-sm text-muted-foreground font-medium">
                                                        {submission.assignment?.course?.code || 'N/A'} • Submitted on {new Date(submission.submitted_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusStyle(submission.status)}`}>
                                                    {submission.status || 'Submitted'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground line-clamp-2">
                                                {submission.content || 'No text content provided.'}
                                            </div>
                                        </div>

                                        {/* Grade & Feedback */}
                                        <div className="w-full md:w-64 p-6 bg-secondary/10 flex flex-col justify-center items-center text-center space-y-2">
                                            {submission.grade !== null ? (
                                                <>
                                                    <div className="text-3xl font-black text-primary">{submission.grade}%</div>
                                                    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Grade Received</div>
                                                </>
                                            ) : (
                                                <>
                                                    <FiClock className="h-8 w-8 text-yellow-500 opacity-50 mb-2" />
                                                    <div className="text-sm font-medium text-muted-foreground italic">Awaiting Grading</div>
                                                </>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="p-4 bg-secondary/5 flex flex-row md:flex-col justify-center gap-2">
                                            <Button size="sm" variant="outline" asChild className="flex-1 md:flex-none">
                                                <Link to={`/student/assignments/${submission.assignment?.id}`}>
                                                    <FiFileText className="mr-2" /> Assignment
                                                </Link>
                                            </Button>
                                            {submission.files && submission.files.length > 0 && (
                                                <Button size="sm" variant="ghost" className="flex-1 md:flex-none">
                                                    <FiDownload className="mr-2" /> Files ({submission.files.length})
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {submission.feedback && (
                                        <div className="px-6 py-4 bg-emerald-500/5 border-t border-emerald-500/10">
                                            <div className="flex items-start gap-3">
                                                <FiMessageSquare className="h-4 w-4 text-emerald-600 mt-1 shrink-0" />
                                                <div className="space-y-1">
                                                    <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Teacher Feedback</div>
                                                    <p className="text-sm italic text-zinc-700 dark:text-zinc-300">"{submission.feedback}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-secondary/20 rounded-[2.5rem] border-2 border-dashed border-border/50">
                        <FiFileText className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                        <h3 className="text-xl font-bold mb-2">No submissions yet</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto">Complete your assignments and submit them to track your progress here.</p>
                        <Button asChild className="mt-6 rounded-xl">
                            <Link to="/student/assignments">View Assignments</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
});

StudentSubmissions.displayName = 'StudentSubmissions';
export default StudentSubmissions;
