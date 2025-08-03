import axios from 'axios';

class ApiService {
    constructor() {
        const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

        this.token = localStorage.getItem('parkezy_token');

        this.axiosInstance = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.axiosInstance.interceptors.request.use(config => {
            if (this.token) {
                config.headers.Authorization = `Bearer ${this.token}`;
            }
            return config;
        });
    }

    setToken = (token) => {
        this.token = token;
        localStorage.setItem('parkezy_token', token);
    }

    clearToken = () => {
        this.token = null;
        localStorage.removeItem('parkezy_token');
    }

    // --- Auth Methods ---
    register = (name, email, password, role) =>
        this.axiosInstance.post('/auth/register', { name, email, password, role });

    verifyEmail = (token) =>
        this.axiosInstance.get(`/auth/verify-email/${token}`);

    login = (email, password) =>
        this.axiosInstance.post('/auth/login', { email, password });

    forgotPassword = (email) =>
        this.axiosInstance.post('/auth/forgot-password', { email });

    resetPassword = (token, password) =>
        this.axiosInstance.patch(`/auth/reset-password/${token}`, { password });

    // --- User Methods ---
    getParkingAreas = (searchTerm = '', lat, lng, radius = 10) => {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (lat) params.lat = lat;
        if (lng) params.lng = lng;
        if (radius) params.radius = radius;
        return this.axiosInstance.get('/user/parking-areas', { params });
    };

    getParkingAreaDetails = (areaId) =>
        this.axiosInstance.get(`/user/parking-areas/${areaId}`);

    bookSlot = (bookingData) =>
        this.axiosInstance.post('/user/book-slot', bookingData);

    getUserBookings = () =>
        this.axiosInstance.get('/user/bookings');

    requestBookingCancellation = (bookingId) =>
        this.axiosInstance.put(`/bookings/${bookingId}/request-cancellation`);

    requestBookingCompletion = (bookingId) =>
        this.axiosInstance.put(`/bookings/${bookingId}/request-completion`);

    // --- Owner Methods ---
    getOwnerStats = () =>
        this.axiosInstance.get('/parking-areas/owner/stats');

    getOwnerParkingAreas = () =>
        this.axiosInstance.get('/parking-areas/owner');

    createParkingArea = (data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'parkingImage') {
                formData.append(key, value);
            }
        });
        if (data.parkingImage) {
            formData.append('parkingImage', data.parkingImage);
        }

        return this.axiosInstance.post('/parking-areas', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    };

    updateParkingArea = (id, data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'parkingImage') {
                formData.append(key, value);
            }
        });
        if (data.parkingImage) {
            formData.append('parkingImage', data.parkingImage);
        }

        return this.axiosInstance.put(`/parking-areas/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    };

    deleteParkingArea = (id) =>
        this.axiosInstance.delete(`/parking-areas/${id}`);

    getCancellationRequests = () =>
        this.axiosInstance.get('/bookings/owner/cancellation-requests');

    respondToCancellation = (bookingId, decision) =>
        this.axiosInstance.put(`/bookings/${bookingId}/respond-cancellation`, { decision });

    getCompletionRequests = () =>
        this.axiosInstance.get('/bookings/owner/completion-requests');

    respondToCompletion = (bookingId, decision) =>
        this.axiosInstance.put(`/bookings/${bookingId}/respond-completion`, { decision });

    updateMyProfile = (profileData) =>
        this.axiosInstance.put('/profile/update-me', profileData);

    updateUserPassword = (passwordData) =>
        this.axiosInstance.put('/profile/update-my-password', passwordData);

    getUserBookingHistory = () =>
        this.axiosInstance.get('/user/bookings/history');

    uploadProfilePicture = (file) => {
        const formData = new FormData();
        formData.append('profilePic', file);

        return this.axiosInstance.post('/profile/upload-picture', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    };

    getSlotAvailability = (slotId) =>
        this.axiosInstance.get(`/user/slots/${slotId}/availability`);
}

export const apiService = new ApiService();
