// UI utility functions
const UI = {
    // Show toast notification
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        const bgColor = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500'
        }[type];

        toast.className = `toast ${bgColor} text-white p-4 mb-4 rounded-lg shadow-lg flex items-center justify-between`;
        toast.innerHTML = `
            <span>${message}</span>
            <button class="ml-4 hover:text-gray-200" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    },

    // Show modal dialog
    showModal(content) {
        const modalContainer = document.getElementById('modal-container');
        const modalContent = modalContainer.querySelector('div');
        
        modalContent.innerHTML = content;
        modalContainer.classList.remove('hidden');
        modalContainer.classList.add('modal-enter');
        modalContent.classList.add('modal-content-enter');

        // Close modal when clicking outside
        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                this.closeModal();
            }
        });
    },

    // Close modal dialog
    closeModal() {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.classList.add('hidden');
    },

    // Show login modal
    showLoginModal() {
        const content = `
            <div class="p-6">
                <h2 class="text-2xl font-bold mb-4">Login</h2>
                <form id="login-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div class="flex items-center justify-between">
                        <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Login</button>
                        <button type="button" onclick="UI.showRegisterModal()" class="text-indigo-600 hover:text-indigo-800">Create account</button>
                    </div>
                </form>
            </div>
        `;

        this.showModal(content);

        // Handle form submission
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const success = await Auth.login(formData.get('email'), formData.get('password'));
            if (success) {
                this.closeModal();
            }
        });
    },

    // Show registration modal
    showRegisterModal() {
        const content = `
            <div class="p-6">
                <h2 class="text-2xl font-bold mb-4">Create Account</h2>
                <form id="register-form" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">First Name</label>
                            <input type="text" name="firstName" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Last Name</label>
                            <input type="text" name="lastName" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" required minlength="6" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Faculty</label>
                        <input type="text" name="faculty" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Department</label>
                        <input type="text" name="department" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="tel" name="phoneNumber" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div class="flex items-center justify-between">
                        <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Register</button>
                        <button type="button" onclick="UI.showLoginModal()" class="text-indigo-600 hover:text-indigo-800">Already have an account?</button>
                    </div>
                </form>
            </div>
        `;

        this.showModal(content);

        // Handle form submission
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const userData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password'),
                faculty: formData.get('faculty'),
                department: formData.get('department'),
                phoneNumber: formData.get('phoneNumber')
            };
            const success = await Auth.register(userData);
            if (success) {
                this.closeModal();
            }
        });
    },

    // Show loading spinner
    showLoading() {
        const spinner = document.createElement('div');
        spinner.className = 'spinner fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
        spinner.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(spinner);
    },

    // Hide loading spinner
    hideLoading() {
        const spinner = document.querySelector('.spinner');
        if (spinner) {
            spinner.remove();
        }
    },

    // Format date
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Format price
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    },

    // Create book card
    createBookCard(book) {
        return `
            <div class="book-card bg-white rounded-lg shadow-md overflow-hidden">
                <div class="p-6">
                    <div class="flex justify-between items-start">
                        <h3 class="text-lg font-semibold text-gray-900">${book.title}</h3>
                        <span class="status-tag status-${book.status}">${book.status}</span>
                    </div>
                    <p class="text-gray-600 mt-2">${book.author}</p>
                    <p class="text-sm text-gray-500 mt-1">${book.subject}</p>
                    <div class="mt-4 flex justify-between items-center">
                        <span class="text-indigo-600 font-semibold">${this.formatPrice(book.price)}</span>
                        <span class="text-sm text-gray-500">Condition: ${book.condition}</span>
                    </div>
                    <div class="mt-4 flex justify-between items-center">
                        <button onclick="Books.viewDetails('${book.id}')" class="text-indigo-600 hover:text-indigo-800">View Details</button>
                        ${Auth.isAuthenticated ? `
                            <button onclick="Books.toggleFavorite('${book.id}')" class="text-gray-400 hover:text-red-500">
                                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
}; 