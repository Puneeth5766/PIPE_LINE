import axios from "axios";
import cheerio from "cheerio";
import { SourceItemInput } from "../types/schemas";

export const fetchGitHubTrendingItems = async (): Promise<SourceItemInput[]> => {
  const response = await axios.get("https://github.com/trending");
  const $ = cheerio.load(response.data);
  const items: SourceItemInput[] = [];

  $("article.Box-row").each((_, el) => {
    const repoPath = $(el).find("h2 a").attr("href")?.trim();
    if (!repoPath) {
      return;
    }
    const title = repoPath.replace("/", "").trim();
    items.push({
      source: "github",
      sourceType: "tool",
      externalId: title,
      title,
      url: `https://github.com${repoPath}`,
      summary: $(el).find("p").text().trim() || undefined,
      comments: [],
      metadata: {
        language: $(el).find('[itemprop="programmingLanguage"]').text().trim(),
        starsToday: $(el).find("span.d-inline-block.float-sm-right").text().trim()
      },
      rawPayload: { html: $(el).html() ?? "" }
    });
  });

  return items.slice(0, 15);
};
