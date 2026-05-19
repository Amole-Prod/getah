import type { Route } from "next";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteSourceButton } from "@/features/sources/components/delete-source-button";
import { deleteSourceAction } from "@/features/sources/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { SourceRecord } from "@/features/sources/types";

type SourcesTableProps = {
  items: SourceRecord[];
  query: string;
  page: number;
  pageCount: number;
};

function pageHref(page: number, query: string) {
  return {
    pathname: "/admin/sources" as Route,
    query: {
      page: String(page),
      ...(query ? { query } : {}),
    },
  };
}

export function SourcesTable({
  items,
  query,
  page,
  pageCount,
}: SourcesTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Sources</CardTitle>
          <p className="text-muted text-sm">
            Manage source catalog for scraping and analysis.
          </p>
        </div>
        <Link href={"/admin/sources/new" as Route} className={buttonVariants()}>
          New source
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-muted border-border/70 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">URL</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-border/50 border-b last:border-b-0"
                  >
                    <td className="px-4 py-4 font-medium text-slate-100">
                      {item.name}
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      {item.base_url ?? "-"}
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      {item.source_type}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                          item.is_active
                            ? "bg-brand/10 text-brand"
                            : "bg-slate-800 text-slate-400",
                        )}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      {new Date(item.updated_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/sources/${item.id}/edit` as Route}
                          className={cn(
                            buttonVariants({
                              variant: "secondary",
                              size: "sm",
                            }),
                          )}
                        >
                          Edit
                        </Link>
                        <DeleteSourceButton
                          sourceId={item.id}
                          action={deleteSourceAction}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    No sources found. Adjust search or create new source.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            Page {page} of {pageCount}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={pageHref(Math.max(1, page - 1), query)}
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                page <= 1 && "pointer-events-none opacity-50",
              )}
            >
              Previous
            </Link>
            <Link
              href={pageHref(Math.min(pageCount, page + 1), query)}
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                page >= pageCount && "pointer-events-none opacity-50",
              )}
            >
              Next
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
