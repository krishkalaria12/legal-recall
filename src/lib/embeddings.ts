import { google } from "@ai-sdk/google";

export async function getEmbeddings(text: string) {
  try {
    const dimEnv = process.env.PINECONE_DIMENSION || process.env.EMBEDDING_DIMENSION;
    const dimensions = dimEnv ? parseInt(dimEnv, 10) : undefined;
    const cleaned = (text ?? "").replace(/\n/g, " ");
    if (!cleaned.trim()) {
      const size = dimensions ?? 1536;
      return new Array(size).fill(0);
    }
    const model = google.embedding("gemini-embedding-001");
    const response = await model.doEmbed({
      values: [cleaned],
      ...(dimensions && { providerOptions: { google: { outputDimensionality: dimensions } } }),
    });
    return response.embeddings[0] as number[];
  } catch (error) {
    console.log("error calling google embeddings api", error);
    throw error;
  }
}
