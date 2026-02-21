import '../components/Loader/Loader.css';

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

                // Use the application's base Loader structure
                const container = document.createElement('div');
                container.className = 'loader-container overlay';
                container.style.zIndex = '99999'; // Ensure it's on top

                const loader = document.createElement('div');
                loader.className = 'loader';

                container.appendChild(loader);
                document.body.appendChild(container);

                // Force clear all storage to ensure a clean state
                localStorage.clear();
                sessionStorage.clear();

                // Redirect to login page after a tiny delay for visual feedback
                setTimeout(() => {
                    window.location.href = '/login';
                }, 800);
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
