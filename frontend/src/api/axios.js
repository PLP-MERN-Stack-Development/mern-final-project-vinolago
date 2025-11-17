import axios from "axios";

// Get API URL from environment variables
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback to development localhost
  return "http://localhost:5000/api";
};

const api = axios.create({
    baseURL: getApiUrl(),
    headers: { "Content-Type":"application/json",},
    timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from Clerk (this will be handled by Clerk's useAuth hook in components)
    // For now, we'll assume the token is passed in headers when needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export default api;