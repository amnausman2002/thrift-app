# Reloved

Mobile-first web app for buying and selling preloved women's clothing in Pakistan.
Built by two product designers, Amna and Bismah, in five weeks. Soft launch in week 3.
Entered in the Google Cloud AI Builder Cup (Retail & Commerce track). Prototype due 18 October.

**North star:** A woman anywhere in Pakistan finds a preloved item in her size and brand,
and messages the seller on WhatsApp in under two minutes.
If a feature does not shorten that distance, it is not in v1.

The full spec is in `docs/PRD.md`. Read the relevant section before building any feature.
The technical plan for the seller flow (photo upload, Gemini calls, accounts, build order) is in
`docs/seller-flow-research.md`. Read it before touching anything in `app/sell/`, `lib/ai/` or `app/api/ai/`.
If this file and the PRD disagree, stop and ask us.

---

## Competition rules (non-negotiable)

- Every AI feature uses Google's Gemini models. Never call Anthropic, OpenAI or any other model provider from the app.
- Everything runs on Google Cloud / Firebase. Do not add services hosted elsewhere (no Vercel, Supabase, AWS, etc.).
- The app deploys on Firebase App Hosting, which runs on Cloud Run.
- This is a fresh project built during the hackathon. Do not copy in code from other projects.

## Stack

- Next.js (App Router) with TypeScript
- Tailwind CSS
- Firebase Authentication: email link sign-in for everyone, phone verification by SMS code for sellers
- Cloud Firestore for data
- Cloud Storage for Firebase for listing photos
- Gemini through the Google Gen AI library (`@google/genai`) on Vertex AI, called only from server code
- Firebase Trigger Email extension for emails to sellers and reporters (Google is retiring Firebase Extensions in March 2027, which is fine for the prototype)
- Firebase App Hosting for deployment

### Gemini settings (easy to get wrong)

- **Model:** `gemini-3.8-flash`, read from the environment variable `GEMINI_MODEL`. Never hard-code the model name in more than one place.
- **Do not use Gemini 2.5 models.** Google retires them on 16 to 20 October 2026, around our deadline.
- **Location must be `global`** (environment variable `GOOGLE_CLOUD_LOCATION=global`). Gemini 3.x models return a 404 error at `us-central1`.
- Gemini model names change often and 3.8 Flash may be retired on short notice. Before writing or changing any model name, check Google's current documentation, and tell us if the name is out of date.
- **No API keys anywhere.** On a laptop the server signs in through Application Default Credentials (`gcloud auth application-default login`). On App Hosting it uses the service account `firebase-app-hosting-compute@PROJECT_ID.iam.gserviceaccount.com`, which needs the role `roles/aiplatform.user`.
- Gemini is called only from server routes. Never from the browser.
- Use the `thinkingLevel` setting `LOW` (3.8 Flash does not accept `MINIMAL`), and do not set a low temperature.
- Some setting names differ between versions of the Gen AI library (for example `responseSchema` vs `responseJsonSchema`). Check the installed version's types before writing calls.
- Validate every Gemini answer with Zod (a data-checking library) before using it. Never trust the shape of the model's output.

## Commands

Gemini setup on a laptop (run once):

```
gcloud auth login
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable aiplatform.googleapis.com
```

Environment variables in `.env.local` (never committed, listed without values in `.env.example`):
`GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION=global`, `GEMINI_MODEL`.

TODO: run, test and deploy commands, filled in by Claude once the project is set up.

## Folder structure

```
app/                  Pages and routes
  page.tsx            Marketing homepage (site root)
  browse/             Listings grid, filters, search
  item/[id]/          Item detail
  seller/[id]/        Seller's public profile
  sell/               Listing flow
  my-listings/        Seller's own listings
  admin/              Queue, reports, listing lookup
  api/ai/
    prefill/          Call 1: photos to listing fields
    photo-quality/    Call 2: separate photo quality check
  dev/prefill/          Throwaway test page. Development only, never linked, never deployed
components/
  ui/                 Shared components. Names match Figma exactly
  buyer/  seller/  admin/
lib/
  firebase/           Firebase setup (client and admin)
  data/               All Firestore reads and writes
  ai/                 All Gemini calls, one file per AI feature
    client.ts         The one place the Gemini connection is created
    schemas.ts        Response templates and Zod checks for every AI call
    prefill.ts        Photo to listing
    photo-quality.ts  Photo quality check
    runBoth.ts        Fires both seller calls at the same time
  pricing.ts          Suggested price range (our own rules, never the model)
  pricing-table.ts    Hand-editable brand tier by category table
  constants.ts        Every fixed list (categories, sizes, conditions, reasons, brands, cities, photo tips)
scripts/
  try-prefill.ts      Runs a folder of photos through the AI and prints a results table
eval/
  items.csv           Real test items with the correct answers, used to measure AI accuracy
docs/
  PRD.md              Product spec
  seller-flow-research.md   Technical plan for the seller flow
  BACKLOG.md          Ideas for later. Never read or build from this file
```

