import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSourceAction } from "@/features/sources/actions";
import { SourceForm } from "@/features/sources/components/source-form";
import { SourcesSearchForm } from "@/features/sources/components/sources-search-form";
import { SourcesTable } from "@/features/sources/components/sources-table";
import { listSources } from "@/features/sources/repository";
import { sourceSearchSchema } from "@/features/sources/schemas";

type SourcesPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    query?: string | string[];
  }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SourcesPage({ searchParams }: SourcesPageProps) {
  const params = await searchParams;
  const parsed = sourceSearchSchema.parse({
    page: readParam(params.page),
    query: readParam(params.query),
  });
  const { items, pageCount } = await listSources({
    page: parsed.page,
    query: parsed.query,
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand text-sm tracking-[0.24em] uppercase">
            Source management
          </p>
          <h2 className="text-surface-foreground text-3xl font-semibold tracking-tight">
            Manage source inventory
          </h2>
          <p className="max-w-3xl text-base leading-7 text-slate-300">
            Store source list for scraping pipeline, editorial review, and AI
            analysis.
          </p>
        </div>

        <SourcesSearchForm query={parsed.query} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <SourcesTable
          items={items}
          query={parsed.query}
          page={parsed.page}
          pageCount={pageCount}
        />

        <Card>
          <CardHeader>
            <CardTitle>Create source</CardTitle>
          </CardHeader>
          <CardContent>
            <SourceForm
              action={createSourceAction}
              submitLabel="Create source"
              pendingLabel="Creating..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
