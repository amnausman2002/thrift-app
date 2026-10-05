"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PrimaryButton from "@/components/ui/PrimaryButton";
import TextLink from "@/components/ui/TextLink";
import BottomSheet from "@/components/ui/BottomSheet";
import PhotoGrid from "@/components/seller/PhotoGrid";
import PhotoGuide from "@/components/seller/PhotoGuide";
import PhotoSource from "@/components/seller/PhotoSource";
import { preparePhotos } from "@/lib/photos";
import { MIN_LISTING_PHOTOS, MAX_LISTING_PHOTOS } from "@/lib/constants";
import ReadingPhotos from "./ReadingPhotos";
import SellForm from "./SellForm";
import { requestPhotoQuality, requestPrefill } from "./aiRequests";
import type { QualityFlag } from "./aiRequests";
import { EMPTY_PREFILL, prefillToForm, type Prefilled } from "./prefillToForm";
import { flagFor, flaggedCount, qualityHeading, slotNote } from "./qualityWording";
import { EMPTY_FIELDS, mergePrefill, type FormFields, type SellPhoto } from "./types";

// Path 1, the whole seller flow on one page.
//
//   intro     the photo guide, first listing only
//   photos    take or choose photos, pick the cover
//   reading   both Gemini calls, side by side
//   details   the form, already part filled
//
// It is one component with a `step` rather than four routes because the photos
// only exist as object URLs in this tab. A real navigation would throw them
// away and she would have to shoot the item again.

type Step = "intro" | "photos" | "reading" | "details";

/** Remembering she has seen the guide is a convenience, not a setting, so
 *  localStorage is enough. A new phone showing it again is the right outcome. */
const GUIDE_SEEN_KEY = "reloved.sell.guide-seen";

/** When the wait stops being normal and we say so. Matches AI_TIMEOUT_MS in
 *  lib/ai/images.ts, which is where the call itself gives up. Not imported:
 *  that module is server code and has no business in the browser bundle. */
const SLOW_AFTER_MS = 15_000;

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

