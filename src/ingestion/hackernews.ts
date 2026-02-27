import axios from "axios";
import { SourceItemInput } from "../types/schemas";

export const fetchHackerNewsItems = async (): Promise<SourceItemInput[]> => {
  const response = await axios.get("https://hn.algolia.com/api/v1/search?tags=front_page");
  const hits: any[] = response.data.hits ?? [];
  return hits.slice(0, 20).map((hit) => ({
    source: "hackernews",
    sourceType: "growth_move",
    externalId: String(hit.objectID),
    title: hit.title ?? hit.story_title ?? "Untitled",
    url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
    author: hit.author,
    summary: hit.story_text ?? undefined,
    score: hit.points,
    comments: [],
    metadata: { numComments: hit.num_comments, createdAt: hit.created_at },
    rawPayload: hit
  }));
};
