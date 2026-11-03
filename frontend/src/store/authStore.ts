import { User } from '../types';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export const getStoredAuth = (): AuthState => {
  const token = localStorage.getItem('access_token');
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
  };
};
