import OpenAI from "openai";

import { buildPresidentialActionPrompt } from "@/features/presidential-actions-ai/prompt";
import { articleActionAnalysisSchema } from "@/features/presidential-actions-ai/schema";
import type {
  ActionAnalysisProvider,
  NewsArticleForAnalysis,
} from "@/features/presidential-actions-ai/types";

export class OpenAIActionAnalysisProvider implements ActionAnalysisProvider {
  private client: OpenAI;
  name: string;

  constructor(
    apiKey: string,
    model = "gpt-4.1-mini",
    baseURL?: string,
  ) {
    this.client = new OpenAI({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    });
    this.name = baseURL ? `openai-compatible:${model}` : `openai:${model}`;
    this.model = model;
  }

  private model: string;

  async analyze(article: NewsArticleForAnalysis) {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are strict structured extractor for presidential action detection. Output valid JSON only.",
        },
        {
          role: "user",
          content: buildPresidentialActionPrompt(article),
        },
      ],
    });

    const content = completion.choices[0]?.message.content;

    if (!content) {
      throw new Error("OpenAI returned empty response");
    }

    return articleActionAnalysisSchema.parse(JSON.parse(content));
  }
}
