import type { SelectHTMLAttributes } from "react";
import { HiOutlineChevronDown } from "react-icons/hi";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

/**
 * Styled native select — native keeps mobile pickers and keyboard behaviour
 * for free. Shares the rounded soft-3D look of `Input`.
 */
export const Select = ({ className, children, ...props }: SelectProps) => {
  return (
    <div className="relative w-full">
      <select
        className={cn(
          "h-12 w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50/50 px-4 pr-10 text-sm text-foreground transition-all duration-200 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <HiOutlineChevronDown
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
};
