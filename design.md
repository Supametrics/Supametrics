# Supametrics Design Guide

This guide defines the **official design language** of Supametrics — a developer-focused analytics platform with a minimal, premium interface inspired by Vercel, A1.gallery, and Linear.

It focuses on **clean typography**, **dark-first aesthetics**, and a sharp, modern layout system to deliver a 10/10 user experience.

---

## Typography

### Primary Font

* **Font Family**: [`Switzer`](https://www.fontshare.com/fonts/switzer) (via [Fontshare CDN](https://www.fontshare.com))
* **License**: Open-source, free for commercial use

```html
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=switzer@100,200,300,400,500,600,700,800,900&display=swap" />
```

### Font Weights Used

* `100` — Thin (for subtle labels)
* `300` — Light (captions, helper text)
* `400` — Regular (default body)
* `500` — Medium (button text)
* `700` — Bold (headings)
* `900` — Black (hero statements, graph titles)

### Font Pairing

* No monospace needed unless showing code — fallback to `IBM Plex Mono` if required.

### Tailwind Setup (optional)

```css
@theme {
  --font-sans: Switzer;
}
```

---

## Colors

### Theme: **Black & White Minimalism**

| Purpose         | Color     | Notes                            |
| --------------- | --------- | -------------------------------- |
| Background      | `#000000` | Pure black                       |
| Text (primary)  | `#ffffff` | Pure white                       |
| Surface (card)  | `#111111` | Slightly lighter black           |
| Border          | `#1f1f1f` | Low-contrast borders             |
| Muted text      | `#888888` | Inactive states                  |
| Purple (Accent) | `#9D4EDD` | For graphs, highlights, callouts |
| Red (Error)     | `#F43F5E` | Destructive actions              |
| Green (Success) | `#10B981` | Positive/verified states         |
| Yellow (Warn)   | `#FACC15` | Warnings, limits                 |

Use HSLA for fine-tuned transparency.

### Optional Radix Colors (Dark Theme Base)

Use Radix primitives if extending to component libraries.

---

## Spacing & Layout

* **Grid**: 8px base unit
* **Max Widths**:

  * Content: `720px`
  * Dashboard: `1200px`
* **Container Padding**: `24px`
* **Card Padding**: `16px`
* **Rounded Corners**: `24px` or `rounded-2xl`
* **Shadow**: Soft shadow only: `shadow-[0_4px_24px_rgba(0,0,0,0.3)]`

---

## Component Library

### Use:

* **Tailwind CSS** (utility-first design)
* **shadcn/ui** (based on Radix UI)
* **Framer Motion** (smooth animations)
* **Lucide.dev** (icons)
* `next-themes` for light/dark toggle support

Install shadcn:

```bash
npx shadcn@latest init
```

---

## Components Style Notes

### Buttons

| Style      | Usage Example                                                                       |
| ---------- | ----------------------------------------------------------------------------------- |
| **Black**  | Primary actions like "Submit", "Continue"                                           |
| **White**  | On dark backgrounds for strong contrast                                             |
| **Gray**   | Secondary/neutral actions like "Cancel"                                             |
| **Accent** | Use purple `#9D4EDD` for key highlights, especially in modals or graph interactions |

* All buttons are rounded-xl by default
* **Hover** state: use `bg-[#1a1a1a]` or a slight tint of the base color

### Cards

* Background: `#111111`
* Rounded, soft shadow
* Spacing inside: `p-6`

### Charts / Graphs

* Color: **Purple `#9D4EDD`** as the primary data line
* Gradients on area charts

---

## Animations

Use **Framer Motion** for:

* Page transitions (fade, slide-in)
* Tooltip reveals
* Modal open/close
* Chart hover effects

Keep it subtle — avoid jarring movement.

---

## Icons

Use [**Lucide.dev**](https://lucide.dev) — clean, minimal, customizable. Integrates well with Tailwind + React.

---

## Developer Tooling

| Tool              | Purpose                       |
| ----------------- | ----------------------------- |
| **Next.js**       | React framework               |
| **Tailwind CSS**  | Utility-first styling         |
| **shadcn/ui**     | Component styling & theming   |
| **Framer Motion** | Animation                     |
| **Lucide**        | Icon set                      |
| **next-themes**   | Light/dark mode               
---

## Summary

This design system ensures Supametrics feels fast, beautiful, and purpose-built for developers — not bloated or corporate. It should evoke confidence, simplicity, and elegance through every detail.

All contributions and UI changes must follow this guide.

Let beauty and precision lead 🖤.
