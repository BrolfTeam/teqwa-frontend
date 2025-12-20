import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '@/context/LanguageContext';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import App from './App';
import './styles/global.css';

// Initialize i18n before everything else
import '@/lib/i18n';

// Import fonts
import '@fontsource/inter/index.css';
import '@fontsource/tajawal/400.css';
// Amharic font support - using Noto Sans Ethiopic
import '@fontsource/noto-sans-ethiopic/400.css';
import '@fontsource/noto-sans-ethiopic/700.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Initialize theme (default to light mode)
const initializeTheme = () => {
  // Check if user has a saved preference
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // Default to light mode if no preference is saved
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

initializeTheme();

// Console message for developers - explain expected network errors
if (process.env.NODE_ENV === 'development') {
  console.log(
    '%c📝 Developer Note:',
    'color: #3b82f6; font-weight: bold; font-size: 12px;',
    'You may see 404 errors in the console for student endpoints if the current user doesn\'t have a student profile. ' +
    'This is expected behavior and handled gracefully by the application. The dashboard will display with empty data.'
  );
}

// Handle unhandled promise rejections (especially rate limiting errors)
window.addEventListener('unhandledrejection', (event) => {
  // Silently handle rate limiting errors (429) - these are expected during development
  if (event.reason?.status === 429 || event.reason?.message?.includes('throttled')) {
    // Suppress the uncaught error for rate limiting - it's handled gracefully by components
    event.preventDefault();
    return;
  }
  // Suppress "Student profile not found" errors (404) - they're handled gracefully
  if (event.reason?.status === 404 && (event.reason?.message?.includes('Student profile') || event.reason?.message?.includes('profile not found'))) {
    event.preventDefault();
    return;
  }
  // Suppress permission denied errors (403) - they're handled gracefully
  if (event.reason?.status === 403) {
    event.preventDefault();
    return;
  }
  // For other errors, allow them to be logged normally
  // This helps catch actual bugs
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <LanguageProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <App />
            </BrowserRouter>
          </LanguageProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);