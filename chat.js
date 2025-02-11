// API configuration
const API_URL = 'https://api.eduide.cc/v1';  // Update this with your actual API endpoint

// Store chat history in localStorage
let chats = JSON.parse(localStorage.getItem('chats')) || [];
let currentChatId = localStorage.getItem('currentChatId');

const chatForm = document.getElementById('chat-form');
const modelSelect = document.getElementById('model-select');
const chatInput = document.getElementById('chat-input');
const messagesContainer = document.getElementById('messages-container');
const chatHistoryList = document.getElementById('chat-history-list');
const newChatButton = document.getElementById('new-chat');

// Add thinking loader element
const thinkingLoader = document.createElement('div');
thinkingLoader.className = 'thinking-loader';
thinkingLoader.innerHTML = '<div class="loader loader2"></div>';
messagesContainer.parentNode.insertBefore(thinkingLoader, chatForm); // Insert before chat form

// Initialize chat
function initializeChat() {
  if (!currentChatId && chats.length === 0) {
    createNewChat();
  } else if (!currentChatId && chats.length > 0) {
    currentChatId = chats[0].id; // Load the first chat if currentChatId is not set
    localStorage.setItem('currentChatId', currentChatId);
  }

  renderChatHistory();
  loadCurrentChat();
}

// Create new chat
function createNewChat() {
  const chatId = Date.now().toString();
  const newChat = {
    id: chatId,
    title: 'New Chat',
    messages: [],
    model: modelSelect.value // Store the selected model
  };
  chats.unshift(newChat);
  currentChatId = chatId;
  localStorage.setItem('chats', JSON.stringify(chats));
  localStorage.setItem('currentChatId', currentChatId);
  renderChatHistory();
  loadCurrentChat();
}

// Render chat history
function renderChatHistory() {
    chatHistoryList.innerHTML = chats.map(chat => {
        const isActive = chat.id === currentChatId;
        return `
            <div class="chat-history-item ${isActive ? 'active' : ''}" data-chat-id="${chat.id}">
                <span>${chat.title}</span>
                <button class="action-button delete-chat" data-chat-id="${chat.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');

    // Add event listeners
    document.querySelectorAll('.chat-history-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-chat')) {
                switchChat(item.dataset.chatId);
            }
        });
    });

    document.querySelectorAll('.delete-chat').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteChat(button.dataset.chatId);
        });
    });
}


// Switch between chats
function switchChat(chatId) {
  currentChatId = chatId;
  localStorage.setItem('currentChatId', currentChatId);
  renderChatHistory(); // Re-render to update the active class
  loadCurrentChat();
}

// Load current chat
function loadCurrentChat() {
  const currentChat = chats.find(chat => chat.id === currentChatId);
  if (currentChat) {
    // Set model select to the model saved in the chat
    modelSelect.value = currentChat.model;
    messagesContainer.innerHTML = currentChat.messages.map(msg => createMessageElement(msg)).join('');
  }
}

// Delete chat
function deleteChat(chatId) {
  chats = filteredChats;
  localStorage.setItem('chats', JSON.stringify(chats));
  if (currentChatId === chatId) {
    currentChatId = chats[0]?.id;
    localStorage.setItem('currentChatId', currentChatId);
  }
  renderChatHistory();
  loadCurrentChat();
}

// Basic Markdown rendering (extend this with a Markdown library for full support)
function renderMarkdown(text) {
    // Bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    // Italics text
    text = text.replace(/\*(.*?)\*/g, '<i>$1</i>');

    // Headers (very basic, only level 1 and 2)
    text = text.replace(/^# (.*)$/gm, '<h1>$1</h1>');
    text = text.replace(/^## (.*)$/gm, '<h2>$1</h2>');

    // Line breaks
    text = text.replace(/\n/g, '<br>');

    return text;
}

// Create message element
function createMessageElement(message) {
  let messageContent = message.content;

  if (message.role === 'user') {
      messageContent = `**You:**<br>${renderMarkdown(message.content)}`;  //Apply simple markdown rendering
  } else if (message.role === 'ai') {
      messageContent = `**AI:**<br>${renderMarkdown(message.content)}`; //Apply simple markdown rendering
  }

  return `
    <div class="message ${message.role}">
      ${messageContent}
      ${message.role === 'ai' ? `
        <div class="message-actions">
          <button class="action-button copy-message" title="Copy">
            <i class="fas fa-copy"></i>
          </button>
          <button class="action-button regenerate-message" title="Regenerate">
            <i class="fas fa-redo"></i>
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

// Function to show/hide the thinking loader
function showThinkingLoader() {
  thinkingLoader.classList.add('active');
}

function hideThinkingLoader() {
  thinkingLoader.classList.remove('active');
}

// Handle message submission
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const message = chatInput.value.trim();
  if (!message) return;

  // Add user message
  const currentChat = chats.find(chat => chat.id === currentChatId);
  const userMessage = { role: 'user', content: message };
  currentChat.messages.push(userMessage);

  // Update UI
  messagesContainer.innerHTML += createMessageElement(userMessage);
  chatInput.value = '';
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  showThinkingLoader();

  try {
    let response, data;

    if (modelSelect.value === 'gpt-4o-mini') {
      // Call API for GPT-4o Mini
      response = await fetch(`${API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: modelSelect.value,
          messages: [{ role: "user", content: message }],
          stream: false,
          temperature: 0.7
        }),
      });

      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      data = await response.json();

    } else if (modelSelect.value === 'gemini-2.0-pro' || modelSelect.value === 'gemini-1.5-flash') {
        // Call your backend server's Gemini endpoint

        response = await fetch('http://localhost:3001/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) throw new Error(`Gemini API request failed: ${response.status}`);
        data = await response.json();
    }

    let aiMessageContent;
      console.log(data);
    if (modelSelect.value === 'gpt-4o-mini') {
        aiMessageContent = data.choices?.[0]?.message?.content || data.response || data;
    } else if (modelSelect.value === 'gemini-2.0-pro' || modelSelect.value === 'gemini-1.5-flash') {
        aiMessageContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!aiMessageContent) {
            aiMessageContent = 'No response from Gemini'; //VERY IMPORTANT -> CHECK your Google API's for formatting needed to get response
        }
    }

    const aiMessage = {
        role: 'ai',
        content: aiMessageContent
    };

    // Add AI message
    currentChat.messages.push(aiMessage);
    messagesContainer.innerHTML += createMessageElement(aiMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Update chat title if it's the first message
    if (currentChat.messages.length === 2) {
      currentChat.title = message.slice(0, 30) + (message.length > 30 ? '...' : '');
      renderChatHistory();
    }

    // Save to localStorage
    localStorage.setItem('chats', JSON.stringify(chats));

  } catch (error) {
    console.error('Error:', error);
    messagesContainer.innerHTML += `
      <div class="message error">
        Error: ${error.message}
      </div>
    `;
  } finally {
    hideThinkingLoader();
  }
});

