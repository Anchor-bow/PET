import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10_000,
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[api]', err?.response?.status, err?.message);
    return Promise.reject(err);
  },
);
