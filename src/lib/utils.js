import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return new Date(date).toLocaleDateString(undefined, defaultOptions);
}

export function formatTime(date, options = {}) {
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  return new Date(date).toLocaleTimeString(undefined, defaultOptions);
}

export function formatDateTime(date) {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function formatCurrency(amount, currency = 'ETB') {
  // For ETB, we'll format manually since Intl.NumberFormat may not support ETB properly
  if (currency === 'ETB') {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ETB`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function truncate(str, length = 100) {
  if (!str || str.length <= length) return str;
  return `${str.substring(0, length)}...`;
}

export function getQueryParam(param) {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

export function setQueryParam(key, value) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  window.history.pushState({}, '', url);
}

export function removeQueryParam(key) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location);
  url.searchParams.delete(key);
  window.history.pushState({}, '', url);
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function isMobile() {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export function isIOS() {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isAndroid() {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
}

export function isSafari() {
  if (typeof window === 'undefined') return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export function isChrome() {
  if (typeof window === 'undefined') return false;
  return /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
}

export function isFirefox() {
  if (typeof window === 'undefined') return false;
  return /Firefox/.test(navigator.userAgent);
}

export function isEdge() {
  if (typeof window === 'undefined') return false;
  return /Edg/.test(navigator.userAgent);
}

export function isIE() {
  if (typeof window === 'undefined') return false;
  return /Trident/.test(navigator.userAgent);
}

export function isMac() {
  if (typeof window === 'undefined') return false;
  return /Mac/.test(navigator.platform);
}

export function isWindows() {
  if (typeof window === 'undefined') return false;
  return /Win/.test(navigator.platform);
}

export function isLinux() {
  if (typeof window === 'undefined') return false;
  return /Linux/.test(navigator.platform);
}

export function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function getOS() {
  if (typeof window === 'undefined') return 'unknown';

  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
  const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

  if (macosPlatforms.indexOf(platform) !== -1) return 'macOS';
  if (iosPlatforms.indexOf(platform) !== -1) return 'iOS';
  if (windowsPlatforms.indexOf(platform) !== -1) return 'Windows';
  if (/Android/.test(userAgent)) return 'Android';
  if (/Linux/.test(platform)) return 'Linux';

  return 'unknown';
}

export function getBrowser() {
  if (typeof window === 'undefined') return 'unknown';

  const userAgent = window.navigator.userAgent;

  if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
  if (userAgent.indexOf('SamsungBrowser') > -1) return 'Samsung Browser';
  if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) return 'Opera';
  if (userAgent.indexOf('Trident') > -1) return 'Internet Explorer';
  if (userAgent.indexOf('Edge') > -1) return 'Edge';
  if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
  if (userAgent.indexOf('Safari') > -1) return 'Safari';

  return 'unknown';
}

export function getDeviceType() {
  if (typeof window === 'undefined') return 'desktop';

  const userAgent = navigator.userAgent;

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    return 'tablet';
  }

  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
    return 'mobile';
  }

  return 'desktop';
}

export function getViewportSize() {
  if (typeof window === 'undefined') return { width: 0, height: 0 };
  return {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  };
}

export function isInViewport(element) {
  if (typeof window === 'undefined' || !element) return false;

  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= viewportHeight &&
    rect.right <= viewportWidth
  );
}

export function scrollToElement(selector, offset = 0) {
  if (typeof document === 'undefined') return;

  const element = document.querySelector(selector);
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

export function copyToClipboard(text) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      return true;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }

  return navigator.clipboard.writeText(text).then(
    () => true,
    (err) => {
      console.error('Failed to copy text: ', err);
      return false;
    }
  );
}

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateId(prefix = '') {
  return `${prefix}${Math.random().toString(36).substr(2, 9)}`;
}

export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getFileExtension(filename) {
  return filename.slice((Math.max(0, filename.lastIndexOf(".")) || Infinity) + 1);
}

export function isImageFile(filename) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const ext = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(ext);
}

export function isVideoFile(filename) {
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv'];
  const ext = getFileExtension(filename).toLowerCase();
  return videoExtensions.includes(ext);
}

export function isAudioFile(filename) {
  const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'];
  const ext = getFileExtension(filename).toLowerCase();
  return audioExtensions.includes(ext);
}

export function isDocumentFile(filename) {
  const docExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
  const ext = getFileExtension(filename).toLowerCase();
  return docExtensions.includes(ext);
}

export function isCompressedFile(filename) {
  const compressedExtensions = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'];
  const ext = getFileExtension(filename).toLowerCase();
  return compressedExtensions.includes(ext);
}

export function getFileIcon(filename) {
  const ext = getFileExtension(filename).toLowerCase();

  if (isImageFile(filename)) return 'image';
  if (isVideoFile(filename)) return 'video';
  if (isAudioFile(filename)) return 'audio';
  if (isDocumentFile(filename)) {
    switch (ext) {
      case 'pdf':
        return 'file-pdf';
      case 'doc':
      case 'docx':
        return 'file-word';
      case 'xls':
      case 'xlsx':
        return 'file-excel';
      case 'ppt':
      case 'pptx':
        return 'file-powerpoint';
      case 'txt':
        return 'file-alt';
      default:
        return 'file';
    }
  }
  if (isCompressedFile(filename)) return 'file-archive';

  return 'file';
}

export function formatPhoneNumber(phoneNumberString) {
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phoneNumberString;
}

export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function isValidPhone(phone) {
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
  return re.test(String(phone));
}

export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function sanitizeInput(input) {
  if (!input) return '';

  // Convert to string if it's not already
  const str = String(input);

  // Remove any HTML tags
  return str.replace(/<[^>]*>?/gm, '');
}

export function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function slugify(str) {
  if (!str) return '';

  return String(str)
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s\-]+/g, '-');
}

export function unslugify(slug) {
  if (!slug) return '';

  return String(slug)
    .replace(/-/g, ' ')
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

export function getQueryParams() {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const result = {};

  for (const [key, value] of params.entries()) {
    result[key] = value;
  }

  return result;
}

export function updateQueryParams(params) {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location);
  const searchParams = new URLSearchParams(url.search);

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
  });

  url.search = searchParams.toString();
  window.history.pushState({}, '', url);
}

export function removeQueryParams(...params) {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location);
  const searchParams = new URLSearchParams(url.search);

  params.forEach(param => {
    searchParams.delete(param);
  });

  url.search = searchParams.toString();
  window.history.pushState({}, '', url);
}

export function getCookie(name) {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export function setCookie(name, value, days = 7) {
  if (typeof document === 'undefined') return;

  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

export function deleteCookie(name) {
  if (typeof document === 'undefined') return;

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

export function getLocalStorage(key, defaultValue = null) {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setLocalStorage(key, value) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

export function removeLocalStorage(key) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

export function getSessionStorage(key, defaultValue = null) {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = window.sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting sessionStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setSessionStorage(key, value) {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting sessionStorage key "${key}":`, error);
  }
}

