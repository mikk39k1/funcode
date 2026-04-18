import { type HTMLAttributes, forwardRef } from "react";

type CardVariant = "default" | "high" | "highest";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Adds a subtle coloured glow blur in the top-right corner */
  glow?: "primary" | "secondary" | "tertiary" | "none";
}

const bgClasses: Record<CardVariant, string> = {
  default: "bg-surface-container-low",
  high: "bg-surface-container-high",
  highest: "bg-surface-container-highest",
};

const glowClasses: Record<NonNullable<CardProps["glow"]>, string> = {
  primary: "bg-primary/5 group-hover:bg-primary/10",
  secondary: "bg-secondary/5 group-hover:bg-secondary/10",
  tertiary: "bg-tertiary/5 group-hover:bg-tertiary/10",
  none: "hidden",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { variant = "default", glow = "none", className = "", children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          group relative rounded-lg p-8 overflow-hidden
          ${bgClasses[variant]}
          ${className}
        `}
        {...props}
      >
        {/* Ambient glow accent */}
        <div
          className={`
            absolute top-0 right-0 w-32 h-32 rounded-full
            -mr-10 -mt-10 blur-2xl pointer-events-none
            transition-colors duration-500
            ${glowClasses[glow]}
          `}
        />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

Card.displayName = "Card";
