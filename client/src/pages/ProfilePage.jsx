import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../api/apiService';

const InputField = ({ name, label, value, onChange, type = 'text', required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input type={type} name={name} id={name} value={value} onChange={onChange} required={required} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
    </div>
);

const ProfilePage = () => {
    const { user, login } = useAuth();
    const [profileData, setProfileData] = useState({ name: user.name, email: user.email });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [profileMessage, setProfileMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');

    const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileMessage('');
        try {
            const response = await apiService.updateMyProfile(profileData);
            if (response.email) {
                login({ user: response, token: localStorage.getItem('parkezy_token') });
                setProfileMessage('Profile updated successfully!');
            } else {
                setProfileMessage(response.message || 'Failed to update profile.');
            }
        } catch (error) {
            setProfileMessage('A server error occurred.');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordMessage('');
        try {
            const response = await apiService.updateUserPassword(passwordData);
            setPasswordMessage(response.message);
            if (response.message === 'Password updated successfully') {
                setPasswordData({ currentPassword: '', newPassword: '' });
            }
        } catch (error) {
            setPasswordMessage('A server error occurred.');
        }
    };

    return (
        <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl font-bold mb-6">My Profile</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
                    {profileMessage && <p className="mb-4 text-sm text-green-600">{profileMessage}</p>}
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <InputField name="name" label="Full Name" value={profileData.name} onChange={handleProfileChange} required />
                        <InputField name="email" label="Email Address" value={profileData.email} onChange={handleProfileChange} type="email" required />
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Save Profile</button>
                    </form>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Change Password</h2>
                    {passwordMessage && <p className="mb-4 text-sm text-green-600">{passwordMessage}</p>}
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <InputField name="currentPassword" label="Current Password" value={passwordData.currentPassword} onChange={handlePasswordChange} type="password" required />
                        <InputField name="newPassword" label="New Password" value={passwordData.newPassword} onChange={handlePasswordChange} type="password" required />
                        <button type="submit" className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg">Update Password</button>
                    </form>
                    <div className="text-center mt-4">
                        <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot your password?</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
