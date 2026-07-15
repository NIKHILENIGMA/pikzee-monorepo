---
title: Product Requirements (PRD)
description: Product Requirements Document for Pikzee workspace, assets, and collaboration.
---

# 📋 Product Requirements Document (PRD)

## 1. Vision & Goals

Pikzee is a premium, real-time collaborative workspace designed to streamline project management, rich text document editing, digital asset management (DAM), and social platform publishing into a single, unified experience.

The core goal is to deliver a smooth, high-fidelity user interface (Notion-like editor + Google Drive-like asset control) backed by robust offline-first synchronization and background job queues.

---

## 2. Target Audience

- **Content Creators & Marketers:** Need to write drafts, manage images/videos, and publish directly to social media.
- **Collaborative Teams:** Need to work on documents concurrently with live presence, inline comments, and task checklists.
- **Organizations:** Need workspace divisions, role-based access control (RBAC), and team member invite flows.

---

## 3. Core Product Features

### **A. Workspace & Membership**

- **Workspaces:** Isolated environments for projects, documents, and media.
- **Invitation Lifecycles:** Send email invitations, track pending invites, handle expiration, and accept joins securely.
- **Role-Based Access Control (RBAC):** Define roles: `OWNER`, `EDITOR`, `COMMENTOR`, and `GUEST`.

### **B. Digital Asset Management (DAM)**

- **Asset Explorer:** Folders and file explorer with card/list views and bulk actions (move, copy, delete).
- **Secure Storage:** Direct client-to-S3 uploads utilizing secure pre-signed URLs. Supports multipart uploads for large files.
- **Asset Transformations:** Automatic generation of image thumbnails, format conversion, and video duration extraction.

### **C. Rich Document Editor**

- **Custom Editor (TipTap):** Built-in rich text editor featuring Notion-style `/` slash commands, bubble menus, and checkable lists.
- **Real-time Collaboration:** Live collaborative editing powered by Yjs CRDTs and Hocuspocus gateway.
- **Cursor Presence:** Live cursor beams and selection highlights with user name tags.

### **D. Social Publishing**

- **Integration:** OAuth 2.0 connections for YouTube, LinkedIn, and Twitter/X.
- **Background Publishing:** BullMQ-based video/image processing and API posting.

---

## 4. Out of Scope (For Current Phases)

- **Public API Access:** No public developer keys or external Webhook integrations.
- **AI Auto-Writing Assistants:** AI content writing, summaries, or smart tag generation (reserved for future phases).
- **Real-Time Audio/Video calls:** Team call features inside workspace rooms.
