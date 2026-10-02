// Fires both seller AI calls at the same time, so she only waits for the
// slower one rather than for both in turn.

import { runPrefill, type PrefillResult } from "@/lib/ai/prefill";
import { runPhotoQuality, type PhotoQualityResult } from "@/lib/ai/photo-quality";

export type RunBothInput = {
  photos: File[];
};

export type RunBothResult = {
  prefill: PrefillResult;
  photoQuality: PhotoQualityResult;
};

/** Safe with Promise.all: neither call throws. Prefill reports failure as
 *  ok: false, and the quality check reports it as skipped, so one failing
 *  never cancels the other. */
export async function runBoth({ photos }: RunBothInput): Promise<RunBothResult> {
  const [prefill, photoQuality] = await Promise.all([
    runPrefill({ photos }),
    runPhotoQuality({ photos }),
  ]);

  return { prefill, photoQuality };
}
