import axios from "axios";
import { AIProvider, GenerationResult } from "./provider.interface";
import { env } from "../config/env";

export class GeminiProvider implements AIProvider {
  private readonly model: string;

  constructor(model: string) {
    this.model = model;
  }

  async generateStructured<T>(params: { systemPrompt: string; userPrompt: string; schema: string }): Promise<GenerationResult<T>> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${env.GEMINI_API_KEY}`;
    const response = await axios.post(url, {
      generationConfig: { responseMimeType: "application/json" },
      contents: [{ role: "user", parts: [{ text: `${params.systemPrompt}\nSchema: ${params.schema}\n\n${params.userPrompt}` }] }]
    });

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    return {
      data: JSON.parse(text) as T,
      rawResponse: response.data,
      tokenUsage: {
        inputTokens: response.data.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: response.data.usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: response.data.usageMetadata?.totalTokenCount ?? 0
      }
    };
  }

  async embed(text: string, _model: string): Promise<number[]> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${env.GEMINI_API_KEY}`;
    const response = await axios.post(url, { content: { parts: [{ text }] } });
    return response.data.embedding?.values ?? [];
  }
}
