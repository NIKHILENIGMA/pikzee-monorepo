---
title: Document Attachments in DAM
description: How PDF, CSV, and office documents are handled as assets in Pikzee.
---

# 📄 Document Attachments

Pikzee lets users organize static files (PDF, CSV, TSV, XLSX, DOCX) as assets inside folders alongside interactive TipTap documents.

---

## 1. Scope

- **Static Assets:** Unlike collaborative TipTap documents (which are stored dynamically in the `documents` table), these files are stored in S3 as static binary blobs and registered in the `assets` table.
- **Previews:** PDF files render inline in the web app utilizing built-in browser rendering engines or pdf-viewer libraries. CSV/XLSX attachments can be parsed by the frontend to render preview tables without needing external office suites.
