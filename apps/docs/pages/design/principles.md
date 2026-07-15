---
title: Aesthetic Design Principles
description: Aesthetic tokens, color themes, typography, and design philosophies for Pikzee.
---

# 🎨 Aesthetic Design Principles

Pikzee is designed to feel premium, modern, and state-of-the-art. This guide outlines the key aesthetic principles that guide UI development.

---

## 1. Key Design Tenets

- **Vibrant Color Harmonies:** Avoid generic colors (like plain #FF0000 red or #0000FF blue). Use curated HSL palettes featuring deep rich colors, smooth gradients, and glassmorphism.
- **Dynamic Visual Responsiveness:** Elements should feel alive. Hover states, active focus borders, and interactive transitions should use micro-animations to guide user attention.
- **Modern Typography:** We use Outfit or Inter fonts with strict vertical grid alignments to keep text legible and clean.
- **Dark Mode Native:** Every screen must be designed from a dark-mode first perspective, ensuring proper contrast ratios without losing the premium color identity.

---

## 2. Global Design Tokens (Tailwind v4)

Our styles are configured in `libs/ui` and `apps/web` utilizing the new Tailwind v4 design tokens:

| Token           | Class / Value                     | Purpose                                           |
| :-------------- | :-------------------------------- | :------------------------------------------------ |
| **Primary**     | `bg-primary` (hsl(250, 84%, 60%)) | Main action items, highlights, active selections. |
| **Background**  | `bg-background`                   | Premium dark backdrop.                            |
| **Glow Effect** | `shadow-glow`                     | Subtle glassmorphic glows and borders.            |
| **Font Sans**   | `font-sans` (Inter/Outfit)        | High-legibility sans-serif text.                  |
