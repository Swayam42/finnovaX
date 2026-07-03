import axios from 'axios';

// Create an Axios instance pointing to the Node.js CRM Backend
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://finnovax.onrender.com/api' : 'http://localhost:5000/api'),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Attach Bearer token if cookies fail
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('finnovax_access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


// Response Interceptor: handle 401 Unauthorized globally
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const clearAuthStorage = () => {
            localStorage.removeItem('finnovax_access_token');
            localStorage.removeItem('finnovax_refresh_token');
            localStorage.removeItem('finnovax_user');
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Avoid infinite loops and unwanted refresh calls on public/auth endpoints
            const isAuthEndpoint = 
                originalRequest.url.includes('/auth/refresh') || 
                originalRequest.url.includes('/auth/login') || 
                originalRequest.url.includes('/auth/register') ||
                originalRequest.url.includes('/auth/me') ||
                originalRequest.url.includes('/auth/verify-otp') ||
                originalRequest.url.includes('/auth/forgot-password') ||
                originalRequest.url.includes('/auth/reset-password');

            if (isAuthEndpoint) {
                clearAuthStorage();
                const currentPath = window.location.pathname;
                if (!currentPath.includes('/login') && !currentPath.includes('/register') && !currentPath.includes('/forgot-password') && currentPath !== '/') {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            try {
                // Attempt to refresh the token using httpOnly cookie OR localStorage fallback
                const storedRefreshToken = localStorage.getItem('finnovax_refresh_token');
                const refreshRes = await axios.post(
                    `${apiClient.defaults.baseURL}/auth/refresh`,
                    storedRefreshToken ? { refreshToken: storedRefreshToken } : {},
                    { 
                        withCredentials: true,
                        headers: storedRefreshToken ? { 'x-refresh-token': storedRefreshToken } : {}
                    }
                );

                if (refreshRes.data?.accessToken) {
                    localStorage.setItem('finnovax_access_token', refreshRes.data.accessToken);
                }
                if (refreshRes.data?.refreshToken) {
                    localStorage.setItem('finnovax_refresh_token', refreshRes.data.refreshToken);
                }

                // The backend successfully rotated tokens
                // Retry the original request (it will automatically send the new token)
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh token invalid or expired
                clearAuthStorage();
                const currentPath = window.location.pathname;
                if (!currentPath.includes('/login') && !currentPath.includes('/register') && !currentPath.includes('/forgot-password') && currentPath !== '/') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
