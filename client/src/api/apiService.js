import axios from 'axios';

const api = axios.create({
    baseURL: 'https://parkezy-backend.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

let authToken = localStorage.getItem('parkezy_token');

api.interceptors.request.use(
    (config) => {
        if (authToken) {
            config.headers['Authorization'] = `Bearer ${authToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const setToken = (token) => {
    authToken = token;
    localStorage.setItem('parkezy_token', token);
};

const clearToken = () => {
    authToken = null;
    localStorage.removeItem('parkezy_token');
};

export const apiService = {
    setToken,
    clearToken,

    register: (name, email, password, role) => api.post('/auth/register', { name, email, password, role }),
    verifyEmail: (verificationToken) => api.get(`/auth/verify-email/${verificationToken}`),
    login: (email, password) => api.post('/auth/login', { email, password }),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.patch(`/auth/reset-password/${token}`, { password }),

    getParkingAreas: (searchTerm = '', lat, lng, radius = 10) => {
        return api.get('/user/parking-areas', {
            params: { search: searchTerm, lat, lng, radius },
        });
    },
    getParkingAreaDetails: (areaId) => api.get(`/user/parking-areas/${areaId}`),
    bookSlot: (bookingData) => api.post('/user/book-slot', bookingData),
    getUserBookings: () => api.get('/user/bookings'),
    getUserBookingHistory: () => api.get('/user/bookings/history'),
    requestBookingCancellation: (bookingId) => api.put(`/bookings/${bookingId}/request-cancellation`),
    requestBookingCompletion: (bookingId) => api.put(`/bookings/${bookingId}/request-completion`),
    getSlotAvailability: (slotId) => api.get(`/user/slots/${slotId}/availability`),

    getOwnerStats: () => api.get('/parking-areas/owner/stats'),
    getOwnerParkingAreas: () => api.get('/parking-areas/owner'),
    createParkingArea: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => formData.append(key, data[key]));
        return api.post('/parking-areas', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    updateParkingArea: (id, data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => formData.append(key, data[key]));
        return api.put(`/parking-areas/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    deleteParkingArea: (id) => api.delete(`/parking-areas/${id}`),
    getCancellationRequests: () => api.get('/bookings/owner/cancellation-requests'),
    respondToCancellation: (bookingId, decision) => api.put(`/bookings/${bookingId}/respond-cancellation`, { decision }),
    getCompletionRequests: () => api.get('/bookings/owner/completion-requests'),
    respondToCompletion: (bookingId, decision) => api.put(`/bookings/${bookingId}/respond-completion`, { decision }),

    // --- Profile Methods ---
    updateMyProfile: (profileData) => api.put('/profile/update-me', profileData),
    updateUserPassword: (passwordData) => api.put('/profile/update-my-password', passwordData),
    uploadProfilePicture: (file) => {
        const formData = new FormData();
        formData.append('profilePic', file);
        return api.post('/profile/upload-picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
};
