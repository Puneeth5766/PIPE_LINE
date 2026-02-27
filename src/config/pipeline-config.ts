import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const pipelineConfigSchema = z.object({
  ai_provider: z.enum(["openai", "gemini", "claude"]),
  model: z.string().min(1),
  embedding_model: z.string().min(1),
  similarity_threshold: z.number().min(0).max(1),
  evaluation_min_score: z.number().min(1).max(10),
  publish_time: z.string().min(1),
  regeneration_limit: z.number().int().min(0).max(3)
});

export type PipelineConfig = z.infer<typeof pipelineConfigSchema>;

export const loadPipelineConfig = (): PipelineConfig => {
  const filePath = path.resolve(process.cwd(), "pipeline_config.json");
  const raw = fs.readFileSync(filePath, "utf8");
  return pipelineConfigSchema.parse(JSON.parse(raw));
};
