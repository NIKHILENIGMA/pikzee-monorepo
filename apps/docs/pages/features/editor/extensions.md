---
title: Custom TipTap Extensions
description: Technical design of custom node views, slash commands, and editor overlays.
---

# 📝 Custom TipTap Extensions

To build a premium, interactive editing canvas, we implement several custom Node views and plugin overlays.

---

## 1. Slash Command (`/`) Menu

- **Purpose:** Allows keyboard-centric block insertion (e.g., typing `/h1` turns a block into a Heading 1).
- **Implementation:** We use TipTap's `Suggestion` plugin to listen for the `/` trigger. When fired, it mounts a custom React dropdown wrapper containing the menu options.

---

## 2. Interactive Callout Boxes (Custom Node)

- **Purpose:** Notion-style alerts with custom icons and backgrounds (Warning, Info, Note).
- **Implementation:** We register a custom Node using `@tiptap/react`'s `ReactNodeViewRenderer`:

  ```typescript
  import { Node, mergeAttributes } from '@tiptap/core'
  import { ReactNodeViewRenderer } from '@tiptap/react'
  import CalloutComponent from './CalloutComponent'

  export const Callout = Node.create({
    name: 'callout',
    group: 'block',
    content: 'inline*',
    addAttributes() {
      return {
        type: { default: 'info' },
        icon: { default: '💡' },
      }
    },
    renderHTML({ HTMLAttributes }) {
      return ['div', mergeAttributes(HTMLAttributes), 0]
    },
    addNodeView() {
      return ReactNodeViewRenderer(CalloutComponent)
    },
  })
  ```

---

## 3. Syntax Code Blocks (Lowlight)

- **Purpose:** Renders code blocks with language-specific syntax highlighting.
- **Implementation:** Extends standard code blocks, configured with `lowlight` (a lightweight parsing engine). The React NodeView renders a copy button and language selection header above the code editor textarea.
