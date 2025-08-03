import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../api/apiService';

const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const EyeSlashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" /></svg>;
const LoadingSpinner = () => <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

const InputField = ({ name, label, value, onChange, type = 'text', required = false, disabled = false }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPasswordField = type === 'password';

    return (
        <div className="relative">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input 
                type={isPasswordField ? (isPasswordVisible ? 'text' : 'password') : type} 
                name={name} 
                id={name} 
                value={value} 
                onChange={onChange} 
                required={required} 
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-50" 
            />
            {isPasswordField && (
                <button 
                    type="button" 
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500 hover:text-blue-600 cursor-pointer"
                >
                    {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
            )}
        </div>
    );
};

const ProfilePage = () => {
    const { user, login, token } = useAuth();
    
    const [profileData, setProfileData] = useState({ name: user.name, email: user.email });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    
    const [profileFeedback, setProfileFeedback] = useState({ message: '', type: '' });
    const [passwordFeedback, setPasswordFeedback] = useState({ message: '', type: '' });
    const [imageFeedback, setImageFeedback] = useState({ message: '', type: '' });

    const [isProfileSaving, setIsProfileSaving] = useState(false);
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const clearFeedback = (setter) => {
            const timer = setTimeout(() => setter({ message: '', type: '' }), 5000);
            return () => clearTimeout(timer);
        };
        if (profileFeedback.message) clearFeedback(setProfileFeedback);
        if (passwordFeedback.message) clearFeedback(setPasswordFeedback);
        if (imageFeedback.message) clearFeedback(setImageFeedback);
    }, [profileFeedback, passwordFeedback, imageFeedback]);

    const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setImageFeedback({ message: '', type: '' });
        try {
            const response = await apiService.uploadProfilePicture(selectedFile);
            login({ user: response.data.user, token });
            setImageFeedback({ message: 'Profile picture updated!', type: 'success' });
            setSelectedFile(null);
            setPreview(null);
        } catch (error) {
            setImageFeedback({ message: error.response?.data?.message || 'Upload failed.', type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsProfileSaving(true);
        setProfileFeedback({ message: '', type: '' });
        try {
            const response = await apiService.updateMyProfile(profileData);
            login({ user: response.data, token });
            setProfileFeedback({ message: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            setProfileFeedback({ message: error.response?.data?.message || 'Failed to update profile.', type: 'error' });
        } finally {
            setIsProfileSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setIsPasswordSaving(true);
        setPasswordFeedback({ message: '', type: '' });
        try {
            const response = await apiService.updateUserPassword(passwordData);
            setPasswordFeedback({ message: response.data.message, type: 'success' });
            setPasswordData({ currentPassword: '', newPassword: '' });
        } catch (error) {
            setPasswordFeedback({ message: error.response?.data?.message || 'Incorrect current password.', type: 'error' });
        } finally {
            setIsPasswordSaving(false);
        }
    };

    return (
        <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">My Profile</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-lg text-center flex flex-col items-center">
                    <h2 className="text-2xl font-bold mb-4">Profile Picture</h2>
                    <img
                        src={preview || user.profilePicture || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&background=random&color=fff`}
                        alt="Profile"
                        className="w-40 h-40 rounded-full object-cover mb-4 border-4 border-gray-200"
                    />
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button onClick={() => fileInputRef.current.click()} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg mb-2 cursor-pointer">
                        Choose Image
                    </button>
                    {selectedFile && (
                        <button onClick={handleUpload} disabled={uploading} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-green-300 flex items-center justify-center cursor-pointer">
                            {uploading && <LoadingSpinner />}
                            {uploading ? 'Uploading...' : 'Upload & Save'}
                        </button>
                    )}
                    {imageFeedback.message && <p className={`mt-4 text-sm ${imageFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{imageFeedback.message}</p>}
                </div>

                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
                        {profileFeedback.message && <p className={`mb-4 text-sm ${profileFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{profileFeedback.message}</p>}
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <InputField name="name" label="Full Name" value={profileData.name} onChange={handleProfileChange} required disabled={isProfileSaving} />
                            <InputField name="email" label="Email Address" value={profileData.email} onChange={handleProfileChange} type="email" required disabled={isProfileSaving} />
                            <button type="submit" disabled={isProfileSaving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer flex items-center justify-center disabled:bg-blue-400">
                                {isProfileSaving && <LoadingSpinner />}
                                {isProfileSaving ? 'Saving...' : 'Save Profile Changes'}
                            </button>
                        </form>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Change Password</h2>
                        {passwordFeedback.message && <p className={`mb-4 text-sm ${passwordFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{passwordFeedback.message}</p>}
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <InputField name="currentPassword" label="Current Password" value={passwordData.currentPassword} onChange={handlePasswordChange} type="password" required disabled={isPasswordSaving} />
                            <InputField name="newPassword" label="New Password" value={passwordData.newPassword} onChange={handlePasswordChange} type="password" required disabled={isPasswordSaving} />
                            <button type="submit" disabled={isPasswordSaving} className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg cursor-pointer flex items-center justify-center disabled:bg-gray-500">
                                {isPasswordSaving && <LoadingSpinner />}
                                {isPasswordSaving ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                        <div className="text-center mt-4">
                            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline cursor-pointer">Forgot your password?</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;