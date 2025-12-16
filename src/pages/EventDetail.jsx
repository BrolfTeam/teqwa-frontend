import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiMapPin,
  FiClock,
  FiUsers,
  FiArrowLeft,
  FiShare2,
  FiCheckCircle
} from 'react-icons/fi';
import Hero from '@/components/ui/Hero';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { dataService } from '@/lib/dataService';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import eventBg from '@/assets/mesjid2.jpg';
import { LoadingSpinner } from '@/components/ui';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventData = await dataService.getEvent(id);
        // Handle API response format (data might be in response.data or response itself)
        const eventResponse = eventData?.data || eventData;
        const normalizedEvent = dataService.normalizeEvent(eventResponse);
        setEvent(normalizedEvent);
        
        // Check if user is registered (if authenticated)
        if (isAuthenticated && normalizedEvent.registrationRequired) {
          // This would need to check registration status via API
          // For now, we'll handle it when user tries to register
        }
      } catch (err) {
        console.error('Failed to fetch event:', err);
        toast.error('Failed to load event details');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id, isAuthenticated, navigate]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to register for events');
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    if (!event.registrationRequired) {
      toast.info('This event does not require registration');
      return;
    }

    try {
      setRegistering(true);
      await dataService.registerForEvent(id);
      setRegistered(true);
      toast.success('Successfully registered for the event!');
    } catch (err) {
      console.error('Registration failed:', err);
      toast.error(err.message || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
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
        <LoadingSpinner size="lg" text="Loading event..." />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <Link to="/events">
          <Button>Back to Events</Button>
        </Link>
      </div>
    );
  }

  const isEventFull = event.registrationRequired && event.registeredCount >= event.capacity;
  const spotsLeft = event.registrationRequired ? event.capacity - event.registeredCount : null;

  return (
    <div className="min-h-screen bg-background">
      <Hero
        title={event.title}
        description={event.category}
        backgroundImage={event.image || eventBg}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link to="/events">
              <Button variant="ghost" size="sm">
                <FiArrowLeft className="mr-2" />
                Back to Events
              </Button>
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Featured Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl overflow-hidden shadow-lg"
              >
                <img
                  src={event.image || eventBg}
                  alt={event.title}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = eventBg;
                  }}
                />
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="prose max-w-none">
                      <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {event.description || 'No description available.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Event Info Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      {/* Date */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FiCalendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-semibold">
                            {event.date ? format(parseISO(event.date), 'EEEE, MMMM d, yyyy') : 'TBD'}
                          </p>
                        </div>
                      </div>

                      {/* Time */}
                      {event.time && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FiClock className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Time</p>
                            <p className="font-semibold">{event.time}</p>
                          </div>
                        </div>
                      )}

                      {/* Location */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FiMapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-semibold">{event.location || 'TBD'}</p>
                        </div>
                      </div>

                      {/* Capacity */}
                      {event.registrationRequired && (
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FiUsers className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Capacity</p>
                            <p className="font-semibold">
                              {isEventFull ? (
                                <span className="text-red-500">Event Full</span>
                              ) : (
                                `${spotsLeft} spots remaining`
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Category */}
                      {event.category && (
                        <div className="pt-4 border-t">
                          <Badge variant="primary">{event.category}</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  {event.registrationRequired && !isEventFull && (
                    <Button
                      onClick={handleRegister}
                      disabled={registering || registered}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      {registering ? (
                        'Registering...'
                      ) : registered ? (
                        <>
                          <FiCheckCircle className="mr-2" />
                          Registered
                        </>
                      ) : (
                        'RSVP Now'
                      )}
                    </Button>
                  )}

                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    <FiShare2 className="mr-2" />
                    Share Event
                  </Button>

                  {searchParams.get('rsvp') === 'true' && !registered && event.registrationRequired && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-primary/10 rounded-lg border border-primary/20"
                    >
                      <p className="text-sm text-foreground font-medium mb-2">Ready to RSVP?</p>
                      <Button
                        onClick={handleRegister}
                        disabled={registering || registered || isEventFull}
                        variant="primary"
                        size="sm"
                        className="w-full"
                      >
                        {registering ? 'Processing...' : 'Confirm RSVP'}
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
