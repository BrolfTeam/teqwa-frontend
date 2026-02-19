/**
 * A wrapper for React.lazy() that attempts to reload the page once if a dynamic import fails.
 * This is useful for handling cases where a new version of the app is deployed and old 
 * chunk hashes are no longer present on the server.
 * 
 * @param {Function} componentImport A function that returns a dynamic import promise, e.g., () => import('./MyComponent')
 * @returns {Promise} The component module if successful, or reloads the page on failure.
 */
export const lazyRetry = (componentImport) => {
    return new Promise((resolve, reject) => {
        // Check if we've already tried to reload the page for this session to avoid infinite loops
        const hasRetried = window.sessionStorage.getItem('lazy-retry-done');

        componentImport()
            .then(component => {
                // If successful, we can clear the retry flag for the next time something fails
                window.sessionStorage.removeItem('lazy-retry-done');
                resolve(component);
            })
            .catch(error => {
                if (!hasRetried) {
                    // Tag this session as having retried to avoid infinite reload cycles
                    window.sessionStorage.setItem('lazy-retry-done', 'true');
                    console.warn('Dynamic import failed (possibly due to new deployment). Reloading page...', error);
                    window.location.reload();
                } else {
                    // If we've already retried and it still fails, bubble up the error
                    console.error('Dynamic import failed after page reload:', error);
                    reject(error);
                }
            });
    });
};
