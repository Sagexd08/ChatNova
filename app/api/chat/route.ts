import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

// Use the provided Gemini API key
const GEMINI_API_KEY = "AIzaSyAUUVxnKetQoPl2vWx0UY-m-Sc-xXRhz2Y";

// Define Message type
interface Message {
  role: string;
  content: string;
}



export async function POST(req: Request) {
  try {
    const { messages, uploadedFiles } = await req.json();

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

    // Use AI SDK with Google provider
    const result = await streamText({
      model: google('gemini-1.5-flash', {
        apiKey: GEMINI_API_KEY,
      }),
      system: systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
