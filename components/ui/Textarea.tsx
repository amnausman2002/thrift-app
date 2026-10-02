"use client";

import { useId } from "react";
import type { TextareaHTMLAttributes, ReactNode } from "react";

// .textarea from components.html. Same label, hint and error treatment as
// Input, so the two line up on a form. Vertically resizable, 96px minimum.
// Used for the fit note and the description.

type Props = {
  /** Usually a string; ReactNode so a label can carry an "(optional)" span. */
  label?: ReactNode;
  hint?: string;
  error?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ label, hint, error, id, className, ...props }: Props) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = `${textareaId}-hint`;
  const errorId = `${textareaId}-error`;

  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      {label && (
        <label className="input-label" htmlFor={textareaId}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={[ "textarea", error && "input-error", className ].filter(Boolean).join(" ")}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...props}
      />
      {hint && (
        <p className="input-hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="input-error-msg" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
