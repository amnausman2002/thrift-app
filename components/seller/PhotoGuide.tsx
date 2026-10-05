import GuideIllustration from "./GuideIllustration";
import { PHOTO_GUIDE } from "@/lib/constants";

// The five photo tips with a picture and a line of why.
//
// Shown full-page on a seller's first listing, and after that behind the
// "How to photograph it" link on the photos step. Same content both times, so
// it lives here once rather than being written out twice.
//
// NEW, with no design in components.html. The rows reuse the showcase's
// "picture, then a label and a description" shape from .condition-option, but
// they are not interactive, so they are a plain <ul> rather than that control.

export default function PhotoGuide() {
  return (
    <ul className="photo-guide">
      {PHOTO_GUIDE.map((step) => (
        <li key={step.illustration} className="photo-guide-item">
          <span className="photo-guide-figure-box">
            <GuideIllustration name={step.illustration} />
          </span>
          <span className="photo-guide-text">
            <span className="photo-guide-title">{step.title}</span>
            <span className="photo-guide-body">{step.body}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
