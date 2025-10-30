import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadPdfFromUrlIntoPinecone } from "@/lib/pinecone";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// /api/create-chat
export async function POST(req: Request, res: Response) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { file_key, file_name, file_url } = body;
    console.log(file_key, file_name, file_url);
    if (!file_url || !file_name || !file_key) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }
    await loadPdfFromUrlIntoPinecone(file_url, file_key);
    const chat_id = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: file_url,
        userId,
      })
      .returning({
        insertedId: chats.id,
      });

    return NextResponse.json(
      {
        chat_id: chat_id[0].insertedId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("create-chat error", error);
    const message =
      error instanceof Error ? error.message : "internal server error";
    const status = message.includes("Pinecone") ? 502 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
