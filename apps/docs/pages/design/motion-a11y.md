---
title: Motion & Accessibility
description: Core rules for transitions, framer-motion animations, and keyboard navigation.
---

# 🎨 Motion & Accessibility

Every interface in Pikzee must satisfy high standards of interactive beauty (smooth motion) and accessibility (usability).

---

## 1. Motion & Transitions

We use animations to enhance, never delay, the user experience. All transitions should use easing functions:

- **Page Transitions:** Next.js route transitions should utilize subtle fade-in layouts (`duration-200 ease-out`).
- **Active Elements:** Button clicks and toggle actions must use scale down click-animations (e.g. `active:scale-95 transition-all`).
- **Checking checklists:** Task list checks should play a slide-check or strike-through path draw animation.
- **Loading States:** Skeletons and progress bar loaders must use smooth pulse animations (`animate-pulse`).

---

## 2. Accessibility Guidelines (A11y)

- **Keyboard Navigation:** All interactive elements (e.g., buttons, input fields, custom workspace switcher dropdowns) must support full keyboard navigation (`Tab`, `Enter`, `Escape`, arrow keys).
- **Aria Attributes:** Custom interactive elements that are not native HTML tags must have matching ARIA attributes (`aria-expanded`, `aria-hidden`, `role="button"`).
- **Color Contrast:** Ensure a minimum color contrast ratio of 4.5:1 for standard body text against background backdrops.
- **Focus Ring Indicators:** Never disable focus rings (`outline-none`) without providing an explicit, highly visible alternative focus ring (e.g. `ring-2 ring-primary`).
