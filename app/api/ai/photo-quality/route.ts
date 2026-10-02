import { NextResponse } from "next/server";
import { runPhotoQuality } from "@/lib/ai/photo-quality";

// No sign-in check, App Check or rate limit yet. Laptop only until milestone M6.
export const runtime = "nodejs";

// Always 200: this check is advisory and must never look like a broken page.
export async function POST(request: Request) {
  let photos: File[] = [];

  try {
    const form = await request.formData();
    photos = form.getAll("photos").filter((value): value is File => value instanceof File);
  } catch {
    return NextResponse.json({ ok: true, flags: [], skipped: true });
  }

  return NextResponse.json(await runPhotoQuality({ photos }));
}
