// Environment configuration
// This file helps debug and centralize environment variable usage

// Log environment variables during build (will appear in Render logs)
console.log('Build time environment check:');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('MODE:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
console.log('PROD:', import.meta.env.PROD);

// Export the API URL with fallback
export const API_URL = import.meta.env.VITE_API_URL;

// Export environment info
export const ENV = {
    apiUrl: API_URL,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    mode: import.meta.env.MODE,
};

export default ENV;
