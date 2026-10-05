"use client";

// One cell of the photo grid. .photo-slot and friends from components.html
// section 10. PhotoGrid owns the layout and the rules; this draws one slot.
//
// CHANGED FROM components.html: the slot and its two overlay controls are
// <button>s, not <div>s, so they can be tabbed to and used without a mouse.
// The remove control sits inside the slot in the mock, which would nest a
// button inside a button, so it is a sibling here and positioned over it.

export type GridPhoto = {
  id: string;
  /** Object URL or remote URL for the thumbnail. */
  url: string;
  /** Carried through from preparePhotos. Advisory, never blocks submission. */
  problem?: string;
  /** A two-word note from the photo quality check, for example "Dark, blurry".
   *  Also advisory. Takes the corner over `problem` when both are set, because
   *  what the photo looks like matters more to her than how it was converted. */
  note?: string;
};

type Props = {
  photo: GridPhoto;
  index: number;
  isCover: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onSetCover: () => void;
  onRemove: () => void;
};

export default function PhotoSlot({
  photo,
  index,
  isCover,
  isSelected,
  onSelect,
  onSetCover,
  onRemove,
}: Props) {
  const label = `Photo ${index + 1}`;

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        className={[
          "photo-slot",
          "has-photo",
          isCover && "is-cover",
          isSelected && !isCover && "is-selected",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={onSelect}
        aria-pressed={isSelected}
        aria-label={isCover ? `${label}, the cover photo` : `${label}, tap to choose as cover`}
      >
        <img className="photo-slot-img" src={photo.url} alt="" />
        {isCover && <span className="photo-slot-cover-label">Cover</span>}
        {(photo.note || photo.problem) && (
          <span className="photo-slot-problem">{photo.note ?? "Check"}</span>
        )}
      </button>

      {/* Sibling rather than a child: a button cannot contain another button. */}
      <button
        type="button"
        className="photo-slot-remove"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
      >
        &times;
      </button>

      {isSelected && !isCover && (
        <button type="button" className="photo-slot-set-cover" onClick={onSetCover}>
          Set as cover
        </button>
      )}
    </div>
  );
}
