# Frontend Coding Standards & Rules (Next.js & React)

This document outlines the professional and scalable architecture standards for the Pikzee frontend.

## 1. Architecture & Folder Structure

- **App Router First:** Exclusively use the Next.js App Router (`app/` directory).
- **Feature-Sliced Design (FSD):** Adhere to a strict feature-based folder structure. Each distinct feature (e.g., `auth`, `products`, `billing`) must have its own isolated folder containing its respective `components/`, `hooks/`, `actions/`, and `utils/`. Avoid dumping everything into global, flat directories.
- **Server-First Approach:** Default to React Server Components (RSC) to minimize client bundle size. Only add the `'use client'` directive at the lowest possible level in the component tree when interactivity (state, hooks, DOM events) is strictly required.
- **Separation of Concerns:** Keep components small, pure, and strictly presentational where possible. Extract business logic and state management into custom hooks within the feature's `hooks/` directory.

## 2. TypeScript & Shared Types

- **Monorepo Type Sharing:** **Always** import API response types, models, and shared DTOs from the `@pikzee-types` package. Do not duplicate backend types in the frontend application; leverage the monorepo configuration to ensure 100% type safety between client and server and prevent mismatch errors.
- **Strict Component Typing:** Always export TypeScript `Interfaces` or `Types` for component props. Avoid inline type definitions for complex objects.
- **Explicit Returns:** Explicitly type the return values of all custom hooks and utility functions to prevent unintended inferences.

## 3. Data Fetching & Mutations

- **Server Actions:** Prefer Next.js Server Actions for data mutations instead of creating traditional API Route handlers, keeping the mutation logic closely co-located with the feature (inside the feature's `actions/` folder).
- **Caching & Revalidation:** When fetching data on the server, heavily utilize the Next.js data cache. Use `revalidatePath` and `revalidateTag` strategically to keep data fresh without unnecessary refetches.

## 4. State Management

- **Server State vs. Client State:** Do not duplicate server data in client state (e.g., `useState`). Rely on RSC for server state. If client-side fetching is necessary, use tools like React Query or SWR, not raw `useEffect` + `fetch`.
- **Global Client State:** Keep global client state to an absolute minimum. If required (e.g., UI themes, complex multi-step forms), use lightweight libraries like Zustand or React Context instead of heavy solutions like Redux.

## 5. Performance Optimization

- **Next.js Core Components:** ALWAYS use `<Image>` from `next/image` (never `<img>`), `<Link>` from `next/link` (never `<a>`), and `next/font` to ensure automatic optimizations, lazy loading, and prefetching.
- **Dynamic Imports:** Use `next/dynamic` to lazy-load heavy client components (like charts, rich text editors, or complex modals) that are not immediately visible on page load.

## 6. Forms & Validation

- **Form Libraries:** Never manage complex form state manually with `useState`. Always use **React Hook Form**.
- **Schema Validation:** Use **Zod** (integrated via `@hookform/resolvers/zod`) to enforce strict client-side validation that mirrors your shared backend validation schemas.

## 7. Error Handling & UI States

- **Graceful Failures:** Always include `error.tsx` files at major route segments to catch unexpected runtime errors without crashing the entire application.
- **Loading UI:** Provide instant feedback to users by implementing `loading.tsx` or Suspense boundaries with skeleton loaders while data is fetching.

## 8. Accessibility (a11y)

- **Semantic HTML:** Use semantic HTML tags (`<nav>`, `<main>`, `<article>`, `<button>`) instead of generic `<div>` elements.
- **Keyboard & Screen Readers:** Ensure all interactive elements (custom dropdowns, modals) are keyboard navigable and include appropriate `aria-*` attributes.

## 9. Testing

- **Component Testing:** Use React Testing Library and Jest/Vitest for unit testing critical UI components. Tests should focus on user behavior and accessibility rather than implementation details.
- **Mocking:** Mock Server Actions and external API calls effectively when testing client components to ensure isolated and reliable tests.
- **E2E Testing:** Critical user flows (such as Authentication, Checkout, or Onboarding) must be covered by End-to-End tests using tools like Playwright or Cypress.