## How to work with us

- We are product designers, not developers. Before a technical decision, explain it in one or two plain-language sentences.
- Ask before installing any new package or adding any new Google Cloud or Firebase service.
- Keep changes small: one feature per branch, commit working states often.
- For anything bigger than a small edit, propose a plan first and wait for us to say go.
- If a request contradicts the PRD or the anti-goals below, say so instead of building it.
- Never commit secrets. Keys live in environment variables, listed without values in `.env.example`.
- Do not change files outside the current person's area without saying so first (see Ownership).
- When something breaks, explain the error in plain language before changing any code.

## Ownership

- **Amna, seller side and admin:** sell flow, photo to listing, photo quality check, seller's own listings, admin queue, reports, approval copilot, catalogue-photo detection
- **Bismah, buyer side:** homepage, browse, filters, natural-language search, item detail, WhatsApp contact, seller public profile
- **Shared (ask before changing, and note it in the daily handoff):** design tokens, `components/ui/`, the data model, Firestore security rules, `lib/ai/client.ts` and `lib/ai/schemas.ts`, `lib/constants.ts`

---

## Anti-goals: do not build these, even if they seem helpful

1. In-app chat or messaging. WhatsApp carries the conversation.
2. Automated reminder messages to sellers.
3. Seller reviews or ratings. The sold count is the trust signal.
4. Saved searches or new-stock alerts.
5. AI that approves, rejects or hides anything.
6. Duplicate-listing detection. The admin queue is the check.
7. In-app payments or shipping.
8. A native mobile app. Mobile web only.
9. Commission or listing fees.
10. Categories outside the fixed list: no wedding or formal wear, kidswear, menswear, unstitched fabric, jewellery or accessories.

Also out of v1: in-app notifications, analytics dashboards, and in the admin view, user management, bulk actions and editing someone else's listing.

## The AI rule

**The AI reads, drafts and flags. A person decides.**

1. **Photo to listing (seller).** Reads the photos and prefills brand, category, colour, condition and a suggested price range. She can edit every field.
2. **Photo quality check (seller).** A separate call from photo to listing. Checks the photos are usable (sharp, well lit, not too busy) and says so if not, but never blocks her from continuing.
3. **Natural-language search (buyer).** Turns a sentence like "black Sapphire kurta under 3000 in medium" into filter values, shown as applied filter chips she can adjust. Only call the model when the query is not a plain keyword match, and debounce it. If nothing matches, relax a filter and say which one was relaxed.
4. **Approval copilot (admin).** A short summary beside each pending listing: what the photos show, whether the stated brand looks consistent with the photos, whether the price is sane against the original, and any flaw in the description that is missing from the flaw field. A listing with brand `unknown` is normal and is never flagged. Only flag a brand the seller entered that the photos cannot back up, and only as a note for us, never a rejection.
5. **Catalogue-photo detection (admin).** Flags listings that look like a brand's studio photo instead of a real one. A flag in the queue only, never a rejection.

If a Gemini call fails or is slow, the flow carries on without it. AI failure never blocks a buyer or a seller.

### Seller AI calls: rules for Call 1 and Call 2

**Two separate Gemini calls, fired at the same time** (`lib/ai/runBoth.ts`, using `Promise.all`) so the seller only waits for the slower one.

**Call 1: `POST /api/ai/prefill`** (logic in `lib/ai/prefill.ts`)
- Input: 1 to 6 images as multipart form data (JPEG, PNG or WebP, up to 7 MB each) and an optional `originalPrice` number.
- One Gemini call with all the images, structured output using `listingDraftSchema`, thinking level `LOW`, media resolution `MEDIUM`, 15 second timeout, one retry only on HTTP errors 429 or 503.
- `listingDraftSchema` fields: brand, brand_other, brand_evidence, brand_confidence, category, category_confidence, colour, condition, condition_confidence, flaws_seen, title_suggestion. Every list comes from `lib/constants.ts` and includes `unknown`. There is **no price field**: the model never sets a price.
- On validation failure or any error, return `{ ok: false }` with a short message. Never throw an unhandled error.

