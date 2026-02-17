import { useState, useEffect, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isToday, isThisWeek, isThisMonth, subDays } from 'date-fns';
import {
  FiCalendar,
  FiClock,
  FiSearch,
  FiFilter,
  FiX,
  FiUser,
  FiTag,
  FiStar,
  FiTrendingUp,
  FiChevronRight,
  FiBell,
  FiHeart
} from 'react-icons/fi';
import Hero from '@/components/ui/Hero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui';
import EmptyState from '@/components/ui/EmptyState';
import IslamicPattern from '@/components/ui/IslamicPattern';
import { apiService } from '@/lib/apiService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import mesjidBg from '@/assets/mesjid2.jpg';

const News = memo(() => {
  const { t } = useTranslation();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'trending'

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        console.log('[News] Fetching announcements...');
        const response = await apiService.getAnnouncements();
        console.log('[News] API Response:', response);
        const data = response.data || [];
        console.log('[News] Announcements count:', data.length);
        setNews(data);
      } catch (err) {
        console.error('[News] Failed to fetch news:', err);
        toast.error('Failed to load news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Extract all unique tags from news
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    news.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  }, [news]);

  // Filter and sort news
  const filteredNews = useMemo(() => {
    let filtered = [...news];

    // Status Filter (Published only - redundant if API already filters, but good for safety)
    filtered = filtered.filter(item => item.published !== false);

    // Search Filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(query) ||
        item.content?.toLowerCase().includes(query) ||
        item.excerpt?.toLowerCase().includes(query)
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item => {
        if (!item.tags || !Array.isArray(item.tags)) return false;
        return selectedTags.some(tag => item.tags.includes(tag));
      });
    }

    // Featured Filter
    if (showFeaturedOnly) {
      filtered = filtered.filter(item => item.featured);
    }

    // Sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at || 0);
      const dateB = new Date(b.created_at || b.updated_at || 0);

      switch (sortBy) {
        case 'oldest':
          return dateA - dateB;
        case 'trending':
          // Prioritize featured and recent items
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return dateB - dateA;
        case 'newest':
        default:
          return dateB - dateA;
      }
    });

    return filtered;
  }, [news, searchTerm, selectedTags, sortBy]);

  // Separate featured and regular news
  const featuredNews = useMemo(() => {
    // Only show separate featured section if not filtering for featured only
    if (showFeaturedOnly) return [];
    return filteredNews.filter(item => item.featured).slice(0, 3);
  }, [filteredNews, showFeaturedOnly]);

  const regularNews = useMemo(() => {
    // If showFeaturedOnly is active, show all filtered items in the main grid
    if (showFeaturedOnly) return filteredNews;
    // Otherwise, exclude the ones already shown in the featured section
    const featuredIds = new Set(featuredNews.map(item => item.id));
    return filteredNews.filter(item => !featuredIds.has(item.id));
  }, [filteredNews, featuredNews, showFeaturedOnly]);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setShowFeaturedOnly(false);
    setSortBy('newest');
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = parseISO(dateString);
    const now = new Date();

    if (isToday(date)) return t('news.today');
    if (isThisWeek(date)) return format(date, 'EEEE');
    if (isThisMonth(date)) return format(date, 'MMM d');
    return format(date, 'MMM d, yyyy');
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return '';
    return format(parseISO(dateString), 'EEEE, MMMM d, yyyy');
  };

  const getExcerpt = (content, maxLength = 150) => {
    if (!content) return '';
    const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <Hero
        title={t('news.title')}
        titleHighlight={t('news.latestUpdates')}
        align="center"
        description={t('news.description')}
        backgroundImage={mesjidBg}
      />

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-primary/20 shadow-lg">
            <CardContent className="p-6">
              {/* Search Bar */}
              <div className="relative mb-6">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('news.searchNews')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Filters Row */}
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Tags Filter */}
                {allTags.length > 0 && (
                  <div className="flex-1 flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2 self-center">
                      <FiTag className="w-4 h-4" />
                      {t('news.filter')}:
                    </span>
                    {allTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'primary' : 'outline'}
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Sort and Featured Toggle */}
                <div className="flex flex-wrap gap-3 items-center">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="newest">{t('news.newest')}</option>
                    <option value="oldest">{t('news.oldest')}</option>
                    <option value="trending">{t('news.trending')}</option>
                  </select>

                  <Button
                    variant={showFeaturedOnly ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                  >
                    <FiStar className="w-4 h-4 mr-2" />
                    {t('news.featured')}
                  </Button>

                  {(searchTerm || selectedTags.length > 0 || showFeaturedOnly) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                    >
                      <FiX className="w-4 h-4 mr-2" />
                      {t('news.clearFilters')}
                    </Button>
                  )}
                </div>
              </div>

              {/* Active Filters Display */}
              {(searchTerm || selectedTags.length > 0) && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{t('news.activeFilters')}</span>
                    {searchTerm && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {t('news.search')}: "{searchTerm}"
                        <button onClick={() => setSearchTerm('')}>
                          <FiX className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button onClick={() => toggleTag(tag)}>
                          <FiX className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <p className="text-sm text-muted-foreground">
            {t('news.showingAnnouncements', { count: filteredNews.length, total: news.length })}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" text={t('news.loadingNews')} />
          </div>
        ) : filteredNews.length === 0 ? (
          <EmptyState
            icon={FiBell}
            title={t('news.noNewsFound')}
            description={searchTerm || selectedTags.length > 0 || showFeaturedOnly
              ? t('news.noNewsFound')
              : t('news.noNewsFound')}
            action={
              (searchTerm || selectedTags.length > 0 || showFeaturedOnly) ? (
                <Button onClick={clearFilters} variant="primary">
                  {t('news.clearFilters')}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Featured News Section */}
            {featuredNews.length > 0 && !showFeaturedOnly && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <div className="flex items-center gap-3 mb-6">
                  <FiTrendingUp className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t('news.featured')} {t('news.title')}</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredNews.map((item, index) => (
                    <NewsCard key={item.id} item={item} featured index={index} />
                  ))}
                </div>
              </motion.section>
            )}

            {/* Regular News Grid */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {featuredNews.length > 0 && !showFeaturedOnly && (
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">{t('news.allNews')}</h2>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {regularNews.map((item, index) => (
                    <NewsCard key={item.id} item={item} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          </>
        )}
      </div>
    </div>
  );
});

