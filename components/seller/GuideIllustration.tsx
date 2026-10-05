// Drawings for the five photo-guide steps.
//
// PLACEHOLDERS. Amna has reference screenshots for these that have not landed
// yet, so these are simple line drawings built from the design tokens: one
// stroke weight, --text-secondary on --surface, no colour. They are the right
// shape and the right size, so swapping in the real artwork later is a change
// to this file alone and nothing else moves.
//
// Each is drawn on a 4:3 viewBox and scales to whatever box it is given.
// aria-hidden throughout: the title and body beside each one carry the meaning,
// so a screen reader announcing the drawing would only repeat them.

type Props = { name: "daylight" | "background" | "whole_item" | "flaw" | "label" };

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** A simple kurta: shoulders, sleeves, body. Reused at different scales. */
function Garment({ x = 0, y = 0, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M22 10 L32 6 L48 6 L58 10 L62 22 L54 25 L54 54 L26 54 L26 25 L18 22 Z" />
      <path d="M32 6 Q40 13 48 6" />
    </g>
  );
}

export default function GuideIllustration({ name }: Props) {
  return (
    <svg
      className="guide-figure"
      viewBox="0 0 120 90"
      aria-hidden="true"
      focusable="false"
      {...STROKE}
    >
      {name === "daylight" && (
        <>
          {/* A window with light falling across the item */}
          <rect x="8" y="12" width="36" height="46" rx="2" />
          <line x1="26" y1="12" x2="26" y2="58" />
          <line x1="8" y1="35" x2="44" y2="35" />
          <path d="M46 20 L66 30" opacity="0.5" />
          <path d="M46 32 L66 40" opacity="0.5" />
          <path d="M46 44 L66 50" opacity="0.5" />
          <Garment x={52} y={20} scale={0.78} />
        </>
      )}

      {name === "background" && (
        <>
          {/* Left: a patterned surface, crossed out. Right: a plain one. */}
          <rect x="8" y="16" width="44" height="58" rx="2" opacity="0.45" />
          <path
            d="M8 26 L52 26 M8 36 L52 36 M8 46 L52 46 M8 56 L52 56 M8 66 L52 66"
            opacity="0.3"
          />
          <path d="M18 30 L42 60 M42 30 L18 60" opacity="0.75" />
          <rect x="68" y="16" width="44" height="58" rx="2" />
          <Garment x={74} y={24} scale={0.55} />
        </>
      )}

      {name === "whole_item" && (
        <>
          {/* Framing corners with the whole garment comfortably inside */}
          <path d="M10 22 L10 12 L20 12" />
          <path d="M110 22 L110 12 L100 12" />
          <path d="M10 68 L10 78 L20 78" />
          <path d="M110 68 L110 78 L100 78" />
          <Garment x={20} y={16} scale={1.0} />
        </>
      )}

      {name === "flaw" && (
        <>
          {/* A garment with a magnified detail pulled out beside it */}
          <Garment x={2} y={16} scale={0.82} />
          <circle cx="44" cy="48" r="9" opacity="0.7" />
          <line x1="51" y1="42" x2="70" y2="30" opacity="0.5" />
          <line x1="51" y1="55" x2="70" y2="66" opacity="0.5" />
          <rect x="70" y="22" width="42" height="52" rx="2" />
          <path d="M80 40 Q88 48 84 58" />
          <path d="M92 36 L96 44 L90 50" />
        </>
      )}

      {name === "label" && (
        <>
          {/* A neckline, with the woven tag inside it enlarged */}
          <path d="M14 20 L26 14 L40 14 L52 20 L56 32 L48 35 L48 66 L18 66 L18 35 L10 32 Z" />
          <path d="M26 14 Q33 22 40 14" />
          <rect x="27" y="22" width="12" height="7" rx="1" opacity="0.75" />
          <line x1="40" y1="25" x2="66" y2="25" opacity="0.5" />
          <line x1="40" y1="30" x2="66" y2="52" opacity="0.5" />
          <rect x="66" y="20" width="46" height="34" rx="2" />
          <line x1="74" y1="32" x2="104" y2="32" />
          <line x1="74" y1="40" x2="94" y2="40" />
        </>
      )}
    </svg>
  );
}
