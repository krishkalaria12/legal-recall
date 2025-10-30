import { streamText, convertToModelMessages, consumeStream } from "ai";
import { openai } from "@ai-sdk/openai";
import { pdfUrlToBase64DataUrl } from "@/lib/pdf-to-base64";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
// Allow streaming for up to 30s (per AI SDK cookbook examples)
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length != 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }

    const chat = _chats[0];
    const pdfUrl = chat.pdfUrl;
    const pdfName = chat.pdfName;

    console.log(`[Chat API] Processing query for chat ${chatId}, PDF: ${pdfName}`);

    // Convert PDF to base64 data URL
    const pdfDataUrl = await pdfUrlToBase64DataUrl(pdfUrl);

    const lastMessage = messages[messages.length - 1];
    const extractText = (msg: any): string => {
      if (!msg) return "";
      if (typeof msg.content === "string") return msg.content;
      if (Array.isArray(msg.parts)) {
        return msg.parts
          .filter((p: any) => p && p.type === "text" && typeof p.text === "string")
          .map((p: any) => p.text)
          .join("\n");
      }
      return "";
    };
    const userText = extractText(lastMessage);

    // Persist the incoming user message immediately
    await db.insert(_messages).values({
      chatId,
      content: lastMessage?.content ?? userText,
      role: "user",
    });

    // Prepare messages with PDF attachment on first user message
    const userMessages = Array.isArray(messages)
      ? messages.filter((m: any) => m?.role === "user")
      : [];

    // Add the PDF file to the first message if not already present
    const messagesWithPdf = userMessages.map((msg: any, index: number) => {
      const textContent = msg.content || extractText(msg);

      if (index === 0) {
        // First message should include the PDF
        return {
          role: 'user' as const,
          content: [
            {
              type: 'text' as const,
              text: textContent,
            },
            {
              type: 'file' as const,
              data: pdfDataUrl,
              mediaType: 'application/pdf',
            },
          ],
        };
      }
      // Subsequent messages are text only
      return {
        role: 'user' as const,
        content: textContent,
      };
    });

    const result = streamText({
      model: openai("gpt-4o"),
      system: `You are Legal Recall, an AI assistant specialized in analyzing legal documents, case law, and legal research papers.

Your key capabilities include:
- Expert understanding of legal terminology, concepts, and reasoning
- Precise analysis of legal arguments and precedents
- Clear explanations of complex legal topics
- Professional and articulate communication

CRITICAL INSTRUCTIONS:
1. You have been provided with a PDF document (${pdfName})
2. You MUST use ONLY the information from this PDF to answer questions
3. Base ALL your answers strictly on the PDF content - never use external knowledge
4. If the PDF doesn't contain the answer, clearly state: "I cannot find information about that in the document. Could you rephrase your question or ask about a different section?"
5. When citing information, reference specific sections or pages when possible
6. Never fabricate or assume legal information not present in the document
7. Provide clear, professional explanations suitable for legal professionals and students
      `,
      messages: messagesWithPdf,
      abortSignal: (req as any).signal,
      onFinish: async ({ text }) => {
        try {
          await db.insert(_messages).values({
            chatId,
            content: text,
            role: "system",
          });
        } catch (e) {
          console.error("failed to persist assistant message", e);
        }
      },
    });

    // Return UI message stream per AI SDK v5 docs
    return result.toUIMessageStreamResponse({
      consumeSseStream: consumeStream,
    });
  } catch (error: any) {
    const message = error?.message || "internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
