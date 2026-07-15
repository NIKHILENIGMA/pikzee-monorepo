---
title: assets
description: S3 client connections, pre-signed URL validators, and image transformations.
---

# @pikzee/assets (Future Package)

Path: `libs/assets`

## Purpose

Shares storage logic, S3 operations, and file manipulation utilities across backend API and worker nodes.

---

## Planned Modules

- **S3 Service:** Shared client configurations, single PUT pre-signed URL signers, and Multipart Upload managers.
- **Media Validator:** Validates file size and MIME-types against workspace limits before S3 upload begins.
- **Image Sharp Transformer:** Background optimization jobs to resize uploaded images and generate thumbnails.
