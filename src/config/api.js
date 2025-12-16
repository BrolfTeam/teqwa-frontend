import { API_URL } from './env';

const API_BASE_URL = `${API_URL}/api/v1`;

export const apiEndpoints = {
  // Authentication
  auth: {
    login: `${API_BASE_URL}/auth/login/`,
    register: `${API_BASE_URL}/auth/register/`,
    refresh: `${API_BASE_URL}/auth/refresh/`,
    profile: `${API_BASE_URL}/auth/profile/`,
    updateProfile: `${API_BASE_URL}/auth/profile/update/`,
  },

  // User Accounts
  accounts: {
    profile: `${API_BASE_URL}/accounts/profile/`,
    updateProfile: `${API_BASE_URL}/accounts/profile/update/`,
    changePassword: `${API_BASE_URL}/accounts/change-password/`,
    activities: `${API_BASE_URL}/accounts/activities/`,
    sessions: `${API_BASE_URL}/accounts/sessions/`,
  },

  // Staff
  staff: {
    list: `${API_BASE_URL}/staff/`,
    detail: (id) => `${API_BASE_URL}/staff/${id}/`,
    attendance: `${API_BASE_URL}/staff/attendance/`,
    tasks: `${API_BASE_URL}/staff/tasks/`,
  },

  // Prayer Times
  prayers: {
    current: `${API_BASE_URL}/prayer-times/current/`,
    monthly: (year, month) => `${API_BASE_URL}/prayer-times/monthly/${year}/${month}/`,
    yearly: (year) => `${API_BASE_URL}/prayer-times/yearly/${year}/`,
    methods: `${API_BASE_URL}/prayer-times/methods/`,
    qibla: `${API_BASE_URL}/prayer-times/qibla/`,
  },

  // Itikaf
  itikaf: {
    list: `${API_BASE_URL}/itikaf/`,
    upcoming: `${API_BASE_URL}/itikaf/?upcoming=true`,
    detail: (id) => `${API_BASE_URL}/itikaf/${id}/`,
    create: `${API_BASE_URL}/itikaf/create/`,
    register: (id) => `${API_BASE_URL}/itikaf/${id}/register/`,
    unregister: (id) => `${API_BASE_URL}/itikaf/${id}/unregister/`,
    schedules: (id) => `${API_BASE_URL}/itikaf/${id}/schedules/`,
    participants: (id) => `${API_BASE_URL}/itikaf/${id}/participants/`,
    myRegistrations: `${API_BASE_URL}/itikaf/my-registrations/`,
  },

  // Events
  events: {
    list: `${API_BASE_URL}/events/`,
    upcoming: `${API_BASE_URL}/events/?upcoming=true`,
    featured: `${API_BASE_URL}/events/?featured=true`,
    detail: (eventId) => `${API_BASE_URL}/events/${eventId}/`,
    register: (eventId) => `${API_BASE_URL}/events/${eventId}/register/`,
    attendees: (eventId) => `${API_BASE_URL}/events/${eventId}/attendees/`,
    create: `${API_BASE_URL}/events/create/`,
  },

  // Announcements
  announcements: {
    list: `${API_BASE_URL}/announcements/`,
    featured: `${API_BASE_URL}/announcements/?featured=true`,
    detail: (id) => `${API_BASE_URL}/announcements/${id}/`,
    create: `${API_BASE_URL}/announcements/create/`,
  },

  // Education
  education: {
    list: `${API_BASE_URL}/education/`,
    detail: (id) => `${API_BASE_URL}/education/${id}/`,
    enroll: (id) => `${API_BASE_URL}/education/${id}/enroll/`,
    myEnrollments: `${API_BASE_URL}/education/my-enrollments/`,
  },

  // Donations
  donations: {
    create: `${API_BASE_URL}/donations/create/`,
    list: `${API_BASE_URL}/donations/`,
    stats: `${API_BASE_URL}/donations/stats/`,
    causes: `${API_BASE_URL}/donations/causes/`,
    createCause: `${API_BASE_URL}/donations/causes/create/`,
  },

  // Media
  media: {
    upload: `${API_BASE_URL}/media/upload`,
    list: `${API_BASE_URL}/media`,
    detail: (mediaId) => `${API_BASE_URL}/media/${mediaId}`,
    delete: (mediaId) => `${API_BASE_URL}/media/${mediaId}`,
  },

  // Gallery
  gallery: {
    albums: `${API_BASE_URL}/gallery/albums`,
    albumDetail: (albumId) => `${API_BASE_URL}/gallery/albums/${albumId}`,
    photos: (albumId) => `${API_BASE_URL}/gallery/albums/${albumId}/photos`,
    videos: `${API_BASE_URL}/gallery/videos`,
  },

  // Blog/News
  blog: {
    posts: `${API_BASE_URL}/blog/posts`,
    featured: `${API_BASE_URL}/blog/featured`,
    categories: `${API_BASE_URL}/blog/categories`,
    postDetail: (postId) => `${API_BASE_URL}/blog/posts/${postId}`,
    postComments: (postId) => `${API_BASE_URL}/blog/posts/${postId}/comments`,
    addComment: (postId) => `${API_BASE_URL}/blog/posts/${postId}/comments`,
  },

  // Contact
  contact: {
    submit: `${API_BASE_URL}/contact`,
    subscribe: `${API_BASE_URL}/newsletter/subscribe`,
    unsubscribe: `${API_BASE_URL}/newsletter/unsubscribe`,
  },

  // Settings
  settings: {
    general: `${API_BASE_URL}/settings/general`,
    homePage: `${API_BASE_URL}/settings/home-page`,
    socialMedia: `${API_BASE_URL}/settings/social-media`,
    contactInfo: `${API_BASE_URL}/settings/contact-info`,
    seo: `${API_BASE_URL}/settings/seo`,
  },

  // Admin
  admin: {
    users: `${API_BASE_URL}/admin/users`,
    userDetail: (userId) => `${API_BASE_URL}/admin/users/${userId}`,
    roles: `${API_BASE_URL}/admin/roles`,
    permissions: `${API_BASE_URL}/admin/permissions`,
    systemInfo: `${API_BASE_URL}/admin/system-info`,
    logs: `${API_BASE_URL}/admin/logs`,
    backup: `${API_BASE_URL}/admin/backup`,
    maintenance: `${API_BASE_URL}/admin/maintenance`,
  },
};

export const apiConfig = {
  // Default headers for all requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // Timeout for requests (in milliseconds)
  timeout: 30000,

  // Whether to include credentials (cookies, HTTP authentication)
  withCredentials: true,

  // Response type
  responseType: 'json',

  // Request/response interceptors
  interceptors: {
    // Request interceptor
    request: (config) => {
      // Add auth token to requests if available
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },

    // Response interceptor
    response: (response) => {
      // Handle successful responses
      return response.data;
    },

    // Error interceptor
    error: (error) => {
      // Handle errors globally
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('API Error:', error.response.data);
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
      }
      return Promise.reject(error);
    },
  },
};

export default {
  ...apiEndpoints,
  ...apiConfig,
};
