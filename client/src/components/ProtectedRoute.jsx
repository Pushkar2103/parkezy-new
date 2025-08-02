import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // You can add a spinner here for a better UX
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If the user's role is not allowed, redirect them to a 'not authorized' page or home
    // For simplicity, we'll redirect to the home page.
    return <Navigate to="/" replace />;
  }

  // If authenticated and authorized, render the child components
  return <Outlet />;
};

export default ProtectedRoute;
