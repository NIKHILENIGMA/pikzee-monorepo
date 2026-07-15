---
title: S3 Upload Management
description: Overview of client-to-S3 direct upload architecture.
---

# 📤 Upload Management (S3)

To ensure high performance and scale, Pikzee utilizes client-to-cloud file uploading. This offloads resource-heavy file streaming from our application server directly to AWS S3.

---

## 1. Upload Architectures

We support two distinct upload protocols depending on the size of the asset:

1.  **[Single PUT Uploads](/features/upload/presigned-url):** Used for files under 10MB (images, text files, small documents). A single pre-signed URL is generated to upload the entire payload in a single HTTP request.
2.  **[Multipart Chunked Uploads](/features/upload/multipart):** Used for files 10MB and larger (videos, raw audio). The file is split into 5MB chunks which are uploaded in parallel to S3, ensuring stability over network drops.
