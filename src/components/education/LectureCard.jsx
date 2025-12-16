import React, { useState } from 'react';
import { FiPlay, FiCalendar, FiUser, FiBookOpen, FiDownload, FiShare2, FiX } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'sonner';

const LectureCard = ({ lecture, onPlay }) => {
    const [showShareMenu, setShowShareMenu] = useState(false);

    const getDownloadUrl = () => {
        // Priority: video_file > audio_file > video_url
        if (lecture.video_file) return lecture.video_file;
        if (lecture.audio_file) return lecture.audio_file;
        if (lecture.video_url) return lecture.video_url;
        return null;
    };

    const handleDownload = async () => {
        const downloadUrl = getDownloadUrl();

        if (!downloadUrl) {
            toast.error('No downloadable media available');
            return;
        }

        try {
            // For YouTube URLs, show message
            if (downloadUrl.includes('youtube.com') || downloadUrl.includes('youtu.be')) {
                toast.info('YouTube videos cannot be downloaded directly. Please use the share button to share the link.');
                return;
            }

            // For local files, trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${lecture.title}.${downloadUrl.split('.').pop()}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Download started');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download');
        }
    };

    const getShareUrl = () => {
        // Create shareable URL - in production this would be the actual lecture page URL
        const baseUrl = window.location.origin;
        return `${baseUrl}/ders?lecture=${lecture.id}`;
    };

    const handleShare = (platform) => {
        const shareUrl = getShareUrl();
        const text = `Check out this lecture: ${lecture.title}`;

        let url = '';

        switch (platform) {
            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
                break;
            case 'telegram':
                url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(shareUrl);
                toast.success('Link copied to clipboard!');
                setShowShareMenu(false);
                return;
            default:
                return;
        }

        if (url) {
            window.open(url, '_blank', 'width=600,height=400');
            setShowShareMenu(false);
        }
    };

    return (
        <div className="bg-white dark:bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 dark:border-border flex flex-col h-full">
            {/* Thumbnail / Video Placeholder */}
            <div className="relative h-48 bg-gray-900 group cursor-pointer" onClick={() => onPlay(lecture)}>
                {lecture.thumbnail ? (
                    <img
                        src={lecture.thumbnail}
                        alt={lecture.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/10">
                        <FiBookOpen className="w-16 h-16 text-emerald-600/20" />
                    </div>
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <FiPlay className="w-5 h-5 text-emerald-600 ml-1" fill="currentColor" />
                    </div>
                </div>

                {/* Type Badge */}
                <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-md font-medium capitalize">
                        {lecture.subject_display || lecture.subject}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDownload();
                        }}
                        className="p-2 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-black/80 transition-colors"
                        title="Download"
                    >
                        <FiDownload className="w-4 h-4" />
                    </button>
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowShareMenu(!showShareMenu);
                            }}
                            className="p-2 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-black/80 transition-colors"
                            title="Share"
                        >
                            <FiShare2 className="w-4 h-4" />
                        </button>

                        {/* Share Menu */}
                        {showShareMenu && (
                            <div
                                className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 min-w-[160px] z-50"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleShare('whatsapp');
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm flex items-center gap-2 text-gray-700 dark:text-gray-200"
                                >
                                    <span className="text-green-600">📱</span> WhatsApp
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleShare('telegram');
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm flex items-center gap-2 text-gray-700 dark:text-gray-200"
                                >
                                    <span className="text-blue-500">✈️</span> Telegram
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleShare('twitter');
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm flex items-center gap-2 text-gray-700 dark:text-gray-200"
                                >
                                    <span className="text-sky-500">🐦</span> Twitter
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleShare('facebook');
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm flex items-center gap-2 text-gray-700 dark:text-gray-200"
                                >
                                    <span className="text-blue-600">👍</span> Facebook
                                </button>
                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleShare('copy');
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm flex items-center gap-2 text-gray-700 dark:text-gray-200"
                                >
                                    <span>🔗</span> Copy Link
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-foreground mb-2 line-clamp-2 hover:text-emerald-600 transition-colors cursor-pointer" onClick={() => onPlay(lecture)}>
                    {lecture.title}
                </h3>

                <p className="text-gray-500 dark:text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
                    {lecture.description}
                </p>

                <div className="border-t border-gray-100 dark:border-border pt-4 mt-auto space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-muted-foreground">
                        <FiUser className="w-4 h-4 mr-2 text-emerald-500" />
                        <span className="font-medium">{lecture.instructor_name}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-muted-foreground">
                        <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{format(new Date(lecture.date_recorded), 'MMMM d, yyyy')}</span>
                    </div>
                </div>
            </div>

            {/* Click outside to close share menu */}
            {showShareMenu && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowShareMenu(false);
                    }}
                />
            )}
        </div>
    );
};

export default LectureCard;
