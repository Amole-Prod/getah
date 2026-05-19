import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatsCardProps = {
  description: string;
  title: string;
  value: string;
};

export function StatsCard({ description, title, value }: StatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <p className="text-muted text-sm">{description}</p>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-surface-foreground text-3xl font-semibold tracking-tight">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
