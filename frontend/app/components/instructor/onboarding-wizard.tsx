import { useState } from "react";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineCheck,
} from "react-icons/hi";
import { ApiError } from "@/lib/api/client";
import { useCompleteOnboarding } from "@/lib/hooks/use-instructor";
import { cn } from "@/lib/utils";
import { BioStep, ReviewStep, TopicsStep } from "./onboarding-steps";
import type { OnboardingDraft } from "./types";

const STEPS = ["Topics", "About you", "Review"] as const;

type Errors = Partial<Record<keyof OnboardingDraft, string>>;

function validateStep(step: number, draft: OnboardingDraft): Errors {
  const errors: Errors = {};

  if (step === 0) {
    if (draft.expertise.length === 0) {
      errors.expertise = "Pick at least one topic.";
    }
    if (draft.headline.trim().length < 10) {
      errors.headline = "Add a headline of at least 10 characters.";
    }
  }

  if (step === 1) {
    if (draft.bio.trim().length < 40) {
      errors.bio = "Write at least 40 characters so learners know what to expect.";
    }
    if (
      !Number.isInteger(draft.experienceYears) ||
      draft.experienceYears < 0 ||
      draft.experienceYears > 60
    ) {
      errors.experienceYears = "Enter a whole number between 0 and 60.";
    }
  }

  return errors;
}

/**
 * Three-step instructor onboarding: topics, bio, review. Submits the profile
 * to the API (which grants the instructor role) and hands control back to the
 * page on success.
 */
export function OnboardingWizard({
  onComplete,
}: {
  onComplete: () => void | Promise<void>;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>({
    headline: "",
    bio: "",
    expertise: [],
    experienceYears: 1,
  });
  const [errors, setErrors] = useState<Errors>({});
  const completeOnboarding = useCompleteOnboarding();
  const submitting = completeOnboarding.isPending;

  const error =
    completeOnboarding.error instanceof ApiError
      ? completeOnboarding.error.message
      : completeOnboarding.error
        ? "Could not save your profile. Please try again."
        : "";

  const update = (patch: Partial<OnboardingDraft>) =>
    setDraft((previous) => ({ ...previous, ...patch }));

  const goNext = () => {
    const found = validateStep(step, draft);
    setErrors(found);
    if (Object.keys(found).length === 0) setStep((value) => value + 1);
  };

  const goBack = () => {
    setErrors({});
    completeOnboarding.reset();
    setStep((value) => Math.max(0, value - 1));
  };

  const submit = async () => {
    const found = {
      ...validateStep(0, draft),
      ...validateStep(1, draft),
    };
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStep(found.headline || found.expertise ? 0 : 1);
      return;
    }

    try {
      await completeOnboarding.mutateAsync({
        headline: draft.headline.trim(),
        bio: draft.bio.trim(),
        expertise: draft.expertise,
        experienceYears: draft.experienceYears,
      });
      await onComplete();
    } catch {
      // The mutation holds the error; the panel below renders its message.
    }
  };

  const stepProps = { draft, update, errors };

  return (
    <div className="rounded-[32px] border border-white bg-white/90 p-6 shadow-soft-3d backdrop-blur-sm sm:p-9">
      <ol className="flex items-center gap-2">
        {STEPS.map((label, index) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors",
                index <= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-slate-100 text-slate-400",
              )}
            >
              {index < step ? <HiOutlineCheck className="size-4" /> : index + 1}
            </span>
            <span
              className={cn(
                "hidden text-xs font-semibold sm:block",
                index <= step ? "text-foreground" : "text-slate-400",
              )}
            >
              {label}
            </span>
            {index < STEPS.length - 1 && (
              <span className="h-px flex-1 bg-slate-100" />
            )}
          </li>
        ))}
      </ol>

      <div className="mt-8">
        {step === 0 && <TopicsStep {...stepProps} />}
        {step === 1 && <BioStep {...stepProps} />}
        {step === 2 && <ReviewStep draft={draft} />}
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
        {step > 0 ? (
          <button
            type="button"
            onClick={goBack}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-foreground disabled:opacity-50"
          >
            <HiOutlineArrowLeft className="size-4" />
            Back
          </button>
        ) : (
          <span />
        )}

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="button-3d inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-indigo-600"
          >
            Continue
            <HiOutlineArrowRight className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="button-3d inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-indigo-600 disabled:pointer-events-none disabled:opacity-60"
          >
            {submitting ? "Setting up..." : "Become an instructor"}
            {!submitting && <HiOutlineArrowRight className="size-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
