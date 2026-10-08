// The picture beside each photo-guide step.
//
// These are Amna's reference photos, resized to 480px wide and served from
// /public/photo-guide. The originals were 2-3 MB each, which is a lot to send
// a phone for a thumbnail, so they are downscaled rather than used as shot.
//
// They replace the line-drawing placeholders that stood here before. Swapping a
// picture is a change to this file and the matching file in public/photo-guide,
// and nothing else moves.

type Name = "daylight" | "background" | "whole_item" | "flaw" | "label";

/** alt text, not a caption: it describes what the photo shows for someone who
 *  cannot see it. The title and body beside each one carry the instruction. */
const PICTURES: Record<Name, { src: string; alt: string }> = {
  daylight: {
    src: "/photo-guide/daylight.jpg",
    alt: "A kurta on a hanger beside a sunlit window",
  },
  background: {
    src: "/photo-guide/background.jpg",
    alt: "The same kurta against a plain cream wall",
  },
  whole_item: {
    src: "/photo-guide/whole-item.jpg",
    alt: "A full-length shot with the whole garment in frame",
  },
  flaw: {
    src: "/photo-guide/flaw.jpg",
    alt: "A close-up of a mark on the fabric",
  },
  label: {
    src: "/photo-guide/label.jpg",
    alt: "A close-up of the brand label inside the neckline",
  },
};

export default function GuideIllustration({ name }: { name: Name }) {
  const picture = PICTURES[name];
  return (
    <img
      className="guide-figure"
      src={picture.src}
      alt={picture.alt}
      width={480}
      height={322}
      loading="lazy"
      decoding="async"
    />
  );
}
