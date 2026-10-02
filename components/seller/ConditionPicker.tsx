"use client";

import { useId } from "react";
import { CONDITIONS } from "@/lib/constants";
import type { ConditionValue } from "@/lib/constants";

// .condition-picker from components.html section 11.
//
// Options come from CONDITIONS in lib/constants.ts, never from this file. The
// descriptions are not decoration: they are there so two sellers mean the same
// thing by the same word, so they are always shown.
//
// CHANGED FROM components.html: the rows are <div>s there. Here each row is a
// <label> wrapping a real visually-hidden <input type="radio">, which buys
// native radio-group behaviour for free: arrow keys move between options, only
// one can be chosen, and a screen reader announces "2 of 4". The .selected
// class and the markup inside are otherwise unchanged.

type Props = {
  value: ConditionValue | null;
  onChange: (value: ConditionValue) => void;
  /** Groups the radios. Defaults to a generated name, which is fine unless two
   *  pickers share one page. */
  name?: string;
};

export default function ConditionPicker({ value, onChange, name }: Props) {
  const generatedName = useId();
  const groupName = name ?? generatedName;

  return (
    <div className="condition-picker" role="radiogroup" aria-label="Condition">
      {CONDITIONS.map((condition) => {
        const selected = value === condition.value;
        return (
          <label
            key={condition.value}
            className={selected ? "condition-option selected" : "condition-option"}
          >
            <input
              className="sr-only"
              type="radio"
              name={groupName}
              value={condition.value}
              checked={selected}
              onChange={() => onChange(condition.value)}
            />
            <span className="condition-radio">
              <span className="condition-radio-dot" />
            </span>
            <span className="condition-text">
              <span className="condition-text-label">{condition.label}</span>
              <span className="condition-text-desc">{condition.description}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
