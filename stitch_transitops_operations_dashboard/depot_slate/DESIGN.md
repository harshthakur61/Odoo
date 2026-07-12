---
name: Depot Slate
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3d4947'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#4d5d73'
  on-tertiary: '#ffffff'
  tertiary-container: '#66768d'
  on-tertiary-container: '#fdfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display:
    fontFamily: Hanken Grotesk
    fontSize: 30px
    fontWeight: '500'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 24px
  margin-mobile: 16px
  sidebar-width: 260px
---

## Brand & Style
This design system is built on the principles of **Functional Minimalism** and **Industrial Precision**. It is designed specifically for high-density operations dashboards where clarity and speed of information processing are paramount. The aesthetic is "quiet"—it avoids visual noise like gradients, drop shadows, and complex animations to ensure the user's focus remains entirely on data and status.

The target audience consists of operations managers, logistics coordinators, and technical administrators who require a reliable, high-uptime interface that feels like a professional tool rather than a consumer app. The emotional response is one of calm control, architectural stability, and utilitarian efficiency.

## Colors
The palette is rooted in a "Slate and Teal" foundation. We use high-contrast neutrals to define structure rather than depth. 

- **Structural Contrast:** The sidebar uses a deep navy-slate (#0F172A) to create a clear visual anchor, while the main workspace stays light (#F8FAFC) to reduce eye strain.
- **Surface Logic:** Backgrounds are #F8FAFC. Active surfaces (cards, modals) are pure #FFFFFF. 
- **Accents & Status:** Teal (#0D9488) is used sparingly for primary actions to guide the eye. Status colors are saturated and clear, used primarily in badges and indicator dots to signal system health without overwhelming the layout.

## Typography
The system utilizes **Hanken Grotesk** for its technical, clean, and highly legible character. 

- **Weight Constraints:** To maintain the "quiet" aesthetic, only Regular (400) and Medium (500) weights are permitted. Never use Bold.
- **Casing:** All UI text must be in **sentence case**. Title case is reserved only for proper nouns or brand names.
- **Hierarchy:** Contrast is achieved through size and color (Primary vs. Muted text) rather than weight. Labels should be slightly tracked out (+0.02em) for better readability at small sizes.

## Layout & Spacing
The layout follows a **Fluid Grid** model with fixed sidebar constraints. 

- **Grid:** A 12-column grid is used for desktop. 
- **The Sidebar:** Remains fixed at 260px. On mobile, the sidebar collapses into a bottom-sheet navigation or a hidden drawer.
- **Spacing Rhythm:** Use a 4px baseline. Most components should use `16px` (md) for internal padding and `24px` (lg) for external margins between cards.
- **Alignment:** Content should always be left-aligned to mimic document flow, reinforcing the tool-like nature of the system.

## Elevation & Depth
Depth is created strictly through **1px #E2E8F0 borders** and background color shifts. 

- **No Shadows:** Drop shadows are strictly forbidden. 
- **Layering:** 
  - Level 0: Background (#F8FAFC)
  - Level 1: Cards and Surfaces (#FFFFFF with 1px border)
  - Level 2: Overlays and Popovers (#FFFFFF with 1px #CBD5E1 border to increase definition).
- **Separation:** Use vertical and horizontal rules (#E2E8F0) to divide content within cards or lists, ensuring a clean "ledger-like" appearance.

## Shapes
Shapes are disciplined and consistent. 

- **Standard Radius:** All cards, buttons, and input fields use an **8px (0.5rem)** radius.
- **Large Radius:** Modals or large container blocks may use **16px (1rem)** for a slightly softer appearance, though this should be used sparingly.
- **Interactive Elements:** Buttons never use pill-shapes; they adhere to the standard 8px radius to match the rest of the interface.

## Components
- **Buttons:** Solid #0D9488 with white text for primary. Ghost buttons use #E2E8F0 borders with #0F172A text. **States:** During loading, replace text with "Actioning..." (e.g., "Updating...")—do not use spinners.
- **Input Fields:** 1px #E2E8F0 border, 8px radius, white background. On focus, the border changes to #0D9488. Placeholder text uses #94A3B8.
- **Chips/Badges:** Small, 12px font-size, semi-bold. Backgrounds are very light tints of the status color with 10% opacity, and the text is the full-saturation status color.
- **Lists:** Rows are separated by 1px #E2E8F0 lines. Hover states on rows should be a subtle #F1F5F9 background shift.
- **Icons:** Use **Lucide** or **Heroicons** (Outline set). Stroke width should be 1.5px or 2px. Icons should always be the same color as the accompanying text.
- **Cards:** White background, 1px #E2E8F0 border, 8px radius. Titles within cards use `headline-md` in Primary text color.