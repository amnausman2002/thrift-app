import { NextResponse } from "next/server";
import { runPrefill } from "@/lib/ai/prefill";

// No sign-in check, App Check or rate limit yet. Laptop only until milestone M6.
export const runtime = "nodejs";

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Send the photos as multipart form data." },
      { status: 400 },
    );
  }

  const photos = form.getAll("photos").filter((value): value is File => value instanceof File);

  const rawOriginalPrice = form.get("originalPrice");
  const originalPrice =
    typeof rawOriginalPrice === "string" && rawOriginalPrice.trim() !== ""
      ? Number(rawOriginalPrice)
      : undefined;

  if (originalPrice !== undefined && !Number.isFinite(originalPrice)) {
    return NextResponse.json({ ok: false, error: "originalPrice must be a number." }, { status: 400 });
  }

  const result = await runPrefill({ photos, originalPrice });

  // A bad request is the caller's mistake, so it gets a 400. An AI failure
  // returns 200: the seller keeps filling the form by hand, nothing is broken.
  if (!result.ok && result.reason === "input") {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
