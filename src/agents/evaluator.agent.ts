import { AIProvider } from "../ai/provider.interface";
import { EvaluatorOutput, evaluatorOutputSchema } from "../types/schemas";
import { runAgent } from "./helpers";

export const runEvaluatorAgent = async (
  issueId: string,
  provider: AIProvider,
  markdown: string
): Promise<EvaluatorOutput> => {
  return runAgent({
    issueId,
    agentName: "EvaluatorAgent",
    provider,
    systemPrompt:
      "You are Evaluator Agent. Score 1-10 for actionability, tone, wordCountFit, specificity and overall. Penalize fluff and AI jargon.",
    userPrompt: JSON.stringify({ markdown }),
    schema:
      '{"actionability":1,"tone":1,"wordCountFit":1,"specificity":1,"overall":1,"feedback":"string"}',
    inputJson: { markdown },
    validate: (data) => evaluatorOutputSchema.parse(data)
  });
};
