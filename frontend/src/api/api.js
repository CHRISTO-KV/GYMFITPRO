import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // ✔ keep only server URL
});

// Attach userId from sessionStorage to every request so backend auth middleware can use it
api.interceptors.request.use(config => {
  const userId = sessionStorage.getItem("userId");
  if (userId) config.headers["x-user-id"] = userId;
  return config;
});

export default api;
