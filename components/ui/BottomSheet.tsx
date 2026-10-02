"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

// .bottom-sheet from components.html, used for the photo quality advisory and
// the submission confirmation.
//
// ADAPTED: in components.html the sheet is position:absolute inside a
// .phone-frame mock, because that file is a static showcase. A real sheet has
// to sit against the viewport, so it is position:fixed here and rendered into
// document.body through a portal, which stops a transformed ancestor from
// trapping it. The padding, radius, colours and close button are unchanged.
//
// design-system.md: no drag handle, close is the X only, and actions stack full
// width with the primary on top. Pass them as children in that order.

type Props = {
  open: boolean;
  onClose: () => void;
  heading: string;
  /** Supporting line under the heading. */
  body?: ReactNode;
  /** Optional block above the heading: the advisory photo preview, or the
   *  thumbnail and price row on the submission confirmation. */
  media?: ReactNode;
  /** Actions. Primary button first, TextLink second. */
  children?: ReactNode;
  /** Tapping the overlay closes by default. Turn it off where dismissing is
   *  ambiguous, like the photo advisory, so she has to pick Retake or Continue. */
  dismissOnOverlayClick?: boolean;
};

export default function BottomSheet({
  open,
  onClose,
  heading,
  body,
  media,
  children,
  dismissOnOverlayClick = true,
}: Props) {
  const headingId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  // Portals need document, which does not exist during server rendering.
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    // Remember where focus was so it can go back when the sheet closes,
    // otherwise focus jumps to the top of the page.
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    // Stop the page behind from scrolling under the sheet.
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <>
      <div
        className="bottom-sheet-overlay"
        onClick={dismissOnOverlayClick ? onClose : undefined}
        // The close button and Escape both work, so the overlay is a shortcut
        // rather than the only way out. Hidden from screen readers.
        aria-hidden="true"
      />
      <div
        className="bottom-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
      >
        <button
          ref={closeRef}
          type="button"
          className="bottom-sheet-close"
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {media}

        <p className="bottom-sheet-heading" id={headingId}>
          {heading}
        </p>
        {body && <p className="bottom-sheet-body">{body}</p>}

        {children && <div className="bottom-sheet-actions">{children}</div>}
      </div>
    </>,
    document.body,
  );
}
