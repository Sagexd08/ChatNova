import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 30;

// Initialize API keys from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROK_API_KEY = process.env.GROK_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

if (!GROK_API_KEY) {
  throw new Error("GROK_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Define Message type
interface Message {
  role: string;
  content: string;
}

// Grok API function
async function callGrokAPI(prompt: string): Promise<string> {
  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are Grok, a witty and intelligent AI assistant created by xAI. You provide helpful, accurate, and engaging responses with a touch of humor when appropriate.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'grok-3',
        stream: false,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Grok API error:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const { messages, uploadedFiles, selectedModel = 'grok' } = await req.json();

    // Get the last user message
    const lastUserMessage = messages.filter((m: Message) => m.role === "user").pop()?.content || "Hello";

    // Enhanced system message for ChatNova
    let systemPrompt = selectedModel === 'grok'
      ? `You are ChatNova, powered by Grok - a witty and intelligent AI assistant. You provide helpful, accurate, and engaging responses with a touch of humor when appropriate. You excel at reasoning, analysis, and creative problem-solving.

Key guidelines:
- Be conversational, helpful, and engaging with a hint of wit
- Provide detailed, well-structured responses
- Use step-by-step thinking for complex queries
- Be honest when you don't know something
- Show your reasoning process when helpful
- Use clear, accessible language with personality
- Be creative and innovative in your solutions`
      : `You are ChatNova, an advanced AI assistant powered by Google Gemini. You provide intelligent, detailed responses with a friendly and professional tone. You excel at reasoning, analysis, and creative problem-solving.

Key guidelines:
- Be conversational, helpful, and engaging
- Provide detailed, well-structured responses
- Use step-by-step thinking for complex queries
- Be honest when you don't know something
- Show your reasoning process when helpful
- Use clear, accessible language
- Be creative and innovative in your solutions`;

    // Add PDF content to the system message if files are uploaded
    if (uploadedFiles && uploadedFiles.length > 0) {
      systemPrompt += `\n\nYou have access to the following uploaded documents:\n`;
      uploadedFiles.forEach((file: any, index: number) => {
        systemPrompt += `\nDocument ${index + 1}: ${file.name}\nContent: ${file.content}\n`;
      });
      systemPrompt += `\nWhen answering questions, you can reference information from these documents. Always cite which document you're referencing when using information from the uploaded files.`;
    }

    // Prepare the full prompt
    const fullPrompt = `${systemPrompt}\n\nUser query: ${lastUserMessage}`;

    let responseText: string;

    // Choose AI model based on user selection
    if (selectedModel === 'gemini') {
      // Use Gemini API
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await geminiModel.generateContent(fullPrompt);
      const response = result.response;
      responseText = response.text();
    } else {
      // Use Grok API with fallback to Gemini
      try {
        responseText = await callGrokAPI(fullPrompt);
      } catch (grokError) {
        console.log('Grok API failed, falling back to Gemini:', grokError);
        // Fallback to Gemini if Grok fails
        const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await geminiModel.generateContent(fullPrompt);
        const response = result.response;
        responseText = response.text() + "\n\n*Note: Responded using Gemini as Grok is currently unavailable.*";
      }
    }

    return NextResponse.json({
      role: "assistant",
      content: responseText,
      model: selectedModel
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      error: "Failed to generate response",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
