import apiService from '@/lib/apiService';

const staffService = {
    // --- Tasks ---
    getTasks: async (params) => {
        try {
            const response = await apiService.get('/staff/tasks/', params);
            return response;
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    },

    // --- Staff Management ---
    getStaff: async (params) => {
        try {
            const response = await apiService.get('/staff/', params);
            return response;
        } catch (error) {
            console.error('Error fetching staff list:', error);
            throw error;
        }
    },

    createTask: async (data) => {
        try {
            const response = await apiService.post('/staff/tasks/create/', data);
            return response;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    },

    updateTaskStatus: async (taskId, action) => {
        try {
            // action: accept, start, submit, approve, reject, cancel
            const response = await apiService.post(`/staff/tasks/${taskId}/status/`, { action });
            return response;
        } catch (error) {
            console.error('Error updating task status:', error);
            throw error;
        }
    },

    // --- Attendance ---
    getAttendance: async (params) => {
        try {
            const response = await apiService.get('/staff/attendance/', params);
            return response;
        } catch (error) {
            console.error('Error fetching attendance:', error);
            throw error;
        }
    },

    // Best Attendance Method: One-tap Check-in/out
    clockIn: async (staffId) => {
        try {
            const response = await apiService.post('/staff/clock-in/', { staff_id: staffId });
            return response;
        } catch (error) {
            console.error('Error clocking in:', error);
            throw error;
        }
    },

    clockOut: async (staffId) => {
        try {
            const response = await apiService.post('/staff/clock-out/', { staff_id: staffId });
            return response;
        } catch (error) {
            console.error('Error clocking out:', error);
            throw error;
        }
    },

    // Fallback/Admin toggle
    toggleAttendance: async (data) => {
        try {
            const response = await apiService.post('/staff/attendance/toggle/', data);
            return response;
        } catch (error) {
            console.error('Error toggling attendance:', error);
            throw error;
        }
    },

    // --- Reports ---
    getReports: async (params) => {
        try {
            // params: period (daily, weekly, monthly), staff_id
            const response = await apiService.get('/staff/reports/', params);
            return response;
        } catch (error) {
            console.error('Error fetching reports:', error);
            throw error;
        }
    }
};

export default staffService;
