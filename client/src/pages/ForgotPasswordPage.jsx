import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../api/apiService';

const LoadingSpinner = () => (
    <svg 
        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
    >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const response = await apiService.forgotPassword(email);
            setMessage(response.data.message || 'If an account with that email exists, a reset link has been sent.');

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-2xl">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Forgot Password?</h2>
                <p className="text-center text-gray-500 mb-8">No worries, we'll send you reset instructions.</p>

                {message && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-r-lg" role="alert"><p>{message}</p></div>}
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg" role="alert"><p>{error}</p></div>}
                
                {!message && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="email">Enter your email address</label>
                            <input 
                                type="email" 
                                id="email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
                                required 
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-blue-400 flex items-center justify-center cursor-pointer"
                        >
                            {loading && <LoadingSpinner />}
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}
                <p className="text-center mt-4">
                    <Link to="/login" className="text-blue-600 hover:underline font-medium ml-1">
                        &larr; Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;