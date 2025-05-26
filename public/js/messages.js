// Messages management
const Messages = {
    // Current conversations state
    conversations: [],
    currentBookId: null,
    currentReceiverId: null,

    // Initialize messages
    async init() {
        if (Auth.isAuthenticated) {
            await this.loadConversations();
        }
    },

    // Load conversations
    async loadConversations() {
        try {
            UI.showLoading();
            this.conversations = await API.messages.getConversations();
            this.renderConversations();
        } catch (error) {
            UI.showToast(error.message, 'error');
        } finally {
            UI.hideLoading();
        }
    },

    // Render conversations list
    renderConversations() {
        const mainContent = document.getElementById('main-content');
        
        const content = `
            <div class="max-w-4xl mx-auto">
                <h1 class="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
                ${this.conversations.length > 0 ? `
                    <div class="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul class="divide-y divide-gray-200">
                            ${this.conversations.map(conv => `
                                <li>
                                    <a href="#" onclick="Messages.viewConversation('${conv.bookId}', '${conv.otherUserId}')" class="block hover:bg-gray-50">
                                        <div class="px-4 py-4 sm:px-6">
                                            <div class="flex items-center justify-between">
                                                <div class="flex items-center">
                                                    <div class="text-sm font-medium text-indigo-600 truncate">
                                                        ${conv.bookTitle}
                                                    </div>
                                                </div>
                                                <div class="text-sm text-gray-500">
                                                    ${UI.formatDate(conv.lastMessageTime)}
                                                </div>
                                            </div>
                                            <div class="mt-2">
                                                <div class="text-sm text-gray-600">
                                                    ${conv.firstName} ${conv.lastName}
                                                </div>
                                                <div class="mt-1 text-sm text-gray-500 truncate">
                                                    ${conv.lastMessage}
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : `
                    <div class="text-center py-12">
                        <p class="text-gray-500">No messages yet</p>
                    </div>
                `}
            </div>
        `;

        mainContent.innerHTML = content;
    },

    // Start new conversation
    async startConversation(bookId, receiverId) {
        if (!Auth.isAuthenticated) {
            UI.showToast('Please login to send messages', 'warning');
            return;
        }

        this.currentBookId = bookId;
        this.currentReceiverId = receiverId;
        await this.viewConversation(bookId, receiverId);
    },

    // View conversation
    async viewConversation(bookId, receiverId) {
        try {
            UI.showLoading();
            const messages = await API.messages.getBookMessages(bookId);
            const book = await API.books.getById(bookId);
            
            const content = `
                <div class="max-w-4xl mx-auto">
                    <div class="bg-white shadow sm:rounded-lg">
                        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 class="text-lg font-medium text-gray-900">
                                ${book.title}
                            </h3>
                            <p class="mt-1 text-sm text-gray-500">
                                Listed by ${book.firstName} ${book.lastName}
                            </p>
                        </div>
                        <div class="px-4 py-5 sm:p-6">
                            <div class="space-y-4 h-96 overflow-y-auto" id="messages-container">
                                ${messages.map(msg => `
                                    <div class="flex ${msg.senderId === Auth.currentUser.id ? 'justify-end' : 'justify-start'}">
                                        <div class="message-bubble ${msg.senderId === Auth.currentUser.id ? 'sent' : 'received'} px-4 py-2">
                                            <p class="text-sm">${msg.content}</p>
                                            <p class="text-xs opacity-75 mt-1">
                                                ${UI.formatDate(msg.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <form id="message-form" class="mt-4">
                                <div class="flex space-x-3">
                                    <input type="text" name="message" placeholder="Type your message..." required
                                        class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                    <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                                        Send
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;

            UI.showModal(content);

            // Scroll to bottom of messages
            const messagesContainer = document.getElementById('messages-container');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Handle form submission
            document.getElementById('message-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const content = formData.get('message');

                if (!content.trim()) return;

                try {
                    UI.showLoading();
                    await API.messages.send({
                        receiverId,
                        bookId,
                        content
                    });
                    e.target.reset();
                    await this.viewConversation(bookId, receiverId);
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
    }
}; 