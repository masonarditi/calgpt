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
    const userQuery = req.body.query;

    // First, get response from SID API
    const sidResponse = await fetch('https://designer-linear-algebra.sid.ai/query', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: userQuery,
        limit: 1,
        wishlist: {}
      })
    });

    const sidData = await sidResponse.json();
    console.log('SID API response:', JSON.stringify(sidData, null, 2));

    const originalContent = sidData[0]?.content || "No response available";

    // Then, send to OpenAI for summarization with both user query and RAG response
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            //             content: `You are a knowledgeable UC Berkeley academic advisor with expertise in course requirements, prerequisites, and academic policies. 
            // Your responses should:
            // - Be direct and concise (2-3 sentences maximum)
            // - Include specific course codes, unit counts, and prerequisites when relevant
            // - Reference official Berkeley policies and requirements
            // - Highlight key deadlines or time-sensitive information
            // - Focus on factual, actionable information
            // - Use official Berkeley terminology
            // - Maintain a professional but supportive tone
            // Do not include general advice or unofficial recommendations.`
            content: "You are a knowledgeable UC Berkeley academic advisor with expertise in course requirements, prerequisites, and academic policies. Your responses should: - Be direct and concise (2-3 sentences maximum)  Include specific course codes, unit counts, and prerequisites when relevant. Focus on factual, actionable information. Maintain a supportive tone and use emojis to be more engaging. and funny."

          },
          {
            role: "user",
            content: `User Question: ${userQuery}\n\nRelevant Information: ${originalContent}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      })
    });

    const openaiData = await openaiResponse.json();
    console.log('OpenAI response:', JSON.stringify(openaiData, null, 2));

    const summarizedContent = openaiData.choices[0]?.message?.content || originalContent;

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

  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Error processing request' });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
}); 