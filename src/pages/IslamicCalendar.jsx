import { useState, useMemo, memo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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


const IslamicCalendar = memo(() => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [hijriAdjustment, setHijriAdjustment] = useState(0);
  // Removed API state in favor of pure calculation to prevent connection timeouts
  // const [apiData, setApiData] = useState({});
  // const [isSyncing, setIsSyncing] = useState(false);

  // Fetch effect removed - using robust calculation below

  // Robust mathematical Hijri conversion (Tabular/Kuwaiti algorithm) for fallback/pre-sync
  const calculateHijri = useCallback((date) => {
    // Apply adjustment to the base calculation
    const adjustedDate = new Date(date);
    adjustedDate.setDate(date.getDate() + hijriAdjustment);

    let day = adjustedDate.getDate();
    let month = adjustedDate.getMonth();
    let year = adjustedDate.getFullYear();

    if (year < 1900) return { day: 1, month: 0, year: 1445 };

    let m = month + 1;
    let y = year;
    if (m < 3) {
      y -= 1;
      m += 12;
    }

    let a = Math.floor(y / 100);
    let b = 2 - a + Math.floor(a / 4);
    if (y < 1583) b = 0;
    if (y === 1582) {
      if (m > 10) b = -10;
      if (m === 10) {
        b = 0;
        if (day > 4) b = -10;
      }
    }

    let jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;

    b = 0;
    if (jd > 2299160) {
      a = Math.floor((jd - 1867216.25) / 36524.25);
      b = jd + 1 + a - Math.floor(a / 4);
    } else {
      b = jd;
    }

    let bb = b + 1524;
    let cc = Math.floor((bb - 122.1) / 365.25);
    let dd = Math.floor(365.25 * cc);
    let ee = Math.floor((bb - dd) / 30.6001);
    day = bb - dd - Math.floor(30.6001 * ee);
    month = ee - 1;
    if (ee > 13) {
      cc += 1;
      month = ee - 13;
    }
    year = cc;

    let ijd = jd - 1948440 + 10632;
    let n = Math.floor((ijd - 1) / 10631);
    ijd = ijd - 10631 * n + 354;
    let j = (Math.floor((10985 - ijd) / 5316)) * (Math.floor((50 * ijd) / 17719)) + (Math.floor(ijd / 5670)) * (Math.floor((43 * ijd) / 15238));
    ijd = ijd - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
    m = Math.floor((24 * ijd) / 709);
    day = ijd - Math.floor((709 * m) / 24);
    y = 30 * n + j - 30;

    return {
      day: day,
      month: m - 1, // 0-indexed
      year: y
    };
  }, []);

  // Accurate Hijri conversion with Aladhan API priority and adjustment
  const gregorianToHijri = useCallback((date) => {
    // Only use local mathematical calculation to ensure offline capability and speed
    const calculated = calculateHijri(date);
    return {
      ...calculated,
      isVerified: false // Always calculated now
    };
  }, [calendarMonth, calculateHijri]);

  const hijriMonths = t('calendar.months.hijri', { returnObjects: true });

  const viewingHijri = useMemo(() => gregorianToHijri(calendarMonth), [calendarMonth, gregorianToHijri]);
  const todayHijri = useMemo(() => gregorianToHijri(new Date()), [gregorianToHijri]);
  const selectedHijri = useMemo(() => gregorianToHijri(selectedDate), [selectedDate, gregorianToHijri]);

  const isBrowsingToday = useMemo(() => isSameMonth(calendarMonth, new Date()), [calendarMonth]);


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

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const isToday = (date) => isSameDay(date, new Date());
  const isSelected = (date) => isSameDay(date, selectedDate);

  const weekdays = [
    t('calendar.weekdays.sun'),
    t('calendar.weekdays.mon'),
    t('calendar.weekdays.tue'),
    t('calendar.weekdays.wed'),
    t('calendar.weekdays.thu'),
    t('calendar.weekdays.fri'),
    t('calendar.weekdays.sat')
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden relative">
      <IslamicPattern className="opacity-5 absolute inset-0 pointer-events-none" />

      <Hero
        title={t('calendar.title')}
        titleHighlight={`${hijriMonths[viewingHijri.month]} ${viewingHijri.year} ${t('calendar.hijriSuffix')}`}
        align="center"
        description={`${format(calendarMonth, 'MMMM yyyy')} • ${t('calendar.description')}`}
        backgroundImage={mesjidBg}
        actions={[
          {
            label: t('calendar.prevMonth'),
            variant: 'outline',
            onClick: () => navigateMonth(-1)
          },
          {
            label: t('common.today'),
            variant: 'primary',
            onClick: () => {
              setCalendarMonth(new Date());
              setSelectedDate(new Date());
            }
          },
          {
            label: t('calendar.nextMonth'),
            variant: 'outline',
            onClick: () => navigateMonth(1)
          }
        ]}
      />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Status Display Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-primary/20 shadow-xl overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="text-center md:text-left space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                      <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-600">
                        <FiSun className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
                        {isBrowsingToday ? t('calendar.todayGregorian') : t('calendar.gregorian')}
                      </span>
                    </div>
                    <div className="text-3xl font-black text-foreground">
                      {isBrowsingToday ? format(new Date(), 'EEEE, MMMM d, yyyy') : format(calendarMonth, 'MMMM yyyy')}
                    </div>
                  </div>

                  <div className={`text-center md:text-right space-y-2 relative ${isRTL ? 'md:border-l' : 'md:border-r'} border-transparent`}>
                    <div className={`flex items-center justify-center ${isRTL ? 'md:justify-start' : 'md:justify-end'} gap-3 mb-2`}>
                      <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
                        {isBrowsingToday ? t('calendar.todayHijri') : t('calendar.hijriApprox')}
                      </span>
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <FiMoon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-primary">
                      {(isBrowsingToday ? todayHijri : viewingHijri).day > 0 && (isBrowsingToday ? todayHijri : viewingHijri).day}{' '}
                      {hijriMonths[(isBrowsingToday ? todayHijri : viewingHijri).month]} {(isBrowsingToday ? todayHijri : viewingHijri).year} {t('calendar.hijriSuffix')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Gregorian Calendar Grid */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card className="shadow-2xl border-0 overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold">
                      <FiCalendar className="w-5 h-5 text-primary" />
                      {t('calendar.gregorianCalendar')}
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      {/* Syncing indicator removed */}
                      <div className="flex items-center bg-white dark:bg-slate-900 rounded-full shadow-inner p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-primary/10 h-8 w-8"
                          onClick={() => navigateMonth(-1)}
                        >
                          <FiChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-bold min-w-[120px] text-center">
                          {format(calendarMonth, 'MMMM yyyy')}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-primary/10 h-8 w-8"
                          onClick={() => navigateMonth(1)}
                        >
                          <FiChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full font-bold text-xs"
                        onClick={() => {
                          setCalendarMonth(new Date());
                          setSelectedDate(new Date());
                        }}
                      >
                        {t('common.today')}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {weekdays.map(day => (
                      <div key={day} className="text-center text-xs font-black text-muted-foreground uppercase tracking-widest py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, idx) => {
                      const inMonth = isSameMonth(day, calendarMonth);
                      const isTodayDate = isToday(day);
                      const isSelectedDate = isSelected(day);
                      const hijriDate = gregorianToHijri(day);

                      return (
                        <motion.button
                          key={idx}
                          whileHover={inMonth ? { scale: 1.05, y: -2 } : {}}
                          whileTap={inMonth ? { scale: 0.95 } : {}}
                          onClick={() => inMonth && handleDateClick(day)}
                          className={`
                            aspect-square rounded-2xl text-sm font-bold transition-all duration-300
                            relative flex flex-col items-center justify-center gap-0.5
                            ${inMonth
                              ? isSelectedDate
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 z-10'
                                : isTodayDate
                                  ? 'bg-primary/5 text-primary border-2 border-primary/20'
                                  : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 text-foreground border border-transparent hover:border-primary/20 hover:shadow-xl'
                              : 'text-muted-foreground/10 cursor-default opacity-20'
                            }
                          `}
                        >
                          <span className="text-base">{format(day, 'd')}</span>
                          {inMonth && (
                            <span className={`text-[11px] font-medium ${isSelectedDate ? 'text-primary-foreground/80' : 'text-muted-foreground/60'}`}>
                              {hijriDate.day}
                            </span>
                          )}
                          {isTodayDate && !isSelectedDate && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                          )}
                        </motion.button>
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
              className="space-y-6"
            >
              {/* Selected Date Info Card */}
              <Card className="shadow-2xl border-0 bg-primary text-primary-foreground overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <CardHeader className="relative pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FiMoon className="w-5 h-5" />
                    {t('calendar.selectedDate')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-6">
                  <div className="space-y-1">
                    <div className="text-xs font-black uppercase tracking-tighter opacity-60">{t('calendar.gregorian')}</div>
                    <div className="text-xl font-bold">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/10 space-y-1">
                    <div className="text-xs font-black uppercase tracking-tighter opacity-60">{t('calendar.hijriApprox')}</div>
                    <div className="text-3xl font-black">
                      {selectedHijri.day} {hijriMonths[selectedHijri.month]}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold opacity-80">
                        {selectedHijri.year} {t('calendar.hijriSuffix')}
                      </div>
                      <Badge variant="outline" className="text-[9px] border-white/20 text-white/80 font-bold uppercase py-0 px-1.5 h-4">
                        {selectedHijri.isVerified ? t('calendar.verified') : t('calendar.calculated')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Adjustment Card */}
              <Card id="adjustment-card" className="border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FiSun className="w-4 h-4 text-primary" />
                    {t('calendar.adjustment')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('calendar.adjustmentDesc')}
                  </p>
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-border/50">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full border border-border"
                      onClick={() => setHijriAdjustment(prev => Math.max(-2, prev - 1))}
                    >
                      -
                    </Button>
                    <div className="text-center">
                      <div className="text-lg font-black text-primary">{hijriAdjustment > 0 ? `+${hijriAdjustment}` : hijriAdjustment}</div>
                      <div className="text-xs font-bold text-muted-foreground uppercase">{t('common.days')}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full border border-border"
                      onClick={() => setHijriAdjustment(prev => Math.min(2, prev + 1))}
                    >
                      +
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-2 rounded-lg">
                    <FiInfo className="w-3 h-3 text-primary" />
                    {t('calendar.adjustmentNote')}
                  </div>
                </CardContent>
              </Card>

              {/* Information Card */}
              <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FiInfo className="w-4 h-4 text-primary" />
                    {t('calendar.aboutTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {t('calendar.aboutDescription')}
                  </p>
                  <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <Badge variant="primary" className="mt-0.5 rounded-lg h-6 px-2 font-black text-[11px] uppercase">{t('calendar.note')}</Badge>
                    <p className="text-[11px] sm:text-xs font-bold text-muted-foreground uppercase leading-tight tracking-wider">
                      {t('calendar.accuracyNote')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Important Months Card */}
              <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b pb-4">
                  <CardTitle className="text-sm font-bold">{t('calendar.importantMonths')}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {[
                      { name: t('calendar.ramadan'), tag: t('calendar.fasting'), color: 'bg-emerald-500' },
                      { name: t('calendar.dhulHijjah'), tag: t('calendar.hajj'), color: 'bg-blue-500' },
                      { name: t('calendar.muharram'), tag: t('calendar.newYear'), color: 'bg-primary' }
                    ].map((m) => (
                      <div key={m.name} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                        <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{m.name}</span>
                        <Badge className={`${m.color} text-white border-0 text-[11px] font-black tracking-widest uppercase`}>{m.tag}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
});

IslamicCalendar.displayName = 'IslamicCalendar';
export default IslamicCalendar;
