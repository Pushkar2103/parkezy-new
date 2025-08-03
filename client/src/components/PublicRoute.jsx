import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FullScreenLoader from './FullScreenLoader'; 

const PublicRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (isAuthenticated) {
    const dashboardPath = user.role === 'owner' ? '/owner-dashboard' : '/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;