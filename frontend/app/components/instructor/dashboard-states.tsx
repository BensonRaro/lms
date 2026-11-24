import { HiOutlineRefresh } from "react-icons/hi";

/**
 * Loading placeholder matching the instructor dashboard layout so the page
 * doesn't jump when data arrives.
 */
export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse space-y-6">
      <div className="h-48 rounded-[32px] border border-white bg-white/70" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div key={key} className="h-24 rounded-[24px] bg-white" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="h-72 rounded-[28px] bg-white" />
        <div className="h-72 rounded-[28px] bg-white" />
      </div>
    </div>
  );
}

/** Recoverable failure state for the instructor dashboard fetch. */
export function DashboardErrorState({
  title = "We couldn't load your dashboard",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-[28px] border border-red-100 bg-white p-8 text-center shadow-sm">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="button-3d mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-indigo-600"
      >
        <HiOutlineRefresh className="size-4" />
        Try again
      </button>
    </div>
  );
}
