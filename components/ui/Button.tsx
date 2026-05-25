"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "ink" | "secondary" | "outline" | "ghost" | "destructive" | "success" | "warning" | "info";
type Size = "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:opacity-90 shadow-[0_8px_24px_rgba(124,92,255,0.35)]",
  ink: "bg-ink text-bg hover:opacity-90 shadow-[0_6px_20px_rgba(0,0,0,0.15)]",
  secondary: "bg-surface-alt text-ink hover:bg-surface-alt/80",
  outline: "border border-[color:var(--border)] bg-surface text-ink hover:bg-surface-alt",
  ghost: "text-ink-soft hover:bg-surface-alt",
  destructive: "bg-danger text-white hover:opacity-90 shadow-[0_6px_16px_rgba(248,113,113,0.4)]",
  success: "bg-success text-white hover:opacity-90 shadow-[0_6px_16px_rgba(52,211,153,0.4)]",
  warning: "bg-warning text-white hover:opacity-90 shadow-[0_6px_16px_rgba(251,191,36,0.4)]",
  info: "bg-info text-white hover:opacity-90 shadow-[0_6px_16px_rgba(96,165,250,0.4)]",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
  xl: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
