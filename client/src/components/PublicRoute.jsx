import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    const dashboardPath = user.role === 'owner' ? '/owner-dashboard' : '/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
