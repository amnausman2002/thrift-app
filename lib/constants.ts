// Pakistani brands, then Western/international brands, then the two special values.
// This list lives only here — never copy it into another file.
export const BRANDS = [
  "khaadi",
  "sapphire",
  "generation",
  "elan",
  "gul_ahmed",
  "ideas_by_gul_ahmed",
  "alkaram_studio",
  "limelight",
  "nishat_linen",
  "maria_b",
  "sana_safinaz",
  "outfitters",
  "bonanza_satrangi",
  "beechtree",
  "zellbury",
  "junaid_jamshed",
  "ethnic",
  "cross_stitch",
  "baroque",
  "asim_jofa",
  "crimson",
  "mausummery",
  "agha_noor",
  "faiza_saqlain",
  "breakhouse",
  "zara",
  "hm",
  "mango",
  "levis",
  "nike",
  "adidas",
  "puma",
  "bershka",
  "pull_and_bear",
  "stradivarius",
  "marks_and_spencer",
  "tommy_hilfiger",
  "calvin_klein",
  "forever_21",
  "shein",
  "other",
  "unknown",
] as const;

export type Brand = (typeof BRANDS)[number];

// "unknown" means the seller (or the AI) cannot tell the brand — tags are
// often cut out, so this is a normal choice, never an error. "other" means a
// real brand that isn't on the list, paired with a free-text brand_other value.
export const BRAND_LABELS: Partial<Record<Brand, string>> = {
  unknown: "Not sure / no label",
};

export const CATEGORIES = [
  "kurta",
  "pret",
  "co_ord_set",
  "dupatta",
  "dress",
  "top",
  "bottoms",
  "jeans",
  "skirt",
  "jacket",
  "sportswear",
  "shoes",
  "bag",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CONDITION_VALUES = [
  "brand_new_with_tags",
  "brand_new_without_tags",
  "very_good",
  "fair",
] as const;

export type ConditionValue = (typeof CONDITION_VALUES)[number];

export const CONDITIONS: { value: ConditionValue; label: string; description: string }[] = [
  { value: "brand_new_with_tags", label: "Brand new with tags", description: "With tags, never worn" },
  { value: "brand_new_without_tags", label: "Brand new without tags", description: "No tags, never worn" },
  { value: "very_good", label: "Very good", description: "Well worn, but still in great shape" },
  { value: "fair", label: "Fair", description: "Shows some signs of wear — please photograph the areas that show it" },
];

export const PHOTO_TIPS = [
  "Daylight",
  "Plain background",
  "The whole item in frame",
  "A close-up of any flaw",
  "If there is a label or tag, take a close-up of it.",
] as const;
