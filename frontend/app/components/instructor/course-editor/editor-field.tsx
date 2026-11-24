import type { ReactNode } from "react";

/**
 * Label + hint wrapper for the course editor's inputs. Keeps every field
 * aligned without repeating the same markup in the basics and lesson forms.
 */
export function EditorField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold text-foreground"
      >
        {label}
      </label>
      {hint ? <p className="mt-0.5 text-xs text-slate-400">{hint}</p> : null}
      <div className="mt-2">{children}</div>
    </div>
  );
}
