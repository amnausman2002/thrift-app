"use client";

import { useId } from "react";
import type { InputHTMLAttributes } from "react";

// .input from components.html, with its .input-label, .input-hint and
// .input-error-msg siblings bundled in so a labelled field is one component.
//
// "use client" is here for useId, which generates the id that ties the label to
// the input. Without that link a tap on the label does not focus the field and
// a screen reader cannot name it. Pass `id` to override.

type Props = {
  label?: string;
  hint?: string;
  /** When set, the border turns red and the message shows under the field. */
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function Input({ label, hint, error, id, className, ...props }: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  // Point the field at whichever messages are actually on screen.
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      {label && (
        <label className="input-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[ "input", error && "input-error", className ].filter(Boolean).join(" ")}
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
