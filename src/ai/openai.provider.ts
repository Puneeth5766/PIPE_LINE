import OpenAI from "openai";
import { AIProvider, GenerationResult } from "./provider.interface";
import { env } from "../config/env";

export class OpenAIProvider implements AIProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(model: string) {
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    this.model = model;
  }

  async generateStructured<T>(params: { systemPrompt: string; userPrompt: string; schema: string }): Promise<GenerationResult<T>> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `${params.systemPrompt}\nReturn only valid JSON that matches schema: ${params.schema}` },
        { role: "user", content: params.userPrompt }
      ]
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as T;
    const usage = completion.usage;

    return {
      data: parsed,
      rawResponse: completion,
      tokenUsage: {
        inputTokens: usage?.prompt_tokens ?? 0,
        outputTokens: usage?.completion_tokens ?? 0,
        totalTokens: usage?.total_tokens ?? 0
      }
    };
  }

  async embed(text: string, model: string): Promise<number[]> {
    const response = await this.client.embeddings.create({ model, input: text });
    return response.data[0]?.embedding ?? [];
  }
}
