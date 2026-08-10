# Backend API Coding Standards & Rules (NestJS)

This document outlines the professional and scalable architecture standards for the Pikzee NestJS backend.

## 1. Architecture & Module Structure

- **Module Separation:** Strictly follow the NestJS modular architecture. Each feature should have its own `Module`, `Controller`, and `Service`.
- **Thin Controllers:** Controllers must be thin, exclusively handling HTTP routing, request payload extraction, and response formatting. **No business logic** should reside in controllers.
- **Fat Services:** All business logic, third-party API calls, and complex data processing must be encapsulated inside `@Injectable()` services.

## 2. API Responses & Interceptors

- **Standardized Response:** Every API endpoint must return a predictable, standardized JSON structure.
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Request processed successfully",
    "data": {
      "id": "usr_94821",
      "name": "Jane Doe"
    },
    "timestamp": "2026-07-28T11:08:42.125Z"
  }
  ```
- **Global Response Interceptor:** Enforce this structure using a Global Interceptor rather than manually constructing this object in every controller method.

## 3. Validation & DTOs

- **Zod Validation:** Use Zod for all request body, query, and parameter validation.
- **Pipes:** Implement global Validation Pipes that automatically parse and validate incoming requests against Zod schemas before they hit the controller.

## 4. Error Handling

- **Global Exception Filter:** Implement a Global Exception Filter (`@Catch()`) to handle `HttpException`, validation errors, and unexpected errors.
- **Consistent Error Structure:** Error responses must match the standard API response structure, for example:
  ```json
  {
    "success": false,
    "statusCode": 400,
    "errorCode": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "timestamp": "2026-07-28T11:08:42.125Z"
  }
  ```

## 5. Security & Authentication

- **Clerk Integration:** Use Clerk for authentication. Use Custom Guards to verify Clerk session tokens and protect endpoints globally or at the controller/route level.
- **RBAC / Permissions:** Implement Role-Based Access Control (RBAC) via custom decorators (e.g., `@Roles('admin')`) and Role Guards.
- **Rate Limiting:** Protect public and authentication endpoints from brute force and DDoS attacks using `@nestjs/throttler`.
- **Helmet & CORS:** Always enable Helmet for secure HTTP headers and configure strict CORS policies.

## 6. Database & ORM (Drizzle)

- **Centralized Schema:** Define all Drizzle schemas in the shared database library.
- **Transactions:** Any operation that involves multiple database mutations must be wrapped in a transaction to ensure ACID compliance.
- **Avoid Raw SQL:** Rely on Drizzle's query builder. Only use raw SQL for highly specialized queries that Drizzle cannot optimize.
- **Strategic Indexing:** Add indexes only on columns that are frequently used in `WHERE`, `ORDER BY`, or `JOIN` clauses. Avoid over-indexing, as it degrades `INSERT`/`UPDATE` performance and increases storage costs.
- **N+1 Query Prevention:** Never execute database queries inside loops. Always use Drizzle's relational queries (`db.query...`) or `IN` clauses to fetch related data in a single batch.
- **Pagination Strategy:** Never return unbounded lists of records. Always enforce Cursor-based pagination (preferable for infinite scroll/feeds) or Offset-based pagination for all list-returning endpoints.
- **Soft Deletes:** Prefer soft deletes (e.g., a `deletedAt` timestamp) over hard deletions for critical entities to maintain data integrity, audit history, and prevent accidental permanent data loss.
- **Connection Pooling:** Ensure database connections are properly pooled to avoid exhausting connection limits under heavy load.

## 7. Configuration & Environment Variables

- **Strict Validation:** Use `@nestjs/config` combined with Zod to strictly type and validate all environment variables on application startup.

## 8. Logging & Tracing

- **Structured Logging:** Use a structured logging library like `nestjs-pino` to output JSON logs. Avoid standard `console.log`.
- **Correlation IDs:** Every incoming request must be assigned a unique Correlation ID (e.g., via middleware), which is injected into all subsequent log entries for that request.

## 9. Performance & Caching

- **Caching Strategy:** Cache expensive, read-heavy, and infrequently changing data endpoints using `@nestjs/cache-manager` (with Redis for distributed caching).
- **Background Jobs (Queues):** Do not block the event loop with heavy processes (e.g., image resizing, heavy calculations). Offload these to a message queue system like BullMQ.

## 10. API Documentation

- **Swagger/OpenAPI:** All endpoints, DTOs, and expected responses must be documented using `@nestjs/swagger` decorators (`@ApiProperty`, `@ApiResponse`, `@ApiOperation`). The Swagger UI should act as the single source of truth for the frontend team.
