const sendMessageToServer = async (message) => {
  try {
    const response = await fetch('/api/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error('Error:', error);
    return 'Sorry, there was an error. Please try again.';
  }
};

const addMessage = (sender, message) => {
  const chatHistory = document.getElementById('chat-history');
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}`;

  const logo = document.createElement('img');
  logo.src = sender === 'user' ? 'assets/user.png' : 'assets/bot.png';

  const textElement = document.createElement('span');
  textElement.innerText = message || 'No response'; // Handle empty messages

  messageElement.appendChild(logo);
  messageElement.appendChild(textElement);

  chatHistory.appendChild(messageElement);
  chatHistory.scrollTop = chatHistory.scrollHeight; // Smooth scroll to the bottom
};

document.getElementById('send-btn').addEventListener('click', async () => {
  const userInput = document.getElementById('user-input').value;
  if (userInput) {
    addMessage('user', userInput);

    // Show the generating message
    const generatingMessage = document.getElementById('generating-message');
    generatingMessage.style.display = 'block'; // Directly manipulate style

    try {
      const response = await sendMessageToServer(userInput);
      // Hide the generating message and display the bot's response
      generatingMessage.style.display = 'none'; // Directly manipulate style
      addMessage('bot', response);
    } catch (error) {
      // Hide the generating message and show an error message
      generatingMessage.style.display = 'none'; // Directly manipulate style
      addMessage('bot', 'Sorry, there was an error. Please try again.');
    }

    document.getElementById('user-input').value = '';
  }
});

document.getElementById('history-btn').addEventListener('click', () => {
  window.location.href = '/history.html'; // Handle history page routing
});
