import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReportBarsProps = {
  items: Array<{ label: string; total: number }>;
  title: string;
};

export function ReportBars({ items, title }: ReportBarsProps) {
  const max = Math.max(...items.map((item) => item.total), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length ? (
          items.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-200">{item.label}</span>
                <span className="text-muted">{item.total}</span>
              </div>
              <div className="h-2 rounded-full bg-white/6">
                <div
                  className="bg-brand h-2 rounded-full"
                  style={{ width: `${(item.total / max) * 100}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">No data available.</p>
        )}
      </CardContent>
    </Card>
  );
}
