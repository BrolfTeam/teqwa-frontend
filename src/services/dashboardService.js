import apiService from '@/lib/apiService';

const dashboardService = {
    getStats: async () => {
        try {
            const response = await apiService.get('/accounts/dashboard-stats/');
            // Backend returns { message: "...", data: {...} }
            return response?.data || response || {};
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }
};

export default dashboardService;
