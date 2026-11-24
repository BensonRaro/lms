import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineChevronDown,
  HiOutlineLogout,
  HiOutlineSparkles,
} from "react-icons/hi";
import { useSignOut } from "@/lib/hooks/use-sign-out";
import { initialsOf } from "@/lib/initials";
import { canTeach, useSessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";

function Avatar({
  name,
  image,
  className,
}: {
  name: string;
  image?: string | null;
  className?: string;
}) {
  return image ? (
    <img
      src={image}
      alt={name}
      className={cn("size-9 rounded-full object-cover", className)}
    />
  ) : (
    <span
      aria-hidden
      className={cn(
        "grid size-9 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary",
        className,
      )}
    >
      {initialsOf(name) || "?"}
    </span>
  );
}

/**
 * Better-auth session aware actions for the site header: guest sign-in links,
 * or the signed-in learner's avatar menu. `stacked` renders the mobile panel
 * layout inside the header's collapsible menu.
 */
export function AuthActions({ stacked = false }: { stacked?: boolean }) {
  const { data: session, isPending, role } = useSessionUser();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const signOut = useSignOut();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
  };

  if (isPending) {
    return (
      <span
        aria-hidden
        className="block h-10 w-10 animate-pulse rounded-full bg-slate-200/70 sm:w-28"
      />
    );
  }

  if (!session) {
    return (
      <div
        className={cn(
          "flex items-center gap-2",
          stacked && "flex-col items-stretch gap-2.5",
        )}
      >
        <Link
          to="/login"
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-foreground",
            stacked && "py-3 text-center",
          )}
        >
          Log in
        </Link>
        <Link
          to="/signup"
          className={cn(
            "button-3d inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-indigo-600",
            stacked && "py-3",
          )}
        >
          Get started
        </Link>
      </div>
    );
  }

  const user = session.user;
  const displayName = user.name || user.email;

  // Instructors (and admins) go straight to their dashboard; everyone else is
  // invited into onboarding.
  const teachingLink = canTeach(role)
    ? {
        to: "/dashboard/instructor",
        label: "Instructor dashboard",
        icon: HiOutlineAcademicCap,
      }
    : {
        to: "/become-instructor",
        label: "Become an instructor",
        icon: HiOutlineSparkles,
      };

  if (stacked) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <div className="flex items-center gap-3">
          <Avatar name={displayName} image={user.image} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-1">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <HiOutlineBookOpen className="size-4" />
            Browse courses
          </Link>
          <Link
            to={teachingLink.to}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <teachingLink.icon className="size-4" />
            {teachingLink.label}
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <HiOutlineLogout className="size-4" />
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2.5 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
      >
        <Avatar name={displayName} image={user.image} />
        <span className="hidden max-w-28 truncate text-sm font-semibold text-foreground sm:block">
          {displayName}
        </span>
        <HiOutlineChevronDown
          className={cn(
            "size-4 text-slate-400 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-slate-100 bg-white p-2 shadow-soft-3d"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-slate-100" />
          <Link
            to="/"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <HiOutlineBookOpen className="size-4" />
            Browse courses
          </Link>
          <Link
            to={teachingLink.to}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <teachingLink.icon className="size-4" />
            {teachingLink.label}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <HiOutlineLogout className="size-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
