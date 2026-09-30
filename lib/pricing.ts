// Our own pricing rules. Gemini never sets or sees a price.
// Everything here is a suggestion: the seller types the final number herself.

import type { Brand, Category, ConditionValue } from "@/lib/constants";
import { BRAND_TIERS, TIER_RANGES } from "@/lib/pricing-table";

export type PriceRange = {
  min: number;
  max: number;
  /** True when the range came from the hand-edited table rather than an
   *  original price, so the form can label it as a rough guess. */
  isRough: boolean;
};

/** Share of the original price to suggest, by condition. Starting guesses. */
const CONDITION_SHARE: Record<ConditionValue, { min: number; max: number }> = {
  brand_new_with_tags: { min: 0.55, max: 0.7 },
  brand_new_without_tags: { min: 0.4, max: 0.55 },
  very_good: { min: 0.3, max: 0.45 },
  fair: { min: 0.2, max: 0.3 },
};

function roundToNearest100(value: number): number {
  return Math.max(100, Math.round(value / 100) * 100);
}

export type SuggestPriceInput = {
  condition: ConditionValue | "unknown";
  brand: Brand;
  category: Category | "unknown";
  originalPrice?: number;
};

/**
 * Returns a suggested PKR range, or null when we do not know enough to guess.
 *
 * With an original price and a known condition, the range is a share of that
 * price. Otherwise it comes from the brand tier x category table, and is
 * marked rough. If neither path is possible, returns null and the form simply
 * shows no suggestion.
 */
export function suggestPrice({
  condition,
  brand,
  category,
  originalPrice,
}: SuggestPriceInput): PriceRange | null {
  const hasOriginal = typeof originalPrice === "number" && Number.isFinite(originalPrice) && originalPrice > 0;

  if (hasOriginal && condition !== "unknown") {
    const share = CONDITION_SHARE[condition];
    return {
      min: roundToNearest100(originalPrice * share.min),
      max: roundToNearest100(originalPrice * share.max),
      isRough: false,
    };
  }

  if (category === "unknown") {
    return null;
  }

  const tier = BRAND_TIERS[brand] ?? "unbranded";
  const range = TIER_RANGES[tier][category];

  return {
    min: roundToNearest100(range.min),
    max: roundToNearest100(range.max),
    isRough: true,
  };
}
