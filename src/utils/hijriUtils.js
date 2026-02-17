/**
 * Hijri Calendar Utilities
 * Consolidates mathematical Hijri conversion and Ramadan detection logic.
 */

/**
 * Robust mathematical Hijri conversion (Tabular/Kuwaiti algorithm)
 * @param {Date} date - Gregorian date
 * @param {number} adjustment - Number of days to adjust (default 0)
 * @param {boolean} isAfterMaghrib - Whether current time is after Maghrib (Hijri day starts at sunset)
 * @returns {Object} { day, month, year } where month is 0-indexed
 */
export const calculateHijri = (date, adjustment = 0, isAfterMaghrib = false) => {
    const adjustedDate = new Date(date);
    // If it's after Maghrib, the Hijri day is already the next Gregorian day
    const effectiveAdjustment = adjustment + (isAfterMaghrib ? 1 : 0);
    adjustedDate.setDate(date.getDate() + effectiveAdjustment);

    let day = adjustedDate.getDate();
    let month = adjustedDate.getMonth();
    let year = adjustedDate.getFullYear();

    if (year < 1900) return { day: 1, month: 0, year: 1447 };

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
};

/**
 * Detects if a given date is within Ramadan.
 * @param {Date} date 
 * @param {number} adjustment 
 * @param {boolean} isAfterMaghrib
 * @returns {boolean}
 */
export const isRamadan = (date = new Date(), adjustment = 0, isAfterMaghrib = false) => {
    const hijri = calculateHijri(date, adjustment, isAfterMaghrib);
    return hijri.month === 8; // Ramadan is the 9th month (0-indexed 8)
};

/**
 * Returns the current Hijri day in Ramadan (1-30).
 * @param {Date} date 
 * @param {number} adjustment 
 * @param {boolean} isAfterMaghrib
 * @returns {number|null}
 */
export const getRamadanDay = (date = new Date(), adjustment = 0, isAfterMaghrib = false) => {
    const hijri = calculateHijri(date, adjustment, isAfterMaghrib);
    return hijri.month === 8 ? hijri.day : null;
};

/**
 * Gets Hijri adjustment from localStorage.
 * @returns {number}
 */
export const getStoredHijriAdjustment = () => {
    try {
        const stored = localStorage.getItem('hijri_adjustment');
        return stored ? parseInt(stored, 10) : 0;
    } catch (e) {
        return 0;
    }
};

export const HIJRI_MONTHS = [
    "muharram", "safar", "rabiAlAwwal", "rabiAlThani",
    "jumadaAlAwwal", "jumadaAlThani", "rajab", "shaban",
    "ramadan", "shawwal", "dhuAlQidah", "dhuAlHijjah"
];

export default {
    calculateHijri,
    isRamadan,
    getRamadanDay,
    getStoredHijriAdjustment,
    HIJRI_MONTHS
};
