import { Outlet } from "react-router";
import {
  DashboardMobileBar,
  DashboardSidebar,
} from "@/components/dashboard/dashboard-sidebar";

/**
 * Shell for signed-in dashboards: a floating sidebar card on the left from
 * `lg` upwards, and a slide-in drawer on smaller screens. The marketing header
 * is intentionally absent so dashboard space belongs to the product.
 */
export default function DashboardLayout() {
  return (
    <div className="relative min-h-screen bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden bg-gradient-to-b from-accent via-accent/50 to-background"
      >
        <div className="absolute inset-0 bg-grid-soft [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>

      <DashboardMobileBar />

      <div className="relative mx-auto flex w-full max-w-[110rem] items-start gap-5 px-3 pt-3 sm:px-5 lg:gap-6 lg:px-6 lg:pt-4">
        <DashboardSidebar />

        <main className="min-w-0 flex-1 pb-16 pt-3 lg:pt-0">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
