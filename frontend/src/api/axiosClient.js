
import axios from "axios";

const axiosClient = axios.create({
  // Example: https://api.logitraceph.com/api
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Attach the Sanctum bearer token to requests.
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API errors.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Remove an expired or invalid token.
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
