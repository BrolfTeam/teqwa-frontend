import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO, isFuture, isToday, startOfMonth, endOfMonth, addMonths, subMonths, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { FaCalendarAlt, FaMapMarkerAlt, FaSearch, FaFilter, FaCalendarDay, FaRegCalendarCheck } from 'react-icons/fa';
import { BsGridFill, BsListUl } from 'react-icons/bs';
import Hero from '@/components/ui/Hero';
import EmptyState from '@/components/ui/EmptyState';
import { dataService } from '@/lib/dataService';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import eventBg from '@/assets/mesjid2.jpg';

// Small helper: get events grouped by date string
const groupEventsByDate = (events) => events.reduce((acc, e) => {
  const dateKey = format(parseISO(e.date), 'yyyy-MM-dd');
  (acc[dateKey] = acc[dateKey] || []).push(e);
  return acc;
}, {});



const Events = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await dataService.getEvents();
        const normalizedEvents = eventsData.map(dataService.normalizeEvent);
        setEvents(normalizedEvents);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Get unique categories from events
  const categories = [t('events.allCategories'), ...new Set(events.map(event => event.category).filter(Boolean))];

  // Filter events based on search term, selected category, and date
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const isUpcomingOrToday = event.date ? (isFuture(parseISO(event.date)) || isToday(parseISO(event.date))) : true;

    return matchesSearch && matchesCategory && (showPastEvents ? true : isUpcomingOrToday);
  });

  // Sort events by date (earliest first)
  const sortedEvents = [...filteredEvents].sort((a, b) =>
    new Date(a.date) - new Date(b.date)
  );

  // Group events by date
  const eventsByDate = useMemo(() => groupEventsByDate(sortedEvents), [sortedEvents]);

  // For calendar view: get start/end for month and build weeks
  const monthStart = startOfMonth(calendarDate);
  const monthEnd = endOfMonth(calendarDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = [];
  for (let day = calendarStart; day <= calendarEnd; day = addDays(day, 1)) {
    calendarDays.push(day);
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Hero
        title={t('events.communityEvents')}
        description={t('events.joinUsDescription')}
        backgroundImage={eventBg}
        primaryAction={<Link to="/contact">{t('contact.title')}</Link>}
        secondaryAction={<Link to="/calendar">{t('events.viewCalendar')}</Link>}
      />

      {/* Search and Filter Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-8 -mt-20 relative z-20">
        <div className="container mx-auto px-4">

          <div className="max-w-3xl mx-auto">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder={t('events.searchEvents')}
                className="w-full py-3 px-4 pl-12 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 flex flex-wrap gap-2">
                <div className="flex items-center bg-white/10 px-3 py-1 rounded-full">
                  <FaFilter className="mr-2 text-sm" />
                  <span className="text-sm font-medium">{t('common.search')}:</span>
                </div>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                      ? 'bg-white text-brand-deep'
                      : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPastEvents(!showPastEvents)}
                  className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${showPastEvents
                    ? 'bg-white text-brand-deep'
                    : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                  {showPastEvents ? (
                    <>
                      <FaCalendarDay className="mr-1" /> {t('events.upcomingEvents')}
                    </>
                  ) : (
                    <>
                      <FaRegCalendarCheck className="mr-1" /> {t('events.pastEvents')}
                    </>
                  )}
                </button>

                <div className="flex bg-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-brand-deep' : 'text-white hover:bg-white/20'
                      }`}
                    aria-label={t('events.gridView')}
                  >
                    <BsGridFill />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-brand-deep' : 'text-white hover:bg-white/20'
                      }`}
                    aria-label={t('events.listView')}
                  >
                    <BsListUl />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
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
          ) : sortedEvents.length > 0 ? (
            viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : viewMode === 'list' ? (
              // List View
              <div className="max-w-4xl mx-auto">
                {Object.entries(eventsByDate).map(([date, events]) => (
                  <div key={date} className="mb-10">
                    <h3 className="text-2xl font-bold text-brand-deep mb-4 border-b pb-2">
                      {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <div className="space-y-4">
                      {events.map(event => (
                        <EventListItem key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Calendar View
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCalendarDate(subMonths(calendarDate, 1))} className="btn btn-sm btn-secondary">Prev</button>
                    <div className="text-lg font-semibold">{format(calendarDate, 'MMMM yyyy')}</div>
                    <button onClick={() => setCalendarDate(addMonths(calendarDate, 1))} className="btn btn-sm btn-secondary">Next</button>
                  </div>
                  <div className="text-sm text-muted-foreground">Click a day to view events</div>
                </div>

                <div className="grid grid-cols-7 gap-1 bg-card rounded-lg overflow-hidden shadow-sm">
                  {/* Weekday headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center py-2 text-xs font-medium bg-muted border-b border-r border-border">{d}</div>
                  ))}

                  {/* Calendar days */}
                  {calendarDays.map((day, idx) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dayEvents = eventsByDate[dateKey] || [];
                    const inMonth = isSameMonth(day, calendarDate);
                    const isSelected = selectedDay && isSameDay(day, selectedDay);
                    return (
                      <div key={idx} className={`p-2 min-h-[80px] border-r border-b border-border ${inMonth ? 'bg-card' : 'bg-muted text-muted-foreground'}`}>
                        <button onClick={() => setSelectedDay(day)} className={`w-full text-left ${isSelected ? 'ring-2 ring-brand-green rounded-md' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold">{format(day, 'd')}</div>
                            {dayEvents.length > 0 && (
                              <div className="text-xs bg-brand-green text-white rounded-full px-2 py-0.5">{dayEvents.length}</div>
                            )}
                          </div>
                          <div className="mt-2 space-y-1">
                            {dayEvents.slice(0, 2).map(ev => (
                              <div key={ev.id} className="text-xs text-foreground/80 truncate">{ev.time} • {ev.title}</div>
                            ))}
                            {dayEvents.length > 2 && <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Selected day event list */}
                {selectedDay && (
                  <div className="mt-6 bg-card p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold mb-2">Events on {format(selectedDay, 'EEEE, MMMM d, yyyy')}</h4>
                    <div className="space-y-3">
                      {(eventsByDate[format(selectedDay, 'yyyy-MM-dd')] || []).map(ev => (
                        <div key={ev.id} className="p-3 border border-border rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-brand-deep">{ev.title}</div>
                              <div className="text-sm text-muted-foreground">{ev.time} • {ev.location}</div>
                            </div>
                            <div className="text-sm text-muted-foreground">{ev.category}</div>
                          </div>
                          <p className="text-muted-foreground mt-2">{ev.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <EmptyState
              title="No events found"
              description="Try adjusting your search or filter criteria to find events."
              actionLabel="Clear All Filters"
              onAction={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setShowPastEvents(false);
              }}
            />
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-brand-deep text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Have an event idea?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            We're always looking for new ways to serve our community. Share your event ideas with us!
          </p>
          <Link
            to="/contact"
            className="btn btn-lg btn-primary"
          >
            Suggest an Event
          </Link>
        </div>
      </section>
    </div>
  );
};

// Event Card Component for Grid View
const EventCard = ({ event }) => {
  const isEventFull = event.registrationRequired && event.registeredCount >= event.capacity;
  const registrationStatus = isEventFull
    ? 'Event Full'
    : event.registrationRequired
      ? `${event.capacity - event.registeredCount} spots left`
      : 'No registration required';

  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-border/50">
      <div className="h-48 overflow-hidden relative">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/600x400?text=Event+Image';
          }}
        />
        {event.featured && (
          <div className="absolute top-4 right-4 bg-accent-gold text-white text-xs font-bold px-3 py-1 rounded-full">
            Featured
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="text-white font-bold text-lg">{event.title}</div>
          <div className="flex items-center text-white/80 text-sm mt-1">
            <FaCalendarAlt className="mr-1" />
            <span>{event.date ? format(parseISO(event.date), 'EEE, MMM d') : 'TBD'} {event.time && `• ${event.time}`}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center text-muted-foreground text-sm mb-1">
              <FaMapMarkerAlt className="mr-1.5 text-brand-green" />
              <span>{event.location}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {registrationStatus}
            </div>
          </div>
          <span className="px-3 py-1 bg-muted text-foreground text-xs font-medium rounded-full">
            {event.category}
          </span>
        </div>

        <p className="text-muted-foreground mb-4 line-clamp-3">{event.description}</p>

        <div className="flex justify-between items-center">
          <Link
            to={`/events/${event.id}`}
            className="text-brand-green font-medium hover:text-brand-deep transition-colors text-sm"
          >
            {t('events.viewDetails')}
          </Link>

          {isEventFull ? (
            <span className="px-4 py-2 bg-gray-200 text-gray-600 text-sm font-medium rounded-full cursor-not-allowed">
              Event Full
            </span>
          ) : (
            <Link
              to={`/events/${event.id}?rsvp=true`}
              className="btn btn-sm btn-primary"
            >
              {event.registrationRequired ? 'RSVP Now' : 'Learn More'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// Event List Item Component for List View
const EventListItem = ({ event }) => {
  const isEventFull = event.registrationRequired && event.registeredCount >= event.capacity;

  return (
    <div className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-border/50">
      <div className="md:flex">
        <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/600x400?text=Event+Image';
            }}
          />
        </div>

        <div className="p-6 md:w-2/3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-brand-deep mb-2">
                <Link to={`/events/${event.id}`} className="hover:text-brand-green transition-colors">
                  {event.title}
                </Link>
              </h3>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-1.5 text-brand-green" />
                  <span>{event.date ? format(parseISO(event.date), 'EEEE, MMMM d, yyyy') : 'Date TBD'} {event.time && `• ${event.time}`}</span>
                </div>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-1.5 text-brand-green" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>

            <span className="px-3 py-1 bg-muted text-foreground text-xs font-medium rounded-full whitespace-nowrap">
              {event.category}
            </span>
          </div>

          <p className="text-muted-foreground mb-4 line-clamp-2">{event.description}</p>

          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {isEventFull ? (
                <span className="text-red-500 font-medium">Event Full</span>
              ) : event.registrationRequired ? (
                <span>{event.capacity - event.registeredCount} spots remaining</span>
              ) : (
                <span>No registration required</span>
              )}
            </div>

            <div className="flex space-x-2">
              <Link
                to={`/events/${event.id}`}
                className="btn btn-sm btn-outline"
              >
                {t('events.viewDetails')}
              </Link>

              {!isEventFull && (
                <Link
                  to={`/events/${event.id}?rsvp=true`}
                  className="btn btn-sm btn-primary"
                >
                  {event.registrationRequired ? 'RSVP Now' : 'Learn More'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
