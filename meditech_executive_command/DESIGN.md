---
name: Meditech Executive Command
colors:
  surface: '#f3faff'
  surface-dim: '#ccdde5'
  surface-bright: '#f3faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e6f6ff'
  surface-container: '#e0f0f9'
  surface-container-high: '#dbebf3'
  surface-container-highest: '#d5e5ed'
  on-surface: '#0e1e24'
  on-surface-variant: '#3f494a'
  inverse-surface: '#243339'
  inverse-on-surface: '#e3f3fc'
  outline: '#6f797a'
  outline-variant: '#bec8ca'
  surface-tint: '#006971'
  primary: '#005056'
  on-primary: '#ffffff'
  primary-container: '#006a72'
  on-primary-container: '#98e7f0'
  inverse-primary: '#84d3dc'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#663f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#875400'
  on-tertiary-container: '#ffd29f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a0eff8'
  primary-fixed-dim: '#84d3dc'
  on-primary-fixed: '#002023'
  on-primary-fixed-variant: '#004f55'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f3faff'
  on-background: '#0e1e24'
  surface-variant: '#d5e5ed'
typography:
  display-hero:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  metric-number:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
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
  body-md-medium:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses a high-reliability, clinical-grade executive atmosphere combined with modern SaaS clarity. Inspired by advanced health intelligence command centers, it balances authoritative decision-making utility with a calm, inviting clinical ambiance.

### Visual Aesthetic & Language
- **Modern Healthcare Minimalist & Data-Dense Executive UI**: Clean architectural whites, translucent micro-borders, and disciplined typographical rhythm.
- **Atmospheric Clarity**: Subtle aquamarine and pale cyan gradient washes provide dimension without overwhelming data readability.
- **Emotional Stance**: Instills absolute trust, procedural precision, effortless navigation, and calm control in mission-critical environments.

## Colors

The palette establishes an executive health technology posture through deep teal anchors, refreshing mint functional highlights, and high-legibility dark slate typography.

### Palette Architecture
- **Primary Teal (`#006A72`)**: Serves as the primary operational hue for action buttons, key metrics, active primary navigation, and selected command states. Hover states step down to a grounded deep teal (`#08565C`).
- **Primary Tint (`#E6F7F7` / `#CCF0F2`)**: Applied to active states, selected list items, focused inputs, and metric card indicators.
- **Secondary Mint / Success (`#0D9488` / `#10B981`)**: Drives positive delta trends (`+12% vs last week`), completion indicators, telemetry sparklines, and affirmative system actions. Supported by `#D1FAE5` surfaces.
- **Warning / Waiting (`#F59E0B`)**: Designates triage delays, waiting queues, and pending requests, supported by `#FEF3C7` backgrounds.
- **Neutral Core (`#0F1E24`)**: High-contrast, optical slate for primary headlines, patient names, and core metrics. Secondary labels and muted metadata utilize `#5F757C` and `#64748B`.
- **Canvas & Surfaces**: Base canvas utilizes a subtle gradient wash (`#EBF7F7` to `#F7FBFB`), holding pure white (`#FFFFFF`) card containers with structural borders in `#E2EAEB`.

## Typography

The typographical pairing unites structural authority with high-density data legibility:
- **Headlines (Manrope)**: Delivers geometric clarity and executive presence across dashboards, hero assertions, and high-level KPI readouts.
- **Body & Data Grid (Hanken Grotesk)**: Chosen for its open apertures and neutral, crisp profile, maintaining flawless scannability across telemetry tables, medical record lists, and clinical charts.

## Layout & Spacing

This design system uses an adaptable 12-column grid system paired with strict 8-point spatial multiples to sustain operational visual hierarchy.

### Spatial Rhythm
- **Global Canvas**: Padded by `margin` (`2rem`) on desktop monitors and dropping to `margin-mobile` (`1rem`) on portable tablets or phones.
- **Module Nesting**: Content widgets and KPI blocks interact through `space-lg` (`1.5rem`) separations, with interior component paddings structured around `space-md` (`1rem`) and `space-sm` (`0.5rem`).
- **Command Density**: Navigation sidebars adopt fixed structural widths (240px desktop) with flexible central workspaces that reflow data cards from 4-column KPI grids on desktop down to single columns on small displays.

