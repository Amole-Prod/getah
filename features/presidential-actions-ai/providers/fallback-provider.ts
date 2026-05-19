import type {
  ActionAnalysisProvider,
  ArticleActionAnalysis,
  NewsArticleForAnalysis,
} from "@/features/presidential-actions-ai/types";

const presidentialKeywords = [
  "presiden",
  "kepresidenan",
  "istana",
  "perintah presiden",
  "instruksi presiden",
  "keputusan presiden",
  "jokowi",
  "prabowo",
  "government regulation",
  "kabinet",
];

const categoryRules = [
  {
    category: "ekonomi",
    keywords: ["ekonomi", "investasi", "pajak", "industri"],
  },
  {
    category: "hukum",
    keywords: ["hukum", "kejaksaan", "korupsi", "mahkamah"],
  },
  {
    category: "luar negeri",
    keywords: ["diplomasi", "luar negeri", "internasional"],
  },
  {
    category: "infrastruktur",
    keywords: ["jalan", "bandara", "pelabuhan", "proyek"],
  },
  { category: "energi", keywords: ["energi", "listrik", "bbm", "pertamina"] },
  {
    category: "sosial",
    keywords: ["bansos", "pendidikan", "kesehatan", "masyarakat"],
  },
];

function detectCategory(text: string) {
  for (const rule of categoryRules) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      return rule.category;
    }
  }

  return "pemerintahan";
}

function detectImpactLevel(text: string): ArticleActionAnalysis["impactLevel"] {
  if (/(nasional|krisis|darurat|besar|strategis)/.test(text)) {
    return "high";
  }

  if (/(program|kebijakan|regulasi|anggaran)/.test(text)) {
    return "medium";
  }

  return "low";
}

function detectSentiment(text: string): ArticleActionAnalysis["sentiment"] {
  if (/(kritik|gagal|kontroversi|protes|negatif)/.test(text)) {
    return "negative";
  }

  if (/(dukung|apresiasi|positif|berhasil)/.test(text)) {
    return "positive";
  }

  if (/(debat|campuran|beragam)/.test(text)) {
    return "mixed";
  }

  return "neutral";
}

export const fallbackProvider: ActionAnalysisProvider = {
  name: "fallback-heuristic",
  async analyze(article: NewsArticleForAnalysis) {
    const text = [
      article.headline,
      article.summary,
      article.excerpt,
      article.content_text,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const related = presidentialKeywords.some((keyword) =>
      text.includes(keyword),
    );

    return {
      actionDate: article.published_at
        ? article.published_at.slice(0, 10)
        : null,
      category: detectCategory(text),
      confidence: related ? 0.62 : 0.22,
      impactLevel: detectImpactLevel(text),
      isPresidentialAction: related,
      reasoning: related
        ? "Keyword match indicates direct presidential or cabinet action coverage."
        : "No strong signal of direct presidential action in article text.",
      sentiment: detectSentiment(text),
      summary:
        article.summary ??
        article.excerpt ??
        article.content_text?.slice(0, 280) ??
        article.headline,
      title: article.headline,
    };
  },
};
