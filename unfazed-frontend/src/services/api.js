import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

/* =========================================================
   ATTACH JWT TOKEN TO EVERY REQUEST
========================================================= */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("unfazed_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


/* =========================================================
   HANDLE EXPIRED / INVALID JWT
========================================================= */

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      const currentPath = window.location.pathname;

      // Clear expired authentication data
      localStorage.removeItem("unfazed_token");
      localStorage.removeItem("unfazed_therapist");

      // Avoid redirect loop if already on login page
      if (currentPath !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;