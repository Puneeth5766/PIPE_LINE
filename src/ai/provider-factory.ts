import { AIProvider } from "./provider.interface";
import { OpenAIProvider } from "./openai.provider";
import { GeminiProvider } from "./gemini.provider";
import { ClaudeProvider } from "./claude.provider";
import { PipelineConfig } from "../config/pipeline-config";

export const getProvider = (config: PipelineConfig): AIProvider => {
  if (config.ai_provider === "openai") {
    return new OpenAIProvider(config.model);
  }
  if (config.ai_provider === "gemini") {
    return new GeminiProvider(config.model);
  }
  return new ClaudeProvider(config.model);
};
