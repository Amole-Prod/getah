import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSourceAction } from "@/features/sources/actions";
import { SourceForm } from "@/features/sources/components/source-form";
import { getSourceById } from "@/features/sources/repository";

type EditSourcePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSourcePage({ params }: EditSourcePageProps) {
  const { id } = await params;
  const source = await getSourceById(id);

  if (!source) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-2">
        <p className="text-brand text-sm tracking-[0.24em] uppercase">
          Source management
        </p>
        <h2 className="text-surface-foreground text-3xl font-semibold tracking-tight">
          Edit source
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{source.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <SourceForm
            action={updateSourceAction}
            submitLabel="Save changes"
            pendingLabel="Saving..."
            defaultValues={{
              id: source.id,
              name: source.name,
              url: source.base_url ?? "",
              type: source.source_type,
              isActive: source.is_active,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
