import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Checkbox({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        "border-border/70 focus-visible:ring-brand/40 text-brand h-4 w-4 rounded border bg-slate-950 focus-visible:ring-2",
        className,
      )}
      {...props}
    />
  );
}
