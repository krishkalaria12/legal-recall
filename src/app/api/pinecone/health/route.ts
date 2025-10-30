import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";

export async function GET() {
  try {
    const indexName = process.env.PINECONE_INDEX || "chatpdf";
    const pc = new Pinecone();
    const info = await pc.describeIndex(indexName);
    return NextResponse.json({
      index: indexName,
      status: info.status,
      database: info.database,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "failed", stack: e?.stack },
      { status: 500 }
    );
  }
}

