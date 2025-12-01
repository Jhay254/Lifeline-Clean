import axios from 'axios';

// Create Axios instance with default config
export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        // Client-side: Get token from localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized (e.g., redirect to login)
        if (error.response?.status === 401 && !originalRequest._retry) {
            // TODO: Implement token refresh logic or redirect to login
            if (typeof window !== 'undefined') {
                // window.location.href = '/login'; // Optional: Redirect
            }
        }

        return Promise.reject(error);
    }
);
