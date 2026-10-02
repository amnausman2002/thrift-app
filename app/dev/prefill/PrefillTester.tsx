"use client";

// Throwaway test harness. Deliberately plain: Tailwind is not installed yet and
// the design tokens are still TODO, so this uses bare inline styles.

import { useState } from "react";
import { preparePhotos, type PreparedPhoto } from "@/lib/photos";

function mb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

type Timing = { roundTripMs: number; serverMs?: number };

type Results = {
  prefill: { status: number; body: unknown; timing: Timing };
  photoQuality: { status: number; body: unknown; timing: Timing };
};

const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };

async function post(path: string, photos: File[]) {
  const form = new FormData();
  for (const photo of photos) form.append("photos", photo);

  const startedAt = performance.now();
  const response = await fetch(path, { method: "POST", body: form });
  const roundTripMs = Math.round(performance.now() - startedAt);
  const body = await response.json();
  const serverMs = typeof body?.latencyMs === "number" ? body.latencyMs : undefined;

  return { status: response.status, body, timing: { roundTripMs, serverMs } };
}

const STYLES = `
  .dev-row { display: grid; grid-template-columns: 150px 1fr; gap: 12px; padding: 3px 0; }
  .dev-row-label { color: #666; }
  .dev-row-value { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; overflow-wrap: anywhere; }
  @media (max-width: 560px) {
    .dev-row { grid-template-columns: 1fr; gap: 0; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
    .dev-row-label { font-size: 13px; }
  }
`;

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="dev-row">
      <div className="dev-row-label">{label}</div>
      <div className="dev-row-value">{value}</div>
    </div>
  );
}

function TimingLine({ timing }: { timing: Timing }) {
  const upload =
    timing.serverMs !== undefined ? ` (upload + overhead ${timing.roundTripMs - timing.serverMs} ms)` : "";
  return (
    <div style={{ ...mono, fontSize: 13, color: "#444", marginBottom: 8 }}>
      round trip {timing.roundTripMs} ms
      {timing.serverMs !== undefined ? ` · server ${timing.serverMs} ms${upload}` : ""}
    </div>
  );
}

