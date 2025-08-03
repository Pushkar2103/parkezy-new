import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../api/apiService';

const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const EyeSlashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" /></svg>;
const LoadingSpinner = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;


const AuthPage = ({ isRegister = false }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        if (feedback.message) {
            const timer = setTimeout(() => {
                setFeedback({ message: '', type: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback({ message: '', type: '' });

        
        try {
            if (isRegister) {
                const response = await apiService.register(name, email, password, role);
                setFeedback({ message: response.data.message, type: 'success' });
            } else { 
                const response = await apiService.login(email, password);
                login(response.data);
                const dashboardPath = response.data.user.role === 'owner' ? '/owner-dashboard' : '/dashboard';
                navigate(dashboardPath, { replace: true });
            }
        } catch (err) {
            setFeedback({ message: err.response?.data?.message || err.message || 'An unknown error occurred.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-2xl">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{isRegister ? 'Create Your Account' : 'Welcome Back'}</h2>
                <p className="text-center text-gray-500 mb-8">{isRegister ? 'Join Parkezy today!' : 'Log in to continue.'}</p>

                {feedback.message && (
                    <div className={`border-l-4 p-4 mb-6 rounded-r-lg ${feedback.type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'}`} role="alert">
                        <p>{feedback.message}</p>
                    </div>
                )}

                {feedback.type !== 'success' && (
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
                        <div className="relative">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-gray-700 font-medium" htmlFor="password">Password</label>
                                {!isRegister && (
                                    <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline cursor-pointer">Forgot Password?</Link>
                                )}
                            </div>
                            <input 
                                type={isPasswordVisible ? 'text' : 'password'} 
                                id="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
                                required 
                            />
                            <button 
                                type="button" 
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                className="absolute right-3 top-[42px] text-gray-500 hover:text-blue-600 cursor-pointer"
                            >
                                {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {isRegister && (
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">I am a...</label>
                                <div className="flex space-x-4 bg-gray-100 p-2 rounded-lg">
                                    <button type="button" onClick={() => setRole('user')} className={`w-1/2 py-2 rounded-md font-medium transition cursor-pointer ${role === 'user' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-gray-600'}`}>User</button>
                                    <button type="button" onClick={() => setRole('owner')} className={`w-1/2 py-2 rounded-md font-medium transition cursor-pointer ${role === 'owner' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-gray-600'}`}>Owner</button>
                                </div>
                            </div>
                        )}
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-blue-400 flex items-center justify-center cursor-pointer">
                            {loading && <LoadingSpinner />}
                            {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
                        </button>
                        <p className="text-center mt-4">
                            {isRegister ? 'Already have an account?' : "Don't have an account?"}
                            <Link to={isRegister ? '/login' : '/register'} className="text-blue-600 hover:underline font-medium ml-1 cursor-pointer">
                                {isRegister ? 'Login' : 'Register'}
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AuthPage;
