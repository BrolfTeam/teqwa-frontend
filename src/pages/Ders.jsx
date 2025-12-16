import { useState, useEffect } from 'react';
import Hero from '@/components/ui/Hero';
import background from '@/assets/background.png';
import { lectureService } from '@/services/lecture';
import LectureCard from '@/components/education/LectureCard';
import { FiSearch, FiFilter, FiLoader, FiX } from 'react-icons/fi';

const Ders = () => {
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedLecture, setSelectedLecture] = useState(null);

    const subjects = [
        { value: '', label: 'All Subjects' },
        { value: 'quran_recitation', label: 'Quran Recitation' },
        { value: 'tafseer', label: 'Tafseer' },
        { value: 'hadith', label: 'Hadith' },
        { value: 'fiqh', label: 'Fiqh' },
        { value: 'seerah', label: 'Seerah' },
        { value: 'aqidah', label: 'Aqidah' },
        { value: 'general', label: 'General' },
    ];

    const fetchLectures = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (selectedSubject) params.subject = selectedSubject;

            const response = await lectureService.getLectures(params);
            setLectures(response.data || []);
        } catch (error) {
            console.error('Failed to fetch lectures:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLectures();
        }, 300); // Debounce search

        return () => clearTimeout(timer);
    }, [search, selectedSubject]);

    const getEmbedUrl = (url) => {
        if (!url) return '';
        try {
            // Handle already embedded URLs
            if (url.includes('/embed/')) return url;

            // Handle youtu.be short URLs
            if (url.includes('youtu.be')) {
                const id = url.split('youtu.be/')[1].split('?')[0];
                return `https://www.youtube.com/embed/${id}`;
            }

            // Handle standard watch URLs
            if (url.includes('watch?v=')) {
                const id = url.split('watch?v=')[1].split('&')[0];
                return `https://www.youtube.com/embed/${id}`;
            }

            return url;
        } catch (e) {
            console.error('Error parsing video URL:', e);
            return url;
        }
    };

    const handlePlay = (lecture) => {
        setSelectedLecture(lecture);
    };

    return (
        <div className="min-h-screen bg-background font-sans">
            <Hero
                title="Ders & Lecture Archive"
                description="Explore our collection of Islamic lectures, Tafseer, and educational recordings."
                backgroundImage={background}
            />

            <div className="container container-padding py-8">
                {/* Search and Filter */}
                <div className="bg-card rounded-xl shadow-sm border border-border/50 p-4 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search lectures by title or description..."
                                className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-64 relative">
                            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <select
                                className="w-full pl-10 pr-8 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all text-foreground"
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                            >
                                {subjects.map(subject => (
                                    <option key={subject.value} value={subject.value}>
                                        {subject.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <FiLoader className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : lectures.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {lectures.map((lecture) => (
                            <LectureCard
                                key={lecture.id}
                                lecture={lecture}
                                onPlay={handlePlay}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
                        <h3 className="text-lg font-medium text-foreground mb-1">No lectures found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* Video Modal */}
            {selectedLecture && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedLecture(null)}>
                    <div className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl aspect-video flex items-center justify-center bg-zinc-900" onClick={e => e.stopPropagation()}>
                        <button
                            className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors"
                            onClick={() => setSelectedLecture(null)}
                        >
                            <FiX className="w-6 h-6" />
                        </button>

                        {/* YouTube Video */}
                        {selectedLecture.video_url ? (
                            <iframe
                                src={getEmbedUrl(selectedLecture.video_url)}
                                title={selectedLecture.title}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : selectedLecture.video_file ? (
                            /* Local Video */
                            <video controls autoPlay className="w-full h-full object-contain">
                                <source src={selectedLecture.video_file} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        ) : selectedLecture.audio_file ? (
                            /* Audio with Thumbnail */
                            <div className="w-full h-full flex flex-col items-center justify-center relative">
                                {selectedLecture.thumbnail && (
                                    <div className="absolute inset-0 z-0">
                                        <img
                                            src={selectedLecture.thumbnail}
                                            alt={selectedLecture.title}
                                            className="w-full h-full object-cover opacity-50 blur-sm"
                                        />
                                    </div>
                                )}
                                <div className="z-10 bg-black/40 p-8 rounded-2xl backdrop-blur-md flex flex-col items-center">
                                    {selectedLecture.thumbnail && (
                                        <img
                                            src={selectedLecture.thumbnail}
                                            alt={selectedLecture.title}
                                            className="w-48 h-48 object-cover rounded-lg shadow-lg mb-6"
                                        />
                                    )}
                                    <h2 className="text-white text-xl font-bold mb-4 text-center">{selectedLecture.title}</h2>
                                    <audio controls autoPlay className="w-full md:w-96">
                                        <source src={selectedLecture.audio_file} />
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            </div>
                        ) : (
                            <div className="text-white">Media not found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ders;
