import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReportStatsProps = {
  highImpactCount: number;
  publishedCount: number;
  totalActions: number;
};

export function ReportStats({
  highImpactCount,
  publishedCount,
  totalActions,
}: ReportStatsProps) {
  const items = [
    { label: "Total actions", value: totalActions },
    { label: "Published", value: publishedCount },
    { label: "High impact", value: highImpactCount },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader>
            <CardTitle className="text-base">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-surface-foreground text-3xl font-semibold tracking-tight">
              {item.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
