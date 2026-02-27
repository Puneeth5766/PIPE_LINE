import Parser from "rss-parser";
import { SourceItemInput } from "../types/schemas";

const parser = new Parser();

export const fetchProductHuntItems = async (): Promise<SourceItemInput[]> => {
  const feed = await parser.parseURL("https://www.producthunt.com/feed");
  return (feed.items ?? []).slice(0, 15).map((item) => ({
    source: "producthunt",
    sourceType: "tool",
    externalId: item.guid ?? item.id ?? item.link ?? item.title ?? crypto.randomUUID(),
    title: item.title ?? "Untitled",
    url: item.link ?? "https://www.producthunt.com",
    author: item.creator ?? undefined,
    summary: item.contentSnippet ?? undefined,
    comments: [],
    metadata: { pubDate: item.pubDate ?? null },
    rawPayload: item
  }));
};
