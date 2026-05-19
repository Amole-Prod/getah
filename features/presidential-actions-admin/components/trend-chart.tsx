import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PresidentialActionTrendPoint } from "@/features/presidential-actions-admin/types";

type TrendChartProps = {
  items: PresidentialActionTrendPoint[];
};

export function TrendChart({ items }: TrendChartProps) {
  const max = Math.max(...items.map((item) => item.total), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Action trends</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <div className="flex h-56 items-end gap-3">
            {items.map((item) => (
              <div
                key={item.date}
                className="flex flex-1 flex-col items-center gap-3"
              >
                <span className="text-xs text-slate-400">{item.total}</span>
                <div
                  className="from-brand/60 to-brand w-full rounded-t-2xl bg-gradient-to-t"
                  style={{
                    height: `${Math.max((item.total / max) * 170, 14)}px`,
                  }}
                />
                <span className="text-center text-[11px] text-slate-400">
                  {item.date === "Unknown" ? item.date : item.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No trend data yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