## Elevation & Depth

Depth is defined through soft luminous diffusion and subtle structural borders rather than heavy drop shadows, reinforcing a light, sterile, and airborne aesthetic.

### Layer Hierarchy
- **Canvas Base (Level 0)**: Atmospheric wash (`#EBF7F7` to `#F7FBFB`) with optional ultra-subtle vertical rhythm textures (0.5px lines at 3% opacity).
- **Cards & Data Modules (Level 1)**: Solid `#FFFFFF` background bound by a 1px border of `#E2EAEB` and an ambient shadow: `0 4px 20px -2px rgba(0, 106, 114, 0.04), 0 2px 6px -1px rgba(15, 30, 36, 0.02)`.
- **Active / Floating Overlays (Level 2)**: Navigation menus, chart tooltips, and flyout popovers use elevated diffusion: `0 12px 32px -4px rgba(0, 106, 114, 0.08), 0 4px 12px -2px rgba(15, 30, 36, 0.03)`.

## Shapes

The shape hierarchy combines structured module geometry with smooth, friendly interactive elements:
- **Cards & Containers (`rounded-lg` / `rounded-xl`)**: Executive widgets and data blocks enforce 12px to 16px corner radii to balance soft ergonomics with structural integrity.
- **Interactive Controls (Full Pill / 999px)**: Action buttons, primary search bars, status badges, and trend chips strictly use full pill roundedness for seamless tactile accessibility.
- **Micro Elements (`rounded`)**: Checkboxes, nested status dots, and graph markers leverage a 4px to 8px radius.

## Components

### Buttons
- **Primary Action**: Full pill radius (`999px`), solid `#006A72` background, pure `#FFFFFF` typography (`body-md-medium`), with a horizontal padding of `1.25rem` and height of `44px`. Hover activates `#08565C` with smooth 150ms transition.
- **Secondary / Outline**: Full pill radius, white background, `#E2EAEB` border, `#0F1E24` label, accompanied by inline icons in `#006A72`.
- **Icon / Ghost Buttons**: 36px circular frames with transparent background and muted `#5F757C` icons that convert to `#006A72` over `#E6F7F7` on hover.

### Metric Cards & Containers
- Clean `#FFFFFF` fill with 14px border radius and 1px `#E2EAEB` border.
- Integrated header featuring a muted icon badge in `#E6F7F7`, dark `#0F1E24` KPI metric figure (`metric-number`), and inline trend badge (`+12% vs last week`) carrying `#0D9488` text over `#D1FAE5`.

### Chips & Badges
- **Status Pills**: Height 24px, pill-radius (`999px`), padding 8px horizontal, font size 12px (`label-md`).
  - *Completed / Active*: Text `#0D9488`, background `#D1FAE5`.
  - *Waiting / In Progress*: Text `#D97706`, background `#FEF3C7`.
  - *Scheduled / Appointments*: Text `#006A72`, background `#E6F7F7`.

### Input Fields & Search Bars
- Pill-shaped (`999px`) or soft-rounded (`8px`), `#FFFFFF` surface, thin border in `#E2EAEB`, inner padding `0.75rem 1rem`.
- Active focus state triggers a `#006A72` border and an outer ring glow of `0 0 0 3px rgba(0, 106, 114, 0.12)`.
- Icon prefixes (e.g., search magnifying glass) rendered in `#5F757C`.

### Charts & Data Visualizations
- **Area Charts**: Smooth bezier curves using stroke `#006A72` (2px thickness) with a downward vertical gradient transitioning from `rgba(0, 106, 114, 0.20)` down to `rgba(255, 255, 255, 0.0)`.
- **Tooltips / Data Popovers**: Clean floating `#FFFFFF` capsules with 8px radius, displaying time and metric breakdown alongside a targeted `#006A72` pointer anchor.
- **Progress & Flow Bars**: Light background track `#F0F9FA` filled with vibrant `#0D9488` or `#006A72` rounded caps.