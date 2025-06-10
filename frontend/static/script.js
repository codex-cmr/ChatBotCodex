const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');

// Fonction pour ajouter un message au chat
function addMessage(content, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Fonction pour envoyer un message à l'API
async function sendMessage() {
    const query = userInput.value.trim();
    if (!query) return;

    addMessage(query, true);
    userInput.value = '';

    try {
        const response = await fetch('http://127.0.0.1:8081/api/v1/process_query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error('Erreur réseau ou API');
        }

        const data = await response.json();
        addMessage(data.answer || 'Pas de réponse', false);
    } catch (error) {
        addMessage('Erreur : ' + error.message, false);
    }
}

// Envoyer un message avec la touche Entrée
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});