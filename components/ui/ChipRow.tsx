import type { ReactNode } from "react";

// .chip-row from components.html. A horizontally scrolling strip of FilterChips
// with the scrollbar hidden, so a long filter list does not wrap on a phone.
//
// `label` names the group for screen readers, which otherwise announce a row of
// unrelated buttons. Give it something concrete, like "Size" or "Brand".
export default function ChipRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="chip-row" role="group" aria-label={label}>
      {children}
    </div>
  );
}
