# Klinekraft Proof Preview

A PDF flipbook viewer for sharing real estate booklet proofs with agents.
Branded with Klinekraft, built in the Dieter Rams minimalist tradition.

## What's inside

```
klinekraft-proofs/
├── public/
│   ├── index.html              ← the flipbook viewer (the "proof preview")
│   ├── upload.html             ← internal upload tool (password-protected)
│   └── vercel-blob-client.js   ← pre-bundled Vercel Blob client SDK
├── api/
│   └── upload.js               ← serverless function that hands out upload tokens
├── package.json
├── vercel.json
└── README.md
```

## How it works

There are two pages:

1. **`/`** — the public flipbook viewer. Accepts a PDF either dropped locally
   in the browser, or via a `?pdf=<URL>` query parameter (the hosted-share mode).
2. **`/upload`** — an internal, password-protected page where you upload a PDF
   to Vercel Blob and get back a shareable flipbook link. This is the page
   you'll use day-to-day.

The upload flow streams the PDF directly from the browser to Vercel Blob
storage — it never passes through the serverless function, which means
booklets of any size (up to 100 MB by default) can be uploaded.

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

### 3. Set the upload password

In the Vercel dashboard:

1. Open your project → **Settings** → **Environment Variables**
2. Add a new variable:
   - Name: `UPLOAD_PASSWORD`
   - Value: pick anything you want, e.g. `klinekraft2026`
   - Environments: Production, Preview, Development (check all three)
3. Save.

### 4. Redeploy so the env var takes effect

```bash
vercel --prod
```

Done. You're live.

## Daily usage

1. Go to `https://your-deployment.vercel.app/upload`
2. Enter your password, drop a PDF, click **Upload & create link**
3. Copy the link that comes back — it looks like:
   ```
   https://your-deployment.vercel.app/?pdf=https://blob.vercel-storage.com/Barron_Fork_Ranch-aB3xY.pdf
   ```
4. Send that link to your agent. They click it, the flipbook opens.

The agent doesn't need an account, password, or anything else. They get a
clean, branded, mobile-friendly preview with page-curl animation, thumbnails,
zoom, fullscreen, and a PDF download button.

## Features (viewer)

- Realistic page-curl flip animation via StPageFlip
- Magazine-style spread view on desktop (cover renders solo, then spreads)
- Single-page swipe mode on iPhone / mobile (automatic)
- Thumbnail strip with click-to-jump
- Fullscreen mode
- Per-page zoom overlay
- Share link copy button
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

- **No build step.** The viewer (`public/index.html`) and upload page
  (`public/upload.html`) are plain HTML/CSS/JS, loaded straight from the CDN.
  The only "built" file is `public/vercel-blob-client.js`, which is the
  Vercel Blob client SDK pre-bundled for browsers (since it's published as
  ESM-only on npm).
- **Libraries used:**
  - [PDF.js 3.11.174](https://github.com/mozilla/pdf.js) (via cdnjs) —
    renders each PDF page to canvas.
  - [StPageFlip 2.0.7](https://github.com/Nodlik/StPageFlip) (via jsDelivr) —
    realistic page-turning animation. MIT licensed, no dependencies.
  - [@vercel/blob 2.4.0](https://www.npmjs.com/package/@vercel/blob) —
    only used inside `api/upload.js` (server-side) and the pre-bundled
    `vercel-blob-client.js` (browser-side, for the upload page only).

- **Brand colors:** Forest green `#155742` (from your logo), warm off-white
  `#F5F2EC`. The viewer uses Inter Tight for UI and Fraunces for accents.

## Troubleshooting

**"Incorrect password" when uploading.** Make sure you added
`UPLOAD_PASSWORD` to Vercel env vars *and* redeployed afterward.
Env-var changes don't take effect on existing deployments.

**"UPLOAD_PASSWORD is not set on the server."** Same fix — you missed
step 3 or step 4 of the setup.

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
