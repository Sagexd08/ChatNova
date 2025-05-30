import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 30;

// Use the provided Gemini API key
const GEMINI_API_KEY = "AIzaSyAACtM-y1AWa8680XodmK_F8zLEiotgOfQ";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Define Message type
interface Message {
  role: string;
  content: string;
}



export async function POST(req: Request) {
  try {
    const { messages, uploadedFiles, selectedModel = 'gemini' } = await req.json();

    // Get the last user message
    const lastUserMessage = messages.filter((m: Message) => m.role === "user").pop()?.content || "Hello";

    // Enhanced system message for ChatNova
    let systemPrompt = `You are ChatNova, an advanced AI assistant powered by Google Gemini. You provide intelligent, detailed responses with a friendly and professional tone. You excel at reasoning, analysis, and creative problem-solving.

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

    // Use Gemini API
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await geminiModel.generateContent(fullPrompt);
    const response = result.response;
    const responseText = response.text();

    return NextResponse.json({
      role: "assistant",
      content: responseText,
      model: "gemini"
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      error: "Failed to generate response",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
