"use client";

import { useEffect, useState } from "react";
import PrimaryButton from "@/components/ui/PrimaryButton";
import TextLink from "@/components/ui/TextLink";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import FilterChip from "@/components/ui/FilterChip";
import ChipRow from "@/components/ui/ChipRow";
import BottomSheet from "@/components/ui/BottomSheet";
import PhotoGrid from "@/components/seller/PhotoGrid";
import ConditionPicker from "@/components/seller/ConditionPicker";
import ReplicaPicker from "@/components/seller/ReplicaPicker";
import type { GridPhoto } from "@/components/seller/PhotoSlot";
import { preparePhotos } from "@/lib/photos";
import {
  CATEGORIES,
  CITIES,
  SIZE_OPTIONS,
  MIN_LISTING_PHOTOS,
  PHOTO_TIPS,
} from "@/lib/constants";
import type { Category, City, ConditionValue, Size } from "@/lib/constants";

// Path 1, step 6: she picks which photo leads, adds size, city, asking price,
// a fit note if the fit is unusual, and ticks whether it is a replica.
//
// Two fields beyond that list are here because the five do not work without
// them: category, which decides whether a size field is shown at all and which
// sizes, and title, which is how a listing is identified in the queue and on
// the confirmation. Brand, colour and description arrive with the AI prefill.
//
// There is no suggested price and no price range. She types her own.

type SellPhoto = GridPhoto & { file: File };

/** A local id for a photo in this form, nothing to do with the Listing id.
 *
 *  crypto.randomUUID() exists only in a secure context, so it is there on
 *  localhost and on https but undefined when the phone opens the dev server
 *  over http on the local network. That is exactly how we test on a real
 *  phone, so fall back rather than throw. */
function photoId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Turn a snake_case constant into something readable, for the category list. */
function titleCase(value: string): string {
  return value.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

const CATEGORY_OPTIONS = CATEGORIES.map((value) => ({ value, label: titleCase(value) }));

export default function SellForm() {
  const [photos, setPhotos] = useState<SellPhoto[]>([]);
  const [coverId, setCoverId] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [size, setSize] = useState<Size | null>(null);
  const [condition, setCondition] = useState<ConditionValue | null>(null);
  const [isReplica, setIsReplica] = useState<boolean | null>(null);
  const [price, setPrice] = useState("");
  const [city, setCity] = useState<City | "">("");
  const [fitNote, setFitNote] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // null means this category has no size at all: bags and dupattas.
  const sizeOptions = category ? SIZE_OPTIONS[category] : null;

  // Object URLs are a browser-level allocation; without this they leak.
  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd(files: File[]) {
    setPreparing(true);
    // Converts HEIC, resizes to 1600px and strips EXIF, so her home GPS
    // location never leaves the phone. It never throws: on failure it keeps the
    // original and sets `problem`.
    const prepared = await preparePhotos(files);
    const added: SellPhoto[] = prepared.map((item) => ({
      id: photoId(),
      url: URL.createObjectURL(item.file),
      problem: item.problem,
      file: item.file,
    }));
    setPhotos((current) => {
      const next = [...current, ...added];
      // The first photo added becomes the cover. She can change it after.
      if (!coverId && next.length > 0) setCoverId(next[0].id);
      return next;
    });
    setPreparing(false);
  }

  function handleRemove(id: string) {
    setPhotos((current) => {
      const photo = current.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.url);
      const next = current.filter((p) => p.id !== id);
      if (id === coverId) setCoverId(next[0]?.id ?? null);
      return next;
    });
  }

  function handleCategoryChange(next: Category | "") {
    setCategory(next);
    // A size that does not exist in the new category would silently submit.
    const nextOptions = next ? SIZE_OPTIONS[next] : null;
    if (!nextOptions || (size && !nextOptions.includes(size))) {
      setSize(null);
    }
  }

  function validate(): Record<string, string> {
    const found: Record<string, string> = {};
    if (photos.length < MIN_LISTING_PHOTOS) {
      found.photos = `Add at least ${MIN_LISTING_PHOTOS} photos.`;
    }
    if (!title.trim()) found.title = "Give it a short title.";
    if (!category) found.category = "Pick a category.";
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
        <div data-error={Boolean(errors.photos)}>
          <span className="sell-form-section-label">Photos</span>
          <PhotoGrid
            photos={photos}
            coverId={coverId}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onSetCover={setCoverId}
          />
          {preparing && <p className="input-hint">Getting your photos ready...</p>}
          {errors.photos && <p className="input-error-msg">{errors.photos}</p>}
          <ul className="input-hint" style={{ marginTop: "var(--space-3)", paddingLeft: "var(--space-4)" }}>
            {PHOTO_TIPS.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>

        <div data-error={Boolean(errors.title)}>
          <Input
            label="Title"
            placeholder="e.g. Khaadi lawn kurta"
            hint="Be specific about colour and print."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            error={errors.title}
          />
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
                  onClick={() => setSize(size === option ? null : option)}
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
          <ConditionPicker value={condition} onChange={setCondition} />
          {errors.condition && <p className="input-error-msg">{errors.condition}</p>}
        </div>

        <div data-error={Boolean(errors.isReplica)}>
          <span className="sell-form-section-label">Is it a replica?</span>
          <ReplicaPicker value={isReplica} onChange={setIsReplica} />
          {errors.isReplica && <p className="input-error-msg">{errors.isReplica}</p>}
        </div>

        <div data-error={Boolean(errors.price)}>
          <Input
            label="Your asking price (Rs)"
            placeholder="3000"
            inputMode="numeric"
            hint="Whole rupees. This is yours to set."
            value={price}
            // Digits only. type="number" would let the scroll wheel change it.
            onChange={(event) => setPrice(event.target.value.replace(/\D/g, ""))}
            error={errors.price}
          />
        </div>

        <div data-error={Boolean(errors.city)}>
          <Select
            label="City"
            placeholder="Pick a city"
            options={CITIES}
            value={city}
            onChange={(event) => setCity(event.target.value as City | "")}
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
          onChange={(event) => setFitNote(event.target.value)}
        />

        <PrimaryButton type="submit">Submit listing</PrimaryButton>
      </form>

      <BottomSheet
        open={submitted}
        onClose={() => setSubmitted(false)}
        heading="We're reviewing your listing."
        body="We're just going to check a few details and we'll get back to you within 24 hours."
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
