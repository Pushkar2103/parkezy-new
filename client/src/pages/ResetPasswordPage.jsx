import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../api/apiService';

// --- ICONS ---
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const EyeSlashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" /></svg>;
const LoadingSpinner = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

const PasswordStrengthMeter = ({ password }) => {
    const getStrength = () => {
        let score = 0;
        if (password.length > 7) score++;
        if (password.match(/[a-z]/)) score++;
        if (password.match(/[A-Z]/)) score++;
        if (password.match(/[0-9]/)) score++;
        if (password.match(/[^A-Za-z0-9]/)) score++;
        return score;
    };
    const strength = getStrength();
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

    return (
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${strengthColors[strength - 1] || ''}`}
                style={{ width: `${(strength / 5) * 100}%` }}
            ></div>
        </div>
    );
};

const PasswordField = ({ id, label, value, onChange }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <div className="relative">
            <label className="block text-gray-700 font-medium mb-2" htmlFor={id}>{label}</label>
            <input 
                type={isVisible ? 'text' : 'password'} 
                id={id} 
                value={value} 
                onChange={onChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
                required 
            />
            <button 
                type="button" 
                onClick={() => setIsVisible(!isVisible)}
                className="absolute right-3 top-[42px] text-gray-500 hover:text-blue-600 cursor-pointer"
            >
                {isVisible ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
        </div>
    );
};

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    useEffect(() => {
        if (feedback.type === 'error' && feedback.message) {
            const timer = setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ message: '', type: '' });

        if (password.length < 6) {
            setFeedback({ message: 'Password must be at least 6 characters long.', type: 'error' });
            return;
        }
        if (password !== confirmPassword) {
            setFeedback({ message: "Passwords do not match.", type: 'error' });
            return;
        }
        
        setLoading(true);
        try {
            const response = await apiService.resetPassword(token, password);
            if (response.token && response.user) {
                setFeedback({ message: 'Password has been reset successfully!', type: 'success' });
            } else {
                setFeedback({ message: response.message || 'Failed to reset password. The link may be invalid or expired.', type: 'error' });
            }
        } catch (err) {
            setFeedback({ message: 'A server error occurred. Please try again later.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-2xl">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Reset Your Password</h2>
                
                {feedback.type === 'success' ? (
                    <div className="text-center">
                        <div className="flex justify-center my-4">
                            <CheckCircleIcon />
                        </div>
                        <p className="text-green-700 mb-6">{feedback.message}</p>
                        <Link to="/login" className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 cursor-pointer">
                            Go to Login
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="text-center text-gray-500 mb-8">Enter your new password below.</p>
                        {feedback.message && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg" role="alert">
                                <p>{feedback.message}</p>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <PasswordField id="password" label="New Password" value={password} onChange={e => setPassword(e.target.value)} />
                                <PasswordStrengthMeter password={password} />
                            </div>
                            <div>
                                <PasswordField id="confirmPassword" label="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-blue-400 flex items-center justify-center cursor-pointer">
                                {loading && <LoadingSpinner />}
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
