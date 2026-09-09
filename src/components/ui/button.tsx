import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "negative" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-ring",
          "disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-emerald-600 text-white hover:bg-emerald-700 border-none":
              variant === "primary",
            "bg-transparent text-gray-900 border border-gray-200 hover:bg-gray-50":
              variant === "secondary",
            "bg-red-600 text-white hover:bg-red-700 border-none":
              variant === "negative",
            "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-none":
              variant === "ghost",
          },
          {
            "px-3 py-1.5 text-xs": size === "sm",
            "px-4 py-2 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
