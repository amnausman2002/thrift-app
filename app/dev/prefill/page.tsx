import { notFound } from "next/navigation";
import PrefillTester from "./PrefillTester";

// Development only. Never linked, and returns 404 if it ever reaches production.
export default function DevPrefillPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <PrefillTester />;
}
