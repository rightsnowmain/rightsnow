import api from './api';
import { User } from '../types';

export const AuthService = {
  login: async (email: string, password: string): Promise<{ accessToken: string; user: User }> => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.accessToken) {
      localStorage.setItem('access_token', res.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (email: string, password: string, displayName: string): Promise<{ accessToken: string; user: User }> => {
    const res = await api.post('/auth/register', { email, password, displayName });
    if (res.data.accessToken) {
      localStorage.setItem('access_token', res.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },
};
