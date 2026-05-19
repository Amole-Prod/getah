import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type FormFieldProps = {
  children: ReactNode;
  className?: string;
};

type FormLabelProps = {
  children: ReactNode;
  htmlFor: string;
};

type FormMessageProps = {
  children?: ReactNode;
  className?: string;
};

export function FormField({ children, className }: FormFieldProps) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

export function FormLabel({ children, htmlFor }: FormLabelProps) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-slate-200">
      {children}
    </label>
  );
}

export function FormMessage({ children, className }: FormMessageProps) {
  if (!children) {
    return null;
  }

  return (
    <p className={cn("text-sm leading-5 text-red-300", className)}>
      {children}
    </p>
  );
}
