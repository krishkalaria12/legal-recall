import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";
import { queryVector } from "./pinecone-http";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  try {
    const namespace = convertToAscii(fileKey);
    const result = await queryVector(embeddings, 5, namespace, true);
    return result.matches || [];
  } catch (error) {
    console.log("error querying embeddings", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

  // Lower threshold from 0.7 to 0.6 for better recall
  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.6
  );

  console.log(`[Context] Found ${matches.length} total matches, ${qualifyingDocs.length} above threshold`);

  if (qualifyingDocs.length === 0) {
    console.warn(`[Context] No qualifying matches found for query. Top match score: ${matches[0]?.score || 'none'}`);
  }

  type Metadata = {
    text: string;
    pageNumber: number;
  };

  let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);
  // Increase context length from 3000 to 5000 for legal documents
  const context = docs.join("\n").substring(0, 5000);

  console.log(`[Context] Returning ${context.length} characters of context`);

  return context;
}
