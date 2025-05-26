// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize authentication
        await Auth.init();

        // Initialize books
        await Books.init();

        // Initialize messages if authenticated
        if (Auth.isAuthenticated) {
            await Messages.init();
        }

        // Handle navigation
        window.addEventListener('popstate', handleNavigation);
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.href) {
                e.preventDefault();
                const url = new URL(e.target.href);
                if (url.origin === window.location.origin) {
                    history.pushState({}, '', url.pathname);
                    handleNavigation();
                }
            }
        });

        // Initial navigation
        handleNavigation();
    } catch (error) {
        UI.showToast('Error initializing application', 'error');
        console.error(error);
    }
});

// Handle navigation
async function handleNavigation() {
    const path = window.location.pathname;

    try {
        UI.showLoading();

        switch (path) {
            case '/':
                await Books.loadBooks();
                break;

            case '/books':
                await Books.loadBooks();
                break;

            case '/my-books':
                if (!Auth.isAuthenticated) {
                    UI.showToast('Please login to view your books', 'warning');
                    history.pushState({}, '', '/');
                    await Books.loadBooks();
                } else {
                    Books.filters = { sellerId: Auth.currentUser.id };
                    await Books.loadBooks();
                }
                break;

            case '/favorites':
                if (!Auth.isAuthenticated) {
                    UI.showToast('Please login to view your favorites', 'warning');
                    history.pushState({}, '', '/');
                    await Books.loadBooks();
                } else {
                    const favorites = await API.user.getFavorites();
                    Books.books = favorites;
                    Books.renderBooks();
                }
                break;

            case '/messages':
                if (!Auth.isAuthenticated) {
                    UI.showToast('Please login to view messages', 'warning');
                    history.pushState({}, '', '/');
                    await Books.loadBooks();
                } else {
                    await Messages.loadConversations();
                }
                break;

            case '/profile':
                if (!Auth.isAuthenticated) {
                    UI.showToast('Please login to view your profile', 'warning');
                    history.pushState({}, '', '/');
                    await Books.loadBooks();
                } else {
                    renderProfile();
                }
                break;

            default:
                history.pushState({}, '', '/');
                await Books.loadBooks();
        }
    } catch (error) {
        UI.showToast(error.message, 'error');
    } finally {
        UI.hideLoading();
    }
}

// Render user profile
function renderProfile() {
    const mainContent = document.getElementById('main-content');
    const user = Auth.currentUser;

    const content = `
        <div class="max-w-4xl mx-auto">
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
                <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg font-medium text-gray-900">Profile Information</h3>
                    <p class="mt-1 text-sm text-gray-500">Manage your account details</p>
                </div>
                <div class="border-t border-gray-200">
                    <form id="profile-form" class="divide-y divide-gray-200">
                        <div class="px-4 py-5 sm:p-6">
                            <div class="grid grid-cols-6 gap-6">
                                <div class="col-span-6 sm:col-span-3">
                                    <label class="block text-sm font-medium text-gray-700">First Name</label>
                                    <input type="text" name="firstName" value="${user.firstName}" required
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                </div>
                                <div class="col-span-6 sm:col-span-3">
                                    <label class="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input type="text" name="lastName" value="${user.lastName}" required
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                </div>
                                <div class="col-span-6 sm:col-span-3">
                                    <label class="block text-sm font-medium text-gray-700">Faculty</label>
                                    <input type="text" name="faculty" value="${user.faculty}" required
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                </div>
                                <div class="col-span-6 sm:col-span-3">
                                    <label class="block text-sm font-medium text-gray-700">Department</label>
                                    <input type="text" name="department" value="${user.department}" required
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                </div>
                                <div class="col-span-6">
                                    <label class="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input type="tel" name="phoneNumber" value="${user.phoneNumber || ''}"
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                </div>
                            </div>
                        </div>
                        <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
                            <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg font-medium text-gray-900">Change Password</h3>
                    <p class="mt-1 text-sm text-gray-500">Update your password</p>
                </div>
                <div class="border-t border-gray-200">
                    <form id="password-form" class="divide-y divide-gray-200">
                        <div class="px-4 py-5 sm:p-6">
                            <div class="grid grid-cols-6 gap-6">
                                <div class="col-span-6 sm:col-span-4">
                                    <label class="block text-sm font-medium text-gray-700">Current Password</label>
                                    <input type="password" name="currentPassword" required
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                </div>
                                <div class="col-span-6 sm:col-span-4">
                                    <label class="block text-sm font-medium text-gray-700">New Password</label>
                                    <input type="password" name="newPassword" required minlength="6"
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                </div>
                            </div>
                        </div>
                        <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
                            <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                                Change Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    mainContent.innerHTML = content;

    // Handle profile form submission
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            faculty: formData.get('faculty'),
            department: formData.get('department'),
            phoneNumber: formData.get('phoneNumber')
        };

        try {
            UI.showLoading();
            await API.user.updateProfile(userData);
            const updatedUser = await API.user.getProfile();
            Auth.setUser(updatedUser);
            UI.showToast('Profile updated successfully', 'success');
        } catch (error) {
            UI.showToast(error.message, 'error');
        } finally {
            UI.hideLoading();
        }
    });

    // Handle password form submission
    document.getElementById('password-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const passwordData = {
            currentPassword: formData.get('currentPassword'),
            newPassword: formData.get('newPassword')
        };

        try {
            UI.showLoading();
            await API.user.changePassword(passwordData);
            e.target.reset();
            UI.showToast('Password changed successfully', 'success');
        } catch (error) {
            UI.showToast(error.message, 'error');
        } finally {
            UI.hideLoading();
        }
    });
} 