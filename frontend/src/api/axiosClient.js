
import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Add Bearer token to every request when available
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle API responses and authentication errors
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized - token may be expired");

      localStorage.removeItem("token");

      // Uncomment if you want to redirect automatically to login
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
