import {
  buildCategoryPoints,
  buildPresidentialActionStats,
  buildTrendPoints,
  listPresidentialActionCategories,
  listPresidentialActions,
} from "@/features/presidential-actions-admin/repository";
import { presidentialActionFiltersSchema } from "@/features/presidential-actions-admin/schema";
import { ActionsTable } from "@/features/presidential-actions-admin/components/actions-table";
import { CategoryChart } from "@/features/presidential-actions-admin/components/category-chart";
import { FiltersForm } from "@/features/presidential-actions-admin/components/filters-form";
import { StatsCard } from "@/features/presidential-actions-admin/components/stats-card";
import { TrendChart } from "@/features/presidential-actions-admin/components/trend-chart";

type PresidentialActionsPageProps = {
  searchParams: Promise<{
    category?: string | string[];
    dateFrom?: string | string[];
    dateTo?: string | string[];
    impactLevel?: string | string[];
    sentiment?: string | string[];
  }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PresidentialActionsPage({
  searchParams,
}: PresidentialActionsPageProps) {
  const rawParams = await searchParams;
  const filters = presidentialActionFiltersSchema.parse({
    category: readParam(rawParams.category),
    dateFrom: readParam(rawParams.dateFrom),
    dateTo: readParam(rawParams.dateTo),
    impactLevel: readParam(rawParams.impactLevel),
    sentiment: readParam(rawParams.sentiment),
  });
  const [items, categories] = await Promise.all([
    listPresidentialActions(filters),
    listPresidentialActionCategories(),
  ]);
  const stats = buildPresidentialActionStats(items);
  const trendPoints = buildTrendPoints(items);
  const categoryPoints = buildCategoryPoints(items);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="text-brand text-sm tracking-[0.24em] uppercase">
          Presidential actions
        </p>
        <h2 className="text-surface-foreground text-3xl font-semibold tracking-tight">
          Review AI-detected government actions
        </h2>
        <p className="max-w-3xl text-base leading-7 text-slate-300">
          Moderate extracted actions, track publication status, and inspect
          category, sentiment, impact, and time-based trends.
        </p>
      </section>

      <FiltersForm categories={categories} filters={filters} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total actions"
          description="Filtered records"
          value={String(stats.total)}
        />
        <StatsCard
          title="Published"
          description="Visible records"
          value={String(stats.published)}
        />
        <StatsCard
          title="Drafts"
          description="Need moderation"
          value={String(stats.drafts)}
        />
        <StatsCard
          title="High impact"
          description="Score 75 and above"
          value={String(stats.highImpact)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <TrendChart items={trendPoints} />
        <CategoryChart items={categoryPoints} />
      </section>

      <ActionsTable items={items} />
    </div>
  );
}
