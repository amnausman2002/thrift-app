import type { ButtonHTMLAttributes } from "react";

// .filter-chip from components.html.
//
// CHANGED FROM components.html: it is a <div> there, which cannot be reached by
// keyboard or announced as a control. Here it is a <button> with aria-pressed,
// so it tabs, responds to space and enter, and a screen reader says whether it
// is on. Visually identical, same class.
//
// Two jobs: browse filters (Bismah) and the "Could it be...?" suggestion chips
// on the sell form (Amna).

type Props = {
  /** Selected state. Renders the darker border and text from the design system. */
  active?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function FilterChip({
  active = false,
  type = "button",
  className,
  ...props
}: Props) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={["filter-chip", active && "active", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
