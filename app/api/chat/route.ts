import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 30;

// Use the provided Gemini API key
const GEMINI_API_KEY = "AIzaSyAUUVxnKetQoPl2vWx0UY-m-Sc-xXRhz2Y";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Define Message type
interface Message {
  role: string;
  content: string;
}



export async function POST(req: Request) {
  try {
    const { messages, uploadedFiles } = await req.json();

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

    // Enhanced PDF content handling
    if (uploadedFiles && uploadedFiles.length > 0) {
      systemPrompt += `\n\n=== UPLOADED DOCUMENTS ===\n`;
      uploadedFiles.forEach((file: any, index: number) => {
        systemPrompt += `\n📄 DOCUMENT ${index + 1}: "${file.name}"\n`;
        systemPrompt += `📝 CONTENT:\n${file.content}\n`;
        systemPrompt += `${'='.repeat(50)}\n`;
      });
      systemPrompt += `\n🔍 IMPORTANT INSTRUCTIONS FOR DOCUMENT ANALYSIS:
- You have full access to the content of the uploaded documents above
- When users ask questions, carefully analyze the document content to provide accurate answers
- Always cite the specific document name when referencing information
- If the user asks about something not in the documents, clearly state that
- Provide detailed quotes and page references when possible
- Summarize key points from the documents when asked
- Compare information across multiple documents if relevant
- Be specific about which document contains which information`;
    }

    // Build conversation context
    let conversationContext = "";
    if (messages.length > 1) {
      conversationContext = "\n\n=== CONVERSATION HISTORY ===\n";
      messages.slice(-5).forEach((msg: Message) => { // Last 5 messages for context
        conversationContext += `${msg.role.toUpperCase()}: ${msg.content}\n`;
      });
      conversationContext += "=".repeat(50) + "\n";
    }

    // Prepare the enhanced prompt with better structure
    const fullPrompt = `${systemPrompt}${conversationContext}

🎯 CURRENT USER QUERY: ${lastUserMessage}

Please provide a comprehensive response based on:
1. The uploaded documents (if any)
2. The conversation context
3. Your knowledge and reasoning capabilities

Remember to cite sources when using document information!`;

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
