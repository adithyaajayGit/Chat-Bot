require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const NodeCache = require('node-cache');
const app = express();
const PORT = process.env.PORT || 3000;

// Setup Gemini API client
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Setup in-memory cache
const cache = new NodeCache({ stdTTL: 3600 }); // Cache responses for 1 hour

// Connect to MongoDB Atlas
const setup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error during setup:', error);
  }
};

setup();

// Message schema
const messageSchema = new mongoose.Schema({
  sender: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

messageSchema.index({ timestamp: -1 }); // Adding index for optimization
const Message = mongoose.model('Message', messageSchema);

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/message', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).send('Message is required.');
  }

  try {
    // Save user message to MongoDB
    await new Message({ sender: 'user', message }).save();

    // Check cache first
    const cacheKey = `response_${message}`;
    let botMessage = cache.get(cacheKey);

    if (!botMessage) {
      // Generate bot response
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const response = await model.generateContent([message]);
      botMessage = response.response.text();
      
      // Save bot message to MongoDB
      await new Message({ sender: 'bot', message: botMessage }).save();
      
      // Cache bot message
      cache.set(cacheKey, botMessage);
    }

    res.json({ reply: botMessage });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).send('Error processing message');
  }
});

app.get('/history', async (req, res) => {
  try {
    const { limit = 100 } = req.query; // Get limit from query params
    const messages = await Message.find().sort({ timestamp: -1 }).limit(parseInt(limit)).exec(); // Limit to the latest 'limit' messages
    res.json(messages);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).send('Error fetching history');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}/`);
});
