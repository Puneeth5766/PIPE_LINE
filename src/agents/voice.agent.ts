import { AIProvider } from "../ai/provider.interface";
import { AnalystOutput, ScoutOutput, SourceItemInput, VoiceOutput, voiceOutputSchema } from "../types/schemas";
import { runAgent } from "./helpers";

export const runVoiceAgent = async (
  issueId: string,
  provider: AIProvider,
  scout: ScoutOutput,
  analyst: AnalystOutput,
  sourceItems: SourceItemInput[]
): Promise<VoiceOutput> => {
  return runAgent({
    issueId,
    agentName: "VoiceAgent",
    provider,
    systemPrompt:
      "You are Voice Agent for Founder's Edge Weekly. Write concise, specific markdown under 7-minute read and avoid AI jargon.",
    userPrompt: JSON.stringify({ scout, analyst, sourceItems }),
    schema: '{"title":"string","markdown":"string","excerpt":"string"}',
    inputJson: { scout, analyst },
    validate: (data) => voiceOutputSchema.parse(data)
  });
};
