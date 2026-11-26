/**
 * Full-page spinner for route-level session checks and other first paints.
 * Used by the dashboard guard and instructor onboarding.
 */
export function PageLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <span
        role="status"
        aria-label="Loading"
        className="size-10 animate-spin rounded-full border-4 border-primary-soft border-t-primary"
      />
    </div>
  );
}
