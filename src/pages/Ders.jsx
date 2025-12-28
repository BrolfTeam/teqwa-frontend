import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiUser, FiMapPin, FiCalendar, FiBookOpen, FiCheckCircle, FiSearch, FiFilter, FiLoader, FiX, FiPlay } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { dataService } from '@/lib/dataService';
import { lectureService } from '@/services/lecture';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import Hero from '@/components/ui/Hero';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui';
import IslamicPattern from '@/components/ui/IslamicPattern';
import LectureCard from '@/components/education/LectureCard';
import mesjidBg from '@/assets/mesjid2.jpg';
import { format } from 'date-fns';

const Ders = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Page view state
    const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' or 'archive'

    // Schedule states
    const [loading, setLoading] = useState(true);
    const [allDers, setAllDers] = useState([]);
    const [myEnrollments, setMyEnrollments] = useState([]);
    const [enrolling, setEnrolling] = useState(null);


    // Archive states
    const [lectures, setLectures] = useState([]);
    const [archiveLoading, setArchiveLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedLecture, setSelectedLecture] = useState(null);

    // Day names for the selector
    const dayKeys = [
        { id: 1, key: 'monday' },
        { id: 2, key: 'tuesday' },
        { id: 3, key: 'wednesday' },
        { id: 4, key: 'thursday' },
        { id: 5, key: 'friday' },
        { id: 6, key: 'saturday' },
        { id: 7, key: 'sunday' }
    ];

    const subjects = useMemo(() => [
        { value: '', label: t('ders.allSubjects') },
        { value: 'quran_recitation', label: t('ders.quranRecitation') },
        { value: 'tafseer', label: t('ders.tafseer') },
        { value: 'hadith', label: t('ders.hadith') },
        { value: 'fiqh', label: t('ders.fiqh') },
        { value: 'seerah', label: t('ders.seerah') },
        { value: 'aqidah', label: t('ders.aqidah') },
        { value: 'general', label: t('ders.general') },
    ], [t]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch timetable entries for the weekly schedule
            const timetableResponse = await dataService.getTimetable({ active: 'true' });

            const entries = timetableResponse?.data || timetableResponse || [];
            // Map backend fields to the format expected by the UI if necessary
            // Model uses: title, imam, day_of_week (1-7), time, location
            const ders = entries.map(entry => ({
                id: entry.id,
                title: entry.title,
                instructor_name: entry.imam,
                day_of_week: entry.day_of_week,
                schedule: entry.time,
                location: entry.location,
                is_timetable: true // Flag to identify informational entries
            }));

            setAllDers(ders);

            // Still fetch enrollments if we need them for other parts (though schedule is now info-only)
            if (user) {
                const enrollmentsResponse = await dataService.getMyEnrollments();
                const enrollments = enrollmentsResponse?.data || enrollmentsResponse || [];
                setMyEnrollments(enrollments);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchLectures = useCallback(async () => {
        setArchiveLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (selectedSubject) params.subject = selectedSubject;

            const response = await lectureService.getLectures(params);
            setLectures(response.data || []);
        } catch (error) {
            console.error('Failed to fetch lectures:', error);
        } finally {
            setArchiveLoading(false);
        }
    }, [search, selectedSubject]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (activeTab === 'archive') {
            const timer = setTimeout(() => {
                fetchLectures();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [activeTab, fetchLectures]);

    const handleEnroll = async (serviceId) => {
        if (!user) {
            toast.info(t('education.pleaseLogin'));
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        try {
            setEnrolling(serviceId);
            await dataService.enrollInService(serviceId);
            toast.success(t('education.enrollSucceeded'));
            fetchData();
        } catch (error) {
            toast.error(error.message || t('education.enrollFailed'));
        } finally {
            setEnrolling(null);
        }
    };

    const isEnrolled = (serviceId) => {
        return myEnrollments.some(e => e.service?.id === serviceId || e.service === serviceId);
    };



    const getEmbedUrl = (url) => {
        if (!url) return '';
        try {
            if (url.includes('/embed/')) return url;
            if (url.includes('youtu.be')) {
                const id = url.split('youtu.be/')[1].split('?')[0];
                return `https://www.youtube.com/embed/${id}`;
            }
            if (url.includes('watch?v=')) {
                const id = url.split('watch?v=')[1].split('&')[0];
                return `https://www.youtube.com/embed/${id}`;
            }
            if (url.includes('t.me/') || url.includes('telegram.me/')) {
                // Remove trailing slashes and existing query params to avoid redirects
                let cleanUrl = url.split('?')[0].replace(/\/+$/, "");
                return `${cleanUrl}?embed=1`;
            }
            return url;
        } catch (e) {
            console.error('Error parsing video URL:', e);
            return url;
        }
    };

    const getFullMediaUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        // If it's a relative path, point it to the API domain
        const baseUrl = 'https://api.mujemaateqwa.org';
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const handlePlay = (lecture) => {
        setSelectedLecture(lecture);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background relative overflow-hidden">
            {/* Background Decoration */}
            <IslamicPattern color="currentColor" className="text-primary/5 fixed top-0 right-0 w-64 h-64 -translate-y-1/2 translate-x-1/2 z-0" opacity={0.03} />
            <IslamicPattern color="currentColor" className="text-primary/5 fixed bottom-0 left-0 w-96 h-96 translate-y-1/2 -translate-x-1/2 z-0" opacity={0.03} />

            <Hero
                title={t('education.dersProgram')}
                description={activeTab === 'schedule' ? t('education.schedule.subtitle') : t('ders.description')}
                backgroundImage={mesjidBg}
            />

            <section className="container container-padding py-8 md:py-12 relative z-10">
                {/* View Mode Toggle */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex p-1bg-white dark:bg-card rounded-2xl shadow-soft border border-border/50">
                        <button
                            onClick={() => setActiveTab('schedule')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'schedule'
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
                                }`}
                        >
                            <FiCalendar className="w-4 h-4" />
                            {t('education.weeklySchedule')}
                        </button>
                        <button
                            onClick={() => setActiveTab('archive')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'archive'
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
                                }`}
                        >
                            <FiBookOpen className="w-4 h-4" />
                            {t('ders.title')}
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'schedule' ? (
                        <motion.div
                            key="schedule-tab"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-24">
                                    <LoadingSpinner size="lg" />
                                    <p className="mt-4 text-muted-foreground animate-pulse">{t('common.loading')}</p>
                                </div>
                            ) : (
                                <div className="max-w-6xl mx-auto">
                                    <div className="space-y-12">
                                        {/* Group by Day Logic */}
                                        {dayKeys.map((day) => {
                                            const dayDers = allDers.filter(d =>
                                                d.day_of_week === day.id ||
                                                d.day === day.id ||
                                                (d.schedule && d.schedule.toLowerCase().includes(t(`education.days.${day.key}`).toLowerCase())) ||
                                                (d.schedule && d.schedule.toLowerCase().includes(day.key))
                                            );

                                            if (dayDers.length === 0) return null;

                                            return (
                                                <div key={day.id} className="relative">
                                                    {/* Day Header */}
                                                    <div className="flex items-center gap-4 mb-6 sticky top-4 z-10">
                                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                                                        <div className="px-6 py-2 bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-full shadow-sm border border-primary/10">
                                                            <h2 className="text-xl md:text-2xl font-black text-primary uppercase tracking-widest">
                                                                {t(`education.days.${day.key}`)}
                                                            </h2>
                                                        </div>
                                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                                                    </div>

                                                    {/* Grid of Classes */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {dayDers.map((ders) => (
                                                            <Card key={ders.id} className="group relative overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-card">
                                                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>

                                                                <CardContent className="p-6 md:p-8">
                                                                    <div className="flex flex-col h-full justify-between gap-6">
                                                                        {/* Top Section */}
                                                                        <div className="space-y-4">
                                                                            <div className="flex justify-between items-start gap-4">
                                                                                <h3 className="text-xl md:text-2xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                                                                                    {ders.title || ders.name}
                                                                                </h3>
                                                                                <div className="flex-shrink-0 px-3 py-1 bg-primary/5 rounded-lg border border-primary/10">
                                                                                    <span className="text-sm font-bold text-primary">
                                                                                        {ders.time || (ders.schedule && ders.schedule.split(',').pop().trim()) || 'Evening'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>

                                                                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                                                                                {ders.description || t('education.dersProgramDesc')}
                                                                            </p>
                                                                        </div>

                                                                        {/* Bottom Info */}
                                                                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                                                            <div className="flex items-center gap-2 text-sm text-foreground/70">
                                                                                <FiUser className="w-4 h-4 text-primary/70" />
                                                                                <span className="font-medium">{ders.instructor_name || ders.instructor || 'Scholar'}</span>
                                                                            </div>

                                                                            <div className="flex items-center gap-2 text-sm text-foreground/70">
                                                                                <FiMapPin className="w-4 h-4 text-primary/70" />
                                                                                <span>{ders.location || 'Prayer Hall'}</span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Enrollment / Status Button */}
                                                                        {!ders.is_timetable && (
                                                                            <div className="pt-2">
                                                                                {isEnrolled(ders.id) ? (
                                                                                    <div className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-green-600 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
                                                                                        <FiCheckCircle className="w-4 h-4" />
                                                                                        {t('education.alreadyEnrolled')}
                                                                                    </div>
                                                                                ) : (
                                                                                    <Button
                                                                                        size="sm"
                                                                                        variant="ghost"
                                                                                        className="w-full bg-primary/5 hover:bg-primary hover:text-white text-primary font-bold rounded-xl transition-all duration-300"
                                                                                        onClick={() => handleEnroll(ders.id)}
                                                                                        disabled={enrolling === ders.id}
                                                                                    >
                                                                                        {enrolling === ders.id ? t('education.enrolling') : t('education.enrollNow')}
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* No Results Fallback */}
                                        {allDers.length === 0 && (
                                            <div className="text-center py-24 bg-white/50 dark:bg-card/50 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-border/50 shadow-inner">
                                                <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <FiCalendar className="w-12 h-12 text-muted-foreground/30" />
                                                </div>
                                                <h3 className="text-2xl font-bold mb-3">{t('education.schedule.noClasses')}</h3>
                                                <p className="text-muted-foreground max-w-sm mx-auto">
                                                    {t('services.checkBackSoon')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="archive-tab"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Search and Filter */}
                            <div className="bg-white dark:bg-card rounded-2xl shadow-soft border border-border/50 p-6 mb-10 max-w-5xl mx-auto">
                                <div className="flex flex-col md:flex-row gap-5">
                                    <div className="flex-1 relative">
                                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder={t('ders.searchLectures')}
                                            className="w-full pl-12 pr-4 py-3.5 border border-border bg-gray-50/50 dark:bg-background/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground font-medium"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full md:w-72 relative">
                                        <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                        <select
                                            className="w-full pl-11 pr-10 py-3.5 border border-border bg-gray-50/50 dark:bg-background/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all text-foreground font-medium cursor-pointer"
                                            value={selectedSubject}
                                            onChange={(e) => setSelectedSubject(e.target.value)}
                                        >
                                            {subjects.map(subject => (
                                                <option key={subject.value} value={subject.value}>
                                                    {subject.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Archive Content Grid */}
                            {archiveLoading ? (
                                <div className="flex flex-col items-center justify-center py-24">
                                    <LoadingSpinner size="lg" />
                                    <p className="mt-4 text-muted-foreground animate-pulse">{t('common.loading')}</p>
                                </div>
                            ) : lectures.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {lectures.map((lecture, index) => (
                                        <motion.div
                                            key={lecture.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <LectureCard
                                                lecture={lecture}
                                                onPlay={handlePlay}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-24 bg-white/50 dark:bg-card/50 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-border/50 shadow-inner max-w-2xl mx-auto">
                                    <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FiBookOpen className="w-12 h-12 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">{t('ders.noLecturesFound')}</h3>
                                    <p className="text-muted-foreground">
                                        {t('ders.tryAdjusting')}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* CTA Section - Only show when on schedule tab */}
            {activeTab === 'schedule' && (
                <section className="bg-primary py-20 text-white text-center rounded-t-[4rem] mt-16 relative z-10 shadow-2xl overflow-hidden">
                    <IslamicPattern color="white" className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" />
                    <div className="container px-4 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">{t('education.browseCourses')}</h2>
                            <p className="text-white/80 mb-10 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
                                {t('education.enhanceKnowledge')}
                            </p>
                            <div className="flex flex-wrap justify-center gap-5">
                                <Button
                                    size="lg"
                                    className="px-10 py-7 bg-white text-primary font-black rounded-3xl hover:bg-accent hover:text-primary-foreground hover:scale-105 transition-all duration-300 shadow-xl"
                                    asChild
                                >
                                    <Link to="/education">
                                        {t('education.enrollNow')}
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="px-10 py-7 bg-white/10 backdrop-blur-lg border-2 border-white/30 text-white font-black rounded-3xl hover:bg-white/20 hover:scale-105 transition-all duration-300"
                                    asChild
                                >
                                    <Link to="/education">
                                        {t('services.viewAll')}
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Video Modal ported from Ders.jsx */}
            <AnimatePresence>
                {selectedLecture && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
                        onClick={() => setSelectedLecture(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="relative w-full max-w-5xl bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video flex items-center justify-center bg-zinc-900 border border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-6 right-6 z-10 p-2.5 bg-black/60 text-white rounded-full hover:bg-primary transition-all duration-300 hover:scale-110 group"
                                onClick={() => setSelectedLecture(null)}
                            >
                                <FiX className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                            </button>

                            {/* Video Player (YouTube, Telegram, etc.) */}
                            {selectedLecture.video_url ? (
                                <iframe
                                    src={getEmbedUrl(selectedLecture.video_url)}
                                    title={selectedLecture.title}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    frameBorder="0"
                                ></iframe>
                            ) : selectedLecture.video_file ? (
                                /* Local Video */
                                <video controls autoPlay crossOrigin="anonymous" className="w-full h-full object-contain">
                                    <source src={getFullMediaUrl(selectedLecture.video_file)} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ) : selectedLecture.audio_file ? (
                                /* Audio with Thumbnail */
                                <div className="w-full h-full flex flex-col items-center justify-center relative">
                                    {selectedLecture.thumbnail && (
                                        <div className="absolute inset-0 z-0">
                                            <img
                                                src={getFullMediaUrl(selectedLecture.thumbnail)}
                                                alt={selectedLecture.title}
                                                crossOrigin="anonymous"
                                                className="w-full h-full object-cover opacity-30 blur-xl scale-110"
                                            />
                                        </div>
                                    )}
                                    <div className="z-10 bg-black/40 p-10 rounded-[2.5rem] backdrop-blur-xl flex flex-col items-center border border-white/10 shadow-emerald-500/5 shadow-2xl">
                                        {selectedLecture.thumbnail && (
                                            <div className="relative mb-8">
                                                <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl animate-pulse"></div>
                                                <img
                                                    src={getFullMediaUrl(selectedLecture.thumbnail)}
                                                    alt={selectedLecture.title}
                                                    crossOrigin="anonymous"
                                                    className="w-56 h-56 object-cover rounded-2xl shadow-2xl relative z-10 border-2 border-white/10"
                                                />
                                            </div>
                                        )}
                                        <h2 className="text-white text-2xl font-black mb-6 text-center tracking-tight">{selectedLecture.title}</h2>
                                        <div className="w-full md:w-[400px]">
                                            <audio controls autoPlay crossOrigin="anonymous" className="w-full custom-audio-player">
                                                <source src={getFullMediaUrl(selectedLecture.audio_file)} />
                                                Your browser does not support the audio element.
                                            </audio>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-white flex flex-col items-center gap-4">
                                    <FiLoader className="w-12 h-12 text-primary animate-spin" />
                                    <p className="text-lg font-bold">{t('ders.mediaNotFound')}</p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Ders;
