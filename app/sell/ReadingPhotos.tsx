"use client";

import SecondaryButton from "@/components/ui/SecondaryButton";
import TextLink from "@/components/ui/TextLink";

// What she sees while the two Gemini calls run.
//
// One row per call, and each row ticks when that call actually lands. There is
// no third row and no fake progress: naming the work is what makes ten seconds
// feel like something is happening, and inventing a step would undo that the
// first time the timings did not match.
//
// The way out is always on screen. After AI_TIMEOUT_MS it stops being a quiet
// text link and becomes a button, because by then the wait is our fault.
//
// NEW, with no design in components.html. The rows borrow .condition-option's
// "marker, then text" shape at a smaller size.

type Props = {
  coverUrl?: string;
  qualityDone: boolean;
  prefillDone: boolean;
  /** Set once the calls have outrun their own timeout. */
  slow: boolean;
  onSkip: () => void;
};

function Row({ done, children }: { done: boolean; children: string }) {
  return (
    <li className={done ? "reading-row is-done" : "reading-row"}>
      <span className="reading-dot" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

export default function ReadingPhotos({
  coverUrl,
  qualityDone,
  prefillDone,
  slow,
  onSkip,
}: Props) {
  return (
    <div className="sell-step reading-step">
      <div className="reading-middle">
        {coverUrl && <img className="reading-thumb" src={coverUrl} alt="" />}

        <h2 className="text-h3 reading-heading">
          {slow ? "Still reading" : "Reading your photos"}
        </h2>
        <p className="reading-sub">
          {slow ? "Taking longer than usual today." : "About ten seconds."}
        </p>

        {/* aria-live so a screen reader hears each step land instead of
            sitting in silence until the page changes. */}
        <ul className="reading-list" aria-live="polite">
          <Row done={qualityDone}>Checking your photos are clear</Row>
          <Row done={prefillDone}>Reading the label and working out what it is</Row>
        </ul>
      </div>

      <div className="sell-footer">
        {slow ? (
          <SecondaryButton onClick={onSkip}>Fill it in myself instead</SecondaryButton>
        ) : (
          <TextLink onClick={onSkip}>Skip and fill it in myself</TextLink>
        )}
      </div>
    </div>
  );
}
