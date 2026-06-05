import axios from 'axios';

const envUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = (envUrl?.includes('localhost') && window.location.hostname !== 'localhost')
  ? `${window.location.protocol}//${window.location.hostname}:19090/api`
  : envUrl || 'http://localhost:19090/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
