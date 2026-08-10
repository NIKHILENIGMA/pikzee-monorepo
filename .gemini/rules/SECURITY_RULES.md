# Security Standards & Rules

This document outlines the mandatory security practices for the Pikzee monorepo to protect against external threats, data breaches, and common vulnerabilities.

## 1. Authentication & Identity (Clerk)

- **Single Source of Truth:** Rely exclusively on Clerk for user authentication, session management, and identity verification. Do not roll custom JWT or password hashing implementations.
- **Session Verification:** Every protected backend endpoint must strictly verify the Clerk session token (using custom NestJS Guards). Never trust client-side user IDs without cryptographic verification.
- **Webhook Security:** All Clerk webhooks must cryptographically verify the Svix signature before processing the event to ensure it actually originated from Clerk.

## 2. Authorization & Access Control

- **Principle of Least Privilege:** Users and services should only have the absolute minimum access rights necessary to perform their functions.
- **Role-Based Access Control (RBAC):** Enforce strict RBAC on the backend. Use decorators (e.g., `@Roles('admin')`) and Guards to ensure users cannot access or mutate resources they do not own.
- **IDOR Prevention:** Always validate that the currently authenticated user actually owns the resource they are trying to modify (Insecure Direct Object Reference prevention).

## 3. Data Validation & Sanitization

- **Strict Payload Validation:** Never trust client input. All incoming requests (body, query, params) MUST be validated against strict Zod schemas before any business logic is executed.
- **Type Stripping:** Ensure the validation pipeline strips unknown/unwanted properties from incoming JSON payloads to prevent Mass Assignment attacks.
- **SQL Injection Prevention:** Never concatenate strings to form SQL queries. Rely exclusively on Drizzle ORM's built-in parameterization.

## 4. Web Vulnerability Prevention (OWASP)

- **Cross-Site Scripting (XSS):** Rely on React's automatic escaping for text rendering. Never use `dangerouslySetInnerHTML` unless rendering strictly sanitized Markdown (e.g., using DOMPurify).
- **Cross-Site Request Forgery (CSRF):** While Clerk handles session cookies securely, ensure any state-changing API endpoints enforce strict CORS policies and accept authorization via Bearer tokens where applicable.
- **Security Headers:** The NestJS backend must utilize `Helmet` to set secure HTTP headers (e.g., `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`).

## 5. API Protection

- **Rate Limiting (Throttling):** All public and authenticated endpoints must be protected by rate limiters (e.g., `@nestjs/throttler`) to prevent brute force and Denial of Service (DoS) attacks.
- **CORS Policy:** Configure strict Cross-Origin Resource Sharing (CORS). The backend should only accept requests from known and trusted frontend origins. Wildcard `*` origins are strictly prohibited in production.

## 6. Secrets & Environment Variables

- **No Hardcoded Secrets:** Never hardcode API keys, database credentials, or secrets in the source code.
- **Environment Validation:** All environment variables must be strictly typed and validated on startup (using Zod) to ensure the application does not boot with missing or misconfigured security credentials.
- **Secret Leaks in Frontend:** Prefix frontend-accessible environment variables with `NEXT_PUBLIC_` ONLY if they are truly safe to expose to the browser (e.g., Clerk Publishable Key). Never prefix secret keys with `NEXT_PUBLIC_`.

## 7. Logging & Auditing

- **Audit Trails:** Critical actions (e.g., user deletion, permission changes, payment processing) must generate an audit log with the user's ID, timestamp, and action details.
- **Sensitive Data Masking:** Never log sensitive information such as passwords, session tokens, credit card numbers, or PII (Personally Identifiable Information). Configure the logger to automatically redact these fields.
