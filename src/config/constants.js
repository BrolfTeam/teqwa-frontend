import { API_URL } from './env';

// Use production API URL from environment variable
export const API_BASE_URL = API_URL;

export const DEFAULT_PRAYER_TIMES = {
    fajr: '5:30 AM',
    sunrise: '7:00 AM',
    dhuhr: '1:30 PM',
    asr: '4:45 PM',
    maghrib: '6:30 PM',
    isha: '8:00 PM',
    jummah: '1:30 PM',
};

export const DONATION_AMOUNTS = [25, 50, 100, 250, 500, 1000];

export const CONTACT_INFO = {
    address: 'MuJemea At-Tekwa, Addis Ababa, Ethiopia',
    phone: '+251 11 123 4567',
    email: 'info@mujemea-at-tekwa.org',
    mapLink: 'https://maps.app.goo.gl/UX9Aq8fhoAnqZSKg7',
};
