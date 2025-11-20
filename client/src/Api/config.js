import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "https://lms-backend-tau-nine.vercel.app/api",
  withCredentials: true,
  timeout: 300000,
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
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
          const expiryTime = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
          
          localStorage.setItem("token", newToken);
          localStorage.setItem("tokenExpiry", expiryTime.toString());

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiry");
        window.dispatchEvent(new CustomEvent('forceLogout'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
