import { HiOutlineBadgeCheck } from "react-icons/hi";
import type { InstructorProfile } from "@/lib/api/instructors";
import { initialsOf } from "@/lib/initials";

/**
 * Read-only summary of the instructor profile collected at onboarding.
 * Shown in the instructor dashboard sidebar.
 */
export function InstructorProfileCard({
  name,
  profile,
}: {
  name: string;
  profile: InstructorProfile;
}) {
  return (
    <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-sm font-bold text-primary">
          {initialsOf(name) || "IN"}
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold text-foreground">{name}</p>
          <p className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <HiOutlineBadgeCheck className="size-3.5" />
            Verified instructor
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold leading-snug text-slate-700">
        {profile.headline}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {profile.expertise.map((topic) => (
          <span
            key={topic}
            className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-medium text-primary"
          >
            {topic}
          </span>
        ))}
      </div>

      <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-slate-500">
        {profile.bio}
      </p>

      <dl className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
        <dt className="text-slate-500">Experience</dt>
        <dd className="font-semibold text-foreground">
          {profile.experienceYears}{" "}
          {profile.experienceYears === 1 ? "year" : "years"}
        </dd>
      </dl>
    </section>
  );
}
