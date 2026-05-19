export type WeeklyReportActionRow = {
  action_date: string | null;
  description: string | null;
  id: string;
  impact_score: number | null;
  metadata: Record<string, unknown> | null;
  primary_news_item_id: string | null;
  published_at: string | null;
  status: "draft" | "published" | "archived";
  summary: string | null;
  title: string;
};

export type WeeklyReportMetrics = {
  byCategory: Array<{ category: string; total: number }>;
  byImpact: Array<{ impactLevel: string; total: number }>;
  bySentiment: Array<{ sentiment: string; total: number }>;
  highImpactCount: number;
  publishedCount: number;
  totalActions: number;
};

export type WeeklyReportDraft = {
  actions: WeeklyReportActionRow[];
  executiveSummary: string;
  keyFindings: string[];
  metrics: WeeklyReportMetrics;
  sourceSnapshot: Record<string, unknown>;
  title: string;
  weekEnd: string;
  weekStart: string;
};

export type WeeklyReportProviderResult = {
  executiveSummary: string;
  keyFindings: string[];
};

export type WeeklyReportProvider = {
  generate(draft: WeeklyReportDraft): Promise<WeeklyReportProviderResult>;
  name: string;
};

export type WeeklyReportRecord = {
  executive_summary: string | null;
  generated_by: string | null;
  generation_model: string | null;
  id: string;
  key_findings: unknown;
  metrics: unknown;
  published_at: string | null;
  report_week_end: string;
  report_week_start: string;
  slug: string;
  source_snapshot: unknown;
  status: "draft" | "published" | "archived";
  title: string;
};

export type WeeklyReportSummary = {
  reportId: string;
  slug: string;
  status: "draft" | "published" | "archived";
  title: string;
  weekEnd: string;
  weekStart: string;
};
