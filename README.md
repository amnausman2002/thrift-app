# Reloved

Mobile-first web app for buying and selling preloved women's clothing in Pakistan.
Built by Amna and Bismah for the Google Cloud AI Builder Cup. Prototype due 18 October 2026.

**Read [CLAUDE.md](CLAUDE.md) first.** It holds the project rules, what is built so far, and
the decisions that are easy to undo by accident. The product spec is [docs/PRD.md](docs/PRD.md);
the seller flow's technical plan is [docs/seller-flow-research.md](docs/seller-flow-research.md).

## Getting set up

You need Node and the `gcloud` command line tool.

```
npm install
```

Gemini runs on Vertex AI and there are **no API keys**. You sign in instead, once:

```
gcloud auth login
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable aiplatform.googleapis.com
```

Then copy `.env.example` to `.env.local` and fill in `GOOGLE_CLOUD_PROJECT`.
`.env.local` is gitignored and must never be committed.

## Running it

```
npm run dev
```

- App: http://localhost:3000
- Is Gemini working? http://localhost:3000/api/health/gemini — expect `{"ok":true,...,"reply":"ok"}`
- Try the seller AI by hand: http://localhost:3000/dev/prefill

If the health check fails, your sign-in has usually expired. Run
`gcloud auth application-default login` again.

## Other commands

```
npm run build                    Production build
npx tsc --noEmit                 Type check
npm run try-prefill -- ./photos  Run a folder of photos through the AI, print a table
```

## What works today

The two seller AI calls, end to end: photos in, draft listing fields and photo quality
flags out. Photos are converted from HEIC and resized in the browser first.

There are no screens yet, no Firebase, and no styling. `/dev/prefill` is a bare test
page, not a design — it returns 404 in a production build on purpose.

See "What is actually built" in [CLAUDE.md](CLAUDE.md) for the current line between
plan and code.

## Careful with

- **Never commit `.env.local`** or any key.
- The AI routes have **no sign-in check and no spending limit yet**. Laptop only.
  Do not deploy them publicly.
- Every Gemini call is **server-side only**, never from the browser.
