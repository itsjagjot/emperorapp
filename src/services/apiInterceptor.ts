/**
 * Global API Interceptor
 * This script overrides the global fetch function to catch 401/403 errors
 * and automatically redirect the user to the login page.
 */

const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
        const response = await originalFetch(input, init);

        // Check for Unauthorised (401) or Forbidden (403)
        // This usually means the token has expired or the user is no longer active
        if (response.status === 401 || response.status === 403) {
            // Check if we are already on the login page to avoid infinite loops
            const isLoginPage = window.location.pathname.includes('/login');

            if (!isLoginPage) {
                console.warn(`Global Auth Interceptor: Unauthorized access detected (Status ${response.status}). Redirecting to login...`);

                // Force clear all storage to ensure a clean state
                localStorage.clear();
                sessionStorage.clear();

                // Redirect to login page
                window.location.href = '/login';
            }
        }

        return response;
    } catch (error) {
        // For network errors or other fetch failures
        console.error('Fetch error:', error);
        throw error;
    }
};

export { };