export function removeSessionStorage(key) {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing sessionStorage key "${key}":`, error);
  }
}

export function clearStorage() {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.clear();
    window.sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}

export function formatNumber(number, options = {}) {
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  };

  return new Intl.NumberFormat(undefined, defaultOptions).format(number);
}

export function formatPercentage(number, decimals = 0) {
  return new Intl.NumberFormat(undefined, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number / 100);
}

export function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
}

export function getContrastColor(hexColor) {
  // If the color is light, return dark color, otherwise return light color
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);

  // Calculate the perceptive luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function rgbaToHex(rgba) {
  const values = rgba.match(/\d+/g);
  if (!values || values.length < 3) return '#000000';

  const [r, g, b] = values.map(Number);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

export function lightenDarkenColor(hex, percent) {
  // Convert hex to RGB
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  // Convert to HSL
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  // Adjust lightness
  l = Math.min(1, Math.max(0, l + (l * percent / 100)));

  // Convert back to RGB
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  // Convert to hex
  const toHex = (x) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getTextColor(backgroundColor) {
  // Convert hex to RGB
  const r = parseInt(backgroundColor.slice(1, 3), 16);
  const g = parseInt(backgroundColor.slice(3, 5), 16);
  const b = parseInt(backgroundColor.slice(5, 7), 16);

  // Calculate the perceptive luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light colors and white for dark colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function getRandomGradient() {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
    'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)',
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  ];

  return gradients[Math.floor(Math.random() * gradients.length)];
}

export function getRandomPastelColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 100%, 85%)`;
}

export function getRandomDarkColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 30%)`;
}

export function getRandomLightColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 100%, 95%)`;
}

export function getRandomGrayscale() {
  const shade = Math.floor(Math.random() * 100) + 100; // 100-200
  return `rgb(${shade}, ${shade}, ${shade})`;
}

export function getRandomRgb() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

export function getRandomRgba(alpha = 1) {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getRandomHsl() {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 100);
  const l = Math.floor(Math.random() * 100);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function getRandomHsla(alpha = 1) {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 100);
  const l = Math.floor(Math.random() * 100);
  return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
}

