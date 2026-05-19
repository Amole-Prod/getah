import type { SourceType } from "@/features/sources/schemas";

export type SourceRecord = {
  id: string;
  name: string;
  base_url: string | null;
  source_type: SourceType;
  is_active: boolean;
  updated_at: string;
};

export type SourceFormValues = {
  id?: string;
  name: string;
  url: string;
  type: SourceType;
  isActive: boolean;
};

export type SourceFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof SourceFormValues, string[]>>;
};

export const initialSourceFormState: SourceFormState = {
  status: "idle",
};
