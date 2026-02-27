import { AIProvider } from "../ai/provider.interface";
import { runAgent } from "./helpers";
import { scoutOutputSchema, SourceItemInput } from "../types/schemas";

export const runScoutAgent = async (issueId: string, provider: AIProvider, sourceItems: SourceItemInput[]) => {
  return runAgent({
    issueId,
    agentName: "ScoutAgent",
    provider,
    systemPrompt: "You are Scout Agent. Select exactly one tool, one growth move, and one founder story from source items.",
    userPrompt: JSON.stringify({ sourceItems }),
    schema: '{"selectedTool":{"reason":"string","sourceItemId":"string"},"selectedGrowthMove":{"reason":"string","sourceItemId":"string"},"selectedFounderStory":{"reason":"string","sourceItemId":"string"}}',
    inputJson: { sourceItems },
    validate: (data) => scoutOutputSchema.parse(data)
  });
};
