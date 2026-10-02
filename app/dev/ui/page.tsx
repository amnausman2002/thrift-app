import { notFound } from "next/navigation";
import UiGallery from "./UiGallery";

// Development only. Never linked, and returns 404 if it ever reaches production.
// Exists so the ported components can be checked against components.html side
// by side. Open components.html in another tab and compare.
export default function DevUiPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <UiGallery />;
}
