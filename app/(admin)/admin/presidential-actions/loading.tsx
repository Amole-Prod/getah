import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PresidentialActionsLoadingPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-40 animate-pulse rounded bg-white/8" />
        <div className="h-10 w-80 animate-pulse rounded bg-white/8" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 animate-pulse rounded bg-white/8" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="h-72 animate-pulse rounded-2xl bg-white/8" />
        </CardContent>
      </Card>
    </div>
  );
}
