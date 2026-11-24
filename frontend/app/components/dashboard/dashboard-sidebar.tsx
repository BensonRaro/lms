import { useEffect, useState } from "react";
import { HiOutlineLogout, HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { Brand } from "@/components/globals/brand";
import { useSignOut } from "@/lib/hooks/use-sign-out";
import { initialsOf } from "@/lib/initials";
import { useSessionUser } from "@/lib/session";
import { SidebarNav } from "./sidebar-nav";

function UserAvatar({
  name,
  image,
}: {
  name: string;
  image?: string | null;
}) {
  return image ? (
    <img
      src={image}
      alt=""
      className="size-9 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span
      aria-hidden
      className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary"
    >
      {initialsOf(name) || "?"}
    </span>
  );
}

/** Signed-in identity plus the sign-out action, pinned to the sidebar bottom. */
function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  const { user, isPending } = useSessionUser();
  const signOut = useSignOut();
  const displayName = user?.name || user?.email || "";

  const handleSignOut = async () => {
    onNavigate?.();
    await signOut();
  };

  return (
    <div className="rounded-2xl bg-slate-50/80 p-3">
      {isPending || !user ? (
        <div aria-hidden className="flex items-center gap-2.5">
          <span className="size-9 animate-pulse rounded-full bg-slate-200/70" />
          <div className="flex-1 space-y-1.5">
            <span className="block h-3 w-24 animate-pulse rounded bg-slate-200/70" />
            <span className="block h-2.5 w-32 animate-pulse rounded bg-slate-200/70" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5">
          <UserAvatar name={displayName} image={user.image} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSignOut}
        disabled={isPending || !user}
        className="mt-3 flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-red-600 disabled:opacity-50"
      >
        <HiOutlineLogout className="size-4" />
        Sign out
      </button>
    </div>
  );
}

/** Floating sidebar card shown from `lg` upwards. */
export function DashboardSidebar() {
  return (
    <aside className="sticky top-4 hidden h-[calc(100svh-2rem)] w-72 shrink-0 flex-col overflow-hidden rounded-[28px] border border-white bg-white/90 shadow-soft-3d backdrop-blur-xl lg:flex">
      <div className="px-5 pb-5 pt-6">
        <Brand />
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <SidebarNav />
      </div>
      <div className="border-t border-slate-100 p-3">
        <SidebarFooter />
      </div>
    </aside>
  );
}

/** Compact top bar and slide-in drawer for phones and tablets. */
export function DashboardMobileBar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 lg:hidden">
        <div className="flex h-16 items-center justify-between rounded-[24px] border border-white bg-white/90 px-5 shadow-soft-3d backdrop-blur-xl">
          <Brand />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="dashboard-drawer"
            aria-label="Open dashboard menu"
            className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
          >
            <HiOutlineMenuAlt3 className="size-5" />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close dashboard menu"
            onClick={close}
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
          />
          <div
            id="dashboard-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard menu"
            className="absolute inset-y-3 left-3 flex w-72 max-w-[85vw] flex-col overflow-hidden rounded-[28px] border border-white bg-white shadow-soft-3d"
          >
            <div className="flex items-center justify-between px-4 py-4">
              <Brand />
              <button
                type="button"
                autoFocus
                onClick={close}
                aria-label="Close dashboard menu"
                className="grid size-9 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              >
                <HiOutlineX className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              <SidebarNav onNavigate={close} />
            </div>
            <div className="border-t border-slate-100 p-3">
              <SidebarFooter onNavigate={close} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
