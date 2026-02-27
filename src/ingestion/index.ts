import { prisma } from "../db/prisma";
import { sourceItemSchema, SourceItemInput } from "../types/schemas";
import { fetchRedditItems } from "./reddit";
import { fetchProductHuntItems } from "./producthunt";
import { fetchHackerNewsItems } from "./hackernews";
import { fetchGitHubTrendingItems } from "./github";
import { fetchIndieHackersItems } from "./indiehackers";
import { logger } from "../utils/logger";

export const ingestAllSources = async (): Promise<SourceItemInput[]> => {
  const batches = await Promise.all([
    fetchRedditItems(),
    fetchProductHuntItems(),
    fetchHackerNewsItems(),
    fetchGitHubTrendingItems(),
    fetchIndieHackersItems()
  ]);
  const items = batches.flat().map((item) => sourceItemSchema.parse(item));

  for (const item of items) {
    await prisma.sourceItem.upsert({
      where: { source_externalId: { source: item.source, externalId: item.externalId } },
      update: {
        title: item.title,
        url: item.url,
        author: item.author,
        summary: item.summary,
        score: item.score,
        comments: item.comments,
        metadata: item.metadata,
        rawPayload: item.rawPayload
      },
      create: {
        source: item.source,
        sourceType: item.sourceType,
        externalId: item.externalId,
        title: item.title,
        url: item.url,
        author: item.author,
        summary: item.summary,
        score: item.score,
        comments: item.comments,
        metadata: item.metadata,
        rawPayload: item.rawPayload
      }
    });
  }
  logger.info({ itemCount: items.length }, "Ingestion completed");
  return items;
};
