import OpenAI from "openai";

import type {
  WeeklyReportDraft,
  WeeklyReportProvider,
  WeeklyReportProviderResult,
} from "@/features/weekly-reports/types";
import {
  buildFallbackExecutiveSummary,
  buildFallbackKeyFindings,
} from "@/features/weekly-reports/utils";

function buildPrompt(draft: WeeklyReportDraft) {
  return [
    "You generate concise weekly government action reports.",
    "Return strict JSON only.",
    'Shape: {"executiveSummary": string, "keyFindings": string[] }',
    "Rules:",
    "- Focus on weekly presidential actions.",
    "- Mention policy direction, top categories, impact, and public tone.",
    "- Keep executiveSummary under 120 words.",
    "- keyFindings length 3 to 5.",
    `weekStart: ${draft.weekStart}`,
    `weekEnd: ${draft.weekEnd}`,
    `metrics: ${JSON.stringify(draft.metrics)}`,
    `actions: ${JSON.stringify(
      draft.actions.slice(0, 18).map((item) => ({
        actionDate: item.action_date,
        category: (item.metadata as Record<string, unknown> | null)?.category,
        impactScore: item.impact_score,
        sentiment: (item.metadata as Record<string, unknown> | null)?.sentiment,
        summary: item.summary,
        title: item.title,
      })),
    )}`,
  ].join("\n");
}

class OpenAIWeeklyReportProvider implements WeeklyReportProvider {
  private client: OpenAI;
  private model: string;
  name: string;

  constructor(apiKey: string, model = "gpt-4.1-mini", baseURL?: string) {
    this.client = new OpenAI({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    });
    this.model = model;
    this.name = baseURL ? `openai-compatible:${model}` : `openai:${model}`;
  }

  async generate(
    draft: WeeklyReportDraft,
  ): Promise<WeeklyReportProviderResult> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write structured weekly government reports. Output JSON only.",
        },
        {
          role: "user",
          content: buildPrompt(draft),
        },
      ],
    });

    const content = completion.choices[0]?.message.content;

    if (!content) {
      throw new Error("OpenAI returned empty weekly report response");
    }

    const parsed = JSON.parse(content) as WeeklyReportProviderResult;

    return {
      executiveSummary: parsed.executiveSummary,
      keyFindings: parsed.keyFindings,
    };
  }
}

export function createWeeklyReportProvider(): WeeklyReportProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  const baseURL = process.env.OPENAI_BASE_URL;

  if (apiKey) {
    return new OpenAIWeeklyReportProvider(apiKey, model, baseURL);
  }

  return {
    name: "fallback-summary",
    async generate(draft: WeeklyReportDraft) {
      return {
        executiveSummary: buildFallbackExecutiveSummary(draft.metrics),
        keyFindings: buildFallbackKeyFindings(draft.metrics),
      };
    },
  };
}
