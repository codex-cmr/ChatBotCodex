const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.querySelector('.chat-input button');

// Variable to track if bot is processing
let isBotThinking = false;

// Fonction pour désactiver l'interface utilisateur
function disableInput() {
    isBotThinking = true;
    userInput.disabled = true;
    userInput.placeholder = "Attendez la réponse de Codex...";
    sendButton.disabled = true;
    sendButton.textContent = "Traitement...";
    sendButton.classList.add('processing');
    userInput.classList.add('disabled');
}

// Fonction pour réactiver l'interface utilisateur
function enableInput() {
    isBotThinking = false;
    userInput.disabled = false;
    userInput.placeholder = "Posez votre question à Codex...";
    sendButton.disabled = false;
    sendButton.textContent = "Envoyer";
    sendButton.classList.remove('processing');
    userInput.classList.remove('disabled');
    userInput.focus(); // Refocus on input for better UX
}

// Fonction pour formater l'heure
function formatTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Fonction pour copier le texte d'un message
async function copyMessage(messageText, button) {
    try {
        await navigator.clipboard.writeText(messageText);
        
        // Visual feedback - success
        const icon = button.querySelector('.copy-icon');
        const text = button.querySelector('.copy-text');
        
        const originalIcon = icon.innerHTML;
        const originalText = text.innerHTML;
        
        icon.innerHTML = '✅';
        text.innerHTML = 'Copié !';
        button.style.background = '#28a745';
        button.style.color = 'white';
        button.style.transform = 'scale(1.05)';
        
        setTimeout(() => {
            icon.innerHTML = originalIcon;
            text.innerHTML = originalText;
            button.style.background = '';
            button.style.color = '';
            button.style.transform = '';
        }, 2000);
        
    } catch (err) {
        console.error('Erreur lors de la copie:', err);
        
        // Visual feedback - error
        const icon = button.querySelector('.copy-icon');
        const text = button.querySelector('.copy-text');
        
        const originalIcon = icon.innerHTML;
        const originalText = text.innerHTML;
        
        icon.innerHTML = '❌';
        text.innerHTML = 'Erreur';
        button.style.background = '#dc3545';
        button.style.color = 'white';
        
        setTimeout(() => {
            icon.innerHTML = originalIcon;
            text.innerHTML = originalText;
            button.style.background = '';
            button.style.color = '';
        }, 2000);
    }
}



// Fonction pour ajouter un message au chat
function addMessage(content, isUser) {
    const timestamp = formatTime();
    
    if (isUser) {
        // User message - no avatar, simple message with timestamp and copy
        const messageContainer = document.createElement('div');
        messageContainer.className = 'user-message-container';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.textContent = content;
        
        // Copy button for user messages
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '<span class="copy-icon">📋</span><span class="copy-text">Copier</span>';
        copyBtn.title = 'Copier ce message';
        copyBtn.onclick = () => copyMessage(content, copyBtn);
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'timestamp user-timestamp';
        timeDiv.textContent = timestamp;
        
        messageContainer.appendChild(messageDiv);
        messageContainer.appendChild(copyBtn);
        messageContainer.appendChild(timeDiv);
        chatMessages.appendChild(messageContainer);
    } else {
        // Bot message - with avatar, timestamp and copy
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'message-wrapper bot-wrapper';
        
        const avatar = document.createElement('div');
        avatar.className = 'avatar bot-avatar';
        avatar.innerHTML = '<img src="CODEX LOGO.png" alt="Codex" onerror="this.parentElement.innerHTML=\'🤖\'">';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'bot-message-content';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.textContent = content;
        
        // Copy button for bot messages
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '<span class="copy-icon">📋</span><span class="copy-text">Copier la réponse</span>';
        copyBtn.title = 'Copier cette réponse';
        copyBtn.onclick = () => copyMessage(content, copyBtn);
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'timestamp bot-timestamp';
        timeDiv.textContent = timestamp;
        
        messageContent.appendChild(messageDiv);
        messageContent.appendChild(copyBtn);
        messageContent.appendChild(timeDiv);
        
        messageWrapper.appendChild(avatar);
        messageWrapper.appendChild(messageContent);
        
        chatMessages.appendChild(messageWrapper);
    }
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}



