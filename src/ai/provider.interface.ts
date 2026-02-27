export interface GenerationResult<T> {
  data: T;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  rawResponse: unknown;
}

export interface AIProvider {
  generateStructured<T>(params: { systemPrompt: string; userPrompt: string; schema: string }): Promise<GenerationResult<T>>;
  embed(text: string, model: string): Promise<number[]>;
}
