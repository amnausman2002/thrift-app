// Browser side of the two seller AI calls.
//
// Both routes are posted at the same time, so she waits for the slower one
// rather than the sum of the two. That is the same intent as lib/ai/runBoth.ts,
// which does it on the server; this is the client equivalent and there is still
// no combined HTTP route on purpose.
//
// The response types below are declared here rather than imported from
// lib/ai/prefill.ts and lib/ai/photo-quality.ts: those pull in @google/genai,
// which would end up in the browser bundle for no reason. lib/ai/schemas.ts
// stays the source of truth for the shape. If a field changes there, it has to
// change here too.

import type { Brand, Category, ConditionValue } from "@/lib/constants";

type Confidence = "high" | "medium" | "low";
type BrandEvidence = "label_visible" | "tag_visible" | "print_or_style_only" | "none";

export type ListingDraft = {
  brand: Brand;
  brand_other?: string;
  brand_evidence: BrandEvidence;
  brand_confidence: Confidence;
  category: Category | "unknown";
  category_confidence: Confidence;
  colour: string;
  condition: ConditionValue | "unknown";
  condition_confidence: Confidence;
  flaws_seen: string;
  title_suggestion?: string;
};

export type PrefillResponse =
  | { ok: true; listing: ListingDraft; latencyMs: number }
  | { ok: false; reason?: "input" | "ai"; error: string };

export type QualityFlag = {
  photo_index: number;
  blurry: boolean;
  dark: boolean;
  busy_background: boolean;
  blends_into_background: boolean;
  item_cropped: boolean;
  crooked: boolean;
};

export type QualityResponse = {
  ok: true;
  flags: QualityFlag[];
  overallUsable?: boolean;
  retakeTip?: string;
  skipped?: boolean;
  latencyMs?: number;
};

function formDataFor(photos: File[]): FormData {
  const form = new FormData();
  for (const photo of photos) form.append("photos", photo, photo.name);
  return form;
}

/** Reads the photos into draft listing fields. Never throws: a network failure
 *  looks the same to the caller as the model failing, and both just mean she
 *  fills the form in herself. */
export async function requestPrefill(
  photos: File[],
  signal?: AbortSignal,
): Promise<PrefillResponse> {
  try {
    const response = await fetch("/api/ai/prefill", {
      method: "POST",
      body: formDataFor(photos),
      signal,
    });
    return (await response.json()) as PrefillResponse;
  } catch {
    return { ok: false, reason: "ai", error: "We could not reach the server." };
  }
}

/** Checks the photos are usable. Advisory only, so every failure is the same
 *  as having nothing to say. */
export async function requestPhotoQuality(
  photos: File[],
  signal?: AbortSignal,
): Promise<QualityResponse> {
  try {
    const response = await fetch("/api/ai/photo-quality", {
      method: "POST",
      body: formDataFor(photos),
      signal,
    });
    return (await response.json()) as QualityResponse;
  } catch {
    return { ok: true, flags: [], skipped: true };
  }
}
