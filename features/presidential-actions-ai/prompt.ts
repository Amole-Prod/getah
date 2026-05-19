import type { NewsArticleForAnalysis } from "@/features/presidential-actions-ai/types";

function compactText(value: string | null | undefined, fallback = "-") {
  return value?.trim() || fallback;
}

export function buildPresidentialActionPrompt(article: NewsArticleForAnalysis) {
  return [
    "You analyze Indonesian political news.",
    "Goal: detect whether article is directly related to presidential actions, policies, orders, official statements, cabinet decisions, or formal government interventions led by president.",
    "Return strict JSON only.",
    "Rules:",
    "1. Set isPresidentialAction=true only if article materially concerns presidential action or decision, not generic politics.",
    "2. title must be concise action title in Indonesian or source language.",
    "3. summary must capture action, actor, expected effect.",
    "4. category must be short policy/action category like ekonomi, hukum, luar negeri, sosial, infrastruktur, energi.",
    "5. impactLevel one of low|medium|high|critical.",
    "6. sentiment one of positive|neutral|negative|mixed toward action coverage.",
    "7. confidence 0..1.",
    "8. actionDate use ISO date when clear, else null.",
    "9. reasoning short and specific.",
    "JSON shape:",
    '{"isPresidentialAction":boolean,"title":string,"summary":string,"category":string,"impactLevel":"low|medium|high|critical","sentiment":"positive|neutral|negative|mixed","confidence":number,"actionDate":string|null,"reasoning":string}',
    "Article:",
    `headline: ${compactText(article.headline)}`,
    `summary: ${compactText(article.summary)}`,
    `excerpt: ${compactText(article.excerpt)}`,
    `published_at: ${compactText(article.published_at)}`,
    `url: ${compactText(article.canonical_url)}`,
    `content: ${compactText(article.content_text).slice(0, 6000)}`,
  ].join("\n");
}
