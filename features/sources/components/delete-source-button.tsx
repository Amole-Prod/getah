"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

function DeleteButtonInner() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="ghost" size="sm" disabled={pending}>
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}

type DeleteSourceButtonProps = {
  sourceId: string;
  action: (formData: FormData) => Promise<void>;
};

export function DeleteSourceButton({
  sourceId,
  action,
}: DeleteSourceButtonProps) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={sourceId} />
      <DeleteButtonInner />
    </form>
  );
}
