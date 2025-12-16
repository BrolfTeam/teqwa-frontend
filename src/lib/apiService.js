import { apiEndpoints } from '@/config/api';
import { API_URL } from '@/config/env';

const API_BASE_URL = API_URL;

export class ApiError extends Error {
  constructor(message, data, status) {
    super(message);
    this.name = 'ApiError';
    this.data = data;
    this.status = status;
  }
}

class ApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/v1`;
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.access);
      if (data.refresh) {
        localStorage.setItem('refreshToken', data.refresh);
      }
      return data.access;
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      // Notify application to log out
      window.dispatchEvent(new Event('auth:logout'));
      // Do not redirect here, let the request fail or retry as guest
      throw error;
    }
  }

  async request(url, options = {}) {
    const token = localStorage.getItem('authToken');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      // console.log('Making request to:', `${this.baseURL}${url}`);
      const response = await fetch(`${this.baseURL}${url}`, config);

      if (response.status === 401 && token && !url.includes('/auth/')) {
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(token => {
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            } else {
              delete config.headers.Authorization;
            }
            return fetch(`${this.baseURL}${url}`, config);
          }).then(async response => {
            if (!response.ok) {
              let errorData = {};
              try {
                const text = await response.text();
                if (text) errorData = JSON.parse(text);
              } catch (e) {
                errorData = { message: `HTTP ${response.status}` };
              }
              throw new ApiError(`HTTP ${response.status}`, errorData, response.status);
            }
            const text = await response.text();
            if (!text) return { data: [] };
            return JSON.parse(text);
          });
        }

        this.isRefreshing = true;

        try {
          const newToken = await this.refreshToken();
          this.processQueue(null, newToken);
          config.headers.Authorization = `Bearer ${newToken}`;
          const retryResponse = await fetch(`${this.baseURL}${url}`, config);

          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({}));
            throw new ApiError(errorData.detail || errorData.error || `HTTP ${retryResponse.status}`, errorData, retryResponse.status);
          }

          return await retryResponse.json();
        } catch (refreshError) {
          // If refresh fails, retry as guest (no token)
          this.processQueue(null, null);
          delete config.headers.Authorization;

          const retryResponse = await fetch(`${this.baseURL}${url}`, config);

          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({}));
            throw new ApiError(errorData.detail || errorData.error || `HTTP ${retryResponse.status}`, errorData, retryResponse.status);
          }

          return await retryResponse.json();
        } finally {
          this.isRefreshing = false;
        }
      }

      if (!response.ok) {
        let errorData = {};
        try {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
          }
        } catch (e) {
          // Response might be empty or not JSON
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        // Prefer 'detail' or 'error' message, otherwise generic string
        const errorMessage = errorData.detail || errorData.error || errorData.message || `Request failed with status ${response.status}`;
        throw new ApiError(errorMessage, errorData, response.status);
      }

      // Check for 204 No Content
      if (response.status === 204) {
        return null;
      }

      // Handle empty responses
      const text = await response.text();
      if (!text || text.trim() === '') {
        console.warn(`Empty response from ${url}`);
        return { data: [], message: 'Empty response', count: 0 };
      }

      try {
        return JSON.parse(text);
      } catch (e) {
        console.error(`Failed to parse JSON response from ${url}:`, e, 'Response text:', text);
        throw new ApiError('Invalid JSON response from server', { text }, response.status);
      }
    } catch (error) {
      // Handle network errors (ERR_EMPTY_RESPONSE, Failed to fetch, etc.)
      if (error instanceof TypeError && (error.message.includes('Failed to fetch') || error.message.includes('ERR_EMPTY_RESPONSE'))) {
        console.error('Network error:', error.message, 'URL:', `${this.baseURL}${url}`);
        throw new ApiError('Network error: Unable to connect to server. Please check if the backend is running.', { networkError: true }, 0);
      }
      
      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
      throw error;
      }
      
      // Wrap other errors
      throw new ApiError(error.message || 'An unexpected error occurred', { originalError: error }, 0);
    }
  }

  // Generic HTTP methods
  get(url, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`${url}${query ? `?${query}` : ''}`, {
      method: 'GET'
    });
  }

  post(url, data = {}) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(url, data = {}) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  patch(url, data = {}) {
    return this.request(url, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  delete(url) {
    return this.request(url, {
      method: 'DELETE'
    });
  }

  // Auth methods
  async login(credentials) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await this.request('/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      console.warn('Logout API call failed, but clearing local state:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async getProfile() {
    return this.request('/auth/profile/');
  }

  async requestPasswordReset(email) {
    return this.request('/auth/password-reset/request/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async confirmPasswordReset(token, password) {
    return this.request('/auth/password-reset/confirm/', {
      method: 'POST',
      body: JSON.stringify({
        token,
        password,
        password_confirm: password
      }),
    });
  }

  async verifyEmail(token) {
    return this.request('/auth/verify-email/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resendVerificationEmail(email) {
    return this.request('/auth/resend-verification/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async changePassword(oldPassword, newPassword) {
    return this.request('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPassword
      }),
    });
  }

  // Announcements
  async getAnnouncements(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/announcements/${query ? `?${query}` : ''}`);
  }

  async getAnnouncement(id) {
    return this.request(`/announcements/${id}/`);
  }

  async createAnnouncement(data) {
    return this.request('/announcements/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Events
  async getEvents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/events/${query ? `?${query}` : ''}`);
  }

  async getEvent(id) {
    return this.request(`/events/${id}/`);
  }

  async createEvent(data) {
    return this.request('/events/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async registerForEvent(eventId) {
    return this.request(`/events/${eventId}/register/`, {
      method: 'POST',
    });
  }

  // Education Services
  async getEducationServices(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/education/${query ? `?${query}` : ''}`);
  }

  async getEducationService(id) {
    return this.request(`/education/${id}/`);
  }

  async enrollInService(serviceId) {
    return this.request(`/education/${serviceId}/book/`, {
      method: 'POST',
    });
  }

  async getMyEnrollments() {
    return this.request('/education/my-bookings/');
  }

  // Futsal Booking
  async getFutsalSlots(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/futsal/slots/${query ? `?${query}` : ''}`);
  }

  async getFutsalSlot(id) {
    return this.request(`/futsal/slots/${id}/`);
  }

  async bookFutsalSlot(slotId, bookingData) {
    return this.request(`/futsal/slots/${slotId}/book/`, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getMyFutsalBookings() {
    return this.request('/futsal/my-bookings/');
  }

  async getAllFutsalBookings() {
    return this.request('/futsal/bookings/');
  }

  async updateFutsalBookingStatus(id, status) {
    return this.request(`/futsal/bookings/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // Donations
  async createDonation(data) {
    return this.request('/donations/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDonationCauses(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/donations/causes/${query ? `?${query}` : ''}`);
  }

  async getDonationStats() {
    return this.request('/donations/stats/');
  }

  async getAllDonations(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/donations/${query ? `?${query}` : ''}`);
  }

  async getAllEducationEnrollments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/education/bookings/${query ? `?${query}` : ''}`);
  }

  async updateEnrollmentStatus(enrollmentId, status) {
    return this.request(`/education/bookings/${enrollmentId}/status/`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // Staff
  async getStaff(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/staff/${query ? `?${query}` : ''}`);
  }

  async getStaffMember(id) {
    return this.request(`/staff/${id}/`);
  }

  async getStaffHours(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/staff/hours/${query ? `?${query}` : ''}`);
  }

  async clockIn(id) {
    return this.request(`/staff/${id}/clock-in/`, {
      method: 'POST',
    });
  }

  async clockOut(id) {
    return this.request(`/staff/${id}/clock-out/`, {
      method: 'POST',
    });
  }

  async getStaffTasks(id) {
    return this.request(`/staff/${id}/tasks/`);
  }

  async assignTask(id, data) {
    return this.request(`/staff/${id}/tasks/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeTask(id) {
    return this.request(`/staff/tasks/${id}/complete/`, {
      method: 'POST',
    });
  }

  async getStaffReports() {
    return this.request('/staff/reports/');
  }

  async getStaffAttendance(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/staff/attendance/${query ? `?${query}` : ''}`);
  }

  async toggleStaffAttendance(data) {
    return this.request('/staff/attendance/toggle/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Itikaf
  async getItikafPrograms(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/itikaf/${query ? `?${query}` : ''}`);
  }

  async getItikafProgram(id) {
    return this.request(`/itikaf/${id}/`);
  }

  async createItikafProgram(data) {
    return this.request('/itikaf/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async registerForItikaf(programId, registrationData = {}) {
    return this.request(`/itikaf/${programId}/register/`, {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  async unregisterFromItikaf(programId) {
    return this.request(`/itikaf/${programId}/unregister/`, {
      method: 'DELETE',
    });
  }

  async getItikafSchedules(programId) {
    return this.request(`/itikaf/${programId}/schedules/`);
  }

  async getMyItikafRegistrations() {
    return this.request('/itikaf/my-registrations/');
  }

  async getItikafParticipants(programId) {
    return this.request(`/itikaf/${programId}/participants/`);
  }

  async createItikafSchedule(programId, scheduleData) {
    return this.request(`/itikaf/${programId}/schedules/create/`, {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  }

  // Memberships
  async getMembershipTiers() {
    return this.request('/memberships/tiers/');
  }

  // Students Dashboard
  async getStudentDashboardStats() {
    return this.request('/students/dashboard/stats/');
  }

  async getStudentTimetable() {
    return this.request('/students/timetable/');
  }

  async getStudentAssignments() {
    return this.request('/students/assignments/');
  }

  async getAssignmentDetail(assignmentId) {
    return this.request(`/students/assignments/${assignmentId}/`);
  }

  async getStudentExams() {
    return this.request('/students/exams/');
  }

  async getStudentSubmissions(assignmentId = null) {
    if (assignmentId) {
      return this.request(`/students/submissions/${assignmentId}/`);
    }
    return this.request('/students/submissions/');
  }

  async submitAssignment(assignmentId, data) {
    return this.request(`/students/submissions/${assignmentId}/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStudentGrades() {
    return this.request('/students/grades/');
  }

  async getStudentMessages() {
    return this.request('/students/messages/');
  }

  async sendMessage(data) {
    return this.request('/students/messages/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markMessageRead(messageId) {
    return this.request(`/students/messages/${messageId}/read/`, {
      method: 'PATCH',
    });
  }

  async getStudentAnnouncements() {
    return this.request('/students/announcements/');
  }

  async getParentDashboard() {
    return this.request('/students/parent/dashboard/');
  }

  async getMyMembership() {
    return this.request('/memberships/my-membership/current/');
  }

  async subscribeToMembership(data) {
    return this.request('/memberships/my-membership/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }


}

export const apiService = new ApiService();
export default apiService;