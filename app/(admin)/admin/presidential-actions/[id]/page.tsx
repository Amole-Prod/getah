import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  togglePresidentialActionPublishAction,
  updatePresidentialActionAction,
} from "@/features/presidential-actions-admin/actions";
import { ModerationForm } from "@/features/presidential-actions-admin/components/moderation-form";
import { PublishToggleButton } from "@/features/presidential-actions-admin/components/publish-toggle-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getPresidentialActionDetail } from "@/features/presidential-actions-admin/repository";

type PresidentialActionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PresidentialActionDetailPage({
  params,
}: PresidentialActionDetailPageProps) {
  const { id } = await params;
  const detail = await getPresidentialActionDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-brand text-sm tracking-[0.24em] uppercase">
              Action detail
            </p>
            <h2 className="text-surface-foreground text-3xl font-semibold tracking-tight">
              {detail.title}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={"/admin/presidential-actions" as Route}
              className={buttonVariants({ variant: "secondary" })}
            >
              Back to list
            </Link>
            <PublishToggleButton
              action={togglePresidentialActionPublishAction}
              id={detail.id}
              nextStatus={detail.status === "published" ? "draft" : "published"}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Moderation</CardTitle>
          </CardHeader>
          <CardContent>
            <ModerationForm
              action={updatePresidentialActionAction}
              detail={detail}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-muted">Category</p>
                <p>{detail.category}</p>
              </div>
              <div>
                <p className="text-muted">Sentiment</p>
                <p>{detail.sentiment}</p>
              </div>
              <div>
                <p className="text-muted">Impact level</p>
                <p>{detail.impact_level}</p>
              </div>
              <div>
                <p className="text-muted">Confidence</p>
                <p>
                  {typeof detail.confidence === "number"
                    ? `${Math.round(detail.confidence * 100)}%`
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-muted">Provider</p>
                <p>{detail.provider ?? "-"}</p>
              </div>
              <div>
                <p className="text-muted">Status</p>
                <p>{detail.status}</p>
              </div>
            </div>
            <div>
              <p className="text-muted">Reasoning</p>
              <p className="leading-6">
                {detail.reasoning ?? "No reasoning stored."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Linked context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <div>
              <p className="text-muted">Source</p>
              <p>{detail.source_name ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted">Action date</p>
              <p>{detail.action_date ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted">Related article</p>
              {detail.related_news_url ? (
                <a
                  href={detail.related_news_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand break-all hover:underline"
                >
                  {detail.related_news_url}
                </a>
              ) : (
                <p>-</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
