"use client";

// .photo-grid from components.html section 10. This is both the uploader and
// the cover picker: the showcase draws them as two states of one grid, so they
// are one component rather than two.
//
// Rules, from the PRD:
// - Two to six photos, enforced at submit. This grid never blocks her.
// - Exactly one cover. The first photo added becomes it, and choosing another
//   moves that photo to the front, so the grid is the buyer's running order.
//
// CHANGED FROM components.html, agreed on screen with Amna: all six cells are
// always drawn, and every empty one carries a plus and opens the picker. The
// showcase shows one live "Add" cell followed by dimmed placeholders, which
// hides the ceiling until she reaches it. There is no hint line underneath.
//
// The file picker uses accept="image/*" and NEVER lists image/heic. Safari 17+
// reacts to an explicit heic type by converting JPEGs *into* HEIC, which is the
// problem lib/photos.ts exists to solve.

import { useRef, useState } from "react";
import PhotoSlot from "./PhotoSlot";
import type { GridPhoto } from "./PhotoSlot";
import { MAX_LISTING_PHOTOS } from "@/lib/constants";

type Props = {
  photos: GridPhoto[];
  coverId: string | null;
  /** Raw files straight from the picker. The caller runs preparePhotos. */
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onSetCover: (id: string) => void;
};

export default function PhotoGrid({
  photos,
  coverId,
  onAdd,
  onRemove,
  onSetCover,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const room = MAX_LISTING_PHOTOS - photos.length;
    const files = Array.from(fileList).slice(0, room);
    if (files.length > 0) onAdd(files);
    // Clear it, otherwise choosing the same file twice in a row does nothing.
    if (inputRef.current) inputRef.current.value = "";
  }

  const emptyCount = MAX_LISTING_PHOTOS - photos.length;

  return (
    <div className="photo-grid-wrap">
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

        {Array.from({ length: emptyCount }).map((_, i) => (
          <button
            key={`empty-${i}`}
            type="button"
            className="photo-slot is-empty"
            onClick={() => inputRef.current?.click()}
            aria-label={`Add photo ${photos.length + i + 1}`}
          >
            <svg
              className="photo-slot-add-icon"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
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
    </div>
  );
}
