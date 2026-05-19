"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PresidentialActionsErrorPageProps = {
  error: Error;
  reset: () => void;
};

export default function PresidentialActionsErrorPage({
  error,
  reset,
}: PresidentialActionsErrorPageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Failed to load presidential actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-red-200">{error.message}</p>
        <Button onClick={reset}>Try again</Button>
      </CardContent>
    </Card>
  );
}
