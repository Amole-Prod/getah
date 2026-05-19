import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSourceAction } from "@/features/sources/actions";
import { SourceForm } from "@/features/sources/components/source-form";

export default function NewSourcePage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-2">
        <p className="text-brand text-sm tracking-[0.24em] uppercase">
          Source management
        </p>
        <h2 className="text-surface-foreground text-3xl font-semibold tracking-tight">
          Create source
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Source details</CardTitle>
        </CardHeader>
        <CardContent>
          <SourceForm
            action={createSourceAction}
            submitLabel="Create source"
            pendingLabel="Creating..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
