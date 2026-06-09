import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10_000,
});

apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('pet_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch { /* noop */ }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      try { localStorage.removeItem('pet_access_token'); } catch { /* noop */ }
      window.location.href = '/login';
    }
    console.error('[api]', err?.response?.status, err?.message);
    return Promise.reject(err);
  },
);
