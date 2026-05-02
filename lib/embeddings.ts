import OpenAI from "openai";
import { db, pool } from "@/db";
import { knowledgeBases, documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// Split text into chunks of ~500 tokens
export function chunkText(text: string, chunkSize = 500): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current: string[] = [];

  for (const word of words) {
    current.push(word);
    if (current.length >= chunkSize) {
      chunks.push(current.join(" "));
      current = [];
    }
  }
  if (current.length > 0) {
    chunks.push(current.join(" "));
  }
  return chunks;
}

// Create embedding for a single text
export async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

// Process a file and store embeddings
export async function processAndStoreFile({
  agentId,
  userId,
  fileName,
  content,
}: {
  agentId: string;
  userId: string;
  fileName: string;
  content: string;
}) {
  // Get or create knowledge base for this agent
  let kb = await db
    .select()
    .from(knowledgeBases)
    .where(eq(knowledgeBases.agentId, agentId))
    .limit(1);

  let knowledgeBaseId: string;

  if (kb.length === 0) {
    const newKb = await db
      .insert(knowledgeBases)
      .values({
        id: randomUUID(),
        agentId,
        userId,
        name: `${agentId} knowledge base`,
      })
      .returning();
    knowledgeBaseId = newKb[0].id;
  } else {
    knowledgeBaseId = kb[0].id;
  }

  // Split into chunks
  const chunks = chunkText(content);
  console.log(`Processing ${chunks.length} chunks from ${fileName}`);

  // Create embeddings for each chunk and store
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await createEmbedding(chunks[i]);

    await db.insert(documents).values({
      id: randomUUID(),
      knowledgeBaseId,
      fileName,
      content: chunks[i],
      embedding,
      chunkIndex: i,
    });

    console.log(`Stored chunk ${i + 1}/${chunks.length}`);
  }

  return { chunks: chunks.length, knowledgeBaseId };
}

export async function searchKnowledgeBase({
  agentId,
  query,
  limit = 3,
}: {
  agentId: string
  query: string
  limit?: number
}) {
  try {
    const kb = await db
      .select()
      .from(knowledgeBases)
      .where(eq(knowledgeBases.agentId, agentId))
      .limit(1)

    if (kb.length === 0) return []

    const queryEmbedding = await createEmbedding(query)

    const result = await pool.query(
      `SELECT
        id,
        file_name,
        content,
        chunk_index,
        1 - (embedding <=> $1::vector) as similarity
      FROM documents
      WHERE knowledge_base_id = $2
      ORDER BY embedding <=> $1::vector
      LIMIT $3`,
      [`[${queryEmbedding.join(",")}]`, kb[0].id, limit]
    )

    return result.rows.map((r: any) => ({
      ...r,
      // truncate each chunk to 300 chars max
      content: r.content.slice(0, 300),
    }))
  } catch (error) {
    console.error("Search error:", error)
    return []
  }
}
