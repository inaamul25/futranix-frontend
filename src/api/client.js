import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://futranix-backend.onrender.com/api"
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("smart_learning_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
