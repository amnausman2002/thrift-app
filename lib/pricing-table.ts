// These numbers are starting guesses, not market data.
// Edit them by hand as you see what real items actually sell for.
//
// Two tables live here:
//   BRAND_TIERS  — which price tier each brand sits in
//   TIER_RANGES  — the resale range, in PKR, for each tier x category
//
// Used only when the seller did not give an original price. When she does,
// lib/pricing.ts works from that instead and ignores this file.

import type { Brand, Category } from "@/lib/constants";

export type PriceTier = "premium" | "mid" | "value" | "unbranded";

export const BRAND_TIERS: Record<Brand, PriceTier> = {
  // Pakistani designer and premium
  elan: "premium",
  maria_b: "premium",
  sana_safinaz: "premium",
  asim_jofa: "premium",
  faiza_saqlain: "premium",
  agha_noor: "premium",
  baroque: "premium",
  crimson: "premium",

  // Pakistani high street
  khaadi: "mid",
  sapphire: "mid",
  generation: "mid",
  gul_ahmed: "mid",
  ideas_by_gul_ahmed: "mid",
  alkaram_studio: "mid",
  limelight: "mid",
  nishat_linen: "mid",
  outfitters: "mid",
  beechtree: "mid",
  junaid_jamshed: "mid",
  ethnic: "mid",
  cross_stitch: "mid",
  mausummery: "mid",
  breakhouse: "mid",
  bonanza_satrangi: "mid",
  zellbury: "value",

  // Western and international
  tommy_hilfiger: "premium",
  calvin_klein: "premium",
  levis: "premium",
  nike: "premium",
  adidas: "premium",
  marks_and_spencer: "premium",
  zara: "mid",
  mango: "mid",
  puma: "mid",
  bershka: "mid",
  pull_and_bear: "mid",
  stradivarius: "mid",
  hm: "value",
  forever_21: "value",
  shein: "value",

  // No usable brand: priced as unbranded, and always shown as a rough range
  other: "unbranded",
  unknown: "unbranded",
};

export const TIER_RANGES: Record<PriceTier, Record<Category, { min: number; max: number }>> = {
  premium: {
    kurta: { min: 2500, max: 4500 },
    pret: { min: 4000, max: 8000 },
    co_ord_set: { min: 5000, max: 9000 },
    dupatta: { min: 1500, max: 3000 },
    dress: { min: 4000, max: 7500 },
    top: { min: 2000, max: 4000 },
    bottoms: { min: 2000, max: 4000 },
    jeans: { min: 2500, max: 4500 },
    skirt: { min: 2000, max: 4000 },
    jacket: { min: 4000, max: 8000 },
    sportswear: { min: 3000, max: 6000 },
    shoes: { min: 4000, max: 8000 },
    bag: { min: 4000, max: 9000 },
  },
  mid: {
    kurta: { min: 1200, max: 2500 },
    pret: { min: 2000, max: 4000 },
    co_ord_set: { min: 2500, max: 4500 },
    dupatta: { min: 800, max: 1500 },
    dress: { min: 2000, max: 3500 },
    top: { min: 900, max: 1800 },
    bottoms: { min: 1000, max: 2000 },
    jeans: { min: 1500, max: 2800 },
    skirt: { min: 1000, max: 2000 },
    jacket: { min: 2000, max: 4000 },
    sportswear: { min: 1500, max: 3000 },
    shoes: { min: 2000, max: 4000 },
    bag: { min: 1800, max: 3500 },
  },
  value: {
    kurta: { min: 600, max: 1200 },
    pret: { min: 1000, max: 2000 },
    co_ord_set: { min: 1200, max: 2200 },
    dupatta: { min: 400, max: 800 },
    dress: { min: 900, max: 1800 },
    top: { min: 500, max: 1000 },
    bottoms: { min: 600, max: 1200 },
    jeans: { min: 800, max: 1600 },
    skirt: { min: 600, max: 1200 },
    jacket: { min: 1000, max: 2000 },
    sportswear: { min: 800, max: 1600 },
    shoes: { min: 1000, max: 2000 },
    bag: { min: 900, max: 1800 },
  },
  unbranded: {
    kurta: { min: 500, max: 1000 },
    pret: { min: 800, max: 1600 },
    co_ord_set: { min: 1000, max: 1800 },
    dupatta: { min: 300, max: 600 },
    dress: { min: 700, max: 1400 },
    top: { min: 400, max: 800 },
    bottoms: { min: 500, max: 1000 },
    jeans: { min: 700, max: 1400 },
    skirt: { min: 500, max: 1000 },
    jacket: { min: 900, max: 1700 },
    sportswear: { min: 700, max: 1300 },
    shoes: { min: 800, max: 1600 },
    bag: { min: 700, max: 1500 },
  },
};
