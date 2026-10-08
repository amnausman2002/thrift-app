// Turns Call 1's answer into starting values for the form.
//
// The rules come straight from CLAUDE.md and are the whole point of the
// feature, so they live in one readable place rather than being scattered
// through the form:
//
//   high confidence   fill the field, marked "AI suggested"
//   medium confidence fill the field, marked "AI suggested"
//   low confidence    leave it EMPTY and offer a "Could it be...?" chip
//   "unknown"         leave it empty, whatever the confidence said
//
// DEVIATION: CLAUDE.md says medium confidence should read "please check". That
// wording was dropped from the screen, so high and medium now look identical
// to her. The two are still distinct in the data, so bringing it back is a
// change to markLabel alone.
//
// Suggestions only ever land in an empty field. Nothing here can overwrite
// something she typed, because all of it runs once, before she sees the form.

import type { Brand, Category, ConditionValue } from "@/lib/constants";
import type { ListingDraft } from "./aiRequests";

/** How a filled field is labelled. "check" is the medium-confidence version. */
export type FieldMark = "suggested" | "check";

export type Prefilled = {
  title: string;
  titleMark?: FieldMark;

  category: Category | "";
  categoryMark?: FieldMark;
  /** Offered as a chip when confidence was too low to fill the field. */
  categorySuggestion?: Category;

  brand: Brand | "";
  brandMark?: FieldMark;
  brandSuggestion?: Brand;
  /** Where the brand was read, so she can see why we think so. */
  brandEvidence?: ListingDraft["brand_evidence"];

  colour: string;
  colourMark?: FieldMark;

  condition: ConditionValue | null;
  conditionMark?: FieldMark;
  conditionSuggestion?: ConditionValue;

};

export const EMPTY_PREFILL: Prefilled = {
  title: "",
  category: "",
  brand: "",
  colour: "",
  condition: null,
};

function markFor(confidence: "high" | "medium" | "low"): FieldMark | undefined {
  if (confidence === "high") return "suggested";
  if (confidence === "medium") return "check";
  return undefined; // low: the field stays empty, so there is nothing to mark
}

/** True when we are confident enough to put the value in the field itself. */
function fills(confidence: "high" | "medium" | "low"): boolean {
  return confidence !== "low";
}

export function prefillToForm(draft: ListingDraft): Prefilled {
  const result: Prefilled = { ...EMPTY_PREFILL };

  // Title and colour carry no confidence of their own: the schema has no
  // colour_confidence or title_confidence. So they are marked plainly as
  // suggestions rather than being given a confidence we invented. Adding those
  // two fields to listingDraftSchema is a sensible follow-up.
  //
  // The description is deliberately NOT prefilled. Putting flaws_seen in it
  // hides the placeholder, which is the only thing telling her what sort of
  // sentence belongs there. The model's flaws_seen is still in its answer for
  // the admin copilot to use later; it just never reaches the form.
  if (draft.title_suggestion?.trim()) {
    result.title = draft.title_suggestion.trim();
    result.titleMark = "suggested";
  }
  if (draft.colour.trim() && draft.colour.trim().toLowerCase() !== "unknown") {
    result.colour = draft.colour.trim();
    result.colourMark = "suggested";
  }

  if (draft.category !== "unknown") {
    if (fills(draft.category_confidence)) {
      result.category = draft.category;
      result.categoryMark = markFor(draft.category_confidence);
    } else {
      result.categorySuggestion = draft.category;
    }
  }

  // Brand is the one the server already policed: by the time it reaches here,
  // evidence "none" has forced brand to "unknown" and confidence to low. So
  // "unknown" here genuinely means no label was visible, which is a normal
  // answer for leftover-store stock, not a failure.
  result.brandEvidence = draft.brand_evidence;
  if (draft.brand !== "unknown") {
    if (fills(draft.brand_confidence)) {
      result.brand = draft.brand;
      result.brandMark = markFor(draft.brand_confidence);
    } else {
      result.brandSuggestion = draft.brand;
    }
  }

  if (draft.condition !== "unknown") {
    if (fills(draft.condition_confidence)) {
      result.condition = draft.condition;
      result.conditionMark = markFor(draft.condition_confidence);
    } else {
      result.conditionSuggestion = draft.condition;
    }
  }

  return result;
}

/** What a filled field is labelled. One wording for both confidences: the
 *  medium-confidence "please check" was dropped from the UI, so high and
 *  medium now read the same on screen even though they are still distinct in
 *  the data. See FieldMark above if the distinction needs to come back. */
export function markLabel(_mark: FieldMark): string {
  return "AI suggested";
}

/** Shown under the brand field so she can see what we went on. */
export function brandEvidenceLabel(
  evidence: ListingDraft["brand_evidence"] | undefined,
): string | null {
  switch (evidence) {
    case "label_visible":
      return "We read this off a label in your photos.";
    case "tag_visible":
      return "We read this off a tag in your photos.";
    default:
      return null;
  }
}
