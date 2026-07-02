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
    const token = localStorage.getItem('kfintech_access_token');
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
            localStorage.removeItem('kfintech_access_token');
            localStorage.removeItem('kfintech_user');
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Avoid infinite loops if the refresh endpoint itself returns 401
            if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
                clearAuthStorage();
                // Only redirect to login if we are on a protected route (not landing page or register)
                const currentPath = window.location.pathname;
                if (!currentPath.includes('/login') && !currentPath.includes('/register') && currentPath !== '/') {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            try {
                // Attempt to refresh the token using the httpOnly cookie
                await axios.post(
                    `${apiClient.defaults.baseURL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                // The backend successfully set a new access_token cookie
                // Retry the original request (it will automatically send the new cookie)
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh token invalid or expired
                clearAuthStorage();
                const currentPath = window.location.pathname;
                if (!currentPath.includes('/login') && !currentPath.includes('/register') && currentPath !== '/') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
