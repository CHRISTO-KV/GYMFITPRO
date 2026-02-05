import axios from "axios";

export const SERVER_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace("/api", "")
  : "http://localhost:5000";

export const API_BASE_URL = `${SERVER_URL}/api`;
export const IMG_BASE_URL = `${SERVER_URL}/uploads/`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach userId from sessionStorage to every request so backend auth middleware can use it
api.interceptors.request.use(config => {
  const userId = sessionStorage.getItem("userId");
  if (userId) config.headers["x-user-id"] = userId;
  return config;
});

export default api;
