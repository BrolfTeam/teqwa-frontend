import { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addDays } from 'date-fns';
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiMoon,
  FiSun,
  FiInfo
} from 'react-icons/fi';
import Hero from '@/components/ui/Hero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import IslamicPattern from '@/components/ui/IslamicPattern';
import mesjidBg from '@/assets/mesjid2.jpg';

// Simple Hijri month names
const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  "Rabi' al-awwal",
  "Rabi' al-thani",
  'Jumada al-awwal',
  'Jumada al-thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah"
];

// Approximate conversion (for display purposes - not astronomically precise)
// This is a simplified conversion. For production, consider using a library like 'hijri-date' or API
const gregorianToHijri = (date) => {
  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth();
  const gregorianDay = date.getDate();

  // Approximate formula (for display purposes)
  const hijriYear = Math.floor((gregorianYear - 622) * 0.970224) + 1;
  const daysSinceEpoch = Math.floor((gregorianYear - 1) * 365.25) + 
                         Math.floor((gregorianMonth + 1) * 30.6) + 
                         gregorianDay - 227015;
  const approxHijriYear = Math.floor(daysSinceEpoch / 354.36667) + 1;
  const dayOfHijriYear = (daysSinceEpoch % 354.36667);
  const approxHijriMonth = Math.floor(dayOfHijriYear / 29.5);
  const approxHijriDay = Math.floor(dayOfHijriYear % 29.5) + 1;

  return {
    year: Math.max(1, Math.floor(approxHijriYear)),
    month: Math.max(0, Math.min(11, Math.floor(approxHijriMonth))),
    day: Math.max(1, Math.min(30, Math.floor(approxHijriDay)))
  };
};

const IslamicCalendar = memo(() => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Get today's Hijri date
  const todayHijri = useMemo(() => gregorianToHijri(new Date()), []);
  const selectedHijri = useMemo(() => gregorianToHijri(selectedDate), [selectedDate]);
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = [];
  for (let day = calendarStart; day <= calendarEnd; day = addDays(day, 1)) {
    calendarDays.push(day);
  }

  const navigateMonth = (direction) => {
    setCalendarMonth(prev => addMonths(prev, direction));
  };

  const isToday = (date) => {
    return isSameDay(date, new Date());
  };

  const isSelected = (date) => {
    return isSameDay(date, selectedDate);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <Hero
        title="Islamic"
        titleHighlight="Calendar"
        align="center"
        description="View the Islamic (Hijri) calendar alongside the Gregorian calendar."
        backgroundImage={mesjidBg}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Today's Date Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <FiSun className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Today (Gregorian)</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {format(new Date(), 'EEEE, MMMM d, yyyy')}
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="flex items-center justify-center md:justify-end gap-2 mb-2">
                      <FiMoon className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Today (Hijri)</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {todayHijri.day} {HIJRI_MONTHS[todayHijri.month]} {todayHijri.year} AH
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Calendar Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Gregorian Calendar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FiCalendar className="w-5 h-5 text-primary" />
                      Gregorian Calendar
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth(-1)}
                      >
                        <FiChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-semibold min-w-[150px] text-center">
                        {format(calendarMonth, 'MMMM yyyy')}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateMonth(1)}
                      >
                        <FiChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, idx) => {
                      const inMonth = isSameMonth(day, calendarMonth);
                      const isTodayDate = isToday(day);
                      const isSelectedDate = isSelected(day);
                      const hijriDate = gregorianToHijri(day);

                      return (
                        <button
                          key={idx}
                          onClick={() => handleDateClick(day)}
                          className={`
                            aspect-square rounded-lg text-sm font-medium transition-all duration-200
                            relative group
                            ${inMonth 
                              ? isSelectedDate
                                ? 'bg-primary text-primary-foreground shadow-md scale-105'
                                : isTodayDate
                                  ? 'bg-primary/10 text-primary border-2 border-primary'
                                  : 'hover:bg-muted text-foreground hover:scale-105'
                              : 'text-muted-foreground/30 cursor-not-allowed'
                            }
                          `}
                        >
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                            <span>{format(day, 'd')}</span>
                            {inMonth && (
                              <span className="text-[8px] text-muted-foreground/60 mt-0.5">
                                {hijriDate.day}
                              </span>
                            )}
                          </div>
                          {isTodayDate && (
                            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Hijri Calendar Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="space-y-6">
                {/* Selected Date Info */}
                <Card className="shadow-lg sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FiMoon className="w-5 h-5 text-primary" />
                      Selected Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Gregorian</div>
                      <div className="text-lg font-semibold">
                        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="text-xs text-muted-foreground mb-1">Hijri (Approximate)</div>
                      <div className="text-lg font-semibold text-primary">
                        {selectedHijri.day} {HIJRI_MONTHS[selectedHijri.month]}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {selectedHijri.year} AH
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FiInfo className="w-5 h-5 text-primary" />
                      About Hijri Calendar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      The Islamic calendar (Hijri calendar) is a lunar calendar consisting of 12 months in a year of 354 or 355 days.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="primary" className="mt-0.5">Note</Badge>
                        <p className="text-xs text-muted-foreground flex-1">
                          This calendar shows approximate Hijri dates. For precise dates, consult your local Islamic authority or astronomical calculations.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Important Months */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Important Islamic Months</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Ramadan</span>
                        <Badge variant="primary">Fasting</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Dhu al-Hijjah</span>
                        <Badge variant="primary">Hajj</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Muharram</span>
                        <Badge variant="outline">New Year</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
});

IslamicCalendar.displayName = 'IslamicCalendar';
export default IslamicCalendar;
