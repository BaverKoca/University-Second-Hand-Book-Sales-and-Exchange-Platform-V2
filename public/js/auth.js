// Auth state management
const Auth = {
    // Current user state
    currentUser: null,
    isAuthenticated: false,

    // Initialize auth state
    async init() {
        const token = API.getToken();
        if (token) {
            try {
                const user = await API.user.getProfile();
                this.setUser(user);
            } catch (error) {
                this.logout();
            }
        }
        this.updateUI();
    },

    // Set current user and update state
    setUser(user) {
        this.currentUser = user;
        this.isAuthenticated = true;
        this.updateUI();
    },

    // Handle login
    async login(email, password) {
        try {
            const { token } = await API.auth.login({ email, password });
            API.setToken(token);
            const user = await API.user.getProfile();
            this.setUser(user);
            UI.showToast('Login successful', 'success');
            return true;
        } catch (error) {
            UI.showToast(error.message, 'error');
            return false;
        }
    },

    // Handle registration
    async register(userData) {
        try {
            const { token } = await API.auth.register(userData);
            API.setToken(token);
            const user = await API.user.getProfile();
            this.setUser(user);
            UI.showToast('Registration successful', 'success');
            return true;
        } catch (error) {
            UI.showToast(error.message, 'error');
            return false;
        }
    },

    // Handle logout
    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        API.removeToken();
        this.updateUI();
        UI.showToast('Logged out successfully', 'success');
    },

    // Update UI based on auth state
    updateUI() {
        const navLinks = document.getElementById('nav-links');
        const userMenu = document.getElementById('user-menu');
        const mobileMenu = document.getElementById('mobile-menu');

        if (this.isAuthenticated) {
            // Navigation links for authenticated users
            navLinks.innerHTML = `
                <a href="/" class="text-gray-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</a>
                <a href="/books" class="text-gray-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Browse Books</a>
                <a href="/my-books" class="text-gray-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">My Books</a>
                <a href="/messages" class="text-gray-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Messages</a>
            `;

            // User menu for authenticated users
            userMenu.innerHTML = `
                <div class="relative">
                    <button type="button" class="text-gray-100 hover:text-white flex items-center" id="user-menu-button">
                        <span class="mr-2">${this.currentUser.firstName}</span>
                        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <div class="hidden origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" id="user-menu-dropdown">
                        <div class="py-1">
                            <a href="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                            <a href="/favorites" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Favorites</a>
                            <button onclick="Auth.logout()" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                        </div>
                    </div>
                </div>
            `;

            // Mobile menu for authenticated users
            mobileMenu.innerHTML = `
                <div class="px-2 pt-2 pb-3 space-y-1">
                    <a href="/" class="text-gray-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Home</a>
                    <a href="/books" class="text-gray-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Browse Books</a>
                    <a href="/my-books" class="text-gray-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium">My Books</a>
                    <a href="/messages" class="text-gray-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Messages</a>
                    <a href="/profile" class="text-gray-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Profile</a>
                    <a href="/favorites" class="text-gray-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Favorites</a>
                    <button onclick="Auth.logout()" class="text-gray-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Logout</button>
                </div>
            `;
        } else {
            // Navigation links for guests
            navLinks.innerHTML = `
                <a href="/" class="text-gray-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</a>
                <a href="/books" class="text-gray-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Browse Books</a>
            `;

            // User menu for guests
            userMenu.innerHTML = `
                <button onclick="UI.showLoginModal()" class="text-gray-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Login</button>
                <button onclick="UI.showRegisterModal()" class="bg-white text-indigo-600 hover:bg-gray-100 ml-3 px-3 py-2 rounded-md text-sm font-medium">Register</button>
            `;

            // Mobile menu for guests
            mobileMenu.innerHTML = `
                <div class="px-2 pt-2 pb-3 space-y-1">
                    <a href="/" class="text-gray-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Home</a>
                    <a href="/books" class="text-gray-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Browse Books</a>
                    <button onclick="UI.showLoginModal()" class="text-gray-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Login</button>
                    <button onclick="UI.showRegisterModal()" class="text-gray-100 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Register</button>
                </div>
            `;
        }

        // Setup user menu dropdown toggle
        const userMenuButton = document.getElementById('user-menu-button');
        const userMenuDropdown = document.getElementById('user-menu-dropdown');
        if (userMenuButton && userMenuDropdown) {
            userMenuButton.addEventListener('click', () => {
                userMenuDropdown.classList.toggle('hidden');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (event) => {
                if (!userMenuButton.contains(event.target) && !userMenuDropdown.contains(event.target)) {
                    userMenuDropdown.classList.add('hidden');
                }
            });
        }

        // Setup mobile menu toggle
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}; 