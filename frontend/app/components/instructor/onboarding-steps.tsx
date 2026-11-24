import type { ReactNode } from "react";
import { HiOutlineCheck } from "react-icons/hi";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  EXPERTISE_TOPICS,
  type ExpertiseTopic,
} from "@/lib/api/instructors";
import { cn } from "@/lib/utils";
import type { OnboardingDraft } from "./types";

type StepProps = {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
  errors: Partial<Record<keyof OnboardingDraft, string>>;
};

export function TopicsStep({ draft, update, errors }: StepProps) {
  const toggleTopic = (topic: ExpertiseTopic) => {
    const selected = draft.expertise.includes(topic);
    update({
      expertise: selected
        ? draft.expertise.filter((item) => item !== topic)
        : [...draft.expertise, topic],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-slate-700">
          What will you teach?
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Pick up to five topics. This is how learners find you.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {EXPERTISE_TOPICS.map((topic) => {
            const selected = draft.expertise.includes(topic);
            return (
              <button
                key={topic}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleTopic(topic)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                  selected
                    ? "border-primary/30 bg-primary-soft text-primary"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                {selected && <HiOutlineCheck className="size-3.5" />}
                {topic}
              </button>
            );
          })}
        </div>
        {errors.expertise && <FieldError>{errors.expertise}</FieldError>}
      </div>

      <div>
        <div className="flex items-end justify-between gap-4">
          <label
            htmlFor="headline"
            className="text-sm font-semibold text-slate-700"
          >
            Your teaching headline
          </label>
          <span className="text-xs text-slate-400">
            {draft.headline.length}/120
          </span>
        </div>
        <Input
          id="headline"
          value={draft.headline}
          maxLength={120}
          onChange={(event) => update({ headline: event.target.value })}
          placeholder="I help beginners ship their first React app"
          className="mt-2"
        />
        {errors.headline && <FieldError>{errors.headline}</FieldError>}
      </div>
    </div>
  );
}

export function BioStep({ draft, update, errors }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-end justify-between gap-4">
          <label htmlFor="bio" className="text-sm font-semibold text-slate-700">
            Tell learners about you
          </label>
          <span className="text-xs text-slate-400">{draft.bio.length}/1000</span>
        </div>
        <Textarea
          id="bio"
          value={draft.bio}
          maxLength={1000}
          onChange={(event) => update({ bio: event.target.value })}
          placeholder="What you've built, who you've taught, and what a learner should expect from your courses."
          className="mt-2"
        />
        {errors.bio && <FieldError>{errors.bio}</FieldError>}
      </div>

      <div className="max-w-xs">
        <label
          htmlFor="experience"
          className="text-sm font-semibold text-slate-700"
        >
          Years of experience
        </label>
        <div className="mt-2 flex items-center gap-3">
          <Input
            id="experience"
            type="number"
            min={0}
            max={60}
            value={draft.experienceYears}
            onChange={(event) =>
              update({ experienceYears: Number(event.target.value) })
            }
          />
          <span className="text-sm text-slate-500">years</span>
        </div>
        {errors.experienceYears && (
          <FieldError>{errors.experienceYears}</FieldError>
        )}
      </div>
    </div>
  );
}

export function ReviewStep({ draft }: { draft: OnboardingDraft }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        This is what learners will see on your instructor profile. You can edit
        it later from your dashboard.
      </p>

      <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Headline
        </p>
        <p className="mt-1 font-semibold text-foreground">{draft.headline}</p>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Teaches
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {draft.expertise.map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary"
            >
              {topic}
            </span>
          ))}
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          About
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          {draft.bio}
        </p>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Experience
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {draft.experienceYears} {draft.experienceYears === 1 ? "year" : "years"}
        </p>
      </div>
    </div>
  );
}

function FieldError({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-xs font-medium text-red-600">{children}</p>;
}
