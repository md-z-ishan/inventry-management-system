import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1';


// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for cookies
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          const originalRequest = error.config;
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            try {
              // Try to refresh token
              // We use axios.create() to avoid using the same interceptors
              const refreshRes = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
                withCredentials: true
              });

              if (refreshRes.data.success) {
                const { token } = refreshRes.data.data;
                localStorage.setItem('token', token);

                // Update header and retry
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return axiosInstance(originalRequest);
              }
            } catch (refreshError) {
              // Refresh failed - logout
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
              toast.error('Session expired. Please login again.');
            }
          } else {
            // Already retried and failed
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          break;

        case 403:
          toast.error('You do not have permission to perform this action.');
          break;

        case 404:
          console.error('Resource not found for URL:', error.config?.url);
          toast.error(`Resource not found: ${error.config?.url}`);
          break;

        case 422:
          // Validation error
          if (data.errors) {
            data.errors.forEach(err => {
              toast.error(`${err.field}: ${err.message}`);
            });
          } else {
            toast.error(data.message || 'Validation failed');
          }
          break;

        case 500:
          toast.error('Server error. Please try again later.');
          break;

        default:
          toast.error(data.error || data.message || 'An error occurred');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred.');
    }

    console.error('Axios Error Details:', error);

    return Promise.reject(error);
  }
);

export default axiosInstance;