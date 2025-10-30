import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getEmbeddings(text: string) {
  try {
    const dimEnv = process.env.PINECONE_DIMENSION || process.env.EMBEDDING_DIMENSION;
    const dimensions = dimEnv ? parseInt(dimEnv, 10) : undefined;
    const cleaned = (text ?? "").replace(/\n/g, " ");
    if (!cleaned.trim()) {
      // Return a zero vector matching the index dimension to avoid provider errors on empty input
      const size = dimensions ?? 1536;
      return new Array(size).fill(0);
    }
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: cleaned,
      ...(dimensions && { dimensions }),
    });
    return response.data[0].embedding as number[];
  } catch (error) {
    console.log("error calling openai embeddings api", error);
    throw error;
  }
}
