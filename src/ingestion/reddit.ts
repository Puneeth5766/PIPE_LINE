import axios from "axios";
import { SourceItemInput } from "../types/schemas";

export const fetchRedditItems = async (): Promise<SourceItemInput[]> => {
  const url = "https://www.reddit.com/r/startups/top.json?t=week&limit=25";
  const response = await axios.get(url, { headers: { "User-Agent": "founders-edge/1.0" } });
  const posts: any[] = response.data.data.children ?? [];

  return Promise.all(
    posts.map(async (p) => {
      const data = p.data;
      const commentsRes = await axios.get(`https://www.reddit.com${data.permalink}.json?limit=5`, {
        headers: { "User-Agent": "founders-edge/1.0" }
      });
      const comments = ((commentsRes.data?.[1]?.data?.children as any[]) ?? [])
        .filter((child) => child.kind === "t1")
        .slice(0, 5)
        .map((child) => ({ author: child.data.author, text: child.data.body }));

      return {
        source: "reddit",
        sourceType: "discussion",
        externalId: data.id,
        title: data.title,
        url: `https://reddit.com${data.permalink}`,
        author: data.author,
        summary: data.selftext?.slice(0, 400),
        score: data.score,
        comments,
        metadata: { subreddit: data.subreddit, numComments: data.num_comments },
        rawPayload: data
      };
    })
  );
};
