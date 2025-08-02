import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// Import Pages and Components
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import VerifyEmailPage from './pages/VerifyEmail';
import LandingPage from './components/LandingPage';
import AuthPage from './pages/AuthPage';
import UserDashboard from './pages/UserDashboard';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage'; 
import ParkingDetailsPage from './pages/ParkingDetails'; 
import OwnerDashboard from './pages/OwnerDashboard';

function Layout() {
  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800 flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:p-8">
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        
        <Route element={<PublicRoute />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<AuthPage />} />
          <Route path="register" element={<AuthPage isRegister />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        <Route path="verify-email/:token" element={<VerifyEmailPage />} />

{/*         
        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="parking/:id" element={<ParkingDetailsPage />} />
        </Route>
*/}

        <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
          <Route path="owner-dashboard" element={<OwnerDashboard />} />
        </Route> 

        <Route path="*" element={<div className="text-center py-10"><h1>404 - Page Not Found</h1></div>} />
      </Route>
    </Routes>
  );
}

export default App;
