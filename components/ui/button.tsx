import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "default" | "secondary" | "ghost";
type ButtonSize = "default" | "sm" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-brand text-brand-foreground hover:bg-brand/90",
  secondary:
    "bg-white/5 text-surface-foreground hover:bg-white/10 border border-border/70",
  ghost: "bg-transparent text-surface-foreground hover:bg-white/5",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 px-5 py-2.5",
  sm: "h-9 px-4 py-2 text-sm",
  lg: "h-12 px-6 py-3",
};

export function buttonVariants({
  className,
  size = "default",
  variant = "default",
}: {
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
} = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-2xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export function Button({
  asChild = false,
  children,
  className,
  size,
  variant,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={buttonVariants({ className, size, variant })}
      {...props}
    >
      {children}
    </Component>
  );
}
