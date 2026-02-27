import axios from "axios";
import OpenAI from "openai";
import { AIProvider, GenerationResult } from "./provider.interface";
import { env } from "../config/env";

export class ClaudeProvider implements AIProvider {
  private readonly model: string;
  private readonly embeddingClient: OpenAI;

  constructor(model: string) {
    this.model = model;
    this.embeddingClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  async generateStructured<T>(params: { systemPrompt: string; userPrompt: string; schema: string }): Promise<GenerationResult<T>> {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: this.model,
        max_tokens: 2500,
        system: `${params.systemPrompt}\nReturn valid JSON only. Schema: ${params.schema}`,
        messages: [{ role: "user", content: params.userPrompt }]
      },
      {
        headers: {
          "x-api-key": env.CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        }
      }
    );

    const textBlock = (response.data.content as Array<{ type: string; text?: string }>).find((c) => c.type === "text");
    const text = textBlock?.text ?? "{}";

    return {
      data: JSON.parse(text) as T,
      rawResponse: response.data,
      tokenUsage: {
        inputTokens: response.data.usage?.input_tokens ?? 0,
        outputTokens: response.data.usage?.output_tokens ?? 0,
        totalTokens: (response.data.usage?.input_tokens ?? 0) + (response.data.usage?.output_tokens ?? 0)
      }
    };
  }

  async embed(text: string, model: string): Promise<number[]> {
    const response = await this.embeddingClient.embeddings.create({ model, input: text });
    return response.data[0]?.embedding ?? [];
  }
}
