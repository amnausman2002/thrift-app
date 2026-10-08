import type { GridPhoto } from "@/components/seller/PhotoSlot";
import type { Brand, Category, City, ConditionValue, Material, Size } from "@/lib/constants";
import type { Prefilled } from "./prefillToForm";

/** A photo in the sell flow: what the grid needs to draw it, plus the prepared
 *  File that gets posted to the AI routes and, later, to Cloud Storage. */
export type SellPhoto = GridPhoto & { file: File };

/** Everything on the form that is not a photo.
 *
 *  This lives in SellFlow rather than in SellForm so that stepping back to
 *  the photos and returning does not wipe what she has already typed. The form
 *  unmounts on that round trip; this does not. */
export type FormFields = {
  title: string;
  category: Category | "";
  brand: Brand | "";
  brandOther: string;
  colour: string;
  size: Size | null;
  condition: ConditionValue | null;
  /** PRD `description`. Flaws live in here too: flaw_note was merged into this
   *  field on 8 Oct, before any of it existed in a backend, so there was
   *  nothing to migrate. */
  description: string;
  isReplica: boolean | null;
  price: string;
  city: City | "";
  /** NEW FIELD, replacing fit_note on the form. Not in the PRD's Listing table
   *  yet: it needs a PRD update and Bismah's agreement, because buyers will
   *  filter on it. Optional until then. */
  material: Material | "";
};

export const EMPTY_FIELDS: FormFields = {
  title: "",
  category: "",
  brand: "",
  brandOther: "",
  colour: "",
  size: null,
  condition: null,
  description: "",
  isReplica: null,
  price: "",
  city: "",
  material: "",
};

/** Lays the AI's answer over the form, filling empty fields only.
 *
 *  This is where "never overwrite something she has typed" is actually
 *  enforced. Doing it here rather than by remounting the form means it still
 *  holds when she edits a photo and we read the photos a second time. */
export function mergePrefill(fields: FormFields, prefilled: Prefilled): FormFields {
  return {
    ...fields,
    title: fields.title || prefilled.title,
    category: fields.category || prefilled.category,
    brand: fields.brand || prefilled.brand,
    colour: fields.colour || prefilled.colour,
    condition: fields.condition ?? prefilled.condition,
  };
}
