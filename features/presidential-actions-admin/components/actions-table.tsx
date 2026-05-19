import type { Route } from "next";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { PresidentialActionListItem } from "@/features/presidential-actions-admin/types";

type ActionsTableProps = {
  items: PresidentialActionListItem[];
};

function getMetaString(item: PresidentialActionListItem, key: string) {
  const value = (item.metadata as Record<string, unknown> | null)?.[key];
  return typeof value === "string" ? value : "-";
}

function getImpactLabel(score: number | null) {
  if (score === null) {
    return "Low";
  }

  if (score >= 90) {
    return "Critical";
  }

  if (score >= 75) {
    return "High";
  }

  if (score >= 50) {
    return "Medium";
  }

  return "Low";
}

export function ActionsTable({ items }: ActionsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyzed presidential actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-border/70 text-muted border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Sentiment</th>
                <th className="px-4 py-3 font-medium">Impact</th>
                <th className="px-4 py-3 font-medium">Confidence</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((item) => {
                  const confidence =
                    typeof (item.ai_summary as Record<string, unknown> | null)
                      ?.confidence === "number"
                      ? (
                          ((item.ai_summary as Record<string, unknown>)
                            .confidence as number) * 100
                        ).toFixed(0)
                      : "-";

                  return (
                    <tr
                      key={item.id}
                      className="border-border/50 border-b last:border-b-0"
                    >
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="font-medium text-slate-100">
                            {item.title}
                          </p>
                          <p className="line-clamp-2 max-w-md text-xs text-slate-400">
                            {item.summary ?? "No summary"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-300">
                        {getMetaString(item, "category")}
                      </td>
                      <td className="px-4 py-4 text-slate-300">
                        {getMetaString(item, "sentiment")}
                      </td>
                      <td className="px-4 py-4 text-slate-300">
                        {getImpactLabel(item.impact_score)}
                      </td>
                      <td className="px-4 py-4 text-slate-300">
                        {confidence === "-" ? confidence : `${confidence}%`}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                            item.status === "published"
                              ? "bg-brand/10 text-brand"
                              : "bg-white/6 text-slate-300",
                          )}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-300">
                        {item.action_date ??
                          item.published_at?.slice(0, 10) ??
                          "-"}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={
                            `/admin/presidential-actions/${item.id}` as Route
                          }
                          className={buttonVariants({
                            variant: "secondary",
                            size: "sm",
                          })}
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    No presidential actions match current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
