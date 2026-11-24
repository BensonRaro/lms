import {
  HiOutlineBookOpen,
  HiOutlineStar,
  HiOutlineUsers,
} from "react-icons/hi";

// Zeroed until course data exists; the labels stay so the layout is final.
const STATS = [
  { label: "Courses", value: "0", icon: HiOutlineBookOpen },
  { label: "Learners", value: "0", icon: HiOutlineUsers },
  { label: "Reviews", value: "0", icon: HiOutlineStar },
];

/**
 * Instructor metric cards shown under the dashboard welcome banner.
 */
export function InstructorStats() {
  return (
    <dl className="grid gap-4 sm:grid-cols-3">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-4 rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm"
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
            <stat.icon className="size-5" />
          </span>
          <div>
            <dd className="text-2xl font-extrabold tracking-tight text-foreground">
              {stat.value}
            </dd>
            <dt className="text-xs font-medium text-slate-500">{stat.label}</dt>
          </div>
        </div>
      ))}
    </dl>
  );
}
