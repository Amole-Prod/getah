import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoadingSourcesPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-white/8" />
        <div className="h-10 w-72 animate-pulse rounded bg-white/8" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Loading sources...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 animate-pulse rounded-2xl bg-white/8" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loading form...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-11 animate-pulse rounded-2xl bg-white/8" />
              <div className="h-11 animate-pulse rounded-2xl bg-white/8" />
              <div className="h-11 animate-pulse rounded-2xl bg-white/8" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
