---
name: Araştır Design System
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#39393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1b1b1c'
  surface-container: '#1f1f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353536'
  on-surface: '#e4e2e3'
  on-surface-variant: '#c5c6cc'
  inverse-surface: '#e4e2e3'
  inverse-on-surface: '#303031'
  outline: '#8f9096'
  outline-variant: '#45474c'
  surface-tint: '#bfc7d8'
  primary: '#bfc7d8'
  on-primary: '#29313e'
  primary-container: '#0a121e'
  on-primary-container: '#767d8d'
  inverse-primary: '#575f6d'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#b7c8e1'
  on-tertiary: '#213145'
  tertiary-container: '#021225'
  on-tertiary-container: '#6e7e96'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe3f4'
  primary-fixed-dim: '#bfc7d8'
  on-primary-fixed: '#141c28'
  on-primary-fixed-variant: '#3f4755'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#131314'
  on-background: '#e4e2e3'
  surface-variant: '#353536'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  title-md:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  container-max: 1440px
---

## Brand & Style

The design system is engineered to project institutional-grade reliability combined with the cutting-edge intelligence of AI-driven market research. It targets enterprise analysts, CMOs, and venture capitalists who require rapid, high-fidelity data synthesis. 

The aesthetic is **Sleek & High-Contrast**, leaning into a "Dark Mode First" philosophy that mirrors high-end fintech terminals. It utilizes abstract data visualization—such as blurred mesh gradients in emerald tones and micro-geometric patterns—to represent the flow of information. The experience is fast, precise, and high-stakes, evoking a sense of "technological mastery" through deep backgrounds and punchy, luminous accents.

## Colors

The palette is anchored by **Dark Navy (#0A121E)**, which serves as the primary canvas to reduce eye strain during long analytical sessions. **Emerald Green (#10B981)** is the singular action color, representing growth, positive market trends, and AI "confidence" scores. 

**Slate Gray (#64748B)** provides the neutral structure, used for borders and secondary metadata. For high-contrast impact, we use **Pure White** and **Off-White (#F8FAFC)** for primary typography, ensuring absolute legibility against the deep background. Success states leverage the emerald primary, while error states should utilize a high-vibrancy coral to cut through the navy base without muddying the palette.

## Typography

This design system employs a dual-typeface strategy to balance impact with utility. **Montserrat** is reserved for headlines and numeric data points, utilizing its geometric boldness to establish authority and a modern fintech feel. **Inter** is used for all body copy, UI labels, and complex data tables, chosen for its exceptional legibility and neutral, systematic tone.

Numeric data in charts should use the semi-bold weight of Montserrat to ensure figures "pop." Letter spacing for labels is slightly increased to maintain clarity against the dark background.

## Layout & Spacing

The layout utilizes a **12-column fixed-center grid** for desktop environments to maintain a structured, editorial feel for market reports. A consistent 8px/4px rhythm dictates all spatial relationships. 

- **Desktop:** 48px outer margins, 24px gutters.
- **Tablet:** 32px outer margins, 16px gutters.
- **Mobile:** 16px outer margins, 12px gutters.

Content is organized into distinct card modules. Spacing within cards should be generous (minimum 24px padding) to prevent dense data from feeling overwhelming. Horizontal "scan lines" or subtle Slate Gray dividers may be used to separate complex list items.

## Elevation & Depth

In this design system, depth is created through **Tonal Layering** and **Glassmorphism**, rather than traditional heavy shadows. 

1.  **Level 0 (Base):** Dark Navy (#0A121E) - The infinite background.
2.  **Level 1 (Cards):** Surface Navy (#111B27) - Slightly lighter than the base with a 1px Slate Gray stroke at 10% opacity.
3.  **Level 2 (Modals/Popovers):** Semi-transparent Navy with a 20px backdrop blur and a vibrant 1px border on the top edge to simulate a light source.

Shadows, when used, are "Ambient Glows"—ultra-diffused (40px-60px blur) using the Emerald Green color at 5-10% opacity, placed behind primary action cards or AI insight highlights to suggest "energy" radiating from the data.

## Shapes

The shape language is **Soft (0.25rem/4px)**. This choice reinforces a professional, precision-engineered atmosphere. Sharp corners feel too aggressive, while fully rounded corners feel too consumer-focused. 

Buttons and input fields use the base 4px radius. Larger layout containers and cards may scale up to 8px (rounded-lg) to soften the overall interface composition. Data visualization bars and indicators should remain sharp or minimally rounded to emphasize mathematical accuracy.

## Components

### Buttons
- **Primary:** Solid Emerald Green with Montserrat Bold white text. No gradient, but a subtle "inner glow" on hover.
- **Secondary:** Ghost style with a 1px Slate Gray border. On hover, the border and text transition to Emerald Green.

### Cards
- **Insight Cards:** Feature a Level 1 surface. If an insight is "High Priority," the left border is accented with a 4px Emerald Green stripe.
- **Data Cards:** Minimalist headers with Montserrat Title-md typography.

### Input Fields
- Deep Navy background (darker than the card surface). 
- Bottom-only border or subtle 1px frame in Slate Gray.
- Active state: Border glows Emerald Green with a soft outer shadow.

### Abstract Data Viz
- Use "Sparklines" with Emerald Green gradients.
- "AI Pulse": A subtle, animated glowing orb used next to AI-generated summaries to indicate real-time processing or high confidence.

### Chips & Tags
- Pill-shaped but utilizing the "Soft" radius (4px). 
- Backgrounds are 10% opacity Emerald or Slate with 100% opacity text of the same hue.