import { Link } from "react-router";
import { cn } from "@/lib/utils";

/**
 * Product logo + wordmark. Used in the site header and anywhere the brand
 * needs to link back to the landing page.
 */
export function Brand({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="Lumina home"
      className={cn(
        "group flex shrink-0 items-center gap-2.5 rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
        className,
      )}
    >
      <span className="relative grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:-rotate-6">
        <span className="size-4 rotate-45 rounded-[5px] bg-white shadow-sm" />
      </span>
      <span className="text-xl font-extrabold tracking-tight text-foreground">
        Lumina
      </span>
    </Link>
  );
}
