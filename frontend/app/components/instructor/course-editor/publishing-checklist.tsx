import { HiOutlineCheck } from "react-icons/hi";
import { reviewChecklist, type CourseDraft } from "./course-draft";

/**
 * Live mirror of the backend's submit rules. The submit button stays disabled
 * until every item is green, so instructors never hit a server-side rejection.
 */
export function PublishingChecklist({
  draft,
  locked,
}: {
  draft: CourseDraft;
  locked: boolean;
}) {
  const items = reviewChecklist(draft);
  const done = items.filter((item) => item.done).length;
  const percent = Math.round((done / items.length) * 100);

  return (
    <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Publishing checklist
        </h2>
        <span className="text-xs font-bold text-slate-400">
          {done}/{items.length}
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2.5">
            <span
              className={
                item.done
                  ? "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600"
                  : "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-dashed border-slate-300"
              }
            >
              {item.done ? <HiOutlineCheck className="size-3.5" /> : null}
            </span>
            <span
              className={
                item.done
                  ? "text-sm text-slate-400 line-through decoration-slate-300"
                  : "text-sm text-slate-600"
              }
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>

      {!locked && done === items.length && (
        <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-medium leading-relaxed text-emerald-700">
          Everything checks out. Submit when you are ready — an admin will review
          the course before it goes live.
        </p>
      )}
    </section>
  );
}
