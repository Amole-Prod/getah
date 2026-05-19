"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "@/components/ui/button";

type SubmitButtonProps = ButtonProps & {
  children: ReactNode;
  pendingLabel?: string;
};

export function SubmitButton({
  children,
  pendingLabel,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? (pendingLabel ?? "Saving...") : children}
    </Button>
  );
}
