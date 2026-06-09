require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post('/api/motivate', async (req, res) => {
  try {
    const { habitName, streak, category } = req.body;

    const streakPhrase = streak > 1
      ? ` They are now on a ${streak}-day streak.`
      : '';

    const prompt =
      `Generate a short (1-2 sentence) motivational message for someone who just completed their "${habitName}" habit today.${streakPhrase} Category: ${category}. Be warm, specific, and encouraging. Reply with only the message — no formatting, no hashtags, no emojis.`;

    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    });

    res.json({ message: message.content[0].text });
  } catch (err) {
    console.error('Anthropic API error:', err.message);
    res.status(500).json({ error: 'Failed to generate message' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
