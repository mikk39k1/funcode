import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-on-surface-variant"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3 rounded-[var(--radius)]
            bg-surface-container-low text-on-surface
            font-sans text-sm placeholder:text-on-surface-variant/50
            border-0 outline-none
            transition-colors duration-200
            focus:bg-surface-container-high
            focus:shadow-[inset_0_-2px_0_0_#f0bd8b]
            disabled:opacity-40 disabled:cursor-not-allowed
            ${error ? "shadow-[inset_0_-2px_0_0_#f97758]" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-error font-medium">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-on-surface-variant">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
