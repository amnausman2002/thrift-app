"use client";

import { useId } from "react";

// PROVISIONAL. None of the 25 sections in components.html has a checkbox or a
// yes/no control, so there is no design for this yet. Rather than invent one,
// this reuses the condition picker's rows unchanged (.condition-option and
// friends), which is the showcase's existing pattern for "pick one of these,
// each with a line of explanation".
//
// Bismah needs to confirm or replace this. It is in CLAUDE.md as an open item.
//
// Two options rather than a single tick on purpose: the PRD calls is_replica a
// "required declaration, not inferred". An unticked checkbox is indistinguishable
// from a question she never read, and quietly means "no" on her behalf. Two
// options make her actually answer.

type Props = {
  value: boolean | null;
  onChange: (value: boolean) => void;
  name?: string;
};

const OPTIONS: { value: boolean; label: string; description: string }[] = [
  {
    value: false,
    label: "It's the real thing",
    description: "Bought from the brand or an authorised stockist",
  },
  {
    value: true,
    label: "It's a replica",
    description: "A copy of a branded design. Totally fine to sell, just say so",
  },
];

export default function ReplicaPicker({ value, onChange, name }: Props) {
  const generatedName = useId();
  const groupName = name ?? generatedName;

  return (
    <div className="condition-picker" role="radiogroup" aria-label="Is it a replica?">
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <label
            key={String(option.value)}
            className={selected ? "condition-option selected" : "condition-option"}
          >
            <input
              className="sr-only"
              type="radio"
              name={groupName}
              value={String(option.value)}
              checked={selected}
              onChange={() => onChange(option.value)}
            />
            <span className="condition-radio">
              <span className="condition-radio-dot" />
            </span>
            <span className="condition-text">
              <span className="condition-text-label">{option.label}</span>
              <span className="condition-text-desc">{option.description}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
