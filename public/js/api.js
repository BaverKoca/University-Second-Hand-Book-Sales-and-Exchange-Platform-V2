// API utility functions
const API = {
    // Base URL for API requests
    baseURL: '/api',

    // Get stored auth token
    getToken() {
        return localStorage.getItem('token');
    },

    // Set auth token
    setToken(token) {
        localStorage.setItem('token', token);
    },

    // Remove auth token
    removeToken() {
        localStorage.removeItem('token');
    },

    // Headers for authenticated requests
    authHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    },

    // Generic request function
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: {
                    ...this.authHeaders(),
                    ...options.headers
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    // Auth endpoints
    auth: {
        async register(userData) {
            return API.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        },

        async login(credentials) {
            return API.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });
        }
    },

    // User endpoints
    user: {
        async getProfile() {
            return API.request('/users/profile');
        },

        async updateProfile(data) {
            return API.request('/users/profile', {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },

        async changePassword(data) {
            return API.request('/users/password', {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },

        async getFavorites() {
            return API.request('/users/favorites');
        },

        async getMyBooks() {
            return API.request('/users/books');
        }
    },

    // Book endpoints
    books: {
        async getAll(filters = {}) {
            const params = new URLSearchParams(filters);
            return API.request(`/books?${params}`);
        },

        async getById(id) {
            return API.request(`/books/${id}`);
        },

        async create(bookData) {
            return API.request('/books', {
                method: 'POST',
                body: JSON.stringify(bookData)
            });
        },

        async update(id, bookData) {
            return API.request(`/books/${id}`, {
                method: 'PUT',
                body: JSON.stringify(bookData)
            });
        },

        async delete(id) {
            return API.request(`/books/${id}`, {
                method: 'DELETE'
            });
        },

        async addToFavorites(id) {
            return API.request(`/books/${id}/favorite`, {
                method: 'POST'
            });
        },

        async removeFromFavorites(id) {
            return API.request(`/books/${id}/favorite`, {
                method: 'DELETE'
            });
        }
    },

    // Message endpoints
    messages: {
        async send(messageData) {
            return API.request('/messages', {
                method: 'POST',
                body: JSON.stringify(messageData)
            });
        },

        async getConversations() {
            return API.request('/messages/conversations');
        },

        async getBookMessages(bookId) {
            return API.request(`/messages/book/${bookId}`);
        }
    }
}; 