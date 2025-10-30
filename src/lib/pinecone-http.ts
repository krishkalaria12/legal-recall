type Metadata = Record<string, string | number | boolean | string[]>;

export type VectorRecord = {
  id: string;
  values: number[];
  metadata?: Metadata;
};

function getHost(): string {
  const host = process.env.PINECONE_HOST;
  if (!host) throw new Error("PINECONE_HOST is not set");
  return host.replace(/^https?:\/\//, "");
}

function getApiKey(): string {
  const key = process.env.PINECONE_API_KEY;
  if (!key) throw new Error("PINECONE_API_KEY is not set");
  return key;
}

export async function upsertVectors(
  records: VectorRecord[],
  namespace?: string
) {
  const host = getHost();
  const apiKey = getApiKey();
  const url = `https://${host}/vectors/upsert`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": apiKey,
    },
    body: JSON.stringify({ vectors: records, namespace }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Pinecone upsert failed: ${res.status} ${res.statusText} ${text}`);
  }
}

export async function queryVector(
  vector: number[],
  topK: number,
  namespace?: string,
  includeMetadata: boolean = true
) {
  const host = getHost();
  const apiKey = getApiKey();
  const url = `https://${host}/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": apiKey,
    },
    body: JSON.stringify({ vector, topK, includeMetadata, namespace }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Pinecone query failed: ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
}