// Copy message
document.addEventListener('click', async (e) => {
  if (e.target.closest('.copy-message')) {
    const message = e.target.closest('.message').textContent.trim();
    try {
      await navigator.clipboard.writeText(message);
      alert('Message copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
});

// Regenerate message
document.addEventListener('click', async (e) => {
  if (e.target.closest('.regenerate-message')) {
    const messageElement = e.target.closest('.message');
    const currentChat = chats.find(chat => chat.id === currentChatId);
    const messageIndex = Array.from(messagesContainer.children).indexOf(messageElement);

    // Remove all messages after this one
    currentChat.messages = currentChat.messages.slice(0, messageIndex);
    messagesContainer.innerHTML = currentChat.messages.map(msg => createMessageElement(msg)).join('');

    // Trigger new API call with the last user message
    const lastUserMessage = currentChat.messages[messageIndex - 1];
    if (lastUserMessage) {
      chatInput.value = lastUserMessage.content;
      chatForm.dispatchEvent(new Event('submit'));
    }
  }
});

// Model select change event
modelSelect.addEventListener('change', () => {
  const currentChat = chats.find(chat => chat.id === currentChatId);
  if (currentChat) {
    currentChat.model = modelSelect.value;
    localStorage.setItem('chats', JSON.stringify(chats));
  }
});

// New chat button
newChatButton.addEventListener('click', createNewChat);

// Handle Shift + Enter - New line with Enter, Submit with Shift+Enter
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (e.shiftKey) {
            // If Shift + Enter, submit the form
            e.preventDefault(); // Prevent default newline
            chatForm.dispatchEvent(new Event('submit'));
        } else {
            // If Enter alone, insert a newline character
            e.preventDefault();
            const start = chatInput.selectionStart;
            const end = chatInput.selectionEnd;
            chatInput.value = chatInput.value.substring(0, start) + '\n' + chatInput.value.substring(end);
            chatInput.selectionStart = chatInput.selectionEnd = start + 1;
        }
    }
});

// Initialize on page load
initializeChat();