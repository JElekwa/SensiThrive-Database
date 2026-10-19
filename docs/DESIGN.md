---
name: Modern Handbook
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#44483e'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#75796d'
  outline-variant: '#c4c8ba'
  surface-tint: '#4e6537'
  primary: '#4e6537'
  on-primary: '#ffffff'
  primary-container: '#9eb982'
  on-primary-container: '#334a1e'
  inverse-primary: '#b4cf96'
  secondary: '#7a5735'
  on-secondary: '#ffffff'
  secondary-container: '#fecea4'
  on-secondary-container: '#795634'
  tertiary: '#2a6292'
  on-tertiary: '#ffffff'
  tertiary-container: '#82b5e9'
  on-tertiary-container: '#004673'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cfecb1'
  primary-fixed-dim: '#b4cf96'
  on-primary-fixed: '#0d2000'
  on-primary-fixed-variant: '#374d21'
  secondary-fixed: '#ffdcbf'
  secondary-fixed-dim: '#ecbe94'
  on-secondary-fixed: '#2d1600'
  on-secondary-fixed-variant: '#604020'
  tertiary-fixed: '#cfe5ff'
  tertiary-fixed-dim: '#9acbff'
  on-tertiary-fixed: '#001d34'
  on-tertiary-fixed-variant: '#024a78'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  container-max: 1280px
---

## Brand & Style

This design system is built on the **Modern Handbook** aesthetic—a philosophy that bridges the gap between editorial authority and functional utility. It is designed for a discerning audience seeking "low-tox" product intelligence, prioritizing clarity, calm, and scientific credibility over the frantic pace of traditional e-commerce.

The visual direction is **Minimalist with a Tactile focus**, utilizing generous whitespace, structured data blocks, and a sophisticated material palette. The goal is to evoke the feeling of a high-end wellness journal: intelligent and trustworthy, medically adjacent but never clinical. The user experience should feel like a guided discovery rather than a sales pitch.

## Colors

The palette is derived from the natural, soft tones of the provided logo and established brand data, refined for high-readability and a "Modern Handbook" feel.

*   **Primary (Sage Green):** Used for "Best" classifications, primary calls to action, and indicators of safety and health.
*   **Secondary (Stone/Earth):** Used for "Good" classifications and secondary UI accents to provide a grounded, natural warmth.
*   **Tertiary (Blue):** A nod to medical intelligence, used for informational badges, links, and "Notice" indicators.
*   **Neutral (Charcoal):** Deep, warm charcoal used for text and primary borders to ensure high contrast against the off-white background.
*   **Background (Stone White):** A warm, off-white surface that reduces eye strain compared to pure white, enhancing the editorial feel.

Classification logic:
*   **Best:** Primary Sage.
*   **Good:** Secondary Stone.
*   **Avoid:** High-contrast neutral or muted coral (utility only).

## Typography

The typography system establishes "Editorial Trust." **Source Serif 4** provides an authoritative, literary feel for headlines, reminiscent of high-end health journals. This is paired with **Inter**, a highly legible sans-serif for UI elements and body text to ensure clarity in dense product data.

Maintain a strict vertical rhythm. Use Serif styles for narrative and product names; use Sans-serif for ingredient lists, technical specs, and interface labels.

## Layout & Spacing

The design system utilizes a **Fixed Grid** model for desktop and a fluid model for mobile. 
- **Desktop:** 12-column grid with 24px gutters. Content is centered within a 1280px max-width container.
- **Tablet:** 8-column grid with 20px gutters and 32px margins.
- **Mobile:** 4-column grid with 16px gutters and 16px margins.

Spacing follows an 8px base unit. Card layouts should prioritize "information density with breathing room"—avoiding cramped product lists in favor of structured data blocks that allow the eye to rest.

## Elevation & Depth

To maintain the "Modern Handbook" aesthetic, this design system avoids heavy drop shadows and floating effects. Instead, depth is communicated through **Tonal Layers** and **Low-Contrast Outlines**.

*   **Surface Hierarchy:** The primary background is the base. Cards and containers use a pure white (#FFFFFF) surface to subtly lift off the off-white background.
*   **Outlines:** Use 1px solid borders in a muted version of the neutral color (e.g., 10-15% opacity) to define cards and sections.
*   **Hover States:** When an element is interactive, use a soft, ambient shadow (blur: 12px, opacity: 0.05) to provide a subtle "tactile" lift.

## Shapes

The shape language is **Soft**. Sharp corners are avoided to maintain a calm, approachable feel, but excessive rounding (pills) is avoided to keep the design looking authoritative and "medically adjacent."

*   **Standard UI (Buttons, Inputs, Cards):** 0.25rem (4px) corner radius.
*   **Large Containers (Product Hero Cards):** 0.5rem (8px) corner radius.
*   **Badges:** 2px radius or sharp to differentiate them from interactive buttons.

## Components

### Buttons
Primary buttons use the Primary Sage color with white text. Secondary buttons use a transparent background with a 1px Charcoal border. All buttons use the `label-md` typography.

### Cards
Cards are the backbone of the system. They feature a white background, a light 1px border, and consistent internal padding (24px). Headers within cards use `headline-md`.

### Classification Badges
Small, rectangular tags used for "Best," "Good," and "Avoid."
*   **Best:** Sage background / White text.
*   **Good:** Stone background / White text.
*   **Avoid:** Charcoal background / White text.

### Input Fields
Clean, minimalist inputs with a 1px border. The label sits above the field using `label-sm` in a muted charcoal. Focus states use a Primary Sage border glow.

### Trust Indicators
Small modules featuring icons and `label-sm` text (e.g., "Third-Party Tested," "Fragrance-Free") used to reinforce the authority-commerce narrative. These should be placed near the price or "Add to Cart" actions.