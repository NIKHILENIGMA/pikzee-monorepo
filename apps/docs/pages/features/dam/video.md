---
title: Video Asset Management
description: How video assets are uploaded, transcoded, and processed in Pikzee.
---

# 🎥 Video Asset Management

Videos (MP4, MOV, WebM) require specialized streaming configurations and background extraction tasks.

---

## 1. Multipart Chunked Upload

Because videos are typically larger than 50MB, they must utilize the **Multipart S3 Chunked Upload** protocol, uploading in 5MB fragments to ensure upload stability.

---

## 2. Background Metadata Extraction (BullMQ Worker)

After upload completion, a worker runs an analysis task using `ffprobe` (part of the FFmpeg toolkit):

- **Dimensions:** Extracts height, width, and aspect ratio (e.g. 16:9 landscape vs 9:16 portrait) to optimize the video player UI.
- **Duration:** Measures the running time in seconds (critical for scheduling post uploads on platform specifications like TikTok or YouTube Shorts).
- **Cover Thumbnail:** Generates a thumbnail image from frame 1 (or at 10% progress) and uploads it to S3 as the placeholder cover image.
