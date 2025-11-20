import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "https://lms-backend-tau-nine.vercel.app/api", // Backend base URL
  withCredentials: true, // useful for cookies/JWT
  timeout: 300000, // 5 minutes timeout for all requests
});

// Add interceptors (optional, for tokens, logging, errors)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => {
    // Check if server indicates token refresh is needed
    if (response.headers['x-token-refresh-required']) {
      // Trigger token refresh in the background
      setTimeout(() => {
        refreshTokenInBackground();
      }, 100);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL || "https://lms-backend-tau-nine.vercel.app/api"}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (refreshResponse.data.success && refreshResponse.data.token) {
          const newToken = refreshResponse.data.token;
          const expiryTime = new Date().getTime() + (30 * 24 * 60 * 60 * 1000); // 30 days
          
          localStorage.setItem("token", newToken);
          localStorage.setItem("tokenExpiry", expiryTime.toString());

          // Update the authorization header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiry");
        // Dispatch a custom event to notify the app about logout
        window.dispatchEvent(new CustomEvent('forceLogout'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Background token refresh function
const refreshTokenInBackground = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL || "https://lms-backend-tau-nine.vercel.app/api"}/auth/refresh-token`,
      {},
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success && response.data.token) {
      const newToken = response.data.token;
      const expiryTime = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
      
      localStorage.setItem("token", newToken);
      localStorage.setItem("tokenExpiry", expiryTime.toString());
    }
  } catch (error) {
    console.error("Background token refresh failed:", error);
    // Don't force logout on background refresh failure
  }
};

export default api;
