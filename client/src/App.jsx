import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

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
import ParkingDetailsPage from './pages/ParkingDetailsPage';
import OwnerDashboard from './pages/OwnerDashboard';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import Favorites from './pages/Favorites';

import RequestsPage from './pages/owner/RequestsPage';
import OwnerStatsPage from './pages/owner/OwnerStatsPage';
import MyParkingsPage from './pages/owner/MyParkingsPage';
import AddParkingPage from './pages/owner/AddParkingPage';
import EditParkingPage from './pages/owner/EditParkingPage';
import PaymentSuccess from './components/PaymentSucess';


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

        <Route element={<ProtectedRoute allowedRoles={['user', 'owner']} />}>
            <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="parking/:id" element={<ParkingDetailsPage />} />
          <Route path="my-bookings" element={<MyBookingsPage />} />
          <Route path="booking-history" element={<BookingHistoryPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Route>

        <Route path="/owner-dashboard" element={<ProtectedRoute allowedRoles={['owner']} />}>
            <Route element={<OwnerDashboard />}>
                <Route index element={<OwnerStatsPage />} />
                <Route path="parkings" element={<MyParkingsPage />} />
                <Route path="parkings/edit/:id" element={<EditParkingPage />} />
                <Route path="add-parking" element={<AddParkingPage />} />
                <Route path="requests" element={<RequestsPage />} />
            </Route>
        </Route> 

        <Route path="*" element={<div className="text-center py-10"><h1>404 - Page Not Found</h1></div>} />
      </Route>
    </Routes>
  );
}

export default App;
