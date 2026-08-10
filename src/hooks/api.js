import axios from "axios";

console.log("API BASE URL:", import.meta.env.VITE_API_BASE_URL);


// Use env variable for baseURL
const api = axios.create({
baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth token interceptor (optional)
api.interceptors.request.use((config) => {
   console.log("FINAL API URL:", config.baseURL + config.url);
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default api;