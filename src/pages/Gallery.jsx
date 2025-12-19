import { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaVideo, FaImages, FaYoutube } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '@/lib/apiService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import mosque1 from '@/assets/background.png';
import mosque2 from '@/assets/logo.png';
import { API_BASE_URL } from '@/config/constants';

const Gallery = () => {
  const { t } = useTranslation();
  
  // Categories for filtering
  const categories = [
    { id: 'all', name: t('gallery.allMedia') },
    { id: 'prayer', name: t('prayer.prayerTimes') },
    { id: 'events', name: t('events.title') },
    { id: 'education', name: t('education.title') },
    { id: 'lectures', name: t('ders.title') },
    { id: 'mosque', name: t('gallery.mosque') },
  ];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [error, setError] = useState(null);

  // Fetch media from API
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch events from the events API
        const response = await fetch(`${API_BASE_URL}/api/v1/events/`);

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const result = await response.json();
        const events = result.data || [];

        // Filter events that have images and map to gallery format
        const eventsWithImages = events
          .filter(event => event.image)
          .map(event => ({
            id: event.id,
            title: event.title,
            description: event.description,
            type: 'image',
            url: event.image,
            image_url: event.image,
            date: event.date,
            created_at: event.created_at,
            category: event.status === 'upcoming' ? 'events' :
              event.status === 'ongoing' ? 'events' :
                event.status === 'past' ? 'events' : 'mosque'
          }));

        setMediaItems(eventsWithImages);
      } catch (err) {
        console.error('Failed to fetch media:', err);
        setError('Unable to load gallery images. Please try again later.');
        setMediaItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, []);

  // Filter media based on search term and selected category
  const filteredMedia = mediaItems.filter(media => {
    const matchesSearch = (media.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || (media.category || '').toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });



  // Handle media click to open lightbox
  const handleMediaClick = (media) => {
    setSelectedMedia(media);
    document.body.style.overflow = 'hidden';
  };

  // Close lightbox
  const closeLightbox = () => {
    setSelectedMedia(null);
    document.body.style.overflow = 'auto';
  };

  // Handle keyboard navigation in lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    };

    if (selectedMedia) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedMedia]);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-deep to-brand-green text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Media Gallery</h1>
          <p className="text-xl max-w-2xl mx-auto">Explore photos and videos from our events, prayers, and community activities.</p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search gallery..."
                className="w-full py-3 px-4 pl-12 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />

              {/* Mobile Filter Button */}
              <button
                className="md:hidden absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <FaFilter className="text-xl" />
              </button>
            </div>

            {/* Category Filter - Desktop */}
            <div className="hidden md:flex flex-wrap justify-center gap-2 mt-4">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.id
                    ? 'bg-white text-brand-deep'
                    : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Category Filter - Mobile */}
            {isFilterOpen && (
              <div className="md:hidden mt-4 p-4 bg-card rounded-lg shadow-lg border border-border">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-foreground">{t('gallery.filter')}</h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <MdClose className="text-xl" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setIsFilterOpen(false);
                      }}
                      className={`px-3 py-2 rounded-md text-sm text-left transition-colors ${selectedCategory === category.id
                        ? 'bg-brand-green text-white'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-gray-200 rounded-lg aspect-square animate-pulse"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                Retry
              </button>
            </div>
          ) : filteredMedia.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMedia.map((media) => (
                <motion.div
                  key={media.id}
                  className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                  onClick={() => handleMediaClick(media)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {(media.type || 'image') === 'image' ? (
                    <img
                      src={media.url || media.image_url || 'https://via.placeholder.com/400x400?text=Image+Not+Found'}
                      alt={media.title || 'Gallery Image'}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                      }}
                    />
                  ) : (
                    <div className="relative">
                      <img
                        src={media.thumbnail || media.thumbnail_url || 'https://via.placeholder.com/400x400?text=Video+Thumbnail'}
                        alt={media.title || 'Video Thumbnail'}
                        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x400?text=Video+Thumbnail';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FaYoutube className="text-red-600 text-3xl" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <h3 className="text-white font-medium text-lg">{media.title || 'Untitled'}</h3>
                    <div className="flex items-center text-white/80 text-sm mt-1">
                      {(media.type || 'image') === 'video' ? (
                        <>
                          <FaVideo className="mr-1.5" />
                          <span>Video</span>
                        </>
                      ) : (
                        <>
                          <FaImages className="mr-1.5" />
                          <span>Photo</span>
                        </>
                      )}
                      <span className="mx-2">•</span>
                      <span>{new Date(media.date || media.created_at || new Date()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold text-foreground mb-2">{t('gallery.noMediaFound')}</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Event images will appear here once they are uploaded'}
              </p>
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="btn btn-md btn-primary"
                >
                  {t('common.clear')}
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Mosque & College Photos Section (assets + mock) */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Mosque & College Photos</h2>
            <p className="text-sm text-muted-foreground">A curated collection from our facilities and campus.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { id: 'asset-1', url: mosque1, title: 'Main Hall' },
              { id: 'asset-2', url: mosque2, title: 'Community Logo' },
            ].map(img => (
              <motion.div key={img.id} className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300" onClick={() => handleMediaClick({ id: img.id, type: 'image', url: img.url, title: img.title, date: new Date().toISOString().slice(0, 10), category: 'mosque' })} whileHover={{ scale: 1.02 }}>
                <img src={img.url} alt={img.title} className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <h3 className="text-white text-sm font-medium">{img.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button
              className="absolute top-4 right-4 text-white text-3xl z-10"
              onClick={closeLightbox}
              aria-label="Close"
            >
              <MdClose />
            </button>

            <div
              className="relative w-full max-w-4xl max-h-[90vh] overflow-auto"
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card rounded-lg overflow-hidden border border-border"
              >
                {(selectedMedia.type || 'image') === 'image' ? (
                  <img
                    src={selectedMedia.url || selectedMedia.image_url || 'https://via.placeholder.com/800x600?text=Image+Not+Found'}
                    alt={selectedMedia.title || 'Gallery Image'}
                    className="w-full h-auto max-h-[70vh] object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                    }}
                  />
                ) : (
                  <div className="aspect-video w-full">
                    <iframe
                      src={selectedMedia.url || selectedMedia.video_url}
                      title={selectedMedia.title || 'Video'}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">{selectedMedia.title || 'Untitled'}</h3>
                  <div className="flex items-center text-muted-foreground text-sm mb-4">
                    {(selectedMedia.type || 'image') === 'video' ? (
                      <>
                        <FaVideo className="mr-1.5" />
                        <span>Video</span>
                      </>
                    ) : (
                      <>
                        <FaImages className="mr-1.5" />
                        <span>Photo</span>
                      </>
                    )}
                    <span className="mx-2">•</span>
                    <span>{new Date(selectedMedia.date || selectedMedia.created_at || new Date()).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 bg-muted text-foreground text-xs font-medium rounded-full">
                      {categories.find(cat => cat.id === (selectedMedia.category || '').toLowerCase())?.name || selectedMedia.category || 'Uncategorized'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call to Action */}
      <section className="bg-brand-deep text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Share Your Moments</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Have photos or videos from our events? Share them with us to be featured in our gallery!
          </p>
          <button className="btn btn-lg btn-primary">
            Submit Media
          </button>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
