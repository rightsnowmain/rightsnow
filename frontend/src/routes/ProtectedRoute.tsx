import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthService } from '../services/auth.service';

export const ProtectedRoute: React.FC = () => {
  const user = AuthService.getCurrentUser();
  const token = localStorage.getItem('access_token');

  if (!token || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
