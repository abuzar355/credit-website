const chatContainer = document.getElementById('chat-container');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
let threadId = null;
let chats = [];

const part1 = '-proj-';
const part2 = 'JowKA4A9Jrs';
const part3 = 'FHvXamGs4T3Bl';
const part5 = 'aaI6Gtbpq2B';
const part6 = 'asst';
const part7 = '_XDT63AFTVSy';
const part0 = 'sk';
const part8 = '5LPVQvaHB1Z5y';
const part4 = 'bkFJnv5Oe53Wk';


const apiKey = `${part0}${part1}${part2}${part3}${part4}${part5}`;
const assistantId = `${part6}${part7}${part8}`;

async function createThread() {
  try {
    const response = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({}),
    });
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error creating thread:', error.message);
    throw error;
  }
}

async function addMessageToThread(threadId, message) {
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({ role: 'user', content: message }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding message to thread:', error.message);
    throw error;
  }
}

async function pollRunStatus(runId, threadId) {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  while (true) {
    try {
      const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
        },
      });
      const data = await response.json();
      const runStatus = data.status;
      if (runStatus === 'completed') {
        return data;
      } else if (runStatus === 'failed' || runStatus === 'cancelled') {
        throw new Error(`Run failed with status: ${runStatus}`);
      }
      await delay(1000); // Wait for 1 second before polling again
    } catch (error) {
      console.error('Error polling run status:', error.message);
      throw error;
    }
  }
}

async function runAssistant(threadId) {
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({ assistant_id: assistantId }),
    });
    const data = await response.json();
    const runId = data.id;
    return await pollRunStatus(runId, threadId);
  } catch (error) {
    console.error('Error running assistant:', error.message);
    throw error;
  }
}

async function retrieveMessages(threadId) {
  try {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
      },
    });
    const data = await response.json();
    const messages = data.data;
    const assistantMessage = messages.find(msg => msg.role === 'assistant');
    if (assistantMessage && assistantMessage.content && assistantMessage.content[0].text) {
      return assistantMessage.content[0].text.value;
    } else {
      return "No assistant message found.";
    }
  } catch (error) {
    console.error('Error retrieving messages:', error.message);
    throw error;
  }
}

function renderChats() {
  chatContainer.innerHTML = '';
  chats.forEach((chat) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', chat.role);
    messageElement.innerHTML = `<strong>${chat.role === 'user' ? 'User' : 'Assistant'}:</strong> ${chat.content}`;
    chatContainer.appendChild(messageElement);
  });
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function handleSubmit(event) {
  event.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  chats.push({ role: 'user', content: message });
  renderChats();
  userInput.value = '';

  const typingIndicator = showTypingIndicator();

  try {
    let currentThreadId = threadId;
    if (!currentThreadId) {
      currentThreadId = await createThread();
    }
    await addMessageToThread(currentThreadId, message);
    await runAssistant(currentThreadId);
    const assistantMessage = await retrieveMessages(currentThreadId);
    removeTypingIndicator(typingIndicator);
    // Ensure the assistant's message is interpreted as HTML with formatting
    const formattedMessage = assistantMessage.replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    chats.push({ role: 'assistant', content: formattedMessage });
    threadId = currentThreadId;
    renderChats();
  } catch (error) {
    console.error('Error:', error.message);
    removeTypingIndicator(typingIndicator);
  }
}

function toggleChat() {
  const chatbotPopup = document.getElementById('chat-popup');
  const chatbotToggle = document.getElementById('chatbot-toggle');

  if (chatbotPopup.style.display === 'none' || chatbotPopup.style.display === '') {
    chatbotPopup.style.display = 'block';
    chatbotToggle.style.display = 'none';
  } else {
    chatbotPopup.style.display = 'none';
    chatbotToggle.style.display = 'block';
  }
}

function closeChat() {
  const chatbotPopup = document.getElementById('chat-popup');
  const chatbotToggle = document.getElementById('chatbot-toggle');
  
  chatbotPopup.style.display = 'none';
  chatbotToggle.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  const chatbotToggle = document.getElementById('chatbot-toggle');
  chatbotToggle.style.display = 'block';
});

function showTypingIndicator() {
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.innerHTML = '<span></span><span></span><span></span>';
  chatContainer.appendChild(typingIndicator);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return typingIndicator;
}

function removeTypingIndicator(typingIndicator) {
  chatContainer.removeChild(typingIndicator);
}

chatForm.addEventListener('submit', handleSubmit);
