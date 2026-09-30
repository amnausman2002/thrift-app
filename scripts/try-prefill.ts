// Runs a folder of photos through the photo-to-listing call and prints a table.
//
//   npm run try-prefill -- ./my-photos
//
// Layout: a subfolder per item, with that item's photos inside it. If there are
// no subfolders, each loose image is treated as its own single-photo item.
//
// This prints what the AI said. It does not grade the answers — that is
// eval/items.csv and a separate script, later.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { runPrefill } from "@/lib/ai/prefill";

const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

type Item = { name: string; paths: string[] };

function imagesIn(dir: string): string[] {
  return readdirSync(dir)
    .filter((entry) => MIME_BY_EXTENSION[extname(entry).toLowerCase()])
    .sort()
    .map((entry) => join(dir, entry));
}

function collectItems(root: string): Item[] {
  const subfolders = readdirSync(root)
    .map((entry) => join(root, entry))
    .filter((path) => statSync(path).isDirectory())
    .sort();

  if (subfolders.length > 0) {
    return subfolders
      .map((folder) => ({ name: basename(folder), paths: imagesIn(folder) }))
      .filter((item) => item.paths.length > 0);
  }

  return imagesIn(root).map((path) => ({ name: basename(path), paths: [path] }));
}

function toFile(path: string): File {
  return new File([readFileSync(path)], basename(path), {
    type: MIME_BY_EXTENSION[extname(path).toLowerCase()],
  });
}

async function main() {
  const root = process.argv[2];
  if (!root) {
    console.error("Usage: npm run try-prefill -- <folder>");
    process.exit(1);
  }

  const items = collectItems(root);
  if (items.length === 0) {
    console.error(`No JPEG, PNG or WebP photos found in ${root}`);
    process.exit(1);
  }

  console.log(`Reading ${items.length} item(s) from ${root}\n`);

  const rows = [];
  const latencies: number[] = [];
  let unknownBrand = 0;
  let failed = 0;

  for (const item of items) {
    process.stderr.write(`  ${item.name} (${item.paths.length} photo(s))… `);

    const result = await runPrefill({ photos: item.paths.map(toFile) });

    if (!result.ok) {
      failed += 1;
      process.stderr.write("failed\n");
      rows.push({ item: item.name, photos: item.paths.length, brand: "—", evidence: `FAILED: ${result.error}` });
      continue;
    }

    const { listing, priceRange, latencyMs } = result;
    latencies.push(latencyMs);
    if (listing.brand === "unknown") unknownBrand += 1;
    process.stderr.write(`${latencyMs} ms\n`);

    rows.push({
      item: item.name,
      photos: item.paths.length,
      brand: listing.brand === "other" ? `other: ${listing.brand_other ?? "?"}` : listing.brand,
      evidence: listing.brand_evidence,
      conf: listing.brand_confidence,
      category: listing.category,
      condition: listing.condition,
      colour: listing.colour,
      price: priceRange ? `${priceRange.min}-${priceRange.max}${priceRange.isRough ? " ~" : ""}` : "—",
      ms: latencyMs,
    });
  }

  console.log("");
  console.table(rows);

  const median = latencies.length
    ? [...latencies].sort((a, b) => a - b)[Math.floor(latencies.length / 2)]
    : 0;

  console.log("");
  console.log(`items:          ${items.length}`);
  console.log(`failed:         ${failed}`);
  console.log(`brand unknown:  ${unknownBrand} of ${items.length - failed} read (abstention rate)`);
  console.log(`median latency: ${median} ms`);
  console.log("");
  console.log("'~' on a price means a rough range from the table, not a share of an original price.");
}

main();
