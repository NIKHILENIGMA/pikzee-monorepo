---
title: Multipart Chunked Uploads
description: Technical design of direct client-to-S3 chunked uploads for files over 10MB.
---

# 📤 Multipart Chunked Uploads

For large files (videos, high-res audio), we split files into 5MB chunks and upload them concurrently using S3 Multipart Upload.

---

## 1. Sequence of Events

```
Client                              NestJS API                             AWS S3
  │                                     │                                     │
  ├── 1. Request Multipart Init ───────>│                                     │
  │                                     ├── 2. CreateMultipartUpload ────────>│
  │                                     │<── 3. Return UploadId & S3 Key ─────┤
  │<── 4. Return UploadId & Key ────────┤                                     │
  │                                     │                                     │
  ├── 5. Request Chunk Signatures ─────>│                                     │
  │<── 6. Return Signed URLs (Parts 1-N)┤                                     │
  │                                     │                                     │
  ├── 7. PUT Chunks in parallel ────────┼────────────────────────────────────>│
  │                                     │                                     │
  ├── 8. Complete Upload (Send ETags) ──>│                                     │
  │                                     ├── 9. CompleteMultipartUpload ──────>│
  │                                     │<── 10. Merge Confirmation ──────────┤
  │                                     ├── 11. Insert row into Database      │
  │<── 12. Return New Asset ────────────┤                                     │
```

1.  **Initiate:** The client initializes the flow by calling `/assets/upload/multipart/initiate`. NestJS calls S3 and retrieves an `UploadId`.
2.  **Part Generation:** The client splits the file into parts. It requests signed URLs for each part by calling `/assets/upload/multipart/generate-urls` with `UploadId` and `partCount`.
3.  **Uploading Chunks:** The client uploads the binary chunks to S3, collecting the returned `ETag` header for each chunk.
4.  **Finalization:** The client submits `UploadId` and the parts catalog (Part Numbers and `ETags`) to `/assets/upload/multipart/complete`. The API merges the chunks on S3, validates the final size, and creates the asset record in PostgreSQL.
