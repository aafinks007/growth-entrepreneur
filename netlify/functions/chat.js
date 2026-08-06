import { GoogleGenerativeAI } from '@google/generative-ai';

export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { history, message } = JSON.parse(event.body);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'API key is not configured' }) };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Format history for Gemini API
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const systemPrompt = `You are AI Aafin, an advanced digital marketing AI assistant representing Aafin K S, an AI Digital Marketing Expert in Qatar. 
Your goal is to answer audience questions related to digital marketing, SEO, Meta Ads, Google Ads, content creation, and web development. 
Keep your responses professional, friendly, concise, and helpful. 
If someone asks something outside your expertise (e.g., personal advice, general knowledge not related to business/marketing), politely decline and bring the conversation back to digital marketing.
If they want to hire or contact Aafin, direct them to use the Contact page or the WhatsApp button on the bottom right. 
Keep responses under 100 words when possible. Use emojis occasionally.`;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}` }]
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am AI Aafin, ready to help with digital marketing queries." }]
        },
        ...formattedHistory
      ],
      generationConfig: {
        maxOutputTokens: 250,
      }
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reply: responseText })
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate response' })
    };
  }
};
