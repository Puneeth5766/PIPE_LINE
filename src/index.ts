import cron from "node-cron";
import { runPipeline } from "./services/pipeline.service";
import { logger } from "./utils/logger";
import "./config/env";

cron.schedule(
  "30 22 * * 2",
  async () => {
    try {
      const issueId = await runPipeline();
      logger.info({ issueId }, "Scheduled pipeline run successful");
    } catch (error) {
      logger.error({ err: error }, "Scheduled pipeline run failed");
    }
  },
  { timezone: "Asia/Kolkata" }
);

logger.info("Founder’s Edge cron runner started (Tuesday 10:30 PM IST).");
