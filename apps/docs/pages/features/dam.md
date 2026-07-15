---
title: Digital Asset Management (DAM)
description: Overview of Pikzee's Asset and Folder system.
---

# 📦 Digital Asset Management (DAM)

The DAM module in Pikzee acts as a cloud-based file explorer (like Google Drive) to organize all media and document files inside your workspaces.

---

## 1. Core Structures

- **Virtual Folder Tree:** Assets are stored flat in S3 but mapped hierarchically in PostgreSQL via a self-referencing `parent_id` column.
- **Workspace Scoping:** All assets and folders are strictly scoped to a unique `workspace_id` to enforce logical multi-tenancy.
- **Batch Operations:** Support for multi-selecting files/folders and executing bulk movements, copies, or deletions.

---

## 2. Asset Classes

The DAM explorer categorizes assets into four core classes, each triggering specific background processing tasks:

1.  **[Images](/features/dam/image):** Automated thumbnail scaling and formats conversion.
2.  **[Videos](/features/dam/video):** Metadata extraction, duration parsing, and cover generation.
3.  **[Audio](/features/dam/audio):** Waveform rendering and metadata indexing.
4.  **[Documents](/features/dam/document):** Static file previews (PDFs, CSVs, worksheets).
