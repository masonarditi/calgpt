import { config } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    // First, get response from SID API
    const sidResponse = await fetch(config.sidApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        limit: 1,
        wishlist: {}
      })
    });

    const sidData = await sidResponse.json();
    const originalContent = sidData[0]?.content || "No response available";

    // Then, send to OpenAI for summarization
    const openaiResponse = await fetch(config.openAiApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a knowledgeable UC Berkeley academic advisor...`
          },
          {
            role: "user",
            content: originalContent
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      })
    });

    const openaiData = await openaiResponse.json();
    const summarizedContent = openaiData.choices[0]?.message?.content || originalContent;

    return Response.json([{
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
    return Response.json({ error: 'Error processing request' }, { status: 500 });
  }
} 