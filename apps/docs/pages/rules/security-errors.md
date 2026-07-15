---
title: Security, Errors & Logging
description: Guidelines for secure development, global error handling, and logger standards.
---

# 📜 Security, Errors & Logging Guidelines

Security and runtime stability are central to the Pikzee platform. Developers (and AI agents) must adhere to these policies.

---

## 1. Error Handling Conventions

### **NestJS (Backend API & Worker):**

- **Throw Standard Exceptions:** Never throw raw `Error` objects. Always throw NestJS HttpExceptions (e.g., `NotFoundException`, `BadRequestException`, `ForbiddenException`).
- **Global Filter Mapping:** Uncaught exceptions are intercepted by a global NestJS `HttpExceptionFilter` which sanitizes and formats the error JSON:
  ```json
  {
    "success": false,
    "error": {
      "code": "BAD_REQUEST",
      "message": "Validation failed",
      "details": [ ... ]
    }
  }
  ```
- **Use Transaction Boundaries:** For operations affecting multiple tables (e.g., creating a workspace and adding the owner as a member), always wrap the queries in a database transaction (`db.transaction()`) to ensure atomicity.

### **Next.js (Frontend):**

- **Fail Gracefully:** Use React **Error Boundaries** to prevent a single component crash from breaking the entire page layout.
- **User-Friendly Messages:** Display clean toast notifications (using `@pikzee/ui/toast`) containing friendly instructions rather than raw system error strings.

---

## 2. Logger Standards

- **Categorized Logs:** Always inject the NestJS `Logger` class and define a context context name:
  ```typescript
  private readonly logger = new Logger(WorkspaceService.name);
  ```
- **No Sensitive Logs:** Never log access tokens, refresh tokens, passwords, session cookies, or user PII (emails/phone numbers).
- **Log Levels:**
  - `Logger.log()`: High-level operations (e.g. "Workspace created successfully").
  - `Logger.warn()`: Non-breaking issues (e.g. "OAuth token refresh returned 400 - retrying...").
  - `Logger.error()`: System errors, with stack traces attached.

---

## 3. S3 Bucket Security Rules

- **Private by Default:** All files uploaded to our main S3 bucket are private. We **never** set `public-read` ACLs on direct object uploads.
- **CDN Authorization:** Public access to assets is handled via S3 Bucket Policies combined with an authorized CDN (like CloudFront or ImageKit) to protect original files from scraping.
- **Restricted Pre-signed URLs:** Pre-signed URLs must be generated with short expiration windows (maximum 15 minutes) and scoped explicitly to a single unique S3 Key.
