import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const api = axios.create({ baseURL });

// Attach auth token (if present) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("useme_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function saveSession(token, user) {
  localStorage.setItem("useme_token", token);
  localStorage.setItem("useme_user", JSON.stringify(user));
}

export function getSession() {
  const token = localStorage.getItem("useme_token");
  const userRaw = localStorage.getItem("useme_user");
  if (!token || !userRaw) return null;
  try {
    return { token, user: JSON.parse(userRaw) };
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("useme_token");
  localStorage.removeItem("useme_user");
}

export default api;
