import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PresidentialActionCategoryPoint } from "@/features/presidential-actions-admin/types";

type CategoryChartProps = {
  items: PresidentialActionCategoryPoint[];
};

export function CategoryChart({ items }: CategoryChartProps) {
  const max = Math.max(...items.map((item) => item.total), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length ? (
          items.map((item) => (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-200">{item.category}</span>
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
          <p className="text-sm text-slate-400">No category data yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
