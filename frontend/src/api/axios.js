import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: { "Content-Type":"application/json",},
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