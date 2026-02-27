import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  CLAUDE_API_KEY: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_CHAT_ID: z.string().min(1),
  BEEHIIV_API_KEY: z.string().min(1),
  BEEHIIV_PUBLICATION_ID: z.string().min(1),
  LOG_LEVEL: z.string().default("info")
});

export const env = envSchema.parse(process.env);