export default function PrefillTester() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [prepared, setPrepared] = useState<PreparedPhoto[]>([]);
  const [prepMs, setPrepMs] = useState<number | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onPick(files: FileList | null) {
    const picked = files ? Array.from(files) : [];
    previews.forEach((url) => URL.revokeObjectURL(url));
    setResults(null);
    setError(null);
    setPreviews([]);
    setPhotos([]);
    setPrepared([]);
    setPrepMs(null);
    if (picked.length === 0) return;

    // Convert and shrink first. The previews show the prepared photos, so what
    // you see here is exactly what gets sent.
    setPreparing(true);
    const startedAt = performance.now();
    const ready = await preparePhotos(picked);
    setPrepMs(Math.round(performance.now() - startedAt));
    setPreparing(false);

    setPrepared(ready);
    setPhotos(ready.map((item) => item.file));
    setPreviews(ready.map((item) => URL.createObjectURL(item.file)));
  }

  async function onRead() {
    setBusy(true);
    setError(null);
    setResults(null);
    try {
      // Both at once, so this waits only for the slower one.
      const [prefill, photoQuality] = await Promise.all([
        post("/api/ai/prefill", photos),
        post("/api/ai/photo-quality", photos),
      ]);
      setResults({ prefill, photoQuality });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const prefillBody = results?.prefill.body as
    | { listing?: Record<string, string>; error?: string }
    | undefined;
  const listing = prefillBody?.listing;
  const quality = results?.photoQuality.body as
    | { flags?: { photo_index: number; blurry: boolean; dark: boolean; busy_background: boolean; item_cropped: boolean }[]; overallUsable?: boolean; retakeTip?: string; skipped?: boolean }
    | undefined;

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: 16, fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
      <style>{STYLES}</style>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Prefill tester</h1>
      <p style={{ color: "#666", marginBottom: 20, fontSize: 14 }}>
        Development only. Pick 1 to 6 photos of one item and read them.
      </p>

      {/* Deliberately "image/*", not a list naming image/heic. Safari 17+ has a
          bug where listing image/heic makes it convert JPEGs *into* HEIC. */}
      <input type="file" accept="image/*" multiple onChange={(e) => onPick(e.target.files)} />

      {preparing && <p style={{ color: "#666" }}>Converting and shrinking…</p>}

      {previews.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "16px 0" }}>
          {previews.map((url, index) => (
            <figure key={url} style={{ margin: 0, textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" style={{ width: 96, height: 96, objectFit: "cover", border: "1px solid #ddd" }} />
              <figcaption style={{ ...mono, fontSize: 12, color: "#666" }}>index {index}</figcaption>
            </figure>
          ))}
        </div>
      )}

      {prepared.length > 0 && (
        <section style={{ margin: "16px 0" }}>
          <h2 style={{ fontSize: 16, borderBottom: "1px solid #ddd", paddingBottom: 4 }}>
            Prepared in the browser
          </h2>
          <div style={{ ...mono, fontSize: 13, color: "#444", marginBottom: 8 }}>
            {prepMs} ms · {mb(prepared.reduce((sum, p) => sum + p.originalBytes, 0))} →{" "}
            {mb(prepared.reduce((sum, p) => sum + p.finalBytes, 0))}
          </div>
          {prepared.map((item, index) => (
            <Row
              key={index}
              label={`photo ${index}`}
              value={
                <>
                  {mb(item.originalBytes)} → {mb(item.finalBytes)}
                  {item.convertedFromHeic ? " · HEIC converted" : ""}
                  {item.problem ? <span style={{ color: "#b00" }}> · {item.problem}</span> : ""}
                </>
              }
            />
          ))}
        </section>
      )}

      <button
        onClick={onRead}
        disabled={busy || preparing || photos.length === 0}
        style={{
          padding: "8px 16px",
          fontSize: 15,
          cursor: busy || preparing || photos.length === 0 ? "default" : "pointer",
        }}
      >
        {busy ? "Reading…" : "Read photos"}
      </button>

      {error && <p style={{ color: "#b00" }}>{error}</p>}

      {results && (
        <>
          <section style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 16, borderBottom: "1px solid #ddd", paddingBottom: 4 }}>
              Photo to listing · HTTP {results.prefill.status}
            </h2>
            <TimingLine timing={results.prefill.timing} />
            {listing ? (
              <>
                <Row
                  label="brand"
                  value={`${listing.brand}${listing.brand_other ? ` (${listing.brand_other})` : ""} · ${listing.brand_evidence} · ${listing.brand_confidence}`}
                />
                <Row label="category" value={`${listing.category} · ${listing.category_confidence}`} />
                <Row label="condition" value={`${listing.condition} · ${listing.condition_confidence}`} />
                <Row label="colour" value={listing.colour} />
                <Row label="flaws seen" value={listing.flaws_seen || "—"} />
                <Row label="title" value={listing.title_suggestion || "—"} />
              </>
            ) : (
              // Say why. The reason is the whole point of this page.
              <p style={{ color: "#b00" }}>
                {prefillBody?.error ?? "No listing returned — see the raw response below."}
              </p>
            )}
          </section>

          <section style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 16, borderBottom: "1px solid #ddd", paddingBottom: 4 }}>
              Photo quality · HTTP {results.photoQuality.status}
            </h2>
            <TimingLine timing={results.photoQuality.timing} />
            {quality?.skipped && (
              <p style={{ color: "#666" }}>
                Skipped — the check failed, timed out, or the photos were rejected. By design it never
                says why and never blocks the seller. See the photo-to-listing error above.
              </p>
            )}
            <Row label="overall usable" value={String(quality?.overallUsable ?? "—")} />
            <Row label="retake tip" value={quality?.retakeTip || "—"} />
            {quality?.flags?.length ? (
              quality.flags.map((flag) => {
                const hits = [
                  flag.blurry && "blurry",
                  flag.dark && "dark",
                  flag.busy_background && "busy background",
                  flag.item_cropped && "cropped",
                ].filter(Boolean);
                return (
                  <Row
                    key={flag.photo_index}
                    label={`photo ${flag.photo_index}`}
                    value={hits.length ? hits.join(", ") : "no flags"}
                  />
                );
              })
            ) : (
              <Row label="flags" value="none returned" />
            )}
            {quality?.flags && !quality.skipped && quality.flags.length !== photos.length && (
              <p style={{ color: "#a60", fontSize: 13 }}>
                Note: {quality.flags.length} flag entries for {photos.length} photos. The model does not always
                return one per photo.
              </p>
            )}
          </section>

          <section style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 16, borderBottom: "1px solid #ddd", paddingBottom: 4 }}>Raw responses</h2>
            <pre style={{ ...mono, fontSize: 12, background: "#f6f6f6", padding: 12, overflowX: "auto" }}>
              {JSON.stringify({ prefill: results.prefill.body, photoQuality: results.photoQuality.body }, null, 2)}
            </pre>
          </section>
        </>
      )}
    </main>
  );
}
