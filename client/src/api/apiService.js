import axios from 'axios';

const apiService = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiService.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('parkezy_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


apiService.register = (name, email, password, role) => apiService.post('/auth/register', { name, email, password, role });
apiService.login = (email, password) => apiService.post('/auth/login', { email, password });
apiService.forgotPassword = (email) => apiService.post('/auth/forgot-password', { email });
apiService.resetPassword = (token, password) => apiService.patch(`/auth/reset-password/${token}`, { password });
apiService.verifyEmail = (verificationToken) => apiService.get(`/auth/verify-email/${verificationToken}`);


apiService.requestBookingCancellation = (bookingId) => apiService.put(`/bookings/${bookingId}/request-cancellation`);
apiService.requestBookingCompletion = (bookingId) => apiService.put(`/bookings/${bookingId}/request-completion`);
apiService.getCancellationRequests = () => apiService.get('/bookings/owner/cancellation-requests');
apiService.respondToCancellation = (bookingId, decision) => apiService.put(`/bookings/${bookingId}/respond-cancellation`, { decision });
apiService.getCompletionRequests = () => apiService.get('/bookings/owner/completion-requests');
apiService.respondToCompletion = (bookingId, decision) => apiService.put(`/bookings/${bookingId}/respond-completion`, { decision });


apiService.createParkingArea = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    return apiService.post('/parking-areas', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
apiService.getOwnerParkingAreas = () => apiService.get('/parking-areas/owner');
apiService.updateParkingArea = (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    return apiService.put(`/parking-areas/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
apiService.deleteParkingArea = (id) => apiService.delete(`/parking-areas/${id}`);
apiService.getOwnerStats = () => apiService.get('/parking-areas/owner/stats');



apiService.getParkingAreas = (searchTerm = '', lat, lng, radius = 10) => {
    return apiService.get('/user/parking-areas', {
        params: { search: searchTerm, lat, lng, radius },
    });
};
apiService.getParkingAreaDetails = (areaId) => apiService.get(`/user/parking-areas/${areaId}`);
apiService.bookSlot = (bookingData) => apiService.post('/user/book-slot', bookingData);
apiService.getUserBookings = () => apiService.get('/user/bookings');
apiService.getUserBookingHistory = () => apiService.get('/user/bookings/history');
apiService.getSlotAvailability = (slotId) => apiService.get(`/user/slots/${slotId}/availability`);


apiService.getMyProfile = () => apiService.get('/profile/me');
apiService.updateMyProfile = (profileData) => apiService.put('/profile/update-me', profileData);
apiService.updateUserPassword = (passwordData) => apiService.put('/profile/update-my-password', passwordData);
apiService.uploadProfilePicture = (file) => {
    const formData = new FormData();
    formData.append('profilePic', file);
    return apiService.post('/profile/upload-picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};



export { apiService };
