"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

function PublishToggleInner({
  nextStatus,
}: {
  nextStatus: "draft" | "published";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      {pending
        ? "Updating..."
        : nextStatus === "published"
          ? "Publish"
          : "Unpublish"}
    </Button>
  );
}

type PublishToggleButtonProps = {
  action: (formData: FormData) => Promise<void>;
  id: string;
  nextStatus: "draft" | "published";
};

export function PublishToggleButton({
  action,
  id,
  nextStatus,
}: PublishToggleButtonProps) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="nextStatus" value={nextStatus} />
      <PublishToggleInner nextStatus={nextStatus} />
    </form>
  );
}
