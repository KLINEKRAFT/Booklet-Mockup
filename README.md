# Klinekraft Proof Preview

A PDF flipbook viewer for sharing real estate booklet proofs with agents.
Branded with Klinekraft, built in the Dieter Rams minimalist tradition.

## What's inside

```
.
├── public/
│   ├── index.html              ← the flipbook viewer + uploader
│   └── vercel-blob-client.js   ← pre-bundled Vercel Blob client SDK
├── api/
│   └── upload.js               ← serverless function that hands out upload tokens
├── package.json
├── vercel.json
└── README.md
```

## How it works

One page does everything. Drop a PDF on `/`, the flipbook renders
immediately from your local copy while the file uploads to Vercel Blob
in the background. As soon as the upload finishes, the share button
copies a permanent flipbook link you can send to anyone.

Recipients open the link and get the same flipbook view — no account,
no password, no install. The viewer also handles `?pdf=<URL>` directly,
so any hosted PDF can be wrapped as a flipbook.

The upload streams the PDF directly from the browser to Blob storage —
it never passes through the serverless function, which means booklets
up to 100 MB are supported.

## One-time setup

You'll need:

- A free [Vercel account](https://vercel.com)
- The [Vercel CLI](https://vercel.com/docs/cli) installed locally
  (`npm install -g vercel`)
- Node.js 20 or later

### 1. Deploy the project

From this folder, run:

```bash
vercel
```

The CLI will ask a few questions; accept the defaults. When it finishes,
you'll get a URL like `https://klinekraft-proofs.vercel.app`.

### 2. Create a Vercel Blob store

In the Vercel dashboard:

1. Open your project → **Storage** tab
2. Click **Create Database** → **Blob**
3. Name it (e.g. `klinekraft-proofs-blob`) → Create
4. Connect it to this project (Vercel will offer this automatically)

This creates an environment variable called `BLOB_READ_WRITE_TOKEN` on
your project automatically — that's what the upload function uses.

### 3. Redeploy

```bash
vercel --prod
```

Done. You're live.

## Daily usage

1. Export your booklet from InDesign as a PDF.
2. Open `https://your-deployment.vercel.app/`.
3. Drop the PDF onto the page. The flipbook appears right away.
4. Wait a few seconds for "Share link ready" — click the share icon
   in the top bar to copy a link like:
   ```
   https://your-deployment.vercel.app/?pdf=https://blob.vercel-storage.com/Barron_Fork_Ranch-aB3xY.pdf
   ```
5. Send that link to your agent.

The agent clicks the link, the flipbook opens. Clean, branded,
mobile-friendly. Page-curl animation, thumbnails, zoom, fullscreen,
and a PDF download button.

## Features (viewer)

- Realistic page-curl flip animation via StPageFlip
- Magazine-style spread view on desktop (cover renders solo, then spreads)
- Single-page swipe mode on iPhone / mobile (automatic)
- Thumbnail strip with click-to-jump
- Fullscreen mode
- Per-page zoom overlay
- Share link copy button (auto-hosted on drop)
- Original PDF download
- Keyboard arrows (← / →) for navigation

## Custom domain

If you want `proofs.klinekraft.com` instead of `klinekraft-proofs.vercel.app`:

1. Vercel dashboard → your project → **Settings** → **Domains**
2. Add `proofs.klinekraft.com`
3. Update your DNS as Vercel instructs (one CNAME record)

That's it. Existing share links will keep working under both domains.

## Updating

When you want to change the design or add features, edit the files in
`public/` and redeploy:

```bash
vercel --prod
```

The change is live in ~20 seconds.

## Tech notes

- **No build step.** `public/index.html` is plain HTML/CSS/JS, loaded
  straight from the CDN. The only "built" file is
  `public/vercel-blob-client.js`, which is the Vercel Blob client SDK
  pre-bundled for browsers (since it's published as ESM-only on npm).
- The blob client is loaded **on demand** — only fetched when someone
  drops a PDF, so recipients viewing a share link don't pay the cost.
- **No password gate.** Anyone who lands on `/` can upload a PDF. Keep
  the deployment URL private (or behind a custom domain you don't
  advertise) if that matters. Uploads are restricted to `application/pdf`
  and capped at 100 MB.
- **Libraries used:**
  - [PDF.js 3.11.174](https://github.com/mozilla/pdf.js) (via cdnjs) —
    renders each PDF page to canvas.
  - [StPageFlip 2.0.7](https://github.com/Nodlik/StPageFlip) (via jsDelivr) —
    realistic page-turning animation. MIT licensed, no dependencies.
  - [@vercel/blob 2.4.0](https://www.npmjs.com/package/@vercel/blob) —
    used inside `api/upload.js` (server-side) and `vercel-blob-client.js`
    (browser-side, for hosting dropped PDFs).
- **Brand colors:** Forest green `#155742` (from your logo), warm off-white
  `#F5F2EC`. The viewer uses Inter Tight for UI and Fraunces for accents.

## Troubleshooting

**Share button says "Hosting failed".** The blob upload didn't go
through. Most common cause: `BLOB_READ_WRITE_TOKEN` isn't set on the
deployment. Confirm the Blob store is connected to the project in the
Vercel dashboard, then redeploy.

**PDFs over 100 MB rejected.** Edit `maximumSizeInBytes` in
`api/upload.js`. Vercel Blob itself supports up to 5 GB per file.

**The flipbook is slow with very large PDFs.** Rendering happens in the
browser, so the limit depends on the agent's device. Booklets in the
30–50 page range render in 2–5 seconds on a modern laptop. If you
routinely produce 100+ page PDFs you'll want to lower the render scale
in `index.html` (search for `renderScale = 1.5 * dpr` and reduce to `1.0`).

**Old proofs taking up Blob storage.** Vercel Blob bills per GB-month.
To clean up, go to dashboard → Storage → your blob store → browse and
delete old files. Or use the Vercel Blob SDK's `del()` to write a small
cleanup script.

## License

Internal project for Klinekraft. PDF.js is Apache 2.0; StPageFlip is MIT;
@vercel/blob is Apache 2.0.
