import { config } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

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

    const openaiResponse = await fetch(config.openAiApiUrl, {
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
            content: "You are a knowledgeable UC Berkeley academic advisor with expertise in course requirements, prerequisites, and academic policies. Your responses should: - Be direct and concise (2-3 sentences maximum)  Include specific course codes, unit counts, and prerequisites when relevant. Focus on factual, actionable information. Maintain a supportive tone and use emojis to be more engaging. and funny."
          },
          {
            role: "user",
            content: `User Question: ${query}\n\nRelevant Information: ${originalContent}`
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

  } catch (err: unknown) {
    console.error('API Error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
} 