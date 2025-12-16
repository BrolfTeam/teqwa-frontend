import { format, parseISO, addDays, isToday, isTomorrow, isYesterday, isThisWeek, isThisMonth, isSameDay, isSameWeek, isSameMonth, isSameYear, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears, formatDistanceToNow, formatDistanceStrict, formatRelative, subDays, addMonths, addWeeks, addYears, subMonths, subWeeks, subYears, getDay, getDate, getMonth, getYear, getHours, getMinutes, getSeconds, set, getWeek, getISOWeeksInYear, getISOWeeksInMonth, getDaysInMonth, getDaysInYear, isLeapYear, isWeekend, isWithinInterval, isBefore, isAfter, min, max, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, eachYearOfInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfToday, endOfToday, startOfTomorrow, endOfTomorrow, startOfYesterday, endOfYesterday, startOfHour, endOfHour, startOfMinute, endOfMinute, startOfSecond, endOfSecond, addMilliseconds, addSeconds, addMinutes, addHours, addBusinessDays, addQuarters, addMillisecondsToNow, addSecondsToNow, addMinutesToNow, addHoursToNow, addDaysToNow, addWeeksToNow, addMonthsToNow, addQuartersToNow, addYearsToNow, areIntervalsOverlapping, closestIndexTo, closestTo, compareAsc, compareDesc, differenceInBusinessDays, differenceInCalendarDays, differenceInCalendarISOWeeks, differenceInCalendarISOWeekYears, differenceInCalendarMonths, differenceInCalendarQuarters, differenceInCalendarWeeks, differenceInCalendarYears, differenceInHours, differenceInISOWeekYears, differenceInMilliseconds, differenceInMinutes, differenceInMonths, differenceInQuarters, differenceInSeconds, differenceInWeeks, differenceInYears, eachHourOfInterval, eachMinuteOfInterval, eachSecondOfInterval, endOfDecade, endOfISOWeek, endOfISOWeekYear, endOfQuarter, endOfTomorrow as endOfTomorrowFn, endOfYesterday as endOfYesterdayFn, format as formatDate, formatDistance, formatDuration, fromUnixTime, getDate as getDayOfMonth, getDayOfYear, getDaysInYear as getDaysInYearFn, getDecade, getHours as getHoursFn, getISODay, getISOWeek, getISOWeekYear, getMilliseconds, getMinutes as getMinutesFn, getMonth as getMonthFn, getOverlappingDaysInIntervals, getQuarter, getSeconds as getSecondsFn, getTime, getUnixTime, getWeek as getWeekFn, getWeekOfMonth, getWeekYear, getWeeksInMonth, getYear as getYearFn, isDate, isEqual, isExists, isFirstDayOfMonth, isFriday, isFuture, isLastDayOfMonth, isLeapYear as isLeapYearFn, isMatch, isMonday, isPast, isSameDay as isSameDayFn, isSameHour, isSameISOWeek, isSameISOWeekYear, isSameMinute, isSameMonth as isSameMonthFn, isSameQuarter, isSameSecond, isSameWeek as isSameWeekFn, isSameYear as isSameYearFn, isSaturday, isSunday, isThursday, isTuesday, isValid, isWednesday, isWeekend as isWeekendFn, isWithinInterval as isWithinIntervalFn, lastDayOfDecade, lastDayOfISOWeek, lastDayOfISOWeekYear, lastDayOfMonth, lastDayOfQuarter, lastDayOfWeek, lastDayOfYear, lightFormat, max as maxDate, milliseconds, millisecondsToHours, millisecondsToMinutes, millisecondsToSeconds, min as minDate, minutesToHours, minutesToMilliseconds, minutesToSeconds, monthsToQuarters, monthsToYears, nextDay, nextFriday, nextMonday, nextSaturday, nextSunday, nextThursday, nextTuesday, nextWednesday, parse, parseISO as parseISODate, parseJSON, previousDay, previousFriday, previousMonday, previousSaturday, previousSunday, previousThursday, previousTuesday, previousWednesday, quarterToMonth, quartersToMonths, quartersToYears, roundToNearestMinutes, secondsToHours, secondsToMilliseconds, secondsToMinutes, setDate, setDay, setDayOfYear, setDefaultOptions, setHours, setISODay, setISOWeek, setISOWeekYear, setMilliseconds, setMinutes, setMonth, setQuarter, setSeconds, setWeek, setWeekYear, setYear, startOfDecade, startOfISOWeek, startOfISOWeekYear, startOfMinute as startOfMinuteFn, startOfQuarter, startOfSecond as startOfSecondFn, startOfToday as startOfTodayFn, startOfTomorrow as startOfTomorrowFn, startOfWeek as startOfWeekFn, startOfYear as startOfYearFn, startOfYesterday as startOfYesterdayFn, sub as subFn, subBusinessDays, subHours, subMilliseconds, subMinutes, subMonths as subMonthsFn, subQuarters, subSeconds, subWeeks as subWeeksFn, subYears as subYearsFn, toDate, weeksToDays, yearsToMonths, yearsToQuarters } from 'date-fns';
import { ar, enUS, fr, es, de, it, pt, ru, tr, zhCN, zhTW, ja, ko } from 'date-fns/locale';

