require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/proxy', async (req, res) => {
  try {
    console.log('Request body:', req.body);

    // First, get response from SID API
    const sidResponse = await fetch('https://designer-linear-algebra.sid.ai/query', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: req.body.query,
        limit: 1,
        wishlist: {}
      })
    });

    const sidData = await sidResponse.json();
    console.log('SID API response:', JSON.stringify(sidData, null, 2));

    // Get the content from SID response
    const originalContent = sidData[0]?.content || "No response available";

    // Then, send to OpenAI for summarization
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a knowledgeable UC Berkeley academic advisor with expertise in course requirements, prerequisites, and academic policies. 
Your responses should:
- Be direct and concise (2-3 sentences maximum)
- Include specific course codes, unit counts, and prerequisites when relevant
- Reference official Berkeley policies and requirements
- Highlight key deadlines or time-sensitive information
- Focus on factual, actionable information
- Use official Berkeley terminology
- Maintain a professional but supportive tone
Do not include general advice or unofficial recommendations.`
          },
          {
            role: "user",
            content: originalContent
          }
        ],
        max_tokens: 150,
        temperature: 0.3 // Lower temperature for more consistent, factual responses
      })
    });

    const openaiData = await openaiResponse.json();
    const summarizedContent = openaiData.choices[0]?.message?.content || originalContent;

    // Send the summarized response
    res.json([{
      item_id: "1",
      idx: 0,
      content: summarizedContent,
      uri: "",
      kind: "text",
      file_name: null,
      file_type: null,
      time_added: new Date().toISOString(),
      time_authored: new Date().toISOString(),
      score: 1,
      metadata: {}
    }]);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Error processing request' });
  }
});

// Add error handling if environment variables are missing
if (!process.env.SID_API_KEY || !process.env.OPENAI_API_KEY) {
  console.error('Error: Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
}); 