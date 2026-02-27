import { z } from "zod";

export const sourceItemSchema = z.object({
  source: z.string(),
  sourceType: z.string(),
  externalId: z.string(),
  title: z.string(),
  url: z.string().url(),
  author: z.string().optional(),
  summary: z.string().optional(),
  score: z.number().int().optional(),
  comments: z.array(z.object({ author: z.string().optional(), text: z.string() })).default([]),
  metadata: z.record(z.any()).default({}),
  rawPayload: z.record(z.any())
});

export const scoutOutputSchema = z.object({
  selectedTool: z.object({ reason: z.string(), sourceItemId: z.string() }),
  selectedGrowthMove: z.object({ reason: z.string(), sourceItemId: z.string() }),
  selectedFounderStory: z.object({ reason: z.string(), sourceItemId: z.string() })
});

export const analystOutputSchema = z.object({
  title: z.string(),
  keyInsight: z.string(),
  tacticalBreakdown: z.array(z.string()).min(3).max(6),
  pitfalls: z.array(z.string()).min(2).max(5),
  founderActionPlan: z.array(z.string()).min(3).max(6)
});

export const voiceOutputSchema = z.object({
  title: z.string(),
  markdown: z.string().min(800),
  excerpt: z.string().max(240)
});

export const evaluatorOutputSchema = z.object({
  actionability: z.number().min(1).max(10),
  tone: z.number().min(1).max(10),
  wordCountFit: z.number().min(1).max(10),
  specificity: z.number().min(1).max(10),
  overall: z.number().min(1).max(10),
  feedback: z.string()
});

export type SourceItemInput = z.infer<typeof sourceItemSchema>;
export type ScoutOutput = z.infer<typeof scoutOutputSchema>;
export type AnalystOutput = z.infer<typeof analystOutputSchema>;
export type VoiceOutput = z.infer<typeof voiceOutputSchema>;
export type EvaluatorOutput = z.infer<typeof evaluatorOutputSchema>;
