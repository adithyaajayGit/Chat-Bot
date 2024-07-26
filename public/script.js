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
      return 'Sorry, there was an error. Please try again later.';
    }
  };
  
  const addMessage = (sender, message) => {
    const chatHistory = document.getElementById('chat-history');
    const messageElement = document.createElement('div');
    messageElement.className = sender;
    messageElement.innerText = message || 'No response'; // Handle empty messages
    chatHistory.appendChild(messageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  };
  
  document.getElementById('send-btn').addEventListener('click', async () => {
    const userInput = document.getElementById('user-input').value;
    if (userInput) {
      addMessage('user', userInput);
      try {
        const response = await sendMessageToServer(userInput);
        addMessage('bot', response);
      } catch (error) {
        addMessage('bot', 'Sorry, there was an error. Please try again later.');
      }
      document.getElementById('user-input').value = '';
    }
  });
  
  document.getElementById('history-btn').addEventListener('click', () => {
    window.location.href = '/history.html'; // Handle history page routing (optional)
  });
  