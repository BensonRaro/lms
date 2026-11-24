import { NavLink } from "react-router";
import type { IconType } from "react-icons";
import {
  HiOutlineBookOpen,
  HiOutlineChartBar,
  HiOutlineGlobeAlt,
  HiOutlineStar,
  HiOutlineUserCircle,
  HiOutlineViewGrid,
} from "react-icons/hi";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: IconType;
  to?: string;
  /** Exact-match the path (used for the section roots). */
  end?: boolean;
  /** Destinations that aren't built yet render as non-interactive. */
  soon?: boolean;
};

const SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Teaching",
    items: [
      {
        label: "Overview",
        to: "/dashboard/instructor",
        end: true,
        icon: HiOutlineViewGrid,
      },
      {
        label: "Courses",
        to: "/dashboard/instructor/courses",
        icon: HiOutlineBookOpen,
      },
      { label: "Reviews", icon: HiOutlineStar, soon: true },
      { label: "Analytics", icon: HiOutlineChartBar, soon: true },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", icon: HiOutlineUserCircle, soon: true },
      { label: "Browse courses", to: "/", end: true, icon: HiOutlineGlobeAlt },
    ],
  },
];

/**
 * Instructor navigation for the dashboard sidebar and its mobile drawer.
 * Unbuilt sections are shown with a "Soon" badge instead of dead links.
 */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-6">
      {SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {section.label}
          </p>
          <ul className="mt-2 space-y-1">
            {section.items.map((item) => (
              <li key={item.label}>
                {item.to ? (
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary-soft text-primary"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-foreground",
                      )
                    }
                  >
                    <item.icon className="size-[18px] shrink-0" />
                    {item.label}
                  </NavLink>
                ) : (
                  <span
                    aria-disabled="true"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400"
                  >
                    <item.icon className="size-[18px] shrink-0" />
                    {item.label}
                    <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Soon
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