**Brand rules (in the system instruction, and enforced again on the server):**
- Labels are often cut out or missing, especially on leftover-store stock. If no label, tag or clear logo is visible, brand is `unknown`, `brand_evidence` is `none` and `brand_confidence` is `low`. Never guess a brand from style, embroidery or fabric.
- `brand_evidence` values: `label_visible` (readable neck or waist label, or logo), `tag_visible` (swing, price or care tag), `print_or_style_only`, `none`.
- A clearly visible woven logo or signature detail (for example a Levi's red tab or a Nike swoosh) counts as `label_visible`.
- Never fill `brand_other` with a guess. It is only for a brand name printed on a label that is not in our list.
- Server rule, whatever the model said: if `brand_evidence` is `print_or_style_only` or `none`, force `brand_confidence` to `low`. If it is `none`, also force `brand` to `unknown`.
- Pakistani labels are often small woven tags inside the neckline or trouser waistband, in English or Urdu script. Replicas are common.

**How suggestions appear to the seller:**
- High confidence: fill the field, marked "AI suggested".
- Medium confidence: fill the field and add "Please check".
- Low confidence or `unknown`: leave the field empty and show tappable "Could it be...?" chips.
- Suggestions fill empty fields only. Never overwrite something she has typed.
- Where possible show the evidence, for example "We read 'Khaadi' on the neck label".

**Suggested price (`lib/pricing.ts`, our own rules, not Gemini):**
- With an original price, the suggested range is a share of it: `brand_new` 55 to 70%, `excellent` 40 to 55%, `very_good` 30 to 45%, `good` 20 to 30%.
- Without one, use the brand tier by category table in `lib/pricing-table.ts`, which we edit by hand. It has an "unbranded" tier used when brand is `unknown` or `other`, and that output is labelled a rough range.
- Round to the nearest Rs 100 and always show a range, never a single number. She decides the final price.
- The numbers are starting guesses, and `lib/pricing-table.ts` says so in a comment at the top.

**Call 2: `POST /api/ai/photo-quality`** (logic in `lib/ai/photo-quality.ts`)
- Same input format. Uses `photoQualitySchema`: per photo, `photo_index`, `blurry`, `dark`, `busy_background`, `item_cropped`. Overall, `overall_usable` (true or false) and one short `retake_tip` in plain English.
- Thinking level `LOW`, media resolution `MEDIUM` (it needs enough detail to judge sharpness).
- The prompt must say: label or flaw close-ups are not "cropped", judge each photo independently, be lenient on plain fabric, never comment on people.
- Advisory only. It returns flags and a tip and never blocks anything. On any error return `{ ok: true, flags: [], skipped: true }`.
- The result is saved in `Photo.quality_flags`.

**Photo tips shown on the upload screen** (`PHOTO_TIPS` in `lib/constants.ts`): daylight, plain background, the whole item in frame, a close-up of any flaw, and "If there is a label or tag, take a close-up of it."

**Current status of the AI routes (temporary):**
- `/api/ai/prefill` and `/api/ai/photo-quality` have no sign-in check and no spending protection yet. Run them on a laptop only. Do not deploy them publicly until sign-in, App Check, rate limits and budget alerts are added (see `docs/seller-flow-research.md`, milestone M6). If they must be deployed sooner, add a temporary secret-header check first.
- For now photos are sent directly in the request. Cloud Storage upload and photo compression come later.
- Later milestone: log each AI read (what the AI suggested, what the seller finally submitted) so we can measure accuracy. Ask before creating that collection.
- Accuracy testing: `eval/items.csv` holds real items with the correct answers. Re-run `scripts/try-prefill.ts` after every prompt change.

## Users and permissions

- **Buyer:** browses and searches with no account. Creates an email-only account the first time she taps Message seller. Never ask a buyer for a phone number. Never show view or contact counts to buyers.
- **Seller:** the account is created at submit, not before (Path 1, step 7). Email verified by link, phone verified by code. If the phone code fails, she continues with email alone. A broken code service must never block a listing. Changing her phone clears `phone_verified_at` and re-triggers verification.
- **Admin:** a user with `is_admin` set to true. There is no role field.
- Enforce permissions on the server and in Firestore security rules, never only by hiding buttons.

See the PRD table "What each user sees on a listing" for exactly which fields each user sees.

## Data model

Six entities: User, Listing, Photo, ContactEvent, ModerationAction, Report.
Full field lists are in the PRD under "Domain model". Do not add, rename or remove fields without asking.

- **Listing status:** `pending`, `live`, `rejected`, `sold`, `expired`, `hidden`. Only admins set `live` and `rejected`. Browse shows `live` only, newest first.
- **Listing colour:** `colour` is a Listing field, used by photo to listing and by search.
- **Listing brand:** one value from the brand list, including `other` (with `brand_other`) and `unknown`. See Fixed lists.
- Sold count is computed from the seller's listings at `sold`. Never store it.
- **ModerationAction** is append-only and written for exactly four events: approved, rejected, hidden, restored. Marking sold or expiring writes no row.
- **ContactEvent** is one record per WhatsApp tap by an email-verified buyer. Maximum 10 per buyer per day, enforced on the server. This is the week 3 success metric.
- **Reports:** two unresolved reports auto-hide the listing and write a `hidden` ModerationAction with `admin_id` null.
- **Photos:** two to six per listing, enforced at submit. Exactly one cover, chosen by the seller. `quality_flags` are advisory only and never block submission.
- Prices are whole numbers in Pakistani rupees (PKR). Phone numbers are stored in E.164 format (the international format, for example +923001234567).
- `expires_at` is `created_at` plus 30 days.
- Listings and their status are written only by the server (Admin SDK), never directly from the browser.

## Fixed lists (all live in `lib/constants.ts`)

- **Categories:** kurta, pret, co_ord_set, dupatta, dress, top, bottoms, jeans, skirt, jacket, sportswear, shoes, bag
- **Sizes:** clothes XS to XL, shoes UK 3 to 9, bags have no size
- **Condition** (always shown with its description):
  - `brand_new`: Brand new, "With tags, never worn"
  - `excellent`: Excellent, "No tags, worn a few times"
  - `very_good`: Very good, "Well worn, but still in great shape"
  - `good`: Good, "Shows some signs of wear — please photograph the areas that show it"
- **Rejection reasons:** bad_photos, missing_details, not_allowed, suspected_counterfeit
- **Report reasons:** counterfeit, not_as_described, inappropriate, spam
- **Brands:**
  - Pakistani: khaadi, sapphire, generation, elan, gul_ahmed, ideas_by_gul_ahmed, alkaram_studio, limelight, nishat_linen, maria_b, sana_safinaz, outfitters, bonanza_satrangi, beechtree, zellbury, junaid_jamshed, ethnic, cross_stitch, baroque, asim_jofa, crimson, mausummery, agha_noor, faiza_saqlain, breakhouse
  - Western and international: zara, hm, mango, levis, nike, adidas, puma, bershka, pull_and_bear, stradivarius, marks_and_spencer, tommy_hilfiger, calvin_klein, forever_21, shein
  - Special values: `other` and `unknown`
  - **`unknown` means the seller (or the AI) cannot tell the brand.** Its label for sellers is "Not sure / no label". Tags are often cut out, especially on leftover-store stock, so this is a normal choice and never an error. It is different from `other`, which means a brand that is not on the list and comes with `brand_other`.
  - **Buyer side:** an item with brand `unknown` shows no brand chip on its card or detail page (never the word "Unknown"), and `unknown` is left out of the brand filter options and out of natural-language search brand matching. An item with brand `other` shows its `brand_other` text.
  - The brand list will change as we see the real seed items. It lives only in `lib/constants.ts`. Never copy it into another file.
- **Cities:** TODO: add the list
- **Colours:** TODO: add the list

## Design rules

- Mobile-first. Build for a phone-width screen first, then scale up.
- Minimal and close to black and white. No coloured buttons or calls to action: the clothes in the photos carry the colour.
- Use design tokens only. Never hard-code a colour value or font size.
  - Colours: TODO from the brand sheet
  - Typography: TODO from the brand sheet
  - Spacing and corner radius: TODO
- Component names match Figma exactly. TODO: list them (e.g. ItemCard, FilterChip, PrimaryButton)
- Reuse existing components. Never create a new button, card or input when one exists. If a variant is needed, ask.
- Tone of voice: TODO from the brand sheet
- AI suggestions must look clearly different from what the seller typed ("AI suggested" or "Please check"), and must be easy to change or clear.
- Photo quality messages are calm and helpful ("This one looks a bit dark. Retake it?") with two equal choices, Retake and Keep it. Never disable the Next button.
- WhatsApp message, prefilled: "Hi, I'm interested in your [item title] on Reloved."
