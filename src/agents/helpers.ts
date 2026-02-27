import { AIProvider } from "../ai/provider.interface";
import { prisma } from "../db/prisma";

export const runAgent = async <T>(params: {
  issueId: string;
  agentName: string;
  provider: AIProvider;
  systemPrompt: string;
  userPrompt: string;
  schema: string;
  inputJson: unknown;
  validate: (data: unknown) => T;
}): Promise<T> => {
  const response = await params.provider.generateStructured<T>({
    systemPrompt: params.systemPrompt,
    userPrompt: params.userPrompt,
    schema: params.schema
  });

  const parsed = params.validate(response.data);

  await prisma.agentOutput.create({
    data: {
      issueId: params.issueId,
      agentName: params.agentName,
      prompt: { systemPrompt: params.systemPrompt, userPrompt: params.userPrompt },
      inputJson: params.inputJson as object,
      outputJson: parsed as object,
      tokenUsage: response.tokenUsage as object
    }
  });

  return parsed;
};
