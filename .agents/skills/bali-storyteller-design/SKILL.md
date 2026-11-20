---
name: bali-storyteller-design
description: Design system, editorial visual language, Cirrel-inspired glass surfaces, mobile image-led layout rules, typography, brand tokens, GSAP scroll animations, and top-navigation-only constraints for Bali Storyteller across Customer, Admin, and Guide applications.
---

# Bali Storyteller Design System

## 1. Core Design Philosophy
Bali Storyteller is a premium, editorial, guide-first cultural travel marketplace. Every surface across the **Public Customer Website**, **Admin Dashboard**, and **Guide Dashboard** must feel like one cohesive travel technology company:

- **Desktop Visual Language (Cirrel-inspired)**: Floating rounded containers, iOS-style frosted/liquid glass surfaces (`backdrop-blur`), soft warm backgrounds, subtle multi-layered shadows, crisp hairlines (`1px` translucent borders), refined data tables, interactive charts, and purposeful GSAP motion.
- **Mobile Visual Language (Screenshot-inspired)**: Warm ivory canvas (`#F7F5EF`), large rounded photographic cards (`20px–28px` radius), generous negative space, minimal high-contrast typography, dark charcoal floating pill controls (`#191A18`), soft lime-green active highlights (`#D8F36A`), compact top navigation, and thumb-friendly filters.
- **Image-Led Hierarchy**: Photography of Bali's landscapes, temples, and guides leads every discovery card and editorial block. Text overlays use subtle bottom scrims (`linear-gradient`) only when needed for WCAG AA contrast.

## 2. Non-Negotiable Navigation Rules
- **TOP NAVIGATION ONLY**: Never create a bottom navigation bar, bottom tab bar, mobile tab bar, navigation dock, or fixed bottom menu at ANY breakpoint (`mobile`, `tablet`, `desktop`, `large desktop`) across any of the three apps.
- **Homepage Transparent-to-Glass Morphing Navbar**:
  - At `scrollY === 0` on `/`: Navbar is full-bleed transparent over the hero photography, floating glass card hidden, white/ivory crisp typography and logo.
  - On scroll down (`scrollY > 40` via GSAP ScrollTrigger): Smoothly morphs into a centered floating rounded glass pill/card (`rounded-full` or `rounded-2xl`, `backdrop-blur-xl`, translucent ivory/white or charcoal surface, `1px` delicate border, soft shadow, compact width/padding).
  - On return to `scrollY === 0`: Smoothly reverts to transparent without layout jump (navbar is `fixed top-0 inset-x-0 z-50`).
- **Internal Public Pages**: Compact floating glass top navbar immediately visible with high-contrast readable links.
- **Mobile Public Navbar**: Compact top bar only — Logo left, Search trigger + Menu trigger right. Opens a smooth full-screen/slide-in drawer with comfortable touch targets (`>= 44px`).
- **Admin & Guide Dashboards**:
  - Desktop: Collapsible left sidebar + top header (search, notifications, profile menu).
  - Mobile: Compact top header with menu button opening a slide-in drawer + page title + contextual actions. No bottom nav.

## 3. Brand Identity & Color Tokens
| Token | Hex | Usage |
|---|---|---|
| Primary Olive | `#344B35` | Primary actions, verified accents, deep editorial blocks |
| Deep Olive Hover | `#283B29` | Hover/active states on olive surfaces |
| Warm Ivory | `#F7F5EF` | Main page canvas & soft editorial backgrounds |
| Soft Sand / Surface | `#EFECE3` | Secondary cards, subtle chips, table hover rows |
| Muted Gold | `#B69A58` | Premium accents, verification seals, star ratings, editorial rules |
| Charcoal Black | `#191A18` | Primary typography, dark floating pills, high-contrast buttons |
| Soft Lime Green | `#D8F36A` | Active filter pills, live availability indicators, mobile action highlights |
| Neutral Grey | `#85877F` | Secondary metadata, captions, muted borders |
| Pure White | `#FFFFFF` | Elevated cards, glass highlights, inverted text |

### Glass & Surface Tokens
- **Light Glass Pill**: `bg-white/75 backdrop-blur-xl border border-[#191A18]/10 shadow-[0_8px_32px_rgba(25,26,24,0.08)]`
- **Dark Charcoal Glass**: `bg-[#191A18]/85 backdrop-blur-xl border border-white/15 text-[#F7F5EF] shadow-[0_12px_36px_rgba(25,26,24,0.22)]`
- **Ivory Editorial Card**: `bg-white rounded-[24px] border border-[#191A18]/8 shadow-[0_4px_24px_rgba(25,26,24,0.04)]`

## 4. Typography
- **Unified Geometric Display & Interface Font**: `Urbanist` (weights `400`, `500`, `600`, `700`), matching Cirrel's crisp, modern geometric typography across hero headlines, section titles, navigation, cards, and dashboard analytics.
- **Hierarchy & Spacing**: Tight tracking (`-0.025em`) on display headings, clean `tabular-nums` for all prices, durations, ratings, and financial ledgers, and airy Cirrel-style frosted glass spacing (`26px–30px` outer card radius, `16px` inner surfaces).
- **Color Purity**: Keep Deep Olive Green (`#344B35`) and Soft Lime Green (`#D8F36A`) for all primary buttons and active pills—never introduce Cirrel's default blue (`#007aff` / `#0a84ff`).

## 5. Motion & GSAP Guidelines
- Use GSAP + `ScrollTrigger` for:
  - Homepage navbar transparent <-> floating glass transition.
  - Hero editorial headline & photography staggered reveal.
  - Scroll-triggered section entrances (`y: 24 -> 0`, `opacity: 0 -> 1`, gentle `power3.out`).
- Always wrap GSAP setup in `gsap.context()` inside `useEffect` with cleanup (`ctx.revert()`).
- Always respect `prefers-reduced-motion: reduce` (skip transforms/staggers when reduced motion is preferred).
- Keep GPU-composited properties only (`transform`, `opacity`, `backdrop-filter`) for smooth 60fps mobile performance.

## 6. Accessibility & Quality Standards
- Minimum `44x44px` touch targets on mobile.
- Semantic HTML landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>`).
- Keyboard-accessible drawers, modals, date pickers, and dropdowns (`Escape` to close, focus visible rings).
- No generic placeholder chrome or repetitive card grids—vary section rhythms across editorial split panels, bento destination showcases, horizontal mobile carousels, and clean metric tables.
