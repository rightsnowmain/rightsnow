import axios from 'axios';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://rightsnow-api.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // If the server returned HTML (e.g. Vercel SPA rewrite fallback when backend is not yet attached)
    const contentType = String(response.headers?.['content-type'] || '');
    if (
      typeof response.data === 'string' &&
      (contentType.includes('text/html') ||
        response.data.trim().toLowerCase().startsWith('<!doctype') ||
        response.data.trim().toLowerCase().startsWith('<html'))
    ) {
      console.warn('[API Warning]: Backend endpoint returned HTML (SPA fallback). Backend might not be configured.');
      return { ...response, data: null };
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