// Fonction pour afficher l'indicateur de frappe
function showTypingIndicator() {
    const typingWrapper = document.createElement('div');
    typingWrapper.className = 'message-wrapper bot-wrapper';
    typingWrapper.id = 'typing-indicator-wrapper';
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar bot-avatar';
    avatar.innerHTML = '<img src="CODEX LOGO.png" alt="Codex" onerror="this.parentElement.innerHTML=\'🤖\'">';
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <span class="typing-text">Codex réfléchit</span>
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    typingWrapper.appendChild(avatar);
    typingWrapper.appendChild(typingDiv);
    
    chatMessages.appendChild(typingWrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Fonction pour masquer l'indicateur de frappe
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator-wrapper');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Fonction pour simuler un délai de réflexion réaliste
function getThinkingTime(query) {
    const baseTime = 800; // Temps de base
    const wordCount = query.split(' ').length;
    const complexityBonus = wordCount * 100; // Plus de mots = plus de réflexion
    const randomDelay = Math.random() * 500; // Délai aléatoire pour plus de réalisme
    
    return Math.min(baseTime + complexityBonus + randomDelay, 3000); // Max 3 secondes
}

// Fonction pour envoyer un message à l'API
async function sendMessage() {
    const query = userInput.value.trim();
    if (!query || isBotThinking) return; // Prevent sending if bot is thinking

    // Ajouter le message de l'utilisateur
    addMessage(query, true);
    userInput.value = '';

    // Désactiver l'interface utilisateur
    disableInput();

    // Afficher l'indicateur de frappe avec délai réaliste
    showTypingIndicator();
    
    // Simuler un temps de réflexion basé sur la complexité de la question
    const thinkingTime = getThinkingTime(query);
    
    try {
        // Attendre le temps de réflexion avant d'envoyer la requête
        await new Promise(resolve => setTimeout(resolve, thinkingTime));
        
        const response = await fetch('http://127.0.0.1:8081/api/v1/process_query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        // Masquer l'indicateur de frappe
        hideTypingIndicator();

        if (!response.ok) {
            throw new Error('Erreur réseau ou API');
        }

        const data = await response.json();
        
        // Petit délai avant d'afficher la réponse pour plus de naturel
        setTimeout(() => {
            addMessage(data.answer || 'Pas de réponse', false);
            // Réactiver l'interface utilisateur après la réponse
            enableInput();
        }, 200);
        
    } catch (error) {
        // Masquer l'indicateur de frappe en cas d'erreur
        hideTypingIndicator();
        
        setTimeout(() => {
            addMessage('Erreur : ' + error.message, false);
            // Réactiver l'interface utilisateur même en cas d'erreur
            enableInput();
        }, 200);
    }
}

// Envoyer un message avec la touche Entrée
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !isBotThinking) {
        sendMessage();
    }
});

// ========== THEME TOGGLE FUNCTIONALITY ==========

// Fonction pour basculer entre les thèmes
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle');
    const currentTheme = body.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        body.setAttribute('data-theme', 'light');
        themeToggle.classList.remove('dark');
        localStorage.setItem('codex-theme', 'light');
        
        // Animation de transition
        body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            body.style.transition = '';
        }, 300);
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggle.classList.add('dark');
        localStorage.setItem('codex-theme', 'dark');
        
        // Animation de transition
        body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            body.style.transition = '';
        }, 300);
    }
}

// Initialiser le thème au chargement de la page
function initializeTheme() {
    const savedTheme = localStorage.getItem('codex-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeToggle = document.querySelector('.theme-toggle');
    
    // Détermine le thème à utiliser
    let theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    // Applique le thème
    document.body.setAttribute('data-theme', theme);
    
    if (theme === 'dark') {
        themeToggle.classList.add('dark');
    } else {
        themeToggle.classList.remove('dark');
    }
}

// Écouter les changements de préférence système
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Ne change automatiquement que si l'utilisateur n'a pas défini de préférence
    if (!localStorage.getItem('codex-theme')) {
        const themeToggle = document.querySelector('.theme-toggle');
        if (e.matches) {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.classList.add('dark');
        } else {
            document.body.setAttribute('data-theme', 'light');
            themeToggle.classList.remove('dark');
        }
    }
});

// Initialiser le thème quand la page se charge
document.addEventListener('DOMContentLoaded', initializeTheme);

// Message de bienvenue avec le thème actuel
function showWelcomeMessage() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const themeEmoji = currentTheme === 'dark' ? '🌙' : '☀️';
    const welcomeMsg = `Bienvenue dans Codex ChatBot ${themeEmoji}! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui?`;
    
    setTimeout(() => {
        addMessage(welcomeMsg, false);
    }, 500);
}

// Afficher le message de bienvenue après l'initialisation
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(showWelcomeMessage, 800);
});