import axios from 'axios';

// Mock JWT Token mimicking a secure authentication payload
const MOCK_JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.MockPayloadForTestingProtectedRoutes.KFintechSignature123";

// Create an Axios instance pointing to the Node.js CRM Backend
const apiClient = axios.create({
    // User requested localhost:5000 (Ensure your node backend runs on 5000 or modify this to 3000 if needed)
    baseURL: 'http://localhost:5000/api', 
    headers: {
        'Content-Type': 'application/json'
    }
});

// Axios Request Interceptor: Automatically attach the JWT token to every request
apiClient.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${MOCK_JWT_TOKEN}`;
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default apiClient;
