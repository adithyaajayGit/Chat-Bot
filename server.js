

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Gemini API client
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.error('Error during setup:', error));

// Message schema
const messageSchema = new mongoose.Schema({
  sender: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

app.use(bodyParser.json());
app.use(express.static('public'));

// Post message API
app.post('/api/message', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).send('Message is required.');

  try {
    // Save user message to MongoDB
    const userMessage = new Message({ sender: 'user', message });
    await userMessage.save();

    // Generate bot response
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent([message]);
    const botMessage = response.response.text();

    // Save bot message to MongoDB
    const savedBotMessage = new Message({ sender: 'bot', message: botMessage });
    await savedBotMessage.save();

    res.json({ reply: botMessage });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).send('Error processing message');
  }
});

// Get message history API
app.get('/history', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).send('Error fetching history');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}/`);
});


