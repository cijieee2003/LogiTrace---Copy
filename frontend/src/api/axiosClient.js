// import axios from 'axios';

// const axiosClient = axios.create({
//   baseURL: 'http://10.5.50.121:8000/api',
//   headers: {
//     Accept: "application/json"
//   }
// });

// axiosClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export default axiosClient;


import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://172.20.10.2:8000/api",
  // baseURL: "http://localhost:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Add token to every request
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

// Handle authentication errors
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized - token may be expired");

      localStorage.removeItem("token");

      // Optional:
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosClient;