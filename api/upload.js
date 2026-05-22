// /api/upload.js
// Vercel serverless function. Generates a short-lived token that lets the
// browser upload a PDF directly to Vercel Blob — bypassing the 4.5 MB function
// body limit. The upload is gated by a shared password (UPLOAD_PASSWORD env var).
//
// The browser POSTs here twice during a single upload:
//   1) "blob.generate-client-token" — we check the password and approve.
//   2) "blob.upload-completed"     — Vercel notifies us when the upload finishes.
//
// We never see the PDF bytes; they go straight from browser to Blob.

import { handleUpload } from '@vercel/blob/client';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = request.body;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // ── Password check ──────────────────────────────────────────
        // The browser sends the password through clientPayload (a string).
        const expected = process.env.UPLOAD_PASSWORD;
        if (!expected) {
          throw new Error(
            'UPLOAD_PASSWORD is not set on the server. ' +
            'Add it in Vercel → Project Settings → Environment Variables.'
          );
        }

        let supplied = '';
        if (clientPayload) {
          try {
            const parsed = JSON.parse(clientPayload);
            supplied = parsed.password || '';
          } catch {
            supplied = '';
          }
        }

        if (supplied !== expected) {
          throw new Error('Incorrect password.');
        }

        return {
          allowedContentTypes: ['application/pdf'],
          addRandomSuffix: true,
          // Optional: cap upload size. Default Blob limit is 5 GB but we
          // realistically want ≤ 100 MB per booklet.
          maximumSizeInBytes: 100 * 1024 * 1024,
          tokenPayload: JSON.stringify({
            uploadedAt: new Date().toISOString(),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Fires after the upload completes successfully.
        // We don't need a DB; Vercel Blob keeps the URL stable.
        console.log('Upload completed:', blob.url);
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (err) {
    console.error('Upload error:', err);
    return response.status(400).json({ error: err.message || 'Upload failed' });
  }
}
