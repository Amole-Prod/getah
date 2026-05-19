import type { ActionAnalysisProvider } from "@/features/presidential-actions-ai/types";
import { fallbackProvider } from "@/features/presidential-actions-ai/providers/fallback-provider";
import { OpenAIActionAnalysisProvider } from "@/features/presidential-actions-ai/providers/openai-provider";

export function createActionAnalysisProvider(): ActionAnalysisProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  const baseURL = process.env.OPENAI_BASE_URL;

  if (!apiKey) {
    return fallbackProvider;
  }

  return new OpenAIActionAnalysisProvider(apiKey, model, baseURL);
}

export { fallbackProvider };
