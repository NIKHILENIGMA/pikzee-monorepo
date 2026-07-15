---
title: TipTap Core Setup
description: Core configurations and design system bindings for the TipTap editor.
---

# 📝 TipTap Core Setup

Our rich-text package (`@pikzee/documents`) wraps TipTap core to establish styling compatibility and clean state structures.

---

## 1. Extension Configuration

We customize the standard `@tiptap/starter-kit` to inject our Tailwind CSS v4 design system classes directly into standard elements:

```typescript
import StarterKit from '@tiptap/starter-kit'

export const pikzeeExtensions = [
  StarterKit.configure({
    heading: {
      HTMLAttributes: {
        class: 'scroll-m-20 text-gray-900 tracking-tight font-extrabold',
      },
    },
    paragraph: {
      HTMLAttributes: {
        class: 'leading-7 [&:not(:first-child)]:mt-6 text-gray-700',
      },
    },
    codeBlock: false, // Disabled to use lowlight instead
  }),
]
```

This keeps standard editor tags in sync with our workspace styles.

---

## 2. Editor State Synchronization

- **Initialization:** The editor component accepts an `initialContent` parameter (HTML string or JSON tree) and hydrates the editor inside `useEffect`.
- **Keystroke Throttling:** Changes trigger an `onChange` event emitter, debounced locally to prevent high re-render frequencies on the parent dashboard.
