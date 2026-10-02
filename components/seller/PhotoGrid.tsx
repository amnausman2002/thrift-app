"use client";

import { useRef, useState } from "react";
import PhotoSlot from "./PhotoSlot";
import type { GridPhoto } from "./PhotoSlot";
import { MIN_LISTING_PHOTOS, MAX_LISTING_PHOTOS } from "@/lib/constants";

// .photo-grid from components.html section 10. This is both the uploader and
// the cover picker: the showcase draws them as two states of one grid, so they
// are one component rather than two.
//
// Rules, from the PRD:
// - Two to six photos, enforced at submit. This grid never blocks her.
// - Exactly one cover. The first photo added becomes it, and she can change it.
// - Tap a photo to select it, then "Set as cover". Tapping is not destructive.
//
// The file picker uses accept="image/*" and NEVER lists image/heic. Safari 17+
// reacts to an explicit heic type by converting JPEGs *into* HEIC, which is the
// problem lib/photos.ts exists to solve.

type Props = {
  photos: GridPhoto[];
  coverId: string | null;
  /** Raw files straight from the picker. The caller runs preparePhotos. */
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onSetCover: (id: string) => void;
};

export default function PhotoGrid({ photos, coverId, onAdd, onRemove, onSetCover }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isFull = photos.length >= MAX_LISTING_PHOTOS;

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const room = MAX_LISTING_PHOTOS - photos.length;
    const files = Array.from(fileList).slice(0, room);
    if (files.length > 0) onAdd(files);
    // Clear it, otherwise choosing the same file twice in a row does nothing.
    if (inputRef.current) inputRef.current.value = "";
  }

  // One slot per photo, then the Add slot, then dimmed placeholders out to six
  // so the grid keeps its shape instead of reflowing on every upload.
  const placeholderCount = Math.max(0, MAX_LISTING_PHOTOS - photos.length - (isFull ? 0 : 1));

  return (
    <div>
      <div className="photo-grid">
        {photos.map((photo, index) => (
          <PhotoSlot
            key={photo.id}
            photo={photo}
            index={index}
            isCover={photo.id === coverId}
            isSelected={photo.id === selectedId}
            onSelect={() => setSelectedId(photo.id === selectedId ? null : photo.id)}
            onSetCover={() => {
              onSetCover(photo.id);
              setSelectedId(null);
            }}
            onRemove={() => {
              if (photo.id === selectedId) setSelectedId(null);
              onRemove(photo.id);
            }}
          />
        ))}

        {!isFull && (
          <button
            type="button"
            className="photo-slot"
            onClick={() => inputRef.current?.click()}
            aria-label="Add photos"
          >
            <span className="photo-slot-add">
              <svg
                className="photo-slot-add-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span className="photo-slot-add-text">Add</span>
            </span>
          </button>
        )}

        {Array.from({ length: placeholderCount }).map((_, i) => (
          <div key={`placeholder-${i}`} className="photo-slot is-placeholder" aria-hidden="true" />
        ))}
      </div>

      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => handleFiles(event.target.files)}
        tabIndex={-1}
      />

      <p className="photo-grid-hint">
        {photos.length === 0
          ? `${MIN_LISTING_PHOTOS} to ${MAX_LISTING_PHOTOS} photos. Daylight, plain background, the whole item in frame.`
          : isFull
            ? "That's the maximum. Tap any photo to make it the cover."
            : "Tap any photo to make it the cover."}
      </p>
    </div>
  );
}
