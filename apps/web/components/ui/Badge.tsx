import { type HTMLAttributes } from "react";

type BadgeVariant =
  | "typescript"
  | "react"
  | "node"
  | "python"
  | "css"
  | "default"
  | "xp"
  | "difficulty-cozy"
  | "difficulty-standard"
  | "difficulty-challenging";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  typescript: "bg-tertiary-container/20 text-tertiary",
  react:       "bg-secondary-container/30 text-secondary",
  node:        "bg-secondary-container/20 text-secondary",
  python:      "bg-tertiary-container/20 text-tertiary",
  css:         "bg-primary-container/20 text-primary",
  default:     "bg-surface-container-highest text-on-surface-variant",
  xp:          "bg-primary/10 text-primary",
  "difficulty-cozy":        "bg-secondary-container/30 text-secondary",
  "difficulty-standard":    "bg-surface-container-highest text-on-surface-variant",
  "difficulty-challenging": "bg-error-container/20 text-error",
};

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-3 py-1 rounded-full
        text-xs font-bold uppercase tracking-wide
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}