// Configure locales
const locales = {
  en: enUS,
  ar,
  fr,
  es,
  de,
  it,
  pt,
  ru,
  tr,
  zh: zhCN,
  'zh-TW': zhTW,
  ja,
  ko,
};

// Default format strings
const FORMATS = {
  date: 'yyyy-MM-dd',
  time: 'HH:mm',
  datetime: 'yyyy-MM-dd HH:mm',
  dateTimeLocal: "yyyy-MM-dd'T'HH:mm",
  month: 'MMMM yyyy',
  monthShort: 'MMM yyyy',
  day: 'EEEE, MMMM d, yyyy',
  dayShort: 'EEE, MMM d',
  timeWithSeconds: 'HH:mm:ss',
  iso: "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
  relative: 'PPPppp',
};

/**
 * Format a date using the specified format string
 * @param {Date|string|number} date - The date to format
 * @param {string} formatStr - The format string (defaults to 'yyyy-MM-dd')
 * @param {string} locale - The locale to use (defaults to 'en')
 * @returns {string} The formatted date string
 */
function formatDateWithLocale(date, formatStr = FORMATS.date, locale = 'en') {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : parseISODate(date);
  
  if (!isValid(dateObj)) {
    console.error('Invalid date:', date);
    return '';
  }
  
  return format(dateObj, formatStr, {
    locale: locales[locale] || enUS,
  });
}

/**
 * Format a date as a relative time string (e.g., '2 hours ago')
 * @param {Date|string|number} date - The date to format
 * @param {Object} options - Formatting options
 * @param {string} options.locale - The locale to use (defaults to 'en')
 * @param {boolean} options.addSuffix - Whether to add a suffix like 'ago' or 'in' (defaults to true)
 * @param {boolean} options.includeSeconds - Whether to include seconds (defaults to false)
 * @returns {string} The formatted relative time string
 */
function formatRelativeTime(date, { 
  locale = 'en', 
  addSuffix = true, 
  includeSeconds = false,
  ...options 
} = {}) {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : parseISODate(date);
  
  if (!isValid(dateObj)) {
    console.error('Invalid date:', date);
    return '';
  }
  
  return formatDistanceToNow(dateObj, {
    addSuffix,
    includeSeconds,
    locale: locales[locale] || enUS,
    ...options,
  });
}

/**
 * Check if a date is today
 * @param {Date|string|number} date - The date to check
 * @returns {boolean} True if the date is today
 */
function isDateToday(date) {
  if (!date) return false;
  const dateObj = date instanceof Date ? date : parseISODate(date);
  return isToday(dateObj);
}

/**
 * Check if a date is tomorrow
 * @param {Date|string|number} date - The date to check
 * @returns {boolean} True if the date is tomorrow
 */
function isDateTomorrow(date) {
  if (!date) return false;
  const dateObj = date instanceof Date ? date : parseISODate(date);
  return isTomorrow(dateObj);
}

