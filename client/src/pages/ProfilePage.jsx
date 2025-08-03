import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
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

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

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

      const handleFileChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setSelectedFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        };
    

    const handleUpload = async () => {
            if (!selectedFile) return;
            setUploading(true);
            setProfileMessage({ text: '', type: '' });
            try {
                const response = await apiService.uploadProfilePicture(selectedFile);
                if (response.user) {
                    login({ user: response.user, token: localStorage.getItem('parkezy_token') });
                    setProfileMessage({ text: 'Profile picture updated!', type: 'success' });
                    setSelectedFile(null);
                    setPreview(null);
                } else {
                    setProfileMessage({ text: response.message || 'Upload failed.', type: 'error' });
                }
            } catch (error) {
                setProfileMessage({ text: 'A server error occurred.', type: 'error' });
            } finally {
                setUploading(false);
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
            <h1 className="text-4xl font-bold mb-8">My Profile</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-lg text-center flex flex-col items-center">
                    <h2 className="text-2xl font-bold mb-4">Profile Picture</h2>
                    <img
                        src={preview || user.profilePicture || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random`}
                        alt="Profile"
                        className="w-40 h-40 rounded-full object-cover mb-4 border-4 border-gray-200"
                    />
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button onClick={() => fileInputRef.current.click()} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg mb-2">
                        Choose Image
                    </button>
                    {selectedFile && (
                        <button onClick={handleUpload} disabled={uploading} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-green-300">
                            {uploading ? 'Uploading...' : 'Upload & Save'}
                        </button>
                    )}
                     {profileMessage.text && <p className={`mt-4 text-sm ${profileMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{profileMessage.text}</p>}
                </div>

                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <InputField name="name" label="Full Name" value={profileData.name} onChange={handleProfileChange} required />
                            <InputField name="email" label="Email Address" value={profileData.email} onChange={handleProfileChange} type="email" required />
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Save Profile Changes</button>
                        </form>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Change Password</h2>
                        {passwordMessage.text && <p className={`mb-4 text-sm ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{passwordMessage.text}</p>}
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
        </div>
    );
};

export default ProfilePage;
