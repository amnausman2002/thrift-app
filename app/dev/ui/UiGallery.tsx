"use client";

import { useState } from "react";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import TextLink from "@/components/ui/TextLink";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import FilterChip from "@/components/ui/FilterChip";
import ChipRow from "@/components/ui/ChipRow";
import StatusChip from "@/components/ui/StatusChip";
import BottomSheet from "@/components/ui/BottomSheet";
import PhotoGrid from "@/components/seller/PhotoGrid";
import ConditionPicker from "@/components/seller/ConditionPicker";
import type { GridPhoto } from "@/components/seller/PhotoSlot";
import { LISTING_STATUSES, CLOTHING_SIZES } from "@/lib/constants";
import type { ConditionValue } from "@/lib/constants";

// A 1x1 grey pixel, so the grid can be exercised without picking real files.
const STUB =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#d8d6d1"/></svg>',
  );

export default function UiGallery() {
  const [size, setSize] = useState<string | null>("M");
  const [sheet, setSheet] = useState<null | "confirm" | "advisory">(null);
  const [condition, setCondition] = useState<ConditionValue | null>("very_good");
  const [photos, setPhotos] = useState<GridPhoto[]>([
    { id: "a", url: STUB },
    { id: "b", url: STUB },
    { id: "c", url: STUB, problem: "Kept the original" },
  ]);
  const [coverId, setCoverId] = useState<string | null>("a");

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "var(--space-8) var(--space-4)" }}>
      <h1 className="text-h1" style={{ marginBottom: "var(--space-6)" }}>
        components/ui
      </h1>

      <Section title="Buttons">
        <div style={{ maxWidth: 375, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <PrimaryButton>Submit listing</PrimaryButton>
          <PrimaryButton disabled>Submit listing (disabled)</PrimaryButton>
          <SecondaryButton>Keep it</SecondaryButton>
          <SecondaryButton disabled>Keep it (disabled)</SecondaryButton>
          <TextLink>Continue anyway</TextLink>
          <TextLink href="/dev/prefill">View my listings (a real link)</TextLink>
        </div>
      </Section>

      <Section title="Input and textarea">
        <div style={{ maxWidth: 375, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Input label="Item title" placeholder="e.g. Khaadi lawn kurta" hint="Be specific about colour and print." />
          <Input label="Price (Rs)" defaultValue="abc" error="Enter a number only." />
          <Input label="City (disabled)" defaultValue="Lahore" disabled />
          <Textarea label="Fit note" placeholder="Marked small but fits a medium" hint="Only if the fit is unusual." />
        </div>
      </Section>

      <Section title="Filter chips">
        <ChipRow label="Size">
          {CLOTHING_SIZES.map((s) => (
            <FilterChip key={s} active={size === s} onClick={() => setSize(size === s ? null : s)}>
              {s}
            </FilterChip>
          ))}
        </ChipRow>
        <p className="text-caption" style={{ marginTop: "var(--space-2)", color: "var(--text-tertiary)" }}>
          Selected: {size ?? "none"}
        </p>
      </Section>

      <Section title="Status chips">
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          {LISTING_STATUSES.map((s) => (
            <StatusChip key={s} status={s} />
          ))}
        </div>
      </Section>

      <Section title="Photo grid and cover picker">
        <div style={{ maxWidth: 375 }}>
          <PhotoGrid
            photos={photos}
            coverId={coverId}
            onAdd={(files) => {
              const added = files.map((file, i) => ({
                id: `${Date.now()}-${i}`,
                url: URL.createObjectURL(file),
              }));
              setPhotos((current) => {
                const next = [...current, ...added];
                if (!coverId && next.length > 0) setCoverId(next[0].id);
                return next;
              });
            }}
            onRemove={(id) =>
              setPhotos((current) => {
                const next = current.filter((p) => p.id !== id);
                if (id === coverId) setCoverId(next[0]?.id ?? null);
                return next;
              })
            }
            onSetCover={setCoverId}
          />
          <p className="text-caption" style={{ marginTop: "var(--space-2)", color: "var(--text-tertiary)" }}>
            {photos.length} photo(s), cover: {coverId ?? "none"}
          </p>
        </div>
      </Section>

      <Section title="Condition picker">
        <div style={{ maxWidth: 375 }}>
          <ConditionPicker value={condition} onChange={setCondition} />
          <p className="text-caption" style={{ marginTop: "var(--space-2)", color: "var(--text-tertiary)" }}>
            Selected: {condition ?? "none"}
          </p>
        </div>
      </Section>

      <Section title="Bottom sheet">
        <div style={{ maxWidth: 375, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <PrimaryButton onClick={() => setSheet("confirm")}>Show submission confirmation</PrimaryButton>
          <SecondaryButton onClick={() => setSheet("advisory")}>Show photo quality advisory</SecondaryButton>
        </div>
      </Section>

      <BottomSheet
        open={sheet === "confirm"}
        onClose={() => setSheet(null)}
        heading="We're reviewing your listing."
        body="We're just going to check a few details and we'll get back to you within 24 hours."
        media={
          <div className="bottom-sheet-item">
            <div className="bottom-sheet-thumb" />
            <div>
              <p className="bottom-sheet-item-name">Khaadi lawn kurta</p>
              <p className="bottom-sheet-item-price">Rs 3,000</p>
            </div>
          </div>
        }
      >
        <PrimaryButton onClick={() => setSheet(null)}>View my listings</PrimaryButton>
        <TextLink onClick={() => setSheet(null)}>List another item</TextLink>
      </BottomSheet>

      <BottomSheet
        open={sheet === "advisory"}
        onClose={() => setSheet(null)}
        dismissOnOverlayClick={false}
        heading="One photo needs attention"
        body="Photo 2 looks a bit dark. Try retaking it near a window in natural light. You can still continue without changing it."
        media={
          <div className="advisory-preview">
            <div className="advisory-preview-label">Photo 2</div>
            Photo preview
          </div>
        }
      >
        <PrimaryButton onClick={() => setSheet(null)}>Retake photo</PrimaryButton>
        <TextLink onClick={() => setSheet(null)}>Continue anyway</TextLink>
      </BottomSheet>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "var(--space-8)" }}>
      <h2 className="text-h2" style={{ marginBottom: "var(--space-4)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
