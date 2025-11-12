//Not set up
// src/services/axiosInstance.js
import axios from "axios";

// 🔧 Base API URL
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ✅ Create Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ===============================
// 🔐 Request Interceptor
// ===============================
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (or sessionStorage)
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// ⚠️ Response Interceptor
// ===============================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 globally
    if (error.response?.status === 401) {
      console.warn("⚠️ Unauthorized - Token may be expired");
      // Optionally redirect or clear localStorage
      localStorage.removeItem("token");
      // window.location.href = "/login"; // uncomment if you want auto-redirect
    }

    // Re-throw error for local catch blocks
    return Promise.reject(error);
  }
);

export default api;
