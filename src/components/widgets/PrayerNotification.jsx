import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX, FiClock } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { useCurrentPrayer } from '@/hooks/usePrayerTimes';
import { formatTimeRemaining } from '@/lib/prayerTimesService';

const PrayerNotification = memo(({ 
  enabled = true, 
  notifyMinutes = 10,
  className = '' 
}) => {
  const { currentNext } = useCurrentPrayer();
  const [showNotification, setShowNotification] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!enabled || !currentNext?.next || dismissed) {
      setShowNotification(false);
      return;
    }

    const timeToNext = currentNext.timeToNext;
    const notifySeconds = notifyMinutes * 60;

    // Show notification when within the specified minutes
    if (timeToNext > 0 && timeToNext <= notifySeconds) {
      setShowNotification(true);
    } else {
      setShowNotification(false);
      setDismissed(false); // Reset dismissal for next prayer
    }
  }, [currentNext, enabled, notifyMinutes, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setShowNotification(false);
  };

  if (!showNotification || !currentNext?.next) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed top-4 right-4 z-50 ${className}`}
        initial={{ opacity: 0, x: 100, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.9 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-border p-4 max-w-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <FiBell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm">Prayer Time Reminder</div>
                <div className="text-xs text-muted-foreground">
                  {currentNext.next.displayName} prayer approaching
                </div>
              </div>
            </div>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
            >
              <FiX className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-primary">
                {currentNext.next.formatted}
              </div>
              <div className="text-sm text-muted-foreground">
                {currentNext.next.displayName} Prayer
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-muted-foreground">
                <FiClock className="h-3 w-3 mr-1" />
                <span>{formatTimeRemaining(currentNext.timeToNext)}</span>
              </div>
              <div className="text-xs text-muted-foreground">remaining</div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

PrayerNotification.displayName = 'PrayerNotification';

export default PrayerNotification;