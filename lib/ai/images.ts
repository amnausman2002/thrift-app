// Shared photo handling for both seller AI calls.
// Photos are sent inline for now; Cloud Storage upload is a later milestone.

export const MIN_PHOTOS = 1;
export const MAX_PHOTOS = 6;
export const MAX_PHOTO_BYTES = 7 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Timeout for one Gemini call, in milliseconds. */
export const AI_TIMEOUT_MS = 15_000;

export type ImagePart = { inlineData: { data: string; mimeType: string } };

/** Returns a short plain-English problem, or null when the photos are fine. */
export function validatePhotos(photos: File[]): string | null {
  if (photos.length < MIN_PHOTOS || photos.length > MAX_PHOTOS) {
    return `Send between ${MIN_PHOTOS} and ${MAX_PHOTOS} photos.`;
  }
  for (const photo of photos) {
    if (!ALLOWED_MIME_TYPES.includes(photo.type)) {
      return "Photos must be JPEG, PNG or WebP.";
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return "Each photo must be under 7 MB.";
    }
  }
  return null;
}

export async function toImageParts(photos: File[]): Promise<ImagePart[]> {
  return Promise.all(
    photos.map(async (photo) => ({
      inlineData: {
        data: Buffer.from(await photo.arrayBuffer()).toString("base64"),
        mimeType: photo.type,
      },
    })),
  );
}

/** 429 means too many requests, 503 means the service is briefly unavailable.
 *  Both are worth one retry; nothing else is. */
export function isRetryable(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return false;
  }
  const { status } = error as { status: unknown };
  return status === 429 || status === 503;
}
