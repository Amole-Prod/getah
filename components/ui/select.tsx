import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "border-border/70 focus:border-brand focus-visible:ring-brand/40 flex h-11 w-full rounded-2xl border bg-slate-950/60 px-4 text-sm text-slate-50 outline-none focus-visible:ring-2",
        className,
      )}
      {...props}
    />
  );
}
