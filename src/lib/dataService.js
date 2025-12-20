/**
 * Centralized data service for handling all API integrations
 * Provides consistent error handling and data transformation
 * 
 * Note: Browser console will show network errors (404, 403, etc.) for failed requests.
 * This is expected browser behavior and cannot be suppressed. However, this service
 * handles these errors gracefully by returning appropriate empty data structures,
 * allowing the application to continue functioning normally.
 */

import { apiService } from './apiService';
import { toast } from 'sonner';

class DataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Generic cache management
  getCacheKey(endpoint, params = {}) {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  // Generic API call with error handling
  async apiCall(apiMethod, params = {}, options = {}) {
    const { useCache = true, showError = true } = options;
    const cacheKey = this.getCacheKey(apiMethod.name, params);

    // Check cache first
    if (useCache) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await apiMethod(params);
      const data = response?.data || response || [];

      // Cache successful responses
      if (useCache) {
        this.setCache(cacheKey, data);
      }

      return data;
    } catch (error) {
      // Handle rate limiting (429) - don't show error, just return empty data
      if (error.status === 429) {
        console.warn(`Rate limited for ${apiMethod.name}, returning empty data`);
        // Return empty data structure instead of throwing
        return [];
      }

      // Handle "Student profile not found" errors (404) - return empty data gracefully
      if (error.status === 404 && (error.message?.includes('Student profile') || error.message?.includes('profile not found'))) {
        // Silently handle - this is expected for users without student profiles
        // Only log once per session to avoid console spam
        if (!window._studentProfileWarningLogged) {
          console.debug(
            '%cℹ️ Student Profile Info:',
            'color: #10b981; font-weight: bold;',
            'Student profile not found - returning empty data. This is expected for users without student profiles. ' +
            'The dashboard will display with empty states. Browser network logs (404 errors) are normal and cannot be suppressed.'
          );
          window._studentProfileWarningLogged = true;
        }
        // Return appropriate empty structure based on expected return type
        // For methods that return objects with data property, return { data: {} }
        // For methods that return arrays directly, return []
        if (apiMethod.name.includes('Stats') || apiMethod.name.includes('Grades') || apiMethod.name.includes('Dashboard')) {
          return { data: {} };
        }
        return [];
      }

      // Handle permission denied errors (403) - return empty data gracefully
      if (error.status === 403) {
        // Silently handle - this is expected for users without required permissions
        // Only log once per session to avoid console spam
        if (!window._permissionDeniedWarningLogged) {
          console.debug(`Permission denied for ${apiMethod.name} - returning empty data (this is expected for users without required permissions)`);
          window._permissionDeniedWarningLogged = true;
        }
        // Return appropriate empty structure based on expected return type
        if (apiMethod.name.includes('Stats') || apiMethod.name.includes('Dashboard')) {
          return { data: {} };
        }
        return [];
      }

      // Log other errors (not 404 student profile or 403 permission denied)
      console.error(`API call failed for ${apiMethod.name}:`, error);

      // Handle network errors gracefully
      if (error.message && (error.message.includes('Network error') || error.message.includes('Failed to fetch') || error.message.includes('ERR_EMPTY_RESPONSE'))) {
        console.warn(`Network error for ${apiMethod.name}, returning empty data`);
        if (showError) {
          toast.error('Unable to connect to server. Please check your connection.');
        }
        // Return empty data structure instead of throwing
        return [];
      }

      // Don't show error toast for 403 (Forbidden) or 401 (Unauthorized) - these are permission issues
      // that should be handled gracefully by the calling code
      if (showError && error.status !== 403 && error.status !== 401 && error.status !== 429) {
        const errorMessage = error.data?.message || error.message || 'An error occurred';
        toast.error(errorMessage);
      }

      throw error;
    }
  }

  // Events
  async getEvents(params = {}) {
    return this.apiCall(() => apiService.getEvents(params), params);
  }

  async getUpcomingEvents(limit = 10) {
    return this.apiCall(() => apiService.getEvents({ upcoming: true }), { limit })
      .then(events => events.slice(0, limit));
  }

  async getFeaturedEvents(limit = 5) {
    return this.apiCall(() => apiService.getEvents({ featured: true }), { limit })
      .then(events => events.slice(0, limit));
  }

  async getEvent(id) {
    return this.apiCall(() => apiService.getEvent(id), { id });
  }

  async registerForEvent(eventId) {
    return this.apiCall(() => apiService.registerForEvent(eventId), { eventId }, { useCache: false });
  }

  // Announcements/News
  async getAnnouncements(params = {}) {
    return this.apiCall(() => apiService.getAnnouncements(params), params);
  }

  async getFeaturedAnnouncements(limit = 3) {
    return this.apiCall(() => apiService.getAnnouncements({ featured: true }), { limit })
      .then(announcements => announcements.slice(0, limit));
  }

  async getAnnouncement(id) {
    return this.apiCall(() => apiService.getAnnouncement(id), { id });
  }

  // Donations
  async getDonationCauses() {
    return this.apiCall(() => apiService.getDonationCauses());
  }

  async createDonation(donationData) {
    return this.apiCall(() => apiService.createDonation(donationData), donationData, { useCache: false });
  }

  async getDonationStats() {
    return this.apiCall(() => apiService.getDonationStats());
  }

  // Education Services
  async getEducationServices(params = {}) {
    return this.apiCall(() => apiService.getEducationServices(params), params);
  }

  async getEducationService(id) {
    return this.apiCall(() => apiService.getEducationService(id), { id });
  }

  async getCourses(params = {}) {
    return this.apiCall(() => apiService.getCourses(params), params);
  }

  async getCourse(id) {
    return this.apiCall(() => apiService.getCourse(id), { id });
  }

  async enrollInService(serviceId) {
    return this.apiCall(() => apiService.enrollInService(serviceId), { serviceId }, { useCache: false });
  }

  async getMyEnrollments() {
    return this.apiCall(() => apiService.getMyEnrollments(), {}, { useCache: false });
  }

  async getAllEducationEnrollments(params = {}, options = {}) {
    return this.apiCall(() => apiService.getAllEducationEnrollments(params), params, { useCache: false, showError: options.showError !== false });
  }

  async updateEnrollmentStatus(enrollmentId, status) {
    return this.apiCall(() => apiService.updateEnrollmentStatus(enrollmentId, status), { enrollmentId, status }, { useCache: false });
  }

  async getAllDonations(params = {}) {
    return this.apiCall(() => apiService.getAllDonations(params), params, { useCache: false });
  }

  // Staff
  async getStaff(params = {}) {
    return this.apiCall(() => apiService.getStaff(params), params);
  }

  async getStaffMember(id) {
    return this.apiCall(() => apiService.getStaffMember(id), { id });
  }

  async getStaffHours(params = {}) {
    return this.apiCall(() => apiService.getStaffHours(params), params);
  }

  async clockIn(id) {
    return this.apiCall(() => apiService.clockIn(id), { id }, { useCache: false });
  }

  async clockOut(id) {
    return this.apiCall(() => apiService.clockOut(id), { id }, { useCache: false });
  }

  async getStaffTasks(id) {
    return this.apiCall(() => apiService.getStaffTasks(id), { id });
  }

  async assignTask(id, taskData) {
    return this.apiCall(() => apiService.assignTask(id, taskData), { id, ...taskData }, { useCache: false });
  }

  async completeTask(id) {
    return this.apiCall(() => apiService.completeTask(id), { id }, { useCache: false });
  }

  async getStaffReports() {
    return this.apiCall(() => apiService.getStaffReports());
  }

  async getStaffAttendance(params = {}) {
    return this.apiCall(() => apiService.getStaffAttendance(params), params);
  }

  async toggleStaffAttendance(data) {
    return this.apiCall(() => apiService.toggleStaffAttendance(data), data, { useCache: false });
  }

  // Prayer Times
  async getCurrentPrayerTimes() {
    return this.apiCall(() => apiService.getCurrentPrayerTimes(), {}, { useCache: false });
  }

  async getMonthlyPrayerTimes(year, month) {
    return this.apiCall(() => apiService.getMonthlyPrayerTimes(year, month), { year, month });
  }

  async getQiblaDirection() {
    return this.apiCall(() => apiService.getQiblaDirection());
  }

  // Futsal Booking
  async getFutsalSlots(params = {}) {
    return this.apiCall(() => apiService.getFutsalSlots(params), params);
  }

  async getFutsalSlot(id) {
    return this.apiCall(() => apiService.getFutsalSlot(id), { id });
  }

  async bookFutsalSlot(slotId, bookingData) {
    return this.apiCall(() => apiService.bookFutsalSlot(slotId, bookingData), { slotId, ...bookingData }, { useCache: false });
  }

  async getMyFutsalBookings() {
    return this.apiCall(() => apiService.getMyFutsalBookings(), {}, { useCache: false });
  }

  async getAllFutsalBookings() {
    return this.apiCall(() => apiService.getAllFutsalBookings(), {}, { useCache: false });
  }

  async updateFutsalBookingStatus(id, status) {
    return this.apiCall(() => apiService.updateFutsalBookingStatus(id, status), { id, status }, { useCache: false });
  }

  // Itikaf
  async getItikafPrograms(params = {}) {
    return this.apiCall(() => apiService.getItikafPrograms(params), params);
  }

  async getUpcomingItikafPrograms(limit = 10) {
    return this.apiCall(() => apiService.getItikafPrograms({ upcoming: true }), { limit })
      .then(programs => programs.slice(0, limit));
  }

  async getItikafProgram(id) {
    return this.apiCall(() => apiService.getItikafProgram(id), { id });
  }

  async registerForItikaf(programId, registrationData = {}) {
    return this.apiCall(() => apiService.registerForItikaf(programId, registrationData), { programId, ...registrationData }, { useCache: false });
  }

  async unregisterFromItikaf(programId) {
    return this.apiCall(() => apiService.unregisterFromItikaf(programId), { programId }, { useCache: false });
  }

  async getItikafSchedules(programId) {
    return this.apiCall(() => apiService.getItikafSchedules(programId), { programId });
  }

  async getMyItikafRegistrations() {
    return this.apiCall(() => apiService.getMyItikafRegistrations(), {}, { useCache: false });
  }

  // Authentication
  async login(credentials) {
    return this.apiCall(() => apiService.login(credentials), credentials, { useCache: false });
  }

  async register(userData) {
    return this.apiCall(() => apiService.register(userData), userData, { useCache: false });
  }

  async getProfile() {
    return this.apiCall(() => apiService.getProfile(), {}, { useCache: false });
  }

  // Utility methods
  clearCache() {
    this.cache.clear();
  }

  clearCacheByPattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Data transformation helpers
  normalizeEvent(event) {
    return {
      id: event.id,
      title: event.title || 'Untitled Event',
      description: event.description || '',
      date: event.date || event.start_date,
      time: event.time || event.start_time,
      endDate: event.end_date,
      endTime: event.end_time,
      location: event.location || 'Location TBD',
      category: event.category || 'General',
      image: event.image || event.image_url,
      featured: event.featured || false,
      registrationRequired: event.registration_required || false,
      capacity: event.capacity || 0,
      registeredCount: event.registered_count || 0,
      createdAt: event.created_at,
      updatedAt: event.updated_at
    };
  }

  normalizeAnnouncement(announcement) {
    return {
      id: announcement.id,
      title: announcement.title || 'Untitled Announcement',
      content: announcement.content || announcement.description || '',
      excerpt: announcement.excerpt || (announcement.content || '').slice(0, 160),
      date: announcement.date || announcement.created_at,
      category: announcement.category || 'Announcement',
      featured: announcement.featured || false,
      author: announcement.author,
      image: announcement.image || announcement.image_url,
      createdAt: announcement.created_at,
      updatedAt: announcement.updated_at
    };
  }

  // Batch operations
  async getHomePageData() {
    try {
      const [events, announcements] = await Promise.all([
        this.getUpcomingEvents(3).catch(() => []),
        this.getFeaturedAnnouncements(3).catch(() => [])
      ]);

      return {
        events: events.map(this.normalizeEvent),
        announcements: announcements.map(this.normalizeAnnouncement)
      };
    } catch (error) {
      console.error('Failed to fetch home page data:', error);
      return { events: [], announcements: [] };
    }
  }

  // Students Dashboard
  async getStudentDashboardStats() {
    return this.apiCall(() => apiService.getStudentDashboardStats(), {}, { useCache: false });
  }

  async getStudentTimetable() {
    return this.apiCall(() => apiService.getStudentTimetable(), {}, { useCache: false });
  }

  async getStudentAssignments() {
    return this.apiCall(() => apiService.getStudentAssignments(), {}, { useCache: false });
  }

  async getAssignmentDetail(assignmentId) {
    return this.apiCall(() => apiService.getAssignmentDetail(assignmentId), { assignmentId });
  }

  async getStudentExams() {
    return this.apiCall(() => apiService.getStudentExams(), {}, { useCache: false });
  }

  async getStudentSubmissions(assignmentId = null) {
    return this.apiCall(() => apiService.getStudentSubmissions(assignmentId), { assignmentId }, { useCache: false });
  }

  async submitAssignment(assignmentId, data) {
    return this.apiCall(() => apiService.submitAssignment(assignmentId, data), { assignmentId, ...data }, { useCache: false });
  }

  async getStudentGrades() {
    return this.apiCall(() => apiService.getStudentGrades(), {}, { useCache: false });
  }

  async getStudentMessages() {
    return this.apiCall(() => apiService.getStudentMessages(), {}, { useCache: false });
  }

  async sendMessage(data) {
    return this.apiCall(() => apiService.sendMessage(data), data, { useCache: false });
  }

  async markMessageRead(messageId) {
    return this.apiCall(() => apiService.markMessageRead(messageId), { messageId }, { useCache: false });
  }

  async getStudentAnnouncements() {
    return this.apiCall(() => apiService.getStudentAnnouncements(), {}, { useCache: false });
  }

  async getParentDashboard() {
    return this.apiCall(() => apiService.getParentDashboard(), {}, { useCache: false });
  }
}

// Create singleton instance
export const dataService = new DataService();
export default dataService;