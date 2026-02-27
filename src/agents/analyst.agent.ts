import { AIProvider } from "../ai/provider.interface";
import { runAgent } from "./helpers";
import { AnalystOutput, analystOutputSchema, SourceItemInput } from "../types/schemas";

export const runAnalystAgent = async (
  issueId: string,
  provider: AIProvider,
  selectedToolItem: SourceItemInput
): Promise<AnalystOutput> => {
  return runAgent({
    issueId,
    agentName: "AnalystAgent",
    provider,
    systemPrompt: "You are Analyst Agent. Produce a tactical deep dive for founders.",
    userPrompt: JSON.stringify({ selectedToolItem }),
    schema:
      '{"title":"string","keyInsight":"string","tacticalBreakdown":["string"],"pitfalls":["string"],"founderActionPlan":["string"]}',
    inputJson: { selectedToolItem },
    validate: (data) => analystOutputSchema.parse(data)
  });
};
