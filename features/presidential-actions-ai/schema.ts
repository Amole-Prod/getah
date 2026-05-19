import { z } from "zod";

export const articleActionAnalysisSchema = z.object({
  actionDate: z.string().nullable(),
  category: z.string().trim().min(2).max(80),
  confidence: z.number().min(0).max(1),
  impactLevel: z.enum(["low", "medium", "high", "critical"]),
  isPresidentialAction: z.boolean(),
  reasoning: z.string().trim().min(10).max(1000),
  sentiment: z.enum(["positive", "neutral", "negative", "mixed"]),
  summary: z.string().trim().min(10).max(600),
  title: z.string().trim().min(5).max(200),
});
