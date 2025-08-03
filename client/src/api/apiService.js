class ApiService {
    constructor() {
        this.baseUrl = '/api';
        this.token = localStorage.getItem('parkezy_token');
    }

    getHeaders = () => {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }
    
    setToken = (token) => {
        this.token = token;
        localStorage.setItem('parkezy_token', token);
    }

    clearToken = () => {
        this.token = null;
    }

    // --- Auth Methods ---
    register = async (name, email, password, role) => {
        const response = await fetch(`${this.baseUrl}/auth/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ name, email, password, role }),
        });
        return response.json();
    }
    verifyEmail = async (verificationToken) => {
        const response = await fetch(`${this.baseUrl}/auth/verify-email/${verificationToken}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        return response.json();
    }
    login = async (email, password) => {
        const response = await fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email, password }),
        });
        return response.json();
    }
    forgotPassword = async (email) => {
        const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email }),
        });
        return response.json();
    }
    resetPassword = async (token, password) => {
        const response = await fetch(`${this.baseUrl}/auth/reset-password/${token}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify({ password }),
        });
        return response.json();
    }

    // --- User Methods ---
    getParkingAreas = async (searchTerm = '', lat, lng, radius = 10) => {
        const url = new URL(`${window.location.origin}${this.baseUrl}/user/parking-areas`);
        if (searchTerm) url.searchParams.append('search', searchTerm);
        if (lat) url.searchParams.append('lat', lat);
        if (lng) url.searchParams.append('lng', lng);
        if (radius) url.searchParams.append('radius', radius);
        
        const response = await fetch(url.toString(), {
            headers: this.getHeaders(),
        });
        return response.json();
    }
    getParkingAreaDetails = async (areaId) => {
        const response = await fetch(`${this.baseUrl}/user/parking-areas/${areaId}`, {
            headers: this.getHeaders(),
        });
        return response.json();
    }
    bookSlot = async (bookingData) => {
        const response = await fetch(`${this.baseUrl}/user/book-slot`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(bookingData),
        });
        return response.json();
    }
    getUserBookings = async () => {
        const response = await fetch(`${this.baseUrl}/user/bookings`, {
            headers: this.getHeaders(),
        });
        return response.json();
    }
    requestBookingCancellation = async (bookingId) => {
        const response = await fetch(`${this.baseUrl}/bookings/${bookingId}/request-cancellation`, {
            method: 'PUT',
            headers: this.getHeaders(),
        });
        return response.json();
    }
    requestBookingCompletion = async (bookingId) => {
        const response = await fetch(`${this.baseUrl}/bookings/${bookingId}/request-completion`, {
            method: 'PUT',
            headers: this.getHeaders(),
        });
        return response.json();
    }

    // --- Owner Methods ---
    getOwnerStats = async () => {
        const response = await fetch(`${this.baseUrl}/parking-areas/owner/stats`, {
            headers: this.getHeaders(),
        });
        return response.json();
    }
    getOwnerParkingAreas = async () => {
        const response = await fetch(`${this.baseUrl}/parking-areas/owner`, {
            headers: this.getHeaders(),
        });
        return response.json();
    }

    createParkingArea = async (data) => {
        const formData = new FormData();
        for (const key in data) {
            if (key !== 'parkingImage') {
                formData.append(key, data[key]);
            }
        }
        if (data.parkingImage) {
            formData.append('parkingImage', data.parkingImage);
        }

        const response = await fetch(`${this.baseUrl}/parking-areas`, {
            method: 'POST',
            headers: {
                authorization: `Bearer ${this.token}`,
            },
            body: formData,
        });
        return response.json();
    }

    updateParkingArea = async (id, data) => {
        const formData = new FormData();
        for (const key in data) {
            if (key !== 'parkingImage') {
                formData.append(key, data[key]);
            }
        }
        if (data.parkingImage) {
            formData.append('parkingImage', data.parkingImage);
        }

        const response = await fetch(`${this.baseUrl}/parking-areas/${id}`, {
            method: 'PUT',
            headers: {
                authorization: `Bearer ${this.token}`,
            },
            body: formData,
        });
        return response.json();
    }

    deleteParkingArea = async (id) => {
        const response = await fetch(`${this.baseUrl}/parking-areas/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
        return response.json();
    }
     getCancellationRequests = async () => {
        const response = await fetch(`${this.baseUrl}/bookings/owner/cancellation-requests`, {
            headers: this.getHeaders(),
        });
        return response.json();
    }

    respondToCancellation = async (bookingId, decision) => {
        const response = await fetch(`${this.baseUrl}/bookings/${bookingId}/respond-cancellation`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({ decision }),
        });
        return response.json();
    }

    getCompletionRequests = async () => {
        const response = await fetch(`${this.baseUrl}/bookings/owner/completion-requests`, {
            headers: this.getHeaders(),
        });
        return response.json();
    }
    
    respondToCompletion = async (bookingId, decision) => {
        const response = await fetch(`${this.baseUrl}/bookings/${bookingId}/respond-completion`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({ decision }),
        });
        return response.json();
    }

     updateMyProfile = async (profileData) => {
        const response = await fetch(`${this.baseUrl}/profile/update-me`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(profileData),
        });
        return response.json();
    }

    updateUserPassword = async (passwordData) => {
        const response = await fetch(`${this.baseUrl}/profile/update-my-password`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(passwordData),
        });
        return response.json();
    }

    getUserBookingHistory = async () => {
        const response = await fetch(`${this.baseUrl}/user/bookings/history`, {
            headers: this.getHeaders(),
        });
        return response.json();
    }

    uploadProfilePicture = async (file) => {
        const formData = new FormData();
        formData.append('profilePic', file);

        const response = await fetch(`${this.baseUrl}/profile/upload-picture`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`
            },
            body: formData,
        });
        return response.json();
    }

      getSlotAvailability = async (slotId) => {
        const response = await fetch(`${this.baseUrl}/user/slots/${slotId}/availability`, {
            headers: this.getHeaders(),
        });
        return response.json();
    }
}

export const apiService = new ApiService();
