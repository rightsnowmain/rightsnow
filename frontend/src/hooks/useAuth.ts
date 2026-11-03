import { useState, useEffect } from 'react';
import { getStoredAuth, AuthState } from '../store/authStore';

export const useAuth = (): AuthState => {
  const [auth, setAuth] = useState<AuthState>(getStoredAuth());

  useEffect(() => {
    const handleStorage = () => setAuth(getStoredAuth());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return auth;
};
