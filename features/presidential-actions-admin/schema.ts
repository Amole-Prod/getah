import { z } from "zod";

import {
  ACTION_IMPACT_OPTIONS,
  ACTION_SENTIMENT_OPTIONS,
  ACTION_STATUS_OPTIONS,
} from "@/features/presidential-actions-admin/constants";

export const presidentialActionFiltersSchema = z.object({
  category: z.string().trim().default(""),
  dateFrom: z.string().trim().default(""),
  dateTo: z.string().trim().default(""),
  impactLevel: z.string().trim().default(""),
  sentiment: z.string().trim().default(""),
});

export const presidentialActionFormSchema = z.object({
  actionDate: z.string().trim().default(""),
  category: z.string().trim().min(2, "Category must be at least 2 characters."),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters."),
  id: z.uuid(),
  impactLevel: z.enum(ACTION_IMPACT_OPTIONS.map((item) => item.value)),
  sentiment: z.enum(ACTION_SENTIMENT_OPTIONS.map((item) => item.value)),
  status: z.enum(ACTION_STATUS_OPTIONS.map((item) => item.value)),
  summary: z.string().trim().min(10, "Summary must be at least 10 characters."),
  title: z.string().trim().min(5, "Title must be at least 5 characters."),
});
