"use client";

import FilterChip from "@/components/ui/FilterChip";
import ChipRow from "@/components/ui/ChipRow";
import { markLabel, type FieldMark } from "./prefillToForm";

// Two small pieces that make an AI suggestion look different from something she
// typed, which design-system.md requires.
//
// Both are text, not colour-plus-icon: the only warm token in the palette is
// --status-pending, and "no coloured calls to action" rules out inventing an
// accent for this.

/** The line under a field we filled in. */
export function AiMark({ mark }: { mark?: FieldMark }) {
  if (!mark) return null;
  return <span className="ai-mark">{markLabel(mark)}</span>;
}

/** What we offer instead of filling a field when we are not confident enough.
 *  Tapping a chip is her decision, not ours. */
export function CouldItBe({
  label,
  onPick,
}: {
  /** The already-formatted display label, for example "Khaadi". */
  label: string;
  onPick: () => void;
}) {
  return (
    <div className="ai-could-be">
      <span className="ai-could-be-label">Could it be...?</span>
      <ChipRow label="Suggestion">
        <FilterChip onClick={onPick}>{label}</FilterChip>
      </ChipRow>
    </div>
  );
}
