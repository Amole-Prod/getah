"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SourcesErrorPageProps = {
  error: Error;
  reset: () => void;
};

export default function SourcesErrorPage({
  error,
  reset,
}: SourcesErrorPageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Failed to load sources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-red-200">{error.message}</p>
        <Button onClick={reset}>Try again</Button>
      </CardContent>
    </Card>
  );
}