// News Card Component
const NewsCard = memo(({ item, featured = false, index = 0 }) => {
  const { t } = useTranslation();
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = parseISO(dateString);
    if (isToday(date)) return t('news.today');
    if (isThisWeek(date)) return format(date, 'EEEE');
    if (isThisMonth(date)) return format(date, 'MMM d');
    return format(date, 'MMM d, yyyy');
  };

  const getExcerpt = (content, maxLength = 150) => {
    if (!content) return '';
    const text = content.replace(/<[^>]*>/g, '');
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const hasFundraising = item.donation_cause || item.donation_cause_details;
  const causeId = item.donation_cause || item.donation_cause_details?.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`h-full group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50 ${featured ? 'border-primary/30 bg-gradient-to-br from-primary/5 to-transparent' : ''}`}>
        <Link to={`/news/${item.id}`} className="block">
          <div className="relative overflow-hidden">
            <IslamicPattern className="absolute inset-0 opacity-[0.02] pointer-events-none" />
            <CardHeader className="relative">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex flex-wrap gap-2">
                  {featured && (
                    <Badge variant="primary" className="flex items-center gap-1">
                      <FiStar className="w-3 h-3" />
                      {t('news.featured')}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    <FiClock className="w-3 h-3 mr-1" />
                    {getTimeAgo(item.created_at || item.updated_at)}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {item.title}
              </CardTitle>
            </CardHeader>
          </div>
        </Link>
        <CardContent className="relative">
          {/* Tags */}
          {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {item.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <FiTag className="w-2.5 h-2.5 mr-1" />
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Excerpt */}
          <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
            {getExcerpt(item.content || item.description)}
          </p>

          {/* Fundraising Button - Only show if donation_cause exists */}
          {hasFundraising && (
            <div className="mb-4">
              <Link
                to={`/donations?cause=${causeId}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full group/btn"
                >
                  <FiHeart className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                  {t('news.supportFundraising')}
                </Button>
              </Link>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FiUser className="w-4 h-4" />
              <span>{item.author_name || 'Admin'}</span>
            </div>
            <Link
              to={`/news/${item.id}`}
              className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all"
            >
              <span className="text-sm font-medium">{t('news.readMore')}</span>
              <FiChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

NewsCard.displayName = 'NewsCard';

News.displayName = 'News';
export default News;
