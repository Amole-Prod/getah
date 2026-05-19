export type ActionStatus = "draft" | "published" | "archived";
export type ActionSentiment = "positive" | "neutral" | "negative" | "mixed";
export type ActionImpactLevel = "low" | "medium" | "high" | "critical";

export type PresidentialActionListItem = {
  action_date: string | null;
  ai_summary: Record<string, unknown> | null;
  id: string;
  impact_score: number | null;
  metadata: Record<string, unknown> | null;
  primary_news_item_id: string | null;
  published_at: string | null;
  slug: string;
  source_id: string | null;
  status: ActionStatus;
  summary: string | null;
  title: string;
};

export type PresidentialActionDetail = PresidentialActionListItem & {
  description: string | null;
  source_name: string | null;
  related_news_url: string | null;
  confidence: number | null;
  impact_level: ActionImpactLevel;
  sentiment: ActionSentiment;
  category: string;
  provider: string | null;
  reasoning: string | null;
};

export type PresidentialActionDashboardStats = {
  drafts: number;
  highImpact: number;
  published: number;
  total: number;
};

export type PresidentialActionTrendPoint = {
  date: string;
  total: number;
};

export type PresidentialActionCategoryPoint = {
  category: string;
  total: number;
};

export type PresidentialActionFilters = {
  category: string;
  dateFrom: string;
  dateTo: string;
  impactLevel: string;
  sentiment: string;
};

export type PresidentialActionFormValues = {
  actionDate: string;
  category: string;
  description: string;
  id: string;
  impactLevel: ActionImpactLevel;
  sentiment: ActionSentiment;
  status: ActionStatus;
  summary: string;
  title: string;
};

export type PresidentialActionFormState = {
  fieldErrors?: Partial<Record<keyof PresidentialActionFormValues, string[]>>;
  message?: string;
  status: "idle" | "success" | "error";
};

export const initialPresidentialActionFormState: PresidentialActionFormState = {
  status: "idle",
};
