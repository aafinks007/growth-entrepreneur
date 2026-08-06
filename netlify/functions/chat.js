import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

export default async (req, context) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { history, message, image, sessionId } = body;

    const supabaseUrl = process.env.SUPABASE_URL || Netlify.env.get("SUPABASE_URL") || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || Netlify.env.get("SUPABASE_ANON_KEY") || process.env.VITE_SUPABASE_ANON_KEY;
    
    let supabase = null;
    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey);
    }

    const apiKey = process.env.GEMINI_API_KEY || Netlify.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key is not configured' }), { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Format history for Gemini API
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const systemPrompt = `You are Aafin, a Growth Entrepreneur and Business Expert.
Your expertise spans digital marketing, SEO, scaling startups, business strategy, and all aspects of entrepreneurship. You possess deep knowledge of everything business. 
Provide comprehensive, highly valuable, and proper answers to the audience's questions. Be professional, insightful, and strategic, always offering actionable advice. 
CRITICAL RULE 1: Do NOT use markdown formatting (no **bolding**, no *italics*, no bullet lists using -, etc). Use plain text only, separated by normal paragraph breaks or numbers.
CRITICAL RULE 2: At the very end of EVERY conversation, you must direct the user to contact Aafin on WhatsApp to discuss further. Provide this exact number: +974 3996 3997.
CRITICAL RULE 3: NEVER cut off abruptly mid-sentence. Always finish your thoughts completely. Keep responses concise enough to not exceed standard text limits.`;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}` }]
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am Aafin, a Growth Entrepreneur ready to provide deep business and marketing insights. I will always finish my sentences and provide complete answers." }]
        },
        ...formattedHistory
      ],
      generationConfig: {
        maxOutputTokens: 3000,
      }
    });

    let result;
    if (image) {
      const mimeType = image.match(/data:(.*?);base64/)?.[1] || "image/jpeg";
      const base64Data = image.split(',')[1];
      const parts = [
        { text: message || "Analyze this image" },
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ];
      result = await chat.sendMessage(parts);
    } else {
      result = await chat.sendMessage(message);
    }
    const responseText = result.response.text();

    if (supabase && sessionId) {
      try {
        await supabase.from('ai_chat_logs').insert([{
          session_id: sessionId,
          user_message: message || '(Image Analysis)',
          ai_response: responseText,
          has_image: !!image
        }]);
      } catch (err) {
        console.error('Failed to log to Supabase:', err);
      }
    }

    return new Response(JSON.stringify({ reply: responseText }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error generating AI response:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to generate response' }), { status: 500 });
  }
};
