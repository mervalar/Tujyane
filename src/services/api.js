import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tujyane_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Central error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tujyane_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
