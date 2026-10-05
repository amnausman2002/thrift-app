"use client";

import { useState } from "react";
import PrimaryButton from "@/components/ui/PrimaryButton";
import TextLink from "@/components/ui/TextLink";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import FilterChip from "@/components/ui/FilterChip";
import ChipRow from "@/components/ui/ChipRow";
import BottomSheet from "@/components/ui/BottomSheet";
import ConditionPicker from "@/components/seller/ConditionPicker";
import ReplicaPicker from "@/components/seller/ReplicaPicker";
import { AiMark, CouldItBe } from "./AiHints";
import { brandEvidenceLabel, type Prefilled } from "./prefillToForm";
import type { FormFields, SellPhoto } from "./types";
import {
  BRANDS,
  CATEGORIES,
  CITIES,
  CONDITIONS,
  SIZE_OPTIONS,
  brandLabel,
  categoryLabel,
} from "@/lib/constants";
import type { Brand, Category, City, ConditionValue, Size } from "@/lib/constants";

// Everything that is not a photo. Photos and the AI read happen on the two
// steps before this one, so by the time she gets here the form is already part
// filled and her job is to correct it rather than compose it.
//
// Fields marked with AiMark were filled by Call 1. Fields with a "Could it
// be...?" chip were left empty on purpose, because confidence was low.
//
// There is no suggested price and no price range. She types her own.

const CATEGORY_OPTIONS = CATEGORIES.map((value) => ({ value, label: categoryLabel(value) }));
const BRAND_OPTIONS = BRANDS.map((value) => ({ value, label: brandLabel(value) }));

type Props = {
  photos: SellPhoto[];
  coverId: string | null;
  /** Owned by SellFlow, so a trip back to the photos does not wipe it. */
  fields: FormFields;
  onChange: (patch: Partial<FormFields>) => void;
  prefilled: Prefilled;
  /** Set when Call 1 failed. Shown once, quietly: the form still works. */
  prefillError: string | null;
  onBackToPhotos: () => void;
};

