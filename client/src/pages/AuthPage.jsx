import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../api/apiService';

const AuthPage = ({ isRegister = false }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      let response;
      if (isRegister) {
        response = await apiService.register(name, email, password, role);
        if (response.status === 'success') {
          setMessage(response.message);
        } else {
          setError(response.message || 'Registration failed.');
        }
      } else { // Login
        response = await apiService.login(email, password);
        if (response.token && response.user) {
          login(response);
          const dashboardPath = response.user.role === 'owner' ? '/owner-dashboard' : '/dashboard';
          navigate(dashboardPath, { replace: true });
        } else {
          setError(response.message || 'Invalid credentials.');
        }
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{isRegister ? 'Create Your Account' : 'Welcome Back'}</h2>
        <p className="text-center text-gray-500 mb-8">{isRegister ? 'Join Parkezy today!' : 'Log in to continue.'}</p>

        {message && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-r-lg" role="alert"><p>{message}</p></div>}
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg" role="alert"><p>{error}</p></div>}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegister && (
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="name">Full Name</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
              </div>
            )}
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="email">Email Address</label>
              <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700 font-medium" htmlFor="password">Password</label>
                {!isRegister && (
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot Password?</Link>
                )}
              </div>
              <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
            </div>
            {isRegister && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">I am a...</label>
                <div className="flex space-x-4 bg-gray-100 p-2 rounded-lg">
                  <button type="button" onClick={() => setRole('user')} className={`w-1/2 py-2 rounded-md font-medium transition ${role === 'user' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-gray-600'}`}>User</button>
                  <button type="button" onClick={() => setRole('owner')} className={`w-1/2 py-2 rounded-md font-medium transition ${role === 'owner' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-gray-600'}`}>Owner</button>
                </div>
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-blue-400 flex items-center justify-center">
              {loading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
