---
title: Single PUT Pre-signed URLs
description: Technical design of direct client-to-S3 uploads for files under 10MB.
---

# 📤 Single PUT Pre-signed URLs

For smaller files (images, audio, PDFs, text files), we generate a single PUT pre-signed URL to allow direct uploading from the client.

---

## 1. Request Flow

1.  **Frontend Request:** The client sends an HTTP request containing `name`, `mimeType`, and `size`.
2.  **S3 Key Generation:** The NestJS API (`apps/api`) generates a clean path:
    `workspaces/{workspaceId}/assets/{uuid}`
3.  **Command Signing:** The API utilizes `@aws-sdk/s3-request-presigner` and `@aws-sdk/client-s3` to sign a `PutObjectCommand` with a 15-minute expiration:
    ```typescript
    const command = new PutObjectCommand({ Bucket: bucketName, Key: key, ContentType: mimeType })
    const url = await getSignedUrl(s3Client, command, { expiresIn: 900 })
    ```
4.  **Payload Execution:** The frontend receives the URL and key, and executes an HTTP `PUT` request with the file stream.
5.  **Finalization:** The client calls `POST /assets/upload/complete` to save the new asset row in the database.
