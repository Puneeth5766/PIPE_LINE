import crypto from "node:crypto";
import { prisma } from "../db/prisma";

const toPgVector = (embedding: number[]): string => `[${embedding.join(",")}]`;

export const upsertIssueEmbedding = async (issueId: string, markdown: string, embedding: number[]): Promise<void> => {
  const contentHash = crypto.createHash("sha256").update(markdown).digest("hex");
  await prisma.$executeRawUnsafe(
    `INSERT INTO "VectorMemory" (id, "issueId", "contentHash", embedding, "createdAt") VALUES (gen_random_uuid()::text, $1, $2, $3::vector, NOW()) ON CONFLICT ("contentHash") DO NOTHING`,
    issueId,
    contentHash,
    toPgVector(embedding)
  );
};

export const calculateMaxSimilarity = async (embedding: number[]): Promise<number> => {
  const rows = await prisma.$queryRawUnsafe<Array<{ similarity: number }>>(
    `SELECT COALESCE(MAX(1 - (embedding <=> $1::vector)), 0) AS similarity FROM "VectorMemory"`,
    toPgVector(embedding)
  );
  return rows[0]?.similarity ?? 0;
};
