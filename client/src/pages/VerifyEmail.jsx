import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../api/apiService';
import { useAuth } from '../contexts/AuthContext';

// --- ICONS ---
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LoadingSpinner = () => <svg className="animate-spin h-16 w-16 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;


const VerifyEmailPage = () => {
  const { token } = useParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Verifying your email, please wait...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await apiService.verifyEmail(token);
        if (response.token && response.user) {
          setStatus('success');
          setMessage('Your email has been successfully verified!');
          // Automatically log the user in
          login(response);
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            const dashboardPath = response.user.role === 'owner' ? '/owner-dashboard' : '/dashboard';
            navigate(dashboardPath);
          }, 3000);
        } else {
          setStatus('error');
          setMessage(response.message || 'Verification failed. The link may be invalid or expired.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('An error occurred while trying to verify your email.');
      }
    };

    verifyToken();
  }, [token, login, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return <LoadingSpinner />;
      case 'success':
        return <CheckCircleIcon />;
      case 'error':
        return <XCircleIcon />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center" style={{minHeight: '60vh'}}>
      <div className="text-center bg-white p-10 rounded-xl shadow-2xl max-w-lg">
        <div className="flex justify-center mb-6">
          {renderContent()}
        </div>
        <h1 className="text-3xl font-bold mb-4">{status.charAt(0).toUpperCase() + status.slice(1)}</h1>
        <p className="text-gray-600 text-lg mb-8">{message}</p>
        {status === 'success' && (
          <p className="text-sm text-gray-500">Redirecting you to your dashboard...</p>
        )}
        {status === 'error' && (
          <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
            Try Registering Again
          </Link>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
