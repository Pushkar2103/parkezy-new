class ApiService {
    constructor() {
        this.baseUrl = '/api';
        this.token = localStorage.getItem('parkezy_token');
    }

    getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }
    
    setToken(token) {
        this.token = token;
        localStorage.setItem('parkezy_token', token);
    }

    clearToken() {
        this.token = null;
    }

    async register(name, email, password, role) {
        const response = await fetch(`${this.baseUrl}/auth/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ name, email, password, role }),
        });
        return response.json();
    }

    async verifyEmail(verificationToken) {
        const response = await fetch(`${this.baseUrl}/auth/verify-email/${verificationToken}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        return response.json();
    }

    async login(email, password) {
        const response = await fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email, password }),
        });
        return response.json();
    }
    
    async forgotPassword(email) {
        const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email }),
        });
        return response.json();
    }

    async resetPassword(token, password) {
        const response = await fetch(`${this.baseUrl}/auth/reset-password/${token}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify({ password }),
        });
        return response.json();
    }

    async getParkingAreas(searchTerm = '') {
        const url = new URL(`${window.location.origin}${this.baseUrl}/user/parking-areas`);
        if (searchTerm) {
            url.searchParams.append('search', searchTerm);
        }
        const response = await fetch(url.toString(), {
            headers: this.getHeaders(),
        });
        return response.json();
    }

    async getParkingAreaDetails(areaId) {
        const response = await fetch(`${this.baseUrl}/user/parking-areas/${areaId}`, {
            headers: this.getHeaders(),
        });
        return response.json();
    }

    async getOwnerStats() {
        const response = await fetch(`${this.baseUrl}/parking-areas/owner/stats`, {
            headers: this.getHeaders(),
        });
        return response.json();
    }

    async getOwnerParkingAreas() {
        const response = await fetch(`${this.baseUrl}/parking-areas/owner`, {
            headers: this.getHeaders(),
        });
        return response.json();
    }

    async createParkingArea(data) {
        const response = await fetch(`${this.baseUrl}/parking-areas`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        return response.json();
    }

    async updateParkingArea(id, data) {
        const response = await fetch(`${this.baseUrl}/parking-areas/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        return response.json();
    }
}

export const apiService = new ApiService();

