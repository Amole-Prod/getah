import "server-only";

import { logger } from "@/lib/logging/logger";
import {
  createActionAnalysisProvider,
  fallbackProvider,
} from "@/features/presidential-actions-ai/providers";
import {
  attachCategoryToAction,
  ensureCategory,
  listNewsArticlesForActionAnalysis,
  markArticleActionAnalysisStatus,
  upsertActionSentiment,
  upsertPresidentialActionFromArticle,
} from "@/features/presidential-actions-ai/repository";
import { withRetry } from "@/features/presidential-actions-ai/retry";
import type {
  ActionAnalysisRunItem,
  ActionAnalysisRunSummary,
} from "@/features/presidential-actions-ai/types";

async function analyzeArticle(
  articleId: string,
  providerName: string,
  fn: () => Promise<ActionAnalysisRunItem>,
) {
  try {
    return await fn();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown AI analysis error";
    await markArticleActionAnalysisStatus(articleId, providerName, "failed", 0);

    return {
      actionCreated: false,
      articleId,
      category: null,
      confidence: 0,
      error: message,
      provider: providerName,
      related: false,
    };
  }
}

export async function runPresidentialActionAnalysis(
  limit = 20,
): Promise<ActionAnalysisRunSummary> {
  const provider = createActionAnalysisProvider();
  const articles = await listNewsArticlesForActionAnalysis(limit);

  logger.info("Presidential action analysis started", {
    articleCount: articles.length,
    provider: provider.name,
  });

  const results = await Promise.all(
    articles.map((article) =>
      analyzeArticle(article.id, provider.name, async () => {
        let activeProvider = provider;

        let analysis;
        try {
          analysis = await withRetry(() => activeProvider.analyze(article));
        } catch (error) {
          logger.warn("Primary AI provider failed, using fallback", {
            articleId: article.id,
            message:
              error instanceof Error ? error.message : "Unknown provider error",
            provider: provider.name,
          });

          activeProvider = fallbackProvider;
          analysis = await withRetry(
            () => activeProvider.analyze(article),
            1,
            250,
          );
        }

        await markArticleActionAnalysisStatus(
          article.id,
          activeProvider.name,
          "completed",
          analysis.confidence,
        );

        if (!analysis.isPresidentialAction) {
          return {
            actionCreated: false,
            articleId: article.id,
            category: analysis.category,
            confidence: analysis.confidence,
            provider: activeProvider.name,
            related: false,
          } satisfies ActionAnalysisRunItem;
        }

        const actionId = await upsertPresidentialActionFromArticle(
          article,
          analysis,
          activeProvider.name,
        );
        const categoryId = await ensureCategory(analysis.category);

        await attachCategoryToAction(actionId, categoryId);
        await upsertActionSentiment(actionId, analysis, activeProvider.name);

        return {
          actionCreated: true,
          articleId: article.id,
          category: analysis.category,
          confidence: analysis.confidence,
          provider: activeProvider.name,
          related: true,
        } satisfies ActionAnalysisRunItem;
      }),
    ),
  );

  const summary = {
    actionsCreated: results.filter((item) => item.actionCreated).length,
    analyzed: results.length,
    errors: results.flatMap((item) => (item.error ? [item.error] : [])),
    provider: provider.name,
    relatedDetected: results.filter((item) => item.related).length,
    results,
  } satisfies ActionAnalysisRunSummary;

  logger.info("Presidential action analysis finished", summary);

  return summary;
}
