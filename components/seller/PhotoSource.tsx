"use client";

import { useRef } from "react";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import TextLink from "@/components/ui/TextLink";

// The two ways into the flow: the phone's own camera, or photos she already has.
//
// There is deliberately no viewfinder of our own. `capture="environment"` hands
// her straight to the camera app she already knows, she shoots, and it comes
// back. Building our own would mean rebuilding focus, exposure and the shutter,
// and a half-finished one encourages fewer photos, not more.
//
// Two separate inputs because `capture` and `multiple` cannot be combined: the
// camera returns one photo per trip, the gallery returns as many as she picks.
//
// accept="image/*" with NO image/heic, ever. Safari 17+ reacts to an explicit
// heic type by converting JPEGs *into* HEIC, which is the problem lib/photos.ts
// exists to solve.

type Props = {
  /** Raw files straight from the picker. The caller runs preparePhotos. */
  onPick: (files: File[]) => void;
  /** How many more photos will fit. Anything past this is ignored. */
  room: number;
  disabled?: boolean;
  /** "lead" when taking a photo is the main thing to do on the screen.
   *  "quiet" once she has photos and the main action is building the listing:
   *  two black buttons on one screen means neither of them is the answer. */
  variant?: "lead" | "quiet";
};

export default function PhotoSource({ onPick, room, disabled, variant = "lead" }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  function handle(input: HTMLInputElement | null, list: FileList | null) {
    if (list) {
      const files = Array.from(list).slice(0, Math.max(0, room));
      if (files.length > 0) onPick(files);
    }
    // Clear it, otherwise picking the same photo twice in a row does nothing.
    if (input) input.value = "";
  }

  const full = disabled || room <= 0;
  const openCamera = () => cameraRef.current?.click();
  const openGallery = () => galleryRef.current?.click();

  return (
    <div className="photo-source">
      {variant === "lead" ? (
        <>
          <PrimaryButton type="button" onClick={openCamera} disabled={full}>
            Take photos
          </PrimaryButton>
          <SecondaryButton type="button" onClick={openGallery} disabled={full}>
            Choose from my photos
          </SecondaryButton>
        </>
      ) : (
        <>
          <SecondaryButton type="button" onClick={openCamera} disabled={full}>
            Take another
          </SecondaryButton>
          <TextLink onClick={openGallery} disabled={full}>
            Add from my photos
          </TextLink>
        </>
      )}

      <input
        ref={cameraRef}
        className="sr-only"
        type="file"
        accept="image/*"
        capture="environment"
        tabIndex={-1}
        onChange={(event) => handle(cameraRef.current, event.target.files)}
      />
      <input
        ref={galleryRef}
        className="sr-only"
        type="file"
        accept="image/*"
        multiple
        tabIndex={-1}
        onChange={(event) => handle(galleryRef.current, event.target.files)}
      />
    </div>
  );
}
