import { z } from "zod";

import { SOURCE_TYPE_OPTIONS } from "@/features/sources/constants";

const sourceTypeValues = SOURCE_TYPE_OPTIONS.map((option) => option.value);

export const sourceSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  url: z.url("Valid source URL required."),
  type: z.enum(sourceTypeValues),
  isActive: z.boolean(),
});

export const sourceSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  query: z.string().trim().default(""),
});

export type SourceType = (typeof sourceTypeValues)[number];
