import apiService from '../lib/apiService';

export const lectureService = {
    // Get all lectures with optional filters
    getLectures: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiService.request(`/education/lectures/${query ? `?${query}` : ''}`);
    },

    // Get specific lecture details
    getLecture: async (id) => {
        return apiService.request(`/education/lectures/${id}/`);
    }
};

