import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiCalendar,
  FiShare2,
  FiClock,
  FiHeart
} from 'react-icons/fi';
import Hero from '@/components/ui/Hero';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiService } from '@/lib/apiService';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui';
import eventBg from '@/assets/mesjid2.jpg';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAnnouncements();
        const allNews = response.data || [];
        const foundNews = allNews.find(item => item.id.toString() === id);
        
        if (!foundNews) {
          toast.error('Announcement not found');
          navigate('/news');
          return;
        }

        setNews(foundNews);
        
        // Get related news (other announcements)
        const related = allNews
          .filter(item => item.id.toString() !== id)
          .slice(0, 3);
        setRelatedNews(related);
      } catch (err) {
        console.error('Failed to fetch news:', err);
        toast.error('Failed to load announcement');
        navigate('/news');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNews();
    }
  }, [id, navigate]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.excerpt || news.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading announcement..." />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Announcement Not Found</h1>
        <Link to="/news">
          <Button>Back to News</Button>
        </Link>
      </div>
    );
  }

  const newsDate = news.date || news.created_at;
  const formattedDate = newsDate ? format(parseISO(newsDate), 'EEEE, MMMM d, yyyy') : '';

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6"
            >
              <Link to="/news">
                <Button variant="ghost" size="sm">
                  <FiArrowLeft className="mr-2" />
                  Back to News
                </Button>
              </Link>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="primary">
                  <FiCalendar className="w-3 h-3 mr-1" />
                  {formattedDate}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {news.title}
              </h1>
              {news.excerpt && (
                <p className="text-xl text-muted-foreground">
                  {news.excerpt}
                </p>
              )}
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6 md:p-8">
                  <div className="prose max-w-none">
                    <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {news.content || news.description || 'No content available.'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

              {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 flex flex-wrap gap-4"
            >
              <Button
                onClick={handleShare}
                variant="outline"
                size="lg"
              >
                <FiShare2 className="mr-2" />
                Share Announcement
              </Button>
              
              {/* Fundraising Button - Only show if donation_cause exists */}
              {(news.donation_cause || news.donation_cause_details) && (
                <Button
                  asChild
                  variant="primary"
                  size="lg"
                  className="shadow-lg"
                >
                  <Link to={`/donations?cause=${news.donation_cause || news.donation_cause_details?.id}`}>
                    <FiHeart className="mr-2" />
                    Support Fundraising
                  </Link>
                </Button>
              )}
            </motion.div>

            {/* Related News */}
            {relatedNews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-12"
              >
                <h2 className="text-2xl font-bold mb-6">Related Announcements</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedNews.map((item) => (
                    <Link
                      key={item.id}
                      to={`/news/${item.id}`}
                      className="block"
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-2">
                            {item.date || item.created_at
                              ? format(parseISO(item.date || item.created_at), 'MMM d, yyyy')
                              : ''}
                          </div>
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {item.excerpt || item.content || item.description}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
