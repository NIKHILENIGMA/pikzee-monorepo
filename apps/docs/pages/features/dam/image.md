---
title: Image Asset Management
description: How image assets are uploaded, processed, and optimized in Pikzee.
---

# 🖼️ Image Asset Management

Image files (JPEG, PNG, WebP, SVG, GIF) represent a core asset class in Pikzee's Digital Asset Management (DAM) explorer.

---

## 1. Upload & Storage

Images are uploaded directly to the private S3 bucket. Upon successful completion, the client triggers the finalization hook, which registers the image asset in the database with a MIME-type (e.g. `image/png`).

---

## 2. Processing & Transformations (BullMQ Worker)

When a new image is registered, a background job is enqueued in the worker queue:

- **Thumbnail Generation:** The worker uses the `sharp` library to automatically create optimized, downscaled thumbnails at multiple resolutions (e.g., 200px and 800px width).
- **Format Conversion:** For heavy raw formats (like PNG or TIFF), the worker generates a modern `.webp` alternative to reduce loading bandwidth.
- **CDN Caching:** Images are delivered via a global CDN (e.g. ImageKit or CloudFront) to enable on-the-fly transformations and query-based resizing (e.g., `?w=300&h=300`).
