import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "error" | "success" | "info";
};

const toneClasses: Record<NonNullable<AlertProps["tone"]>, string> = {
  error: "border-red-400/30 bg-red-500/10 text-red-100",
  success: "border-brand/30 bg-brand/10 text-green-100",
  info: "border-sky-400/30 bg-sky-500/10 text-sky-100",
};

export function Alert({ className, tone = "info", ...props }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm leading-6",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
