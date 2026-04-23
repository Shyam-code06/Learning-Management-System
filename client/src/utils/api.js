import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for extracting data from ApiResponse wrapper
api.interceptors.response.use(
  (response) => {
    // If the response follows the ApiResponse structure { success, data, message }
    if (response.data && response.data.success !== undefined && response.data.data !== undefined) {
      // Return a modified response object that looks like standard axios response
      // but has the unwrapped data in the .data property
      return {
        ...response,
        data: response.data.data
      };
    }
    return response;
  },
  (error) => {
    // Handle global errors here if needed
    return Promise.reject(error);
  }
);

export default api;
