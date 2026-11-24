import { useState } from "react";
import { Link } from "react-router";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { Brand } from "./brand";
import { AuthActions } from "./auth-actions";

const NAV_ITEMS = [
  { label: "Courses", to: "/courses" },
  { label: "Instructors", to: "/instructors" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
] as const;

/**
 * Public site header, rendered as a floating card that matches the hero.
 * Shows marketing navigation plus better-auth session state (sign-in links
 * for guests, avatar menu for signed-in learners).
 */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto w-full max-w-360 px-2 pb-2 pt-4 sm:px-6 lg:px-8 lg:pb-2 lg:pt-4">
        <div className="rounded-[26px] border border-white bg-white/85 shadow-soft-3d backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-6 sm:px-9 lg:h-18 lg:px-10 xl:px-12">
            <Brand />

            <nav aria-label="Main" className="hidden items-center lg:flex">
              {NAV_ITEMS.map((item, index) => (
                <span key={item.to} className="flex items-center">
                  <Link
                    to={item.to}
                    className="rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                  {index < NAV_ITEMS.length - 1 && (
                    <span
                      aria-hidden
                      className="size-1 rounded-full bg-slate-300"
                    />
                  )}
                </span>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden lg:block">
                <AuthActions />
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 lg:hidden"
              >
                {menuOpen ? (
                  <HiOutlineX className="size-5" />
                ) : (
                  <HiOutlineMenuAlt3 className="size-5" />
                )}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div
              id="mobile-menu"
              className="border-t border-slate-100 px-6 pb-5 pt-4 sm:px-9 lg:hidden"
            >
              <nav aria-label="Mobile" className="grid gap-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100/70"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-4 border-t border-slate-100 pt-4">
                <AuthActions stacked />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
