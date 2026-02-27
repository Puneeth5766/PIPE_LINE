import { Command } from "commander";
import { runPipeline, approveLatestIssue, forcePublishBypass } from "./services/pipeline.service";
import { logger } from "./utils/logger";
import "./config/env";

const program = new Command();

program.command("pipeline").action(async () => {
  const issueId = await runPipeline();
  logger.info({ issueId }, "Pipeline run completed");
  process.exit(0);
});

program.command("approve").action(async () => {
  await approveLatestIssue();
  logger.info("Issue approved and scheduled");
  process.exit(0);
});

program.command("force-publish").action(async () => {
  await forcePublishBypass();
  logger.warn("Force publish completed");
  process.exit(0);
});

program.parseAsync(process.argv).catch((error: unknown) => {
  logger.error({ err: error }, "CLI command failed");
  process.exit(1);
});
