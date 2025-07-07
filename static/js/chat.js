document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    const clearChatBtn = document.querySelectorAll('.delete-chat-button');

    sendButton.disabled = true;
    let conversationHistory = [];

    initChat();

    chatInput.addEventListener('keydown', handleKeyPress);
    chatInput.addEventListener('input', handleInputChange);
    sendButton.addEventListener('click', sendMessage);
    clearChatBtn.forEach(button => {
        button.addEventListener('click', confirmClearChat);
    });

    function initChat() {
        const savedHistory = localStorage.getItem('iyari_chat_history');
        if (savedHistory) {
            try {
                conversationHistory = JSON.parse(savedHistory);
                if (conversationHistory.length > 0) {
                    renderSavedMessages();
                }
            } catch (e) {
                console.error('Error al cargar historial:', e);
                localStorage.removeItem('iyari_chat_history');
            }
        }
        setTimeout(() => chatInput.focus(), 500);
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
        if (!message) return;

        // Añadir mensaje del usuario
        addMessage(message, 'user');
        
        // Limpiar input
        chatInput.value = '';
        sendButton.disabled = true;
        
        // Añadir a historial
        conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });
        
        saveHistory();
        showTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();
            
            hideTypingIndicator();
            
            if (data.status === 'success') {
                addMessage(data.response, 'bot');
                conversationHistory.push({
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date().toISOString()
                });
                saveHistory();
            } else {
                addMessage('Lo siento, hubo un error. Por favor intenta de nuevo.', 'bot');
            }
        } catch (error) {
            console.error('Error:', error);
            hideTypingIndicator();
            addMessage('Error de conexión. Por favor verifica tu conexión a internet.', 'bot');
        }
    }

    /**
     * Añade un mensaje al chat
     */
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.setAttribute('data-message-id', Date.now().toString());

        const currentTime = new Date();
        const timeStr = currentTime.getHours().toString().padStart(2, '0') + ':' +
                       currentTime.getMinutes().toString().padStart(2, '0');

        const avatar = sender === 'bot'
            ? document.querySelector('.chat-avatar')?.innerHTML || '🤖'
            : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                </svg>`;

        let messageContent = `
            <div class="message-content">
                <div class="message-text">${text}</div>
                <div class="message-time flex">${timeStr} ${avatar}</div>
            </div>
        `;

        // Agregar botones de acción solo para mensajes del bot
        if (sender === 'bot') {
            messageContent = `
                <div class="message-content">
                <div class="message-text">${text}</div>

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
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Añadir event listeners para los botones solo en mensajes del bot
        if (sender === 'bot') {
            const messageId = messageDiv.getAttribute('data-message-id');
            
            // Reload button
            messageDiv.querySelector('.reload-btn')?.addEventListener('click', () => regenerateResponse(messageId));
            
            // Copy button
            messageDiv.querySelector('.copy-btn')?.addEventListener('click', () => copyToClipboard(text, messageDiv));
            
            // Share button
            messageDiv.querySelector('.share-btn')?.addEventListener('click', () => shareMessage(text));
            
            // Like button
            messageDiv.querySelector('.like-btn')?.addEventListener('click', (e) => {
                rateResponse(messageId, 'like', e.currentTarget);
                // Toggle active state
                e.currentTarget.classList.toggle('active');
                // Remove active from dislike if like is active
                if (e.currentTarget.classList.contains('active')) {
                    messageDiv.querySelector('.dislike-btn').classList.remove('active');
                }
            });
            
            // Dislike button
            messageDiv.querySelector('.dislike-btn')?.addEventListener('click', (e) => {
                rateResponse(messageId, 'dislike', e.currentTarget);
                // Toggle active state
                e.currentTarget.classList.toggle('active');
                // Remove active from like if dislike is active
                if (e.currentTarget.classList.contains('active')) {
                    messageDiv.querySelector('.like-btn').classList.remove('active');
                }
            });
            
            // Voice narration button
            messageDiv.querySelector('.voice-narration-btn')?.addEventListener('click', (e) => {
                playVoiceNarration(text, e.currentTarget, messageDiv);
            });
        }
    }

    /**
     * Regenera la respuesta del bot para la última pregunta del usuario
     */
    async function regenerateResponse(messageId) {
        // Buscar el último mensaje del usuario
        let lastUserMessage = '';
        for (let i = conversationHistory.length - 1; i >= 0; i--) {
            if (conversationHistory[i].role === 'user') {
                lastUserMessage = conversationHistory[i].content;
                break;
            }
        }

        if (!lastUserMessage) return;

        // Encontrar y eliminar el mensaje del bot que se va a regenerar
        const messageElement = document.querySelector(`.message[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.remove();
            
            // Eliminar el último mensaje del bot del historial
            for (let i = conversationHistory.length - 1; i >= 0; i--) {
                if (conversationHistory[i].role === 'assistant') {
                    conversationHistory.splice(i, 1);
                    break;
                }
            }
            saveHistory();
        }

        showTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: lastUserMessage, regenerate: true })
            });

            const data = await response.json();
            
            hideTypingIndicator();
            
            if (data.status === 'success') {
                addMessage(data.response, 'bot');
                conversationHistory.push({
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date().toISOString()
                });
                saveHistory();
            } else {
                addMessage('Lo siento, hubo un error al regenerar la respuesta. Por favor intenta de nuevo.', 'bot');
            }
        } catch (error) {
            console.error('Error:', error);
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
    function rateResponse(messageId, rating, buttonElement) {
        // Aquí se enviaría la calificación al servidor
        // Por ahora solo cambiamos la apariencia del botón
        console.log(`Mensaje ${messageId} calificado como: ${rating}`);
        
        // Se podría implementar una llamada al API para guardar la calificación
        /* 
        fetch('/api/rate-response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messageId, rating })
        });
        */
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
                // Si está reproduciendo, pausamos
                audioElement.pause();
                button.classList.remove('playing');
                button.innerHTML = '<i class="bi bi-volume-up"></i>';
                return;
            } else {
                // Si está pausado, reproducimos
                audioElement.play();
                button.classList.add('playing');
                button.innerHTML = '<i class="bi bi-pause-fill"></i>';
                return;
            }
        }
        
        // Si no hay elemento de audio, lo creamos
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
                throw new Error('Error en la petición de texto a voz');
            }
            
            const data = await response.json();
            
            // Crear el elemento de audio
            audioElement = document.createElement('audio');
            audioElement.src = data.audioUrl;
            audioElement.controls = false;
            audioContainer.appendChild(audioElement);
            
            // Eventos para el audio
            audioElement.addEventListener('ended', () => {
                button.classList.remove('playing');
                button.innerHTML = '<i class="bi bi-volume-up"></i>';
            });
            
            audioElement.addEventListener('error', () => {
                button.classList.remove('playing');
                button.innerHTML = '<i class="bi bi-volume-up"></i>';
                button.disabled = false;
                alert('Error al reproducir el audio');
            });
            
            // Reproducir el audio
            audioElement.play();
            button.classList.add('playing');
            button.innerHTML = '<i class="bi bi-pause-fill"></i>';
            button.disabled = false;
            
        } catch (error) {
            console.error('Error al obtener audio:', error);
            button.innerHTML = '<i class="bi bi-volume-up"></i>';
            button.disabled = false;
            alert('No se pudo generar el audio en este momento');
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
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
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
        // Mantener solo el mensaje de bienvenida
        const welcomeMessage = document.querySelector('.welcome-message');
        chatMessages.innerHTML = '';
        if (welcomeMessage) {
            chatMessages.appendChild(welcomeMessage);
        }
        // Limpiar historial
        conversationHistory = [];
        localStorage.removeItem('iyari_chat_history');
    }

    function saveHistory() {
        // Limitamos a los últimos 50 mensajes para no sobrecargar localStorage
        const historyToSave = conversationHistory.slice(-50);
        localStorage.setItem('iyari_chat_history', JSON.stringify(historyToSave));
    }

    function renderSavedMessages() {
        // Ocultar mensaje de bienvenida si hay historial
        const welcomeCard = document.querySelector('.welcome-card');
        if (welcomeCard) {
            welcomeCard.style.display = 'none';
        }

        // Mostrar mensajes guardados
        conversationHistory.forEach(msg => {
            const sender = msg.role === 'user' ? 'user' : 'bot';
            addMessage(msg.content, sender);
        });
    }

    // Función para seleccionar una sugerencia
    window.selectSuggestion = function(suggestion) {
        chatInput.value = suggestion;
        chatInput.focus();
        sendButton.disabled = false;
    };
});
