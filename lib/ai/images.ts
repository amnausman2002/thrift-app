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

function statusOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return undefined;
  }
  const { status } = error as { status: unknown };
  return typeof status === "number" ? status : undefined;
}

/** 429 means too many requests, 503 means the service is briefly unavailable.
 *  Both are worth one retry; nothing else is. */
export function isRetryable(error: unknown): boolean {
  const status = statusOf(error);
  return status === 429 || status === 503;
}

/** Gemini's own error messages are raw JSON blobs. Turn them into one short
 *  plain sentence, keeping the status code so a failure is still traceable. */
export function plainErrorMessage(error: unknown): string {
  const status = statusOf(error);
  switch (status) {
    case 429:
      return "Too many requests just now (429).";
    case 503:
      return "The model was briefly unavailable (503).";
    case 504:
      return "The model took too long to answer (504).";
    default:
      return status ? `Could not read the photos (${status}).` : "Could not read the photos.";
  }
}
