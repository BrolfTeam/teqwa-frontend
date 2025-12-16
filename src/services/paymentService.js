import apiService from '@/lib/apiService';

const paymentService = {
    /**
     * Initialize a payment transaction
     * @param {Object} data - Payment initialization data
     * @param {number} data.amount - Amount to pay
     * @param {string} data.currency - Currency code (default ETB)
     * @param {string} data.email - Payer email
     * @param {string} data.first_name - Payer first name
     * @param {string} data.last_name - Payer last name
     * @param {string} data.content_type_model - Model name (e.g. 'donation', 'futsalbooking')
     * @param {number} data.object_id - ID of the related object
     * @returns {Promise<{checkout_url: string, tx_ref: string}>}
     */
    initializePayment: async (data) => {
        try {
            const response = await apiService.post('/payments/initialize/', data);
            return response;
        } catch (error) {
            console.error('Payment initialization failed:', error);
            throw error;
        }
    },

    /**
     * Verify payment status
     * @param {string} txRef - Transaction reference to verify
     * @returns {Promise<Object>}
     */
    verifyPayment: async (txRef) => {
        try {
            const response = await apiService.get(`/payments/verify/${txRef}/`);
            return response;
        } catch (error) {
            console.error('Payment verification failed:', error);
            throw error;
        }
    }
};

export default paymentService;
