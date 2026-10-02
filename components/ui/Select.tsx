"use client";

import { useId } from "react";
import type { SelectHTMLAttributes, ReactNode } from "react";

// .select-input from components.html section 20 (the report form), with the
// same label, hint and error treatment as Input so the two line up on a form.
//
// A native <select> on purpose: on a phone it opens the OS picker, which is
// faster to scroll and more familiar than anything we would build. The custom
// chevron and the removed default arrow come straight from the showcase.
//
// Shared, not seller-only: the report form and the browse filters need it too.

type Option = { value: string; label: string };

type Props = {
  /** Usually a string; ReactNode so a label can carry an "(optional)" span. */
  label?: ReactNode;
  hint?: string;
  error?: string;
  options: readonly Option[];
  /** Shown first and greyed out until she picks something. */
  placeholder?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "children">;

export default function Select({
  label,
  hint,
  error,
  options,
  placeholder,
  id,
  className,
  required,
  value,
  ...props
}: Props) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hintId = `${selectId}-hint`;
  const errorId = `${selectId}-error`;

  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      {label && (
        <label className="input-label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={["select-input", error && "input-error", className].filter(Boolean).join(" ")}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        value={value}
        // `required` with an empty-valued placeholder is what makes :invalid
        // fire, which greys the placeholder out until she chooses.
        required={required ?? Boolean(placeholder)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
