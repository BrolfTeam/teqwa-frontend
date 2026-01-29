import apiService from './apiService';

const siteService = {
    /**
     * Get site-wide configuration
     */
    getSiteConfig: async () => {
        try {
            const response = await apiService.get('/site-config/');
            return response.data;
        } catch (error) {
            console.error('Error fetching site config:', error);
            throw error;
        }
    },

    /**
     * Update site-wide configuration
     */
    updateSiteConfig: async (configData) => {
        try {
            const response = await apiService.post('/site-config/update/', configData);
            return response.data;
        } catch (error) {
            console.error('Error updating site config:', error);
            throw error;
        }
    }
};

export default siteService;
