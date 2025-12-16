import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

/**
 * Custom hook for making API requests with loading and error states
 * @param {Object} config - Axios request config
 * @returns {[Function, { data: any, loading: boolean, error: Error | null }]}
 */
const useApi = (config = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Execute the API request
   * @param {Object} requestConfig - Additional request config to merge with the base config
   * @returns {Promise<{ data: any, error: Error | null }>}
   */
  const execute = useCallback(
    async (requestConfig = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios({
          ...config,
          ...requestConfig,
          headers: {
            'Content-Type': 'application/json',
            ...config.headers,
            ...(requestConfig.headers || {}),
          },
        });

        setData(response.data);
        return { data: response.data, error: null };
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
        const status = err.response?.status;
        
        // Handle specific error statuses
        if (status === 401) {
          // Handle unauthorized (e.g., redirect to login)
          toast.error('Session expired. Please log in again.');
          // You might want to redirect to login here
          // navigate('/login');
        } else if (status === 403) {
          toast.error('You do not have permission to perform this action.');
        } else if (status >= 500) {
          toast.error('A server error occurred. Please try again later.');
        } else {
          toast.error(errorMessage);
        }

        setError({ message: errorMessage, status });
        return { data: null, error: { message: errorMessage, status } };
      } finally {
        setLoading(false);
      }
    },
    [config]
  );

  return [execute, { data, loading, error }];
};

export default useApi;