export default function SellFlow() {
  // null until the effect below has read localStorage. Deciding during render
  // would make the server and the browser draw different first screens, which
  // React treats as a hydration error.
  const [step, setStep] = useState<Step | null>(null);

  const [photos, setPhotos] = useState<SellPhoto[]>([]);
  const [coverId, setCoverId] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  // The form's values live here, not in SellForm, so that stepping back to the
  // photos and returning does not throw away everything she typed.
  const [fields, setFields] = useState<FormFields>(EMPTY_FIELDS);
  const [prefilled, setPrefilled] = useState<Prefilled>(EMPTY_PREFILL);
  const [prefillError, setPrefillError] = useState<string | null>(null);
  const [prefillDone, setPrefillDone] = useState(false);
  const [qualityDone, setQualityDone] = useState(false);
  const [slow, setSlow] = useState(false);
  const [retakeTip, setRetakeTip] = useState<string | null>(null);
  const [qualitySheetOpen, setQualitySheetOpen] = useState(false);

  // Every object URL we have handed out, so none leak when the tab closes.
  const urlsRef = useRef<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.localStorage.getItem(GUIDE_SEEN_KEY) === "1";
    } catch {
      // Private browsing can throw on localStorage. Showing the guide one more
      // time is a far smaller problem than the page not rendering.
    }
    setStep(seen ? "photos" : "intro");
  }, []);

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      abortRef.current?.abort();
    };
  }, []);

  function markGuideSeen() {
    try {
      window.localStorage.setItem(GUIDE_SEEN_KEY, "1");
    } catch {
      // See above. Nothing depends on this succeeding.
    }
  }

  const handleAdd = useCallback(async (files: File[]) => {
    setPreparing(true);
    setPhotoError(null);
    // Converts HEIC, resizes to 1600px and strips EXIF, so her home GPS
    // location never leaves the phone. It never throws: on failure it keeps the
    // original and sets `problem`.
    const prepared = await preparePhotos(files);
    const added: SellPhoto[] = prepared.map((item) => {
      const url = URL.createObjectURL(item.file);
      urlsRef.current.push(url);
      return { id: photoId(), url, problem: item.problem, file: item.file };
    });
    setPhotos((current) => {
      const next = [...current, ...added].slice(0, MAX_LISTING_PHOTOS);
      // The first photo added becomes the cover. She can change it after.
      setCoverId((currentCover) => currentCover ?? next[0]?.id ?? null);
      return next;
    });
    setPreparing(false);
  }, []);

  function handleRemove(id: string) {
    setPhotos((current) => {
      const photo = current.find((item) => item.id === id);
      if (photo) URL.revokeObjectURL(photo.url);
      const next = current.filter((item) => item.id !== id);
      setCoverId((currentCover) => (currentCover === id ? (next[0]?.id ?? null) : currentCover));
      return next;
    });
  }

  function applyQuality(flags: QualityFlag[]) {
    setPhotos((current) =>
      current.map((photo, index) => ({ ...photo, note: slotNote(flagFor(flags, index)) })),
    );
  }

  /** Fires both calls at once, so she waits for the slower one rather than the
   *  sum of the two. Neither one can block her: whatever comes back, or does
   *  not, the next screen is the form. */
  function startReading() {
    if (photos.length < MIN_LISTING_PHOTOS) {
      setPhotoError(
        `Add ${MIN_LISTING_PHOTOS - photos.length} more photo${
          MIN_LISTING_PHOTOS - photos.length === 1 ? "" : "s"
        }. Buyers skip listings with just one.`,
      );
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const files = photos.map((photo) => photo.file);

    setPrefillDone(false);
    setQualityDone(false);
    setSlow(false);
    setPrefillError(null);
    // Clear the last read before starting a new one. Without this, a second
    // attempt that fails would leave the previous attempt's suggestions on
    // screen, still marked "AI suggested", under a notice saying we could not
    // read the photos.
    setPrefilled(EMPTY_PREFILL);
    setStep("reading");

    const slowTimer = window.setTimeout(() => setSlow(true), SLOW_AFTER_MS);

    const prefill = requestPrefill(files, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result.ok) {
        const next = prefillToForm(result.listing);
        setPrefilled(next);
        // Fills empty fields only. Anything she has already typed wins.
        setFields((current) => mergePrefill(current, next));
      } else {
        setPrefillError(result.error);
      }
      setPrefillDone(true);
    });

    const quality = requestPhotoQuality(files, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      applyQuality(result.flags);
      if (!result.skipped && result.retakeTip && flaggedCount(result.flags) > 0) {
        setRetakeTip(result.retakeTip);
      }
      setQualityDone(true);
    });

    void Promise.all([prefill, quality]).then(() => {
      window.clearTimeout(slowTimer);
      if (controller.signal.aborted) return;
      setStep("details");
      setQualitySheetOpen(true);
    });
  }

  function skipReading() {
    abortRef.current?.abort();
    abortRef.current = null;
    setStep("details");
  }

  if (step === null) {
    // One tick, while localStorage is read. Deliberately blank rather than a
    // skeleton: anything drawn here would be replaced before it was seen.
    return <div className="sell-step" aria-busy="true" />;
  }

  const room = MAX_LISTING_PHOTOS - photos.length;
  const cover = photos.find((photo) => photo.id === coverId);
  const flagged = photos.filter((photo) => photo.note).length;

  if (step === "intro") {
    return (
      <div className="sell-step">
        <h1 className="text-h1 sell-heading">Show us the item.</h1>
        <p className="sell-sub">
          Take a few photos and we&apos;ll fill in what we can. You get the last word on all of it.
        </p>

        <PhotoGuide />

        <div className="sell-footer">
          <PhotoSource
            room={room}
            onPick={(files) => {
              markGuideSeen();
              setStep("photos");
              void handleAdd(files);
            }}
          />
          <TextLink
            onClick={() => {
              markGuideSeen();
              setStep("photos");
            }}
          >
            I&apos;ve done this before
          </TextLink>
        </div>
      </div>
    );
  }

  if (step === "photos") {
    return (
      <>
        <div className="sell-step">
          <h1 className="text-h1 sell-heading">
            {photos.length === 0 ? "Show us the item." : "Your photos"}
          </h1>
          <p className="sell-sub">
            {photos.length === 0
              ? `${MIN_LISTING_PHOTOS} to ${MAX_LISTING_PHOTOS} photos. The more angles, the better we read it.`
              : photos.length < MIN_LISTING_PHOTOS
                ? "One more and you're away. A single photo gets skipped."
                : `${photos.length} of ${MAX_LISTING_PHOTOS}. A label close-up is the one that pays off.`}
          </p>

          {photos.length > 0 && (
            <PhotoGrid
              photos={photos}
              coverId={coverId}
              onAdd={(files) => void handleAdd(files)}
              onRemove={handleRemove}
              onSetCover={setCoverId}
            />
          )}

          {preparing && <p className="input-hint">Getting your photos ready...</p>}
          {photoError && <p className="input-error-msg">{photoError}</p>}

          <div className="sell-guide-link">
            <TextLink onClick={() => setGuideOpen(true)}>How to photograph it</TextLink>
          </div>

          {/* Once there are photos, building the listing is the answer and the
              two ways to add more step back. The button is never disabled for
              having too few: tapping it says what is missing instead. */}
          <div className="sell-footer">
            {photos.length > 0 && (
              <PrimaryButton onClick={startReading} disabled={preparing}>
                Build my listing
              </PrimaryButton>
            )}
            <PhotoSource
              variant={photos.length === 0 ? "lead" : "quiet"}
              room={room}
              disabled={preparing}
              onPick={(files) => void handleAdd(files)}
            />
          </div>
        </div>

        <BottomSheet
          open={guideOpen}
          onClose={() => setGuideOpen(false)}
          heading="How to photograph it"
          body="Five things that make the difference between a listing that sells and one that gets skipped."
        >
          <PhotoGuide />
          <PrimaryButton onClick={() => setGuideOpen(false)}>Got it</PrimaryButton>
        </BottomSheet>
      </>
    );
  }

  if (step === "reading") {
    return (
      <ReadingPhotos
        coverUrl={cover?.url}
        qualityDone={qualityDone}
        prefillDone={prefillDone}
        slow={slow}
        onSkip={skipReading}
      />
    );
  }

  return (
    <>
      <div className="sell-step">
        <h1 className="text-h1 sell-heading">Have a last look.</h1>
        <p className="sell-sub">
          Change anything that is wrong. Nothing goes live until we have reviewed it.
        </p>
        <SellForm
          photos={photos}
          coverId={coverId}
          fields={fields}
          onChange={(patch) => setFields((current) => ({ ...current, ...patch }))}
          prefilled={prefilled}
          prefillError={prefillError}
          onBackToPhotos={() => setStep("photos")}
        />
      </div>

      {/* Advisory only. Both ways out are real, and "Keep them" changes nothing. */}
      <BottomSheet
        open={qualitySheetOpen && Boolean(retakeTip) && flagged > 0}
        onClose={() => setQualitySheetOpen(false)}
        heading={qualityHeading(flagged)}
        body={retakeTip ?? ""}
        dismissOnOverlayClick={false}
        media={
          <div className="quality-thumbs">
            {photos
              .filter((photo) => photo.note)
              .map((photo) => (
                <span key={photo.id} className="quality-thumb">
                  <img src={photo.url} alt="" />
                  <span className="photo-slot-problem">{photo.note}</span>
                </span>
              ))}
          </div>
        }
      >
        <PrimaryButton
          onClick={() => {
            setQualitySheetOpen(false);
            setStep("photos");
          }}
        >
          {flagged === 1 ? "Retake it" : "Retake them"}
        </PrimaryButton>
        <TextLink onClick={() => setQualitySheetOpen(false)}>
          {flagged === 1 ? "Keep it and carry on" : "Keep them and carry on"}
        </TextLink>
      </BottomSheet>
    </>
  );
}
