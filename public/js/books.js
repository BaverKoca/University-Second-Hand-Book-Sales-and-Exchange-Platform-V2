// Books management
const Books = {
    // Current books state
    books: [],
    filters: {},

    // Initialize books
    async init() {
        await this.loadBooks();
    },

    // Load books with filters
    async loadBooks() {
        try {
            UI.showLoading();
            this.books = await API.books.getAll(this.filters);
            this.renderBooks();
        } catch (error) {
            UI.showToast(error.message, 'error');
        } finally {
            UI.hideLoading();
        }
    },

    // Render books list
    renderBooks() {
        const mainContent = document.getElementById('main-content');
        
        const content = `
            <div class="mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h1 class="text-2xl font-bold text-gray-900">Browse Books</h1>
                    ${Auth.isAuthenticated ? `
                        <button onclick="Books.showAddBookModal()" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                            Add Book
                        </button>
                    ` : ''}
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${this.books.map(book => UI.createBookCard(book)).join('')}
                </div>
            </div>
        `;

        mainContent.innerHTML = content;
    },

    // Show add book modal
    showAddBookModal() {
        if (!Auth.isAuthenticated) {
            UI.showToast('Please login to add a book', 'warning');
            return;
        }

        const content = `
            <div class="p-6">
                <h2 class="text-2xl font-bold mb-4">Add New Book</h2>
                <form id="add-book-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Title</label>
                        <input type="text" name="title" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Author</label>
                        <input type="text" name="author" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Subject/Course</label>
                        <input type="text" name="subject" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">ISBN (Optional)</label>
                        <input type="text" name="isbn" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Condition</label>
                        <select name="condition" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                            <option value="good">Good</option>
                            <option value="medium">Medium</option>
                            <option value="poor">Poor</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Price ($)</label>
                        <input type="number" name="price" step="0.01" min="0" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div class="flex items-center">
                        <input type="checkbox" name="isExchangeable" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                        <label class="ml-2 text-sm text-gray-700">Available for exchange</label>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                        <textarea name="notes" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button type="button" onclick="UI.closeModal()" class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500">
                            Cancel
                        </button>
                        <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                            Add Book
                        </button>
                    </div>
                </form>
            </div>
        `;

        UI.showModal(content);

        // Handle form submission
        document.getElementById('add-book-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const bookData = {
                title: formData.get('title'),
                author: formData.get('author'),
                subject: formData.get('subject'),
                isbn: formData.get('isbn'),
                condition: formData.get('condition'),
                price: parseFloat(formData.get('price')),
                isExchangeable: formData.get('isExchangeable') === 'on',
                notes: formData.get('notes')
            };

            try {
                UI.showLoading();
                await API.books.create(bookData);
                UI.showToast('Book added successfully', 'success');
                UI.closeModal();
                await this.loadBooks();
            } catch (error) {
                UI.showToast(error.message, 'error');
            } finally {
                UI.hideLoading();
            }
        });
    },

    // View book details
    async viewDetails(bookId) {
        try {
            UI.showLoading();
            const book = await API.books.getById(bookId);
            
            const content = `
                <div class="p-6">
                    <h2 class="text-2xl font-bold mb-4">${book.title}</h2>
                    <div class="space-y-4">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-gray-600">${book.author}</p>
                                <p class="text-sm text-gray-500">${book.subject}</p>
                            </div>
                            <span class="status-tag status-${book.status}">${book.status}</span>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-gray-500">Price</p>
                                <p class="text-lg font-semibold text-indigo-600">${UI.formatPrice(book.price)}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">Condition</p>
                                <p class="text-lg">${book.condition}</p>
                            </div>
                            ${book.isbn ? `
                                <div>
                                    <p class="text-sm text-gray-500">ISBN</p>
                                    <p>${book.isbn}</p>
                                </div>
                            ` : ''}
                            <div>
                                <p class="text-sm text-gray-500">Listed by</p>
                                <p>${book.firstName} ${book.lastName}</p>
                                <p class="text-sm text-gray-500">${book.faculty} - ${book.department}</p>
                            </div>
                        </div>

                        ${book.notes ? `
                            <div>
                                <p class="text-sm text-gray-500">Notes</p>
                                <p class="mt-1">${book.notes}</p>
                            </div>
                        ` : ''}

                        ${Auth.isAuthenticated && book.sellerId !== Auth.currentUser.id ? `
                            <div class="flex justify-end space-x-3 mt-6">
                                <button onclick="Messages.startConversation('${book.id}', '${book.sellerId}')" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                                    Contact Seller
                                </button>
                            </div>
                        ` : ''}

                        ${Auth.isAuthenticated && book.sellerId === Auth.currentUser.id ? `
                            <div class="flex justify-end space-x-3 mt-6">
                                <button onclick="Books.editBook('${book.id}')" class="text-indigo-600 hover:text-indigo-800">
                                    Edit
                                </button>
                                <button onclick="Books.deleteBook('${book.id}')" class="text-red-600 hover:text-red-800">
                                    Delete
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

            UI.showModal(content);
        } catch (error) {
            UI.showToast(error.message, 'error');
        } finally {
            UI.hideLoading();
        }
    },

    // Edit book
    async editBook(bookId) {
        try {
            UI.showLoading();
            const book = await API.books.getById(bookId);
            
            const content = `
                <div class="p-6">
                    <h2 class="text-2xl font-bold mb-4">Edit Book</h2>
                    <form id="edit-book-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" name="title" value="${book.title}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Author</label>
                            <input type="text" name="author" value="${book.author}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Subject/Course</label>
                            <input type="text" name="subject" value="${book.subject}" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">ISBN (Optional)</label>
                            <input type="text" name="isbn" value="${book.isbn || ''}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Condition</label>
                            <select name="condition" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                <option value="good" ${book.condition === 'good' ? 'selected' : ''}>Good</option>
                                <option value="medium" ${book.condition === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="poor" ${book.condition === 'poor' ? 'selected' : ''}>Poor</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Price ($)</label>
                            <input type="number" name="price" value="${book.price}" step="0.01" min="0" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" name="isExchangeable" ${book.isExchangeable ? 'checked' : ''} class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                            <label class="ml-2 text-sm text-gray-700">Available for exchange</label>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                            <textarea name="notes" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">${book.notes || ''}</textarea>
                        </div>
                        <div class="flex justify-end space-x-3">
                            <button type="button" onclick="UI.closeModal()" class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500">
                                Cancel
                            </button>
                            <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            `;

            UI.showModal(content);

            // Handle form submission
            document.getElementById('edit-book-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const bookData = {
                    title: formData.get('title'),
                    author: formData.get('author'),
                    subject: formData.get('subject'),
                    isbn: formData.get('isbn'),
                    condition: formData.get('condition'),
                    price: parseFloat(formData.get('price')),
                    isExchangeable: formData.get('isExchangeable') === 'on',
                    notes: formData.get('notes')
                };

                try {
                    UI.showLoading();
                    await API.books.update(bookId, bookData);
                    UI.showToast('Book updated successfully', 'success');
                    UI.closeModal();
                    await this.loadBooks();
                } catch (error) {
                    UI.showToast(error.message, 'error');
                } finally {
                    UI.hideLoading();
                }
            });
        } catch (error) {
            UI.showToast(error.message, 'error');
        } finally {
            UI.hideLoading();
        }
    },

    // Delete book
    async deleteBook(bookId) {
        if (confirm('Are you sure you want to delete this book?')) {
            try {
                UI.showLoading();
                await API.books.delete(bookId);
                UI.showToast('Book deleted successfully', 'success');
                UI.closeModal();
                await this.loadBooks();
            } catch (error) {
                UI.showToast(error.message, 'error');
            } finally {
                UI.hideLoading();
            }
        }
    },

    // Toggle favorite
    async toggleFavorite(bookId) {
        if (!Auth.isAuthenticated) {
            UI.showToast('Please login to add favorites', 'warning');
            return;
        }

        try {
            UI.showLoading();
            const book = this.books.find(b => b.id === bookId);
            if (book.isFavorite) {
                await API.books.removeFromFavorites(bookId);
                UI.showToast('Removed from favorites', 'success');
            } else {
                await API.books.addToFavorites(bookId);
                UI.showToast('Added to favorites', 'success');
            }
            await this.loadBooks();
        } catch (error) {
            UI.showToast(error.message, 'error');
        } finally {
            UI.hideLoading();
        }
    }
}; 