export default function SellForm({
  photos,
  coverId,
  fields,
  onChange,
  prefilled,
  prefillError,
  onBackToPhotos,
}: Props) {
  const {
    title, category, brand, brandOther, colour, size,
    condition, flawNote, isReplica, price, city, fitNote,
  } = fields;

  // A suggestion she has taken, or dismissed by typing, stops being offered.
  const [takenChips, setTakenChips] = useState<Record<string, boolean>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // null means this category has no size at all: bags and dupattas.
  const sizeOptions = category ? SIZE_OPTIONS[category] : null;
  const evidence = brandEvidenceLabel(prefilled.brandEvidence);

  function handleCategoryChange(next: Category | "") {
    onChange({ category: next });
    // A size that does not exist in the new category would silently submit.
    const nextOptions = next ? SIZE_OPTIONS[next] : null;
    if (!nextOptions || (size && !nextOptions.includes(size))) onChange({ size: null });
  }

  function validate(): Record<string, string> {
    const found: Record<string, string> = {};
    if (!title.trim()) found.title = "Give it a short title.";
    if (!category) found.category = "Pick a category.";
    if (!brand) found.brand = "Pick one, or choose Not sure / no label.";
    if (brand === "other" && !brandOther.trim()) found.brandOther = "Which brand is it?";
    if (sizeOptions && !size) found.size = "Pick a size.";
    if (!condition) found.condition = "Pick a condition.";
    if (isReplica === null) found.isReplica = "Let buyers know either way.";
    if (!price) found.price = "Add your asking price.";
    if (!city) found.city = "Pick a city.";
    return found;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Take her to the first thing that needs attention.
      document.querySelector<HTMLElement>("[data-error='true']")?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
      return;
    }
    // TODO: this is where POST /api/listings/submit goes, writing status
    // "pending" with the Admin SDK. Nothing persists until Firebase exists.
    setSubmitted(true);
  }

  const cover = photos.find((photo) => photo.id === coverId);

  return (
    <>
      <form className="sell-form" onSubmit={handleSubmit} noValidate>
        <div className="sell-form-photos">
          {photos.map((photo) => (
            <img key={photo.id} className="sell-form-thumb" src={photo.url} alt="" />
          ))}
          <TextLink onClick={onBackToPhotos} className="sell-form-photos-edit">
            Edit photos
          </TextLink>
        </div>

        {prefillError && (
          <p className="sell-form-notice">
            {/* "nothing new" rather than "nothing": on a second attempt that
                fails, what an earlier read filled in is still on the form, and
                wiping it because a retry failed would be the wrong trade. */}
            We could not read your photos this time, so there is nothing new filled in below.
            Everything still works, it is just yours to type.
          </p>
        )}

        <div data-error={Boolean(errors.title)}>
          <Input
            label="Title"
            placeholder="e.g. Khaadi lawn kurta"
            hint="Be specific about colour and print."
            value={title}
            onChange={(event) => onChange({ title: event.target.value })}
            error={errors.title}
          />
          <AiMark mark={title === prefilled.title ? prefilled.titleMark : undefined} />
        </div>

        <div data-error={Boolean(errors.category)}>
          <Select
            label="What is it?"
            placeholder="Pick a category"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(event) => handleCategoryChange(event.target.value as Category | "")}
            error={errors.category}
          />
          <AiMark mark={category === prefilled.category ? prefilled.categoryMark : undefined} />
          {!category && prefilled.categorySuggestion && !takenChips.category && (
            <CouldItBe
              label={categoryLabel(prefilled.categorySuggestion)}
              onPick={() => {
                handleCategoryChange(prefilled.categorySuggestion!);
                setTakenChips((current) => ({ ...current, category: true }));
              }}
            />
          )}
        </div>

        <div data-error={Boolean(errors.brand)}>
          <Select
            label="Brand"
            placeholder="Pick a brand"
            options={BRAND_OPTIONS}
            value={brand}
            onChange={(event) => onChange({ brand: event.target.value as Brand | "" })}
            // Nudging her towards "Not sure" is only useful while the field is
            // empty. Once we have read a brand off a label, the hint, the
            // marker and the evidence line would be three lines of support
            // under one field, two of them answering a question she no longer
            // has.
            hint={brand ? undefined : "No label? Choose Not sure / no label. It is a normal answer."}
            error={errors.brand}
          />
          <AiMark mark={brand === prefilled.brand ? prefilled.brandMark : undefined} />
          {evidence && brand === prefilled.brand && prefilled.brandMark && (
            <span className="ai-mark ai-mark-quiet">{evidence}</span>
          )}
          {!brand && prefilled.brandSuggestion && !takenChips.brand && (
            <CouldItBe
              label={brandLabel(prefilled.brandSuggestion)}
              onPick={() => {
                onChange({ brand: prefilled.brandSuggestion! });
                setTakenChips((current) => ({ ...current, brand: true }));
              }}
            />
          )}
        </div>

        {brand === "other" && (
          <div data-error={Boolean(errors.brandOther)}>
            <Input
              label="Which brand?"
              placeholder="As printed on the label"
              value={brandOther}
              onChange={(event) => onChange({ brandOther: event.target.value })}
              error={errors.brandOther}
            />
          </div>
        )}

        <div>
          <Input
            label="Colour"
            placeholder="e.g. navy blue"
            hint="Plain everyday words. Buyers search with these."
            value={colour}
            onChange={(event) => onChange({ colour: event.target.value })}
          />
          <AiMark mark={colour === prefilled.colour ? prefilled.colourMark : undefined} />
        </div>

        {/* Bags and dupattas have no size, so the field is not shown at all. */}
        {sizeOptions && (
          <div data-error={Boolean(errors.size)}>
            <span className="sell-form-section-label">Size</span>
            <ChipRow label="Size">
              {sizeOptions.map((option) => (
                <FilterChip
                  key={option}
                  active={size === option}
                  onClick={() => onChange({ size: size === option ? null : option })}
                >
                  {option}
                </FilterChip>
              ))}
            </ChipRow>
            {errors.size && <p className="input-error-msg">{errors.size}</p>}
          </div>
        )}

        <div data-error={Boolean(errors.condition)}>
          <span className="sell-form-section-label">Condition</span>
          <ConditionPicker value={condition} onChange={(value) => onChange({ condition: value })} />
          <AiMark mark={condition === prefilled.condition ? prefilled.conditionMark : undefined} />
          {!condition && prefilled.conditionSuggestion && !takenChips.condition && (
            <CouldItBe
              label={
                CONDITIONS.find((item) => item.value === prefilled.conditionSuggestion)?.label ?? ""
              }
              onPick={() => {
                onChange({ condition: prefilled.conditionSuggestion! });
                setTakenChips((current) => ({ ...current, condition: true }));
              }}
            />
          )}
          {errors.condition && <p className="input-error-msg">{errors.condition}</p>}
        </div>

        <div>
          <Textarea
            label={
              <>
                Anything to flag? <span className="sell-form-optional">(optional)</span>
              </>
            }
            placeholder="Slight pilling under the arms"
            hint="Marks, pulls, fading. Saying it first is what buyers trust."
            value={flawNote}
            onChange={(event) => onChange({ flawNote: event.target.value })}
          />
          <AiMark mark={flawNote === prefilled.flawNote ? prefilled.flawMark : undefined} />
        </div>

        <div data-error={Boolean(errors.isReplica)}>
          <span className="sell-form-section-label">Is it a replica?</span>
          <ReplicaPicker value={isReplica} onChange={(value) => onChange({ isReplica: value })} />
          {errors.isReplica && <p className="input-error-msg">{errors.isReplica}</p>}
        </div>

        <div data-error={Boolean(errors.price)}>
          <Input
            label="Your asking price (Rs)"
            placeholder="3000"
            inputMode="numeric"
            hint="Whole rupees. This one is yours. We do not guess."
            value={price}
            // Digits only. type="number" would let the scroll wheel change it.
            onChange={(event) => onChange({ price: event.target.value.replace(/\D/g, "") })}
            error={errors.price}
          />
        </div>

        <div data-error={Boolean(errors.city)}>
          <Select
            label="City"
            placeholder="Pick a city"
            options={CITIES}
            value={city}
            onChange={(event) => onChange({ city: event.target.value as City | "" })}
            hint="Buyers nearby can arrange same-day pickup."
            error={errors.city}
          />
        </div>

        <Textarea
          label={
            <>
              Fit note <span className="sell-form-optional">(optional)</span>
            </>
          }
          placeholder="Marked small but fits a medium"
          hint="Only if the fit is unusual."
          value={fitNote}
          onChange={(event) => onChange({ fitNote: event.target.value })}
        />

        <PrimaryButton type="submit">Submit listing</PrimaryButton>
      </form>

      <BottomSheet
        open={submitted}
        onClose={() => setSubmitted(false)}
        heading="All good so far!"
        body="We'll review your listing and get back to you within a day."
        media={
          <div className="bottom-sheet-item">
            {cover ? (
              <img className="bottom-sheet-thumb" src={cover.url} alt="" />
            ) : (
              <div className="bottom-sheet-thumb" />
            )}
            <div>
              <p className="bottom-sheet-item-name">{title}</p>
              <p className="bottom-sheet-item-price">Rs {Number(price).toLocaleString("en-PK")}</p>
            </div>
          </div>
        }
      >
        <PrimaryButton onClick={() => setSubmitted(false)}>View my listings</PrimaryButton>
        <TextLink onClick={() => setSubmitted(false)}>List another item</TextLink>
      </BottomSheet>
    </>
  );
}
