// /api/upload.js
// Vercel serverless function. Generates a short-lived token that lets the
// browser upload a PDF directly to Vercel Blob — bypassing the 4.5 MB function
// body limit.
//
// The browser POSTs here twice during a single upload:
//   1) "blob.generate-client-token" — we approve and hand back a token.
//   2) "blob.upload-completed"     — Vercel notifies us when the upload finishes.
//
// We never see the PDF bytes; they go straight from browser to Blob.

import { handleUpload } from '@vercel/blob/client';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const jsonResponse = await handleUpload({
      body: request.body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['application/pdf'],
        addRandomSuffix: true,
        maximumSizeInBytes: 100 * 1024 * 1024,
        tokenPayload: JSON.stringify({ uploadedAt: new Date().toISOString() }),
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log('Upload completed:', blob.url);
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (err) {
    console.error('Upload error:', err);
    return response.status(400).json({ error: err.message || 'Upload failed' });
  }
}
