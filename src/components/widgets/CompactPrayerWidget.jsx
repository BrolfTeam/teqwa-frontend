import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiCalendar, FiMapPin } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { prayerTimesService, formatTimeRemaining } from '@/lib/prayerTimesService';
import { format } from 'date-fns';

const CompactPrayerWidget = memo(({ className = '' }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentNext, setCurrentNext] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializePrayerTimes = async () => {
      try {
        await prayerTimesService.getCurrentLocation();
        const currentNextData = prayerTimesService.getCurrentAndNextPrayer();
        setCurrentNext(currentNextData);
      } catch (error) {
        console.error('Error loading prayer times:', error);
      } finally {
        setLoading(false);
      }
    };

    initializePrayerTimes();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Update prayer times every minute
      if (currentTime.getSeconds() === 0 && currentNext) {
        const currentNextData = prayerTimesService.getCurrentAndNextPrayer();
        setCurrentNext(currentNextData);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentTime, currentNext]);

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-6 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!currentNext) {
    return null;
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiClock className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Prayer Times</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {format(currentTime, 'h:mm a')}
          </div>
        </div>
      </div>

      {/* Current Prayer */}
      <div className="p-4">
        <div className="text-center mb-4">
          <div className="text-xs text-muted-foreground mb-1">Current Prayer</div>
          <div className="text-lg font-bold text-primary">
            {currentNext.current?.displayName || 'N/A'}
          </div>
          <div className="text-sm text-muted-foreground">
            {currentNext.current?.formatted || '--:--'}
          </div>
        </div>

        {/* Next Prayer */}
        <div className="bg-muted/50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Next Prayer</div>
              <div className="font-semibold">{currentNext.next?.displayName || 'N/A'}</div>
              <div className="text-sm text-muted-foreground">
                {currentNext.next?.formatted || '--:--'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Time Left</div>
              <div className="font-bold text-primary">
                {currentNext.timeToNext > 0 
                  ? formatTimeRemaining(currentNext.timeToNext)
                  : '--'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs text-muted-foreground">
            <FiMapPin className="h-3 w-3 mr-1" />
            <span>Addis Ababa, Ethiopia</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(), 'EEEE, MMM d, yyyy')}
          </div>
        </div>

        {/* Action Button */}
        <Button asChild size="sm" variant="outline" className="w-full">
          <Link to="/prayer-times" className="flex items-center justify-center">
            <FiCalendar className="mr-2 h-3 w-3" />
            View Full Schedule
          </Link>
        </Button>
      </div>
    </Card>
  );
});

CompactPrayerWidget.displayName = 'CompactPrayerWidget';

export default CompactPrayerWidget;