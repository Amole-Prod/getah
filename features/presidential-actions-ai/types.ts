export type NewsArticleForAnalysis = {
  canonical_url: string;
  content_text: string | null;
  excerpt: string | null;
  headline: string;
  id: string;
  metadata: Record<string, unknown> | null;
  published_at: string | null;
  source_id: string;
  summary: string | null;
};

export type ActionImpactLevel = "low" | "medium" | "high" | "critical";

export type ArticleActionAnalysis = {
  actionDate: string | null;
  category: string;
  confidence: number;
  impactLevel: ActionImpactLevel;
  isPresidentialAction: boolean;
  reasoning: string;
  sentiment: "positive" | "neutral" | "negative" | "mixed";
  summary: string;
  title: string;
};

export type ActionAnalysisProvider = {
  analyze(article: NewsArticleForAnalysis): Promise<ArticleActionAnalysis>;
  name: string;
};

export type ActionAnalysisRunItem = {
  actionCreated: boolean;
  articleId: string;
  category: string | null;
  confidence: number;
  error?: string;
  provider: string;
  related: boolean;
};

export type ActionAnalysisRunSummary = {
  actionsCreated: number;
  analyzed: number;
  errors: string[];
  provider: string;
  relatedDetected: number;
  results: ActionAnalysisRunItem[];
};
