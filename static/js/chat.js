document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    const clearChatBtn = document.querySelectorAll('.delete-chat-button');
    const newChatBtn = document.getElementById('newChatBtn');
    const chatHistoryList = document.getElementById('chatHistoryList');

    sendButton.disabled = true;
    let conversationHistory = [];
    let currentChatId = null;
    let chatHistory = {};

    let messageIdCounter = 0;

    initChat();

    chatInput.addEventListener('keydown', handleKeyPress);
    chatInput.addEventListener('input', handleInputChange);
    sendButton.addEventListener('click', sendMessage);
    newChatBtn.addEventListener('click', createNewChat);
    clearChatBtn.forEach(button => {
        button.addEventListener('click', confirmClearChat);
    });

    function initChat() {
        loadChatHistory();
        initKeyboardShortcuts();
        
        // Add event listeners for new buttons
        const optionsBtn = document.getElementById('optionsBtn');
        const attachBtn = document.getElementById('attachBtn');
        
        if (optionsBtn) {
            optionsBtn.addEventListener('click', handleOptionsClick);
        }
        
        if (attachBtn) {
            attachBtn.addEventListener('click', handleAttachmentClick);
        }
        
        // Add auto-resize to textarea
        chatInput.addEventListener('input', debounce(() => {
            autoResize(chatInput);
        }, 100));
        
        // Try to load the last active chat or create a new one
        if (Object.keys(chatHistory).length > 0) {
            const lastChatId = localStorage.getItem('iyari_last_chat_id');
            if (lastChatId && chatHistory[lastChatId]) {
                loadChat(lastChatId);
            } else {
                // Load the most recent chat
                const sortedChats = Object.keys(chatHistory).sort((a, b) => 
                    new Date(chatHistory[b].lastUpdated) - new Date(chatHistory[a].lastUpdated)
                );
                if (sortedChats.length > 0) {
                    loadChat(sortedChats[0]);
                }
            }
        } else {
            createNewChat();
        }
        
        renderChatHistory();
        setTimeout(() => {
            chatInput.focus();
            autoResize(chatInput);
        }, 500);
    }

    function loadChatHistory() {
        const savedChatHistory = localStorage.getItem('iyari_chat_history_list');
        if (savedChatHistory) {
            try {
                chatHistory = JSON.parse(savedChatHistory);
            } catch (e) {
                console.error('Error loading chat history:', e);
                chatHistory = {};
            }
        }
    }

    function saveChatHistory() {
        try {
            localStorage.setItem('iyari_chat_history_list', JSON.stringify(chatHistory));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    function createNewChat() {
        const chatId = `chat_${Date.now()}`;
        currentChatId = chatId;
        conversationHistory = [];
        
        chatHistory[chatId] = {
            id: chatId,
            title: 'Nueva conversación',
            messages: [],
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        
        saveChatHistory();
        localStorage.setItem('iyari_last_chat_id', chatId);
        
        // Clear chat messages and show welcome card
        chatMessages.innerHTML = '';
        showWelcomeCard();
        renderChatHistory();
        updateActiveChatInSidebar(chatId);
    }

    function loadChat(chatId) {
        if (!chatHistory[chatId]) return;
        
        currentChatId = chatId;
        const chat = chatHistory[chatId];
        conversationHistory = chat.messages || [];
        
        localStorage.setItem('iyari_last_chat_id', chatId);
        
        // Clear and render messages
        chatMessages.innerHTML = '';
        
        if (conversationHistory.length === 0) {
            showWelcomeCard();
        } else {
            hideWelcomeCard();
            renderSavedMessages();
        }
        
        updateActiveChatInSidebar(chatId);
    }

    function updateChatTitle(chatId, title) {
        if (chatHistory[chatId]) {
            chatHistory[chatId].title = title;
            chatHistory[chatId].lastUpdated = new Date().toISOString();
            saveChatHistory();
            renderChatHistory();
        }
    }

    function deleteChat(chatId) {
        if (confirm('¿Estás seguro de que deseas eliminar esta conversación?')) {
            delete chatHistory[chatId];
            saveChatHistory();
            
            if (currentChatId === chatId) {
                // If we're deleting the current chat, create a new one
                createNewChat();
            } else {
                renderChatHistory();
            }
        }
    }

    function renderChatHistory() {
        chatHistoryList.innerHTML = '';
        
        const sortedChats = Object.keys(chatHistory).sort((a, b) => 
            new Date(chatHistory[b].lastUpdated) - new Date(chatHistory[a].lastUpdated)
        );
        
        sortedChats.forEach(chatId => {
            const chat = chatHistory[chatId];
            const chatItem = document.createElement('div');
            chatItem.className = `chat-history-item ${currentChatId === chatId ? 'active' : ''}`;
            chatItem.setAttribute('data-chat-id', chatId);
            
            const timeAgo = getTimeAgo(new Date(chat.lastUpdated));
            
            chatItem.innerHTML = `
                <div class="chat-preview" onclick="loadChat('${chatId}')">
                    <h4>${chat.title}</h4>
                    <p>${timeAgo}</p>
                </div>
                <button class="delete-chat-button" title="Eliminar chat" onclick="deleteChat('${chatId}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            `;
            
            chatHistoryList.appendChild(chatItem);
        });
    }

    function updateActiveChatInSidebar(chatId) {
        const chatItems = document.querySelectorAll('.chat-history-item');
        chatItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-chat-id') === chatId) {
                item.classList.add('active');
            }
        });
    }

    function getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Hace unos segundos';
        if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
        if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
        if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
        
        return date.toLocaleDateString('es-ES');
    }

    function showWelcomeCard() {
        const welcomeCard = document.querySelector('.welcome-card');
        if (welcomeCard) {
            welcomeCard.style.display = 'block';
        }
    }

    function hideWelcomeCard() {
        const welcomeCard = document.querySelector('.welcome-card');
        if (welcomeCard) {
            welcomeCard.style.display = 'none';
        }
    }

    function handleInputChange() {
        sendButton.disabled = !chatInput.value.trim();
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendButton.disabled) {
                sendMessage();
            }
        }
    }

    async function sendMessage() {
        const message = chatInput.value.trim();
        
        // Validate message
        const validation = validateMessage(message);
        if (!validation.valid) {
            showNotification(validation.error, 'error');
            return;
        }
        
        // Check network status
        if (!checkNetworkStatus()) {
            return;
        }

        // Hide welcome card on first message
        hideWelcomeCard();

        // If this is the first message in a new chat, update the title
        if (conversationHistory.length === 0 && currentChatId) {
            const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
            updateChatTitle(currentChatId, title);
        }

        // Añadir mensaje del usuario
        addMessage(message, 'user');
        
        // Limpiar input y resetear altura
        chatInput.value = '';
        autoResize(chatInput);
        sendButton.disabled = true;
        
        // Añadir a historial
        conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });
        
        updateCurrentChat();
        showTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: message,
                    history: conversationHistory.slice(0, -1) // Send history without the current message
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            hideTypingIndicator();
            
            if (data.status === 'success') {
                addMessage(data.response, 'bot');
                conversationHistory.push({
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date().toISOString()
                });
                updateCurrentChat();
                
                // Scroll to bottom after message is added
                scrollToBottom();
            } else {
                handleError(new Error(data.message || 'Error del servidor'), 
                    'Lo siento, hubo un error. Por favor intenta de nuevo.');
            }
        } catch (error) {
            hideTypingIndicator();
            
            if (error.message.includes('Failed to fetch')) {
                handleError(error, 'Error de conexión. Por favor verifica tu conexión a internet.');
            } else if (error.message.includes('HTTP error')) {
                handleError(error, 'Error del servidor. Por favor intenta más tarde.');
            } else {
                handleError(error, 'Ha ocurrido un error inesperado. Por favor intenta de nuevo.');
            }
        }
    }

    function updateCurrentChat() {
        if (currentChatId && chatHistory[currentChatId]) {
            chatHistory[currentChatId].messages = [...conversationHistory];
            chatHistory[currentChatId].lastUpdated = new Date().toISOString();
            saveChatHistory();
            renderChatHistory();
        }
    }

    /**
     * Añade un mensaje al chat
     */
    function addMessage(text, sender, savedMessageId = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        // Use saved ID if available, otherwise generate new one
        const messageId = savedMessageId || `msg_${Date.now()}_${++messageIdCounter}`;
        messageDiv.setAttribute('data-message-id', messageId);
        
        // Store original text for copy/share functions
        messageDiv.setAttribute('data-original-text', text);

        const currentTime = new Date();
        const timeStr = formatTimestamp(currentTime);

        const avatar = sender === 'bot'
            ? document.querySelector('.chat-avatar')?.innerHTML || '🤖'
            : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                </svg>`;

        // Render content based on sender
        let safeText;
        if (sender === 'bot') {
            // Bot messages may contain markdown, so render it
            safeText = renderMarkdown(text);
        } else {
            // User messages should be escaped to prevent XSS
            safeText = escapeHtml(text);
        }

        let messageContent = `
            <div class="message-content">
                <div class="message-text">${safeText}</div>
                <div class="message-time flex">${timeStr} ${avatar}</div>
            </div>
        `;

        // Agregar botones de acción solo para mensajes del bot
        if (sender === 'bot') {
            messageContent = `
                <div class="message-content">
                <div class="message-text">${safeText}</div>

                <div class="message-footer flex d-flex gap-2">
                    <div class="message-time">${timeStr} ${avatar}</div>
                    <div class="message-actions">
                        <button class="message-action-btn reload-btn" title="Regenerar respuesta">
                            <i class="bi bi-arrow-clockwise"></i>
                        </button> 
                        <button class="message-action-btn copy-btn" title="Copiar al portapapeles">
                            <i class="bi bi-clipboard"></i>
                        </button>
                        <button class="message-action-btn share-btn" title="Compartir">
                            <i class="bi bi-share"></i>
                        </button>
                        <button class="message-action-btn like-btn" title="Me gusta">
                            <i class="bi bi-hand-thumbs-up"></i>
                        </button>
                        <button class="message-action-btn dislike-btn" title="No me gusta">
                            <i class="bi bi-hand-thumbs-down"></i>
                        </button>
                        <button class="voice-narration-btn" title="Escuchar respuesta">
                            <i class="bi bi-volume-up"></i>
                        </button>
                    </div>
                </div>
                <div class="audio-player"></div>
            </div>
            `;
        }

        messageDiv.innerHTML = messageContent;
        chatMessages.appendChild(messageDiv);
        scrollToBottom();

        // Añadir event listeners para los botones solo en mensajes del bot
        if (sender === 'bot') {
            // Reload button
            messageDiv.querySelector('.reload-btn')?.addEventListener('click', () => regenerateResponse(messageId));
            
            // Copy button
            messageDiv.querySelector('.copy-btn')?.addEventListener('click', () => {
                const originalText = messageDiv.getAttribute('data-original-text') || text;
                copyToClipboard(originalText, messageDiv);
            });
            
            // Share button
            messageDiv.querySelector('.share-btn')?.addEventListener('click', () => {
                const originalText = messageDiv.getAttribute('data-original-text') || text;
                shareMessage(originalText);
            });
            
            // Like button
            messageDiv.querySelector('.like-btn')?.addEventListener('click', (e) => {
                rateResponse(messageId, 'like', e.currentTarget);
                e.currentTarget.classList.toggle('active');
                if (e.currentTarget.classList.contains('active')) {
                    messageDiv.querySelector('.dislike-btn')?.classList.remove('active');
                }
            });
            
            // Dislike button
            messageDiv.querySelector('.dislike-btn')?.addEventListener('click', (e) => {
                rateResponse(messageId, 'dislike', e.currentTarget);
                e.currentTarget.classList.toggle('active');
                if (e.currentTarget.classList.contains('active')) {
                    messageDiv.querySelector('.like-btn')?.classList.remove('active');
                }
            });
            
            // Voice narration button
            messageDiv.querySelector('.voice-narration-btn')?.addEventListener('click', (e) => {
                const originalText = messageDiv.getAttribute('data-original-text') || text;
                playVoiceNarration(originalText, e.currentTarget, messageDiv);
            });
        }
        
        return messageId;
    }

    /**
     * Regenera la respuesta del bot para la última pregunta del usuario
     */
    async function regenerateResponse(messageId) {
        try {
            const messageElement = document.querySelector(`.message[data-message-id="${messageId}"]`);
            if (!messageElement) {
                console.error('Message element not found:', messageId);
                return;
            }
            
            // Usar el texto original guardado en el atributo data-original-text
            const originalText = messageElement.getAttribute('data-original-text');
            if (!originalText) {
                console.error('Original text not found in message element');
                return;
            }
            
            // Encontrar el índice del mensaje del asistente en el historial usando el texto original
            let assistantIndex = -1;
            for (let i = 0; i < conversationHistory.length; i++) {
                if (conversationHistory[i].role === 'assistant' && 
                    conversationHistory[i].content.trim() === originalText.trim()) {
                    assistantIndex = i;
                    break;
                }
            }
            
            if (assistantIndex === -1) {
                console.error('Cannot find corresponding message in history');
                return;
            }
            
            if (assistantIndex === 0) {
                console.error('No user message before this assistant message');
                return;
            }
            
            // Verificar que hay un mensaje de usuario previo
            if (conversationHistory[assistantIndex - 1].role !== 'user') {
                console.error('Previous message is not from user');
                return;
            }
            
            const prevUserMessage = conversationHistory[assistantIndex - 1].content;
            
            // Eliminar todos los mensajes DOM posteriores (incluyendo el actual)
            const allMessages = Array.from(document.querySelectorAll('.message'));
            let startRemoving = false;
            
            allMessages.forEach(msg => {
                if (startRemoving) {
                    msg.remove();
                } else if (msg.getAttribute('data-message-id') === messageId) {
                    startRemoving = true;
                    msg.remove();
                }
            });
            
            // Truncar historial desde el mensaje del asistente
            conversationHistory = conversationHistory.slice(0, assistantIndex);
            updateCurrentChat();
            
            showTypingIndicator();

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: prevUserMessage, 
                    regenerate: true,
                    history: conversationHistory 
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            hideTypingIndicator();
            
            if (data.status === 'success') {
                addMessage(data.response, 'bot');
                conversationHistory.push({
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date().toISOString()
                });
                updateCurrentChat();
            } else {
                addMessage('Lo siento, hubo un error al regenerar la respuesta. Por favor intenta de nuevo.', 'bot');
            }
        } catch (error) {
            console.error('Error in regenerateResponse:', error);
            hideTypingIndicator();
            addMessage('Error de conexión. Por favor verifica tu conexión a internet.', 'bot');
        }
    }

    /**
     * Copia el texto al portapapeles
     */
    function copyToClipboard(text, messageElement) {
        navigator.clipboard.writeText(text).then(() => {
            // Mostrar notificación visual temporal
            const copyBtn = messageElement.querySelector('.copy-btn');
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="bi bi-check2"></i>';
            copyBtn.classList.add('active');
            
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
                copyBtn.classList.remove('active');
            }, 2000);
        }).catch(err => {
            console.error('Error al copiar texto: ', err);
        });
    }

    /**
     * Comparte el mensaje
     */
    function shareMessage(text) {
        if (navigator.share) {
            navigator.share({
                title: 'Conversación con Iyari',
                text: text
            }).catch(error => {
                console.error('Error al compartir:', error);
            });
        } else {
            // Fallback para navegadores que no soportan Web Share API
            alert('Función de compartir no disponible en este navegador');
        }
    }

    /**
     * Califica la respuesta (me gusta/no me gusta)
     */
    async function rateResponse(messageId, rating, buttonElement) {
        try {
            const response = await fetch('/api/rate-response', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messageId, rating })
            });
            
            if (response.ok) {
                console.log(`Mensaje ${messageId} calificado como: ${rating}`);
                showNotification(`Gracias por tu ${rating === 'like' ? 'valoración positiva' : 'valoración negativa'}`, 'success');
            } else {
                console.error('Error al enviar calificación');
            }
        } catch (error) {
            console.error('Error al calificar respuesta:', error);
        }
    }

    /**
     * Reproduce la narración de voz del mensaje
     */
    async function playVoiceNarration(text, button, messageElement) {
        const audioContainer = messageElement.querySelector('.audio-player');
        let audioElement = audioContainer.querySelector('audio');
        
        // Si ya hay un elemento de audio, lo reutilizamos
        if (audioElement) {
            if (!audioElement.paused) {
                audioElement.pause();
                button.classList.remove('playing');
                button.innerHTML = '<i class="bi bi-volume-up"></i>';
                return;
            } else {
                try {
                    await audioElement.play();
                    button.classList.add('playing');
                    button.innerHTML = '<i class="bi bi-pause-fill"></i>';
                } catch (error) {
                    console.error('Error playing audio:', error);
                }
                return;
            }
        }
        
        button.innerHTML = '<i class="bi bi-hourglass-split"></i>';
        button.disabled = true;
        
        try {
            const response = await fetch('/api/text-to-speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.audioUrl) {
                throw new Error('No audio URL received');
            }
            
            // Crear el elemento de audio
            audioElement = document.createElement('audio');
            audioElement.src = data.audioUrl;
            audioElement.controls = false;
            audioElement.preload = 'auto';
            
            // Cleanup function
            const cleanup = () => {
                button.classList.remove('playing');
                button.innerHTML = '<i class="bi bi-volume-up"></i>';
                button.disabled = false;
            };
            
            // Eventos para el audio
            audioElement.addEventListener('ended', cleanup);
            audioElement.addEventListener('error', (e) => {
                console.error('Audio playback error:', e);
                cleanup();
                alert('Error al reproducir el audio');
            });
            
            audioContainer.appendChild(audioElement);
            
            // Reproducir el audio
            await audioElement.play();
            button.classList.add('playing');
            button.innerHTML = '<i class="bi bi-pause-fill"></i>';
            button.disabled = false;
            
        } catch (error) {
            console.error('Error al obtener audio:', error);
            button.innerHTML = '<i class="bi bi-volume-up"></i>';
            button.disabled = false;
            
            let errorMessage = 'No se pudo generar el audio en este momento';
            if (error.message.includes('HTTP error')) {
                errorMessage = 'Error del servidor al generar audio';
            } else if (error.message.includes('fetch')) {
                errorMessage = 'Error de conexión al solicitar audio';
            }
            alert(errorMessage);
        }
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'message bot';

        const avatar = document.querySelector('.chat-avatar')?.innerHTML || '🤖';

        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;

        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function confirmClearChat() {
        if (confirm('¿Estás seguro de que deseas limpiar la conversación?')) {
            clearChat();
        }
    }

    function clearChat() {
        conversationHistory = [];
        if (currentChatId) {
            chatHistory[currentChatId].messages = [];
            chatHistory[currentChatId].lastUpdated = new Date().toISOString();
            updateCurrentChat();
        }
        
        chatMessages.innerHTML = '';
        showWelcomeCard();
    }

    function saveHistory() {
        updateCurrentChat();
    }

    function renderSavedMessages() {
        try {
            // Mostrar mensajes guardados con IDs únicos
            conversationHistory.forEach((msg, index) => {
                const sender = msg.role === 'user' ? 'user' : 'bot';
                const savedId = `saved_${index}_${Date.now()}`;
                addMessage(msg.content, sender, savedId);
            });
        } catch (error) {
            console.error('Error rendering saved messages:', error);
            // Limpiar historial corrupto
            conversationHistory = [];
            if (currentChatId) {
                chatHistory[currentChatId].messages = [];
                updateCurrentChat();
            }
        }
    }

    // Function to handle auto-resize of textarea
    function autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // Function to handle options button click
    function handleOptionsClick() {
        // Toggle options menu or show configuration modal
        alert('Configuración - Próximamente disponible');
    }

    // Function to handle attachment button click
    function handleAttachmentClick() {
        // File upload functionality
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.pdf,.doc,.docx,.txt';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                // For now, just show a message
                alert(`Archivo seleccionado: ${file.name}\nFuncionalidad de carga próximamente disponible`);
            }
        };
        input.click();
    }

    // Function to scroll to bottom of chat
    function scrollToBottom() {
        requestAnimationFrame(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    // Function to format timestamp
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else {
            return date.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    // Function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Function to render Markdown to HTML
    function renderMarkdown(text) {
        // First escape any existing HTML to prevent XSS
        let html = escapeHtml(text);
        
        // Convert markdown to HTML
        // Headers (must be at start of line)
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        
        // Code blocks (before other formatting)
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Bold and italic (avoid conflict with list markers)
        html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
        
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Lists - handle both unordered and ordered
        // First, mark list items
        html = html.replace(/^(\s*)[-*+] (.*$)/gm, '$1<li>$2</li>');
        html = html.replace(/^(\s*)\d+\. (.*$)/gm, '$1<li>$2</li>');
        
        // Then wrap consecutive list items in ul/ol
        html = html.replace(/(<li>.*<\/li>(?:\s*<li>.*<\/li>)*)/gs, '<ul>$1</ul>');
        
        // Wrap content in paragraphs if it doesn't already have block elements
        if (!html.includes('<h1>') && !html.includes('<h2>') && !html.includes('<h3>') && 
            !html.includes('<ul>') && !html.includes('<pre>') && !html.includes('<p>')) {
            html = '<p>' + html + '</p>';
        } else if (html.includes('</p><p>')) {
            html = '<p>' + html + '</p>';
        }
        
        // Clean up empty paragraphs and fix formatting
        html = html.replace(/<p>\s*<\/p>/g, '');
        html = html.replace(/<p>\s*<br>\s*<\/p>/g, '');
        html = html.replace(/<p>\s*(<h[1-3]>)/g, '$1');
        html = html.replace(/(<\/h[1-3]>)\s*<\/p>/g, '$1');
        html = html.replace(/<p>\s*(<ul>)/g, '$1');
        html = html.replace(/(<\/ul>)\s*<\/p>/g, '$1');
        html = html.replace(/<p>\s*(<pre>)/g, '$1');
        html = html.replace(/(<\/pre>)\s*<\/p>/g, '$1');
        
        // Fix multiple consecutive <br> tags
        html = html.replace(/(<br>\s*){3,}/g, '<br><br>');
        
        return html;
    }

    // Function to handle errors gracefully
    function handleError(error, userMessage = 'Ha ocurrido un error') {
        console.error('Error:', error);
        addMessage(userMessage, 'bot');
        hideTypingIndicator();
    }

    // Function to validate message before sending
    function validateMessage(message) {
        if (!message || message.trim().length === 0) {
            return { valid: false, error: 'Por favor escribe un mensaje' };
        }
        
        if (message.length > 1000) {
            return { valid: false, error: 'El mensaje es demasiado largo (máximo 1000 caracteres)' };
        }
        
        return { valid: true };
    }

    // Function to show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Function to initialize keyboard shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + Enter to send message
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!sendButton.disabled) {
                    sendMessage();
                }
            }
            
            // Ctrl/Cmd + N for new chat
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                createNewChat();
            }
            
            // Escape to focus on input
            if (e.key === 'Escape') {
                chatInput.focus();
            }
        });
    }

    // Function to handle network connectivity
    function checkNetworkStatus() {
        if (!navigator.onLine) {
            showNotification('No hay conexión a internet', 'error');
            return false;
        }
        return true;
    }

    // Function to debounce input changes
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Make functions available globally
    window.selectSuggestion = function(suggestion) {
        chatInput.value = suggestion;
        chatInput.focus();
        sendButton.disabled = false;
    };

    window.loadChat = loadChat;
    window.deleteChat = deleteChat;
});