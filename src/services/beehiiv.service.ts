import axios from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const client = axios.create({
  baseURL: "https://api.beehiiv.com/v2",
  headers: {
    Authorization: `Bearer ${env.BEEHIIV_API_KEY}`,
    "Content-Type": "application/json"
  }
});

export const createBeehiivDraft = async (title: string, markdown: string): Promise<string> => {
  try {
    const response = await client.post(`/publications/${env.BEEHIIV_PUBLICATION_ID}/posts`, {
      title,
      content_tags: ["founders-edge", "weekly"],
      status: "draft",
      body_markdown: markdown
    });
    logger.info({ beehiivResponse: response.data }, "Beehiiv draft created");
    return response.data.data.id as string;
  } catch (error) {
    logger.error({ err: error }, "Beehiiv draft creation failed");
    throw error;
  }
};

export const scheduleBeehiivPost = async (postId: string, scheduledAtIso: string): Promise<void> => {
  try {
    const response = await client.patch(
      `/publications/${env.BEEHIIV_PUBLICATION_ID}/posts/${postId}`,
      { status: "scheduled", publish_at: scheduledAtIso }
    );
    logger.info({ beehiivScheduleResponse: response.data, postId }, "Beehiiv post scheduled");
  } catch (error) {
    logger.error({ err: error, postId }, "Beehiiv scheduling failed");
    throw error;
  }
};
