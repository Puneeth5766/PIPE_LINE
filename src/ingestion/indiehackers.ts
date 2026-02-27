import axios from "axios";
import cheerio from "cheerio";
import { SourceItemInput } from "../types/schemas";

export const fetchIndieHackersItems = async (): Promise<SourceItemInput[]> => {
  const response = await axios.get("https://www.indiehackers.com/posts");
  const $ = cheerio.load(response.data);
  const items: SourceItemInput[] = [];

  $("a.group").each((_, el) => {
    const href = $(el).attr("href");
    const title = $(el).find("h3").first().text().trim();
    if (!href || !title) {
      return;
    }
    items.push({
      source: "indiehackers",
      sourceType: "founder_story",
      externalId: href,
      title,
      url: `https://www.indiehackers.com${href}`,
      summary: $(el).find("p").first().text().trim() || undefined,
      comments: [],
      metadata: {},
      rawPayload: { html: $(el).html() ?? "" }
    });
  });

  return items.slice(0, 15);
};