export function getRandomHex() {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

export function getRandomHexWithAlpha(alpha = 1) {
  const hex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const alphaHex = Math.floor(alpha * 255).toString(16).padStart(2, '0');
  return `#${hex}${alphaHex}`;
}

export function getRandomGradientWithOpacity(opacity = 1) {
  const color1 = getRandomRgba(opacity);
  const color2 = getRandomRgba(opacity);
  return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
}

export function getRandomRadialGradient() {
  const color1 = getRandomRgba(0.8);
  const color2 = getRandomRgba(0.8);
  return `radial-gradient(circle, ${color1} 0%, ${color2} 100%)`;
}

export function getRandomConicGradient() {
  const color1 = getRandomRgba(0.8);
  const color2 = getRandomRgba(0.8);
  const color3 = getRandomRgba(0.8);
  return `conic-gradient(from 0deg, ${color1}, ${color2}, ${color3}, ${color1})`;
}

export function getRandomRepeatingGradient() {
  const color1 = getRandomRgba(0.8);
  const color2 = getRandomRgba(0.8);
  return `repeating-linear-gradient(45deg, ${color1}, ${color1} 10px, ${color2} 10px, ${color2} 20px)`;
}

export function getRandomPattern() {
  const patterns = [
    'polka-dots',
    'stripes',
    'checkerboard',
    'zigzag',
    'dots',
    'crosshatch',
    'bricks',
    'waves',
    'squares',
    'triangles',
  ];

  return patterns[Math.floor(Math.random() * patterns.length)];
}

export function getRandomPatternCss() {
  const pattern = getRandomPattern();

  switch (pattern) {
    case 'polka-dots':
      return {
        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
        backgroundSize: '10px 10px',
      };
    case 'stripes':
      return {
        backgroundImage: 'repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)',
        backgroundSize: '10px 10px',
      };
    case 'checkerboard':
      return {
        backgroundImage: 'linear-gradient(45deg, currentColor 25%, transparent 25%), linear-gradient(-45deg, currentColor 25%, transparent 25%), linear-gradient(45deg, transparent 75%, currentColor 75%), linear-gradient(-45deg, transparent 75%, currentColor 75%)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      };
    case 'zigzag':
      return {
        backgroundImage: 'linear-gradient(135deg, currentColor 25%, transparent 25%) -10px 0, linear-gradient(225deg, currentColor 25%, transparent 25%) -10px 0, linear-gradient(315deg, currentColor 25%, transparent 25%), linear-gradient(45deg, currentColor 25%, transparent 25%)',
        backgroundSize: '20px 20px',
      };
    case 'dots':
      return {
        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
    case 'crosshatch':
      return {
        backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      };
    case 'bricks':
      return {
        backgroundImage: 'linear-gradient(90deg, currentColor 10%, transparent 10%), linear-gradient(90deg, currentColor 10%, transparent 10%), linear-gradient(currentColor 10%, transparent 10%), linear-gradient(transparent 3px, #f2f2f2 3px, #f2f2f2 5px, transparent 5px, transparent 10px)',
        backgroundSize: '20px 10px, 20px 10px, 10px 10px, 10px 10px',
      };
    case 'waves':
      return {
        backgroundImage: 'radial-gradient(circle at 50% 50%, currentColor 0%, currentColor 10%, transparent 10%), radial-gradient(circle at 50% 50%, currentColor 0%, currentColor 10%, transparent 10%)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px',
      };
    case 'squares':
      return {
        backgroundImage: 'linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%, currentColor), linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%, currentColor)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px',
      };
    case 'triangles':
      return {
        backgroundImage: 'linear-gradient(45deg, currentColor 25%, transparent 25%), linear-gradient(-45deg, currentColor 25%, transparent 25%), linear-gradient(45deg, transparent 75%, currentColor 75%), linear-gradient(-45deg, transparent 75%, currentColor 75%)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      };
    default:
      return {};
  }
}

export function getRandomPatternWithColor(color = '#000000') {
  const pattern = getRandomPatternCss();
  return {
    ...pattern,
    backgroundColor: color,
  };
}

export function getRandomPatternWithRandomColor() {
  const color = getRandomHex();
  return getRandomPatternWithColor(color);
}

export function getRandomPatternWithOpacity(opacity = 0.5) {
  const color = getRandomRgba(opacity);
  return getRandomPatternWithColor(color);
}

export function getRandomPatternWithGradient() {
  const gradient = getRandomGradient();
  const pattern = getRandomPatternCss();
  return {
    ...pattern,
    backgroundImage: `${gradient}, ${pattern.backgroundImage}`,
  };
}

export function getRandomPatternWithImage(imageUrl) {
  const pattern = getRandomPatternCss();
  return {
    ...pattern,
    backgroundImage: `url(${imageUrl})`,
  };
}
