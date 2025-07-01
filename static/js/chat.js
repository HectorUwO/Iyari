document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    const clearChatBtn = document.getElementById('clearChatBtn');
    const helpBtn = document.getElementById('helpBtn');
    const optionsBtn = document.getElementById('optionsBtn');
    const attachBtn = document.getElementById('attachBtn');

    // Estado inicial
    sendButton.disabled = true;
    let conversationHistory = [];

    // Inicializar chatbot
    initChat();

    // Event Listeners
    chatInput.addEventListener('input', handleInputChange);
    chatInput.addEventListener('keydown', handleKeyPress);
    sendButton.addEventListener('click', sendMessage);
    clearChatBtn.addEventListener('click', confirmClearChat);
    helpBtn.addEventListener('click', showHelp);
    optionsBtn.addEventListener('click', showOptions);
    attachBtn.addEventListener('click', handleAttachment);

    /**
     * Inicializa el chat
     */
    function initChat() {
        // Cargar historial si existe
        const savedHistory = localStorage.getItem('iyari_chat_history');
        if (savedHistory) {
            try {
                const history = JSON.parse(savedHistory);
                if (history.length > 0) {
                    conversationHistory = history;
                    renderSavedMessages();
                }
            } catch (e) {
                console.error('Error al cargar historial:', e);
                localStorage.removeItem('iyari_chat_history');
            }
        }

        // Focus en el input
        setTimeout(() => {
            chatInput.focus();
        }, 500);
    }

    /**
     * Maneja cambios en el input
     */
    function handleInputChange() {
        // Auto-resize
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';

        // Habilitar/deshabilitar botón de enviar
        sendButton.disabled = this.value.trim() === '';
    }

    /**
     * Maneja pulsaciones de teclas
     */
    function handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendButton.disabled) {
                sendMessage();
            }
        }
    }

    /**
     * Envía un mensaje
     */
    function sendMessage() {
        const message = chatInput.value.trim();

        if (!message) return;

        // Añadir mensaje del usuario
        addMessage(message, 'user');

        // Limpiar input
        chatInput.value = '';
        chatInput.style.height = 'auto';
        chatInput.focus();
        sendButton.disabled = true;

        // Añadir a historial
        conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });

        // Guardar historial
        saveHistory();

        // Mostrar indicador de escritura
        showTypingIndicator();

        // Aquí se conectaría con la API de backend
        // Por ahora, simulamos una respuesta
        simulateResponse(message);
    }

    /**
     * Simula una respuesta del bot (para demo)
     */
    function simulateResponse(userMessage) {
        // En una implementación real, aquí se enviaría la petición al backend

        setTimeout(() => {
            hideTypingIndicator();

            let response;
            if (userMessage.toLowerCase().includes('hola') || userMessage.toLowerCase().includes('saludos')) {
                response = '¡Hola! ¿En qué puedo ayudarte hoy con información de la UAN?';
            } else if (userMessage.toLowerCase().includes('horario')) {
                response = 'Los horarios de atención generales de la UAN son de lunes a viernes de 8:00 am a 8:00 pm y sábados de 9:00 am a 1:00 pm. ¿Necesitas información sobre algún departamento específico?';
            } else if (userMessage.toLowerCase().includes('inscripción') || userMessage.toLowerCase().includes('inscribir')) {
                response = 'El proceso de inscripción requiere los siguientes documentos: certificado de estudios, CURP, identificación oficial y comprobante de pago. Las fechas de inscripción para el próximo semestre son del 15 al 30 de julio. ¿Necesitas más detalles?';
            } else if (userMessage.toLowerCase().includes('beca')) {
                response = 'La UAN ofrece varias becas: Beca de Excelencia Académica, Beca Socioeconómica, y Becas Deportivas. Las convocatorias se publican al inicio de cada semestre. ¿Te interesa alguna en particular?';
            } else {
                response = 'Gracias por tu pregunta. Para darte la información más precisa, te recomiendo visitar la sección correspondiente en el sitio web de la UAN o contactar directamente con el departamento relacionado. ¿Hay algo más en lo que pueda ayudarte?';
            }

            addMessage(response, 'bot');

            // Añadir a historial
            conversationHistory.push({
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString()
            });

            // Guardar historial
            saveHistory();

        }, Math.random() * 1000 + 1000); // Tiempo aleatorio entre 1-2 segundos
    }

    /**
     * Añade un mensaje al chat
     */
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const currentTime = new Date();
        const timeStr = currentTime.getHours().toString().padStart(2, '0') + ':' +
                       currentTime.getMinutes().toString().padStart(2, '0');

        const avatar = sender === 'bot'
            ? document.querySelector('.chat-avatar').innerHTML
            :   `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                </svg>`;

        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${formatMessageText(text)}</div>
                <div class="message-time flex">${timeStr} ${avatar}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    /**
     * Muestra indicador de escritura
     */
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'message bot';

        const avatar = document.querySelector('.chat-avatar').innerHTML;

        typingDiv.innerHTML = `
            <div class="message-avatar">
                ${avatar}
            </div>
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
        scrollToBottom();
    }

    /**
     * Oculta indicador de escritura
     */
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function formatMessageText(text) {
        // Convertir URLs en enlaces
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, function(url) {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        });
    }

    /**
     * Desplaza el chat hacia abajo
     */
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Muestra diálogo de confirmación para limpiar chat
     */
    function confirmClearChat() {
        if (confirm('¿Estás seguro de que deseas limpiar la conversación?')) {
            clearChat();
        }
    }

    /**
     * Limpia el chat
     */
    function clearChat() {
        // Mantener solo el mensaje de bienvenida
        const welcomeMessage = document.querySelector('.welcome-message');
        chatMessages.innerHTML = '';
        chatMessages.appendChild(welcomeMessage);

        // Limpiar historial
        conversationHistory = [];
        localStorage.removeItem('iyari_chat_history');
    }

    /**
     * Guarda el historial en localStorage
     */
    function saveHistory() {
        // Limitamos a los últimos 50 mensajes para no sobrecargar localStorage
        const historyToSave = conversationHistory.slice(-50);
        localStorage.setItem('iyari_chat_history', JSON.stringify(historyToSave));
    }

    /**
     * Renderiza mensajes guardados
     */
    function renderSavedMessages() {
        // Ocultar mensaje de bienvenida si hay historial
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.style.display = 'none';
        }

        // Mostrar mensajes guardados
        conversationHistory.forEach(msg => {
            const sender = msg.role === 'user' ? 'user' : 'bot';
            addMessage(msg.content, sender);
        });
    }

    /**
     * Maneja click en botón de adjuntar
     */
    function handleAttachment() {
        alert('La funcionalidad de adjuntar archivos estará disponible próximamente.');
    }

    /**
     * Muestra opciones adicionales
     */
    function showOptions() {
        const options = [
            'Descargar conversación',
            'Cambiar tema',
            'Reportar un problema',
            'Acerca de Iyari'
        ];

        const option = prompt(`Selecciona una opción:\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`);

        if (option === '1') {
            downloadConversation();
        } else if (option) {
            alert('Esta funcionalidad estará disponible próximamente.');
        }
    }

    /**
     * Descarga la conversación como texto
     */
    function downloadConversation() {
        if (conversationHistory.length === 0) {
            alert('No hay conversación para descargar.');
            return;
        }

        let text = 'Conversación con Iyari - Asistente Virtual UAN\n';
        text += '==================================================\n\n';

        conversationHistory.forEach(msg => {
            const role = msg.role === 'user' ? 'Tú' : 'Iyari';
            const date = new Date(msg.timestamp);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

            text += `[${formattedDate}] ${role}:\n${msg.content}\n\n`;
        });

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'conversacion-iyari.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Muestra ayuda
     */
    function showHelp() {
        const helpMessage = `
            <strong>¿Cómo usar Iyari?</strong><br><br>

            Puedes preguntarme sobre:<br>
            • Información académica<br>
            • Trámites y procesos<br>
            • Horarios y ubicaciones<br>
            • Becas y apoyos financieros<br>
            • Calendarios académicos<br>
            • Programas y carreras<br><br>

            <strong>Consejos:</strong><br>
            • Sé específico en tus preguntas<br>
            • Puedo responder mejor a una pregunta a la vez<br>
            • Para una nueva consulta, presiona el botón de limpiar chat
        `;

        addMessage(helpMessage, 'bot');
    }

    // Exponer funciones para uso externo
    window.selectSuggestion = function(text) {
        chatInput.value = text;
        chatInput.focus();
        chatInput.dispatchEvent(new Event('input'));

        // Opcional: enviar automáticamente
        // sendButton.click();
    };
});
