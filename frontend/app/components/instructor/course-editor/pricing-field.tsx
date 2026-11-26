import { useState } from "react";
import { Input } from "@/components/ui/input";
import { MAX_COURSE_PRICE_CENTS } from "@/lib/api/courses";
import { cn } from "@/lib/utils";
import type { CourseDraft } from "./course-draft";

type PricingFieldProps = {
  pricing: CourseDraft["pricing"];
  priceCents: number | null;
  disabled: boolean;
  onChange: (patch: Pick<CourseDraft, "pricing" | "priceCents">) => void;
};

const OPTIONS = [
  { value: "free", label: "Free", copy: "Anyone can enroll at no cost." },
  { value: "paid", label: "Paid", copy: "One-time price for full access." },
] as const;

/**
 * Free vs paid choice and the USD price input. The first lesson stays a free
 * preview either way, which is explained in the card around this field.
 */
export function PricingField({
  pricing,
  priceCents,
  disabled,
  onChange,
}: PricingFieldProps) {
  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const active = pricing === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              disabled={disabled}
              onClick={() =>
                // Keep the typed amount in the draft so toggling back to paid
                // restores it; free courses never send a price to the API.
                onChange({ pricing: option.value, priceCents })
              }
              className={cn(
                "rounded-2xl border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                active
                  ? "border-primary bg-primary-soft/60"
                  : "border-slate-200 bg-white hover:border-slate-300",
              )}
            >
              <span className="block text-sm font-semibold text-foreground">
                {option.label}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                {option.copy}
              </span>
            </button>
          );
        })}
      </div>

      {pricing === "paid" ? (
        <PriceInput
          priceCents={priceCents}
          disabled={disabled}
          onChange={(cents) => onChange({ pricing, priceCents: cents })}
        />
      ) : null}
    </div>
  );
}

/**
 * Keeps the typed text local so decimals like "12." survive a keystroke, and
 * commits whole USD cents to the draft. Nothing is charged here.
 */
function PriceInput({
  priceCents,
  disabled,
  onChange,
}: {
  priceCents: number | null;
  disabled: boolean;
  onChange: (cents: number | null) => void;
}) {
  const [text, setText] = useState(
    priceCents === null ? "" : (priceCents / 100).toFixed(2),
  );

  const handleChange = (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, "");
    setText(cleaned);

    const amount = Number(cleaned);

    if (cleaned.trim() === "" || Number.isNaN(amount)) {
      onChange(null);
      return;
    }

    onChange(
      Math.min(Math.max(Math.round(amount * 100), 0), MAX_COURSE_PRICE_CENTS),
    );
  };

  return (
    <div className="mt-3">
      <label
        htmlFor="course-price"
        className="text-xs font-semibold text-slate-500"
      >
        Price (USD)
      </label>
      <div className="mt-1">
        <Input
          id="course-price"
          inputMode="decimal"
          value={text}
          disabled={disabled}
          icon={<span className="text-sm font-semibold text-slate-400">$</span>}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="49.00"
          aria-describedby="course-price-hint"
        />
      </div>
      <p id="course-price-hint" className="mt-1 text-[11px] text-slate-400">
        Charged once. Learners keep access for life.
      </p>
    </div>
  );
}
