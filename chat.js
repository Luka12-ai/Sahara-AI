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

  if (!currentChatId) {

    createNewChat();

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

    messages: []

  };

  chats.unshift(newChat);

  currentChatId = chatId;

  localStorage.setItem('chats', JSON.stringify(chats));

  localStorage.setItem('currentChatId', currentChatId);

  renderChatHistory();

  messagesContainer.innerHTML = '';

}



// Render chat history

function renderChatHistory() {

  chatHistoryList.innerHTML = chats.map(chat => `

    <div class="chat-history-item" data-chat-id="${chat.id}">

      <span>${chat.title}</span>

      <button class="action-button delete-chat" data-chat-id="${chat.id}">

        <i class="fas fa-trash"></i>

      </button>

    </div>

  `).join('');



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

  loadCurrentChat();

}



// Load current chat

function loadCurrentChat() {

  const currentChat = chats.find(chat => chat.id === currentChatId);

  if (currentChat) {

    messagesContainer.innerHTML = currentChat.messages.map(msg => createMessageElement(msg)).join('');

  }

}



// Delete chat

function deleteChat(chatId) {

  chats = chats.filter(chat => chat.id !== chatId);

  localStorage.setItem('chats', JSON.stringify(chats));

  if (currentChatId === chatId) {

    if (chats.length > 0) {

      currentChatId = chats[0].id;

    } else {

      createNewChat();

    }

  }

  renderChatHistory();

  loadCurrentChat();

}



// Create message element

function createMessageElement(message) {

  return `

    <div class="message ${message.role}">

      ${message.content}

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

    // Call API

    const response = await fetch(`${API_URL}/chat/completions`, {

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

    

    const data = await response.json();

    const aiMessage = {

      role: 'ai',

      content: data.choices?.[0]?.message?.content || data.response || data

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

  } finally{
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



// New chat button

newChatButton.addEventListener('click', createNewChat);



// Handle Shift + Enter

chatInput.addEventListener('keydown', (e) => {

  if (e.key === 'Enter' && !e.shiftKey) {

    e.preventDefault();

    chatForm.dispatchEvent(new Event('submit'));

  }

});



// Initialize on page load

initializeChat();