/**
 * Check if a date is yesterday
 * @param {Date|string|number} date - The date to check
 * @returns {boolean} True if the date is yesterday
 */
function isDateYesterday(date) {
  if (!date) return false;
  const dateObj = date instanceof Date ? date : parseISODate(date);
  return isYesterday(dateObj);
}

/**
 * Get the start and end of a day
 * @param {Date|string|number} date - The date
 * @returns {{start: Date, end: Date}} An object with the start and end of the day
 */
function getDayRange(date) {
  const dateObj = date instanceof Date ? date : parseISODate(date);
  return {
    start: startOfDay(dateObj),
    end: endOfDay(dateObj),
  };
}

/**
 * Get the start and end of a week
 * @param {Date|string|number} date - The date
 * @param {Object} options - Options
 * @param {number} options.weekStartsOn - The index of the first day of the week (0 = Sunday, 1 = Monday, etc.)
 * @returns {{start: Date, end: Date}} An object with the start and end of the week
 */
function getWeekRange(date, { weekStartsOn = 1 } = {}) {
  const dateObj = date instanceof Date ? date : parseISODate(date);
  return {
    start: startOfWeek(dateObj, { weekStartsOn }),
    end: endOfWeek(dateObj, { weekStartsOn }),
  };
}

/**
 * Get the start and end of a month
 * @param {Date|string|number} date - The date
 * @returns {{start: Date, end: Date}} An object with the start and end of the month
 */
function getMonthRange(date) {
  const dateObj = date instanceof Date ? date : parseISODate(date);
  return {
    start: startOfMonth(dateObj),
    end: endOfMonth(dateObj),
  };
}

/**
 * Get the start and end of a year
 * @param {Date|string|number} date - The date
 * @returns {{start: Date, end: Date}} An object with the start and end of the year
 */
function getYearRange(date) {
  const dateObj = date instanceof Date ? date : parseISODate(date);
  return {
    start: startOfYear(dateObj),
    end: endOfYear(dateObj),
  };
}

/**
 * Add time to a date
 * @param {Date|string|number} date - The date to add time to
 * @param {Object} duration - The duration to add
 * @param {number} [duration.years=0] - Years to add
 * @param {number} [duration.months=0] - Months to add
 * @param {number} [duration.weeks=0] - Weeks to add
 * @param {number} [duration.days=0] - Days to add
 * @param {number} [duration.hours=0] - Hours to add
 * @param {number} [duration.minutes=0] - Minutes to add
 * @param {number} [duration.seconds=0] - Seconds to add
 * @returns {Date} The new date
 */
function addTime(date, { 
  years = 0, 
  months = 0, 
  weeks = 0, 
  days = 0, 
  hours = 0, 
  minutes = 0, 
  seconds = 0 
}) {
  let result = date instanceof Date ? new Date(date) : parseISODate(date);
  
  if (years) result = addYears(result, years);
  if (months) result = addMonths(result, months);
  if (weeks) result = addWeeks(result, weeks);
  if (days) result = addDays(result, days);
  if (hours) result = addHours(result, hours);
  if (minutes) result = addMinutes(result, minutes);
  if (seconds) result = addSeconds(result, seconds);
  
  return result;
}

// Export all date-fns functions and our custom utilities
export {
  // Core functions
  formatDateWithLocale as formatDate,
  formatRelativeTime,
  
  // Date creation and parsing
  parseISODate as parseDate,
  toDate,
  parseJSON,
  
  // Getters
  getDate as getDayOfMonth,
  getDay,
  getDayOfYear,
  getDaysInMonth,
  getDaysInYear,
  getHours as getHoursFn,
  getISODay,
  getISOWeek,
  getISOWeekYear,
  getISOWeeksInYear,
  getISOWeeksInMonth,
  getMilliseconds,
  getMinutes as getMinutesFn,
  getMonth as getMonthFn,
  getQuarter,
  getSeconds as getSecondsFn,
  getTime,
  getUnixTime,
  getWeek as getWeekFn,
  getWeekOfMonth,
  getWeekYear,
  getWeeksInMonth,
  getYear as getYearFn,
  
  // Setters
  setDate,
  setDay,
  setDayOfYear,
  setHours,
  setISODay,
  setISOWeek,
  setISOWeekYear,
  setMilliseconds,
  setMinutes,
  setMonth,
  setQuarter,
  setSeconds,
  setWeek,
  setWeekYear,
  setYear,
  
  // Helpers
  isDate,
  isValid,
  isAfter,
  isBefore,
  isEqual,
  isSameDay: isSameDayFn,
  isSameHour,
  isSameISOWeek,
  isSameISOWeekYear,
  isSameMinute,
  isSameMonth: isSameMonthFn,
  isSameQuarter,
  isSameSecond,
  isSameWeek: isSameWeekFn,
  isSameYear: isSameYearFn,
  isWithinInterval: isWithinIntervalFn,
  
  // Comparisons
  compareAsc,
  compareDesc,
  differenceInBusinessDays,
  differenceInCalendarDays,
  differenceInCalendarISOWeeks,
  differenceInCalendarISOWeekYears,
  differenceInCalendarMonths,
  differenceInCalendarQuarters,
  differenceInCalendarWeeks,
  differenceInCalendarYears,
  differenceInDays,
  differenceInHours,
  differenceInISOWeekYears,
  differenceInMilliseconds,
  differenceInMinutes,
  differenceInMonths,
  differenceInQuarters,
  differenceInSeconds,
  differenceInWeeks,
  differenceInYears,
  
  // Ranges
  eachDayOfInterval,
  eachHourOfInterval,
  eachMinuteOfInterval,
  eachMonthOfInterval,
  eachQuarterOfInterval,
  eachWeekOfInterval,
  eachWeekendOfInterval,
  eachWeekendOfMonth,
  eachWeekendOfYear,
  eachYearOfInterval,
  
  // Start/end of...
  startOfDay,
  endOfDay,
  startOfWeek: startOfWeekFn,
  endOfWeek: endOfWeek,
  startOfISOWeek,
  endOfISOWeek,
  startOfISOWeekYear,
  endOfISOWeekYear,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear: startOfYearFn,
  endOfYear,
  startOfDecade,
  endOfDecade,
  startOfToday: startOfTodayFn,
  endOfToday: endOfTodayFn,
  startOfTomorrow: startOfTomorrowFn,
  endOfTomorrow: endOfTomorrowFn,
  startOfYesterday: startOfYesterdayFn,
  endOfYesterday: endOfYesterdayFn,
  startOfHour,
  endOfHour,
  startOfMinute: startOfMinuteFn,
  endOfMinute,
  startOfSecond: startOfSecondFn,
  endOfSecond,
  
  // Add/subtract
  addTime,
  addDays,
  addWeeks,
  addMonths,
  addQuarters,
  addYears,
  addHours,
  addMinutes,
  addSeconds,
  addMilliseconds,
  sub: subFn,
  subDays,
  subWeeks: subWeeksFn,
  subMonths: subMonthsFn,
  subQuarters,
  subYears: subYearsFn,
  subHours,
  subMinutes,
  subSeconds,
  subMilliseconds,
  
  // Helpers
  isDateToday,
  isDateTomorrow,
  isDateYesterday,
  getDayRange,
  getWeekRange,
  getMonthRange,
  getYearRange,
  
  // Constants
  FORMATS,
  
  // Re-export all date-fns functions
  // ...
};

export default {
  // Core functions
  formatDate: formatDateWithLocale,
  formatRelativeTime,
  
  // Helpers
  isToday: isDateToday,
  isTomorrow: isDateTomorrow,
  isYesterday: isDateYesterday,
  
  // Ranges
  getDayRange,
  getWeekRange,
  getMonthRange,
  getYearRange,
  
  // Constants
  FORMATS,
  
  // Re-export all named exports as default properties
  ...Object.fromEntries(
    Object.entries({
      // ...all named exports
    }).filter(([key]) => key !== 'default')
  ),
};
