import axios from "axios";

import { useAuthStore } from "../store/useAuthStore.js";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) useAuthStore.getState().logout();
    return Promise.reject(err);
  },
);

export const authApi = {
  register: (data) => api.post("/api/auth/register", data).then((r) => r.data),
  login: (data) => api.post("/api/auth/login", data).then((r) => r.data),
};

export const interviewApi = {
  start: (data) => api.post("/api/interview/start", data).then((r) => r.data),
  sendMessage: (data) => api.post("/api/interview/message", data).then((r) => r.data),
  end: (sessionId) => api.post("/api/interview/end", { sessionId }).then((r) => r.data),
};

export const feedbackApi = {
  list: () => api.get("/api/feedback/sessions").then((r) => r.data),
  get: (sessionId) => api.get(`/api/feedback/${sessionId}`).then((r) => r.data),
};
