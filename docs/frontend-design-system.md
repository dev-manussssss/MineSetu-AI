# MineSetu AI — Frontend Design System Specification

> **STATUS**: APPROVED MASTER DESIGN SYSTEM  
> **LAST UPDATED**: October 2026  
> **DESIGN REFERENCE HERITAGE**: `assets/design references /` (`ref1.png`, `ref2.png`)  
> **CANONICAL LOCATION**: `docs/frontend-design-system.md`

---

## 1. Visual Heritage & Brand Identity

The MineSetu AI design system is built to convey institutional credibility, operational clarity, and modern digital precision suitable for India's coal mining management.

### 1.1 Official Brand Assets & Locations
- **Official Logo Emblem**:
  - **Verified Filepath**: `assets/design references /file_00000000e9e88208ae070777ee045cb1.png`
  - **Asset Description**: High-resolution circular emblem featuring faceted geometric mountain/mine peaks rendered in deep charcoal/navy, bisected by a luminous, winding sky-blue river/bridge ("Setu") on an azure circular backdrop.
  - **Preservation Directive**: This mark represents the authentic project brand. It must **not** be replaced with a generic AI sparkle icon or synthetic placeholder.
- **Visual Design References**:
  - **Reference Screenshots**: `assets/design references /ref1.png` and `assets/design references /ref2.png`
  - **High-Resolution Layout PDFs**: `assets/design references /reference-layout-a.pdf` and `assets/design references /reference-layout-b.pdf`
  - **Style Lessons Extracted**:
    1. *Light Neutral Canvas*: `#F8FAFC` background provides a soft, low-strain backdrop for dense operational data.
    2. *Crisp White Content Surfaces*: Elevated white cards (`#FFFFFF`) with thin `1px` subtle borders (`#E2E8F0`).
    3. *Generous Radii*: Modern `16px` to `20px` corner radii on cards; `8px` to `12px` on controls; full pill (`9999px`) on tags and search bars.
    4. *Slim Iconic Sidebar*: Space-efficient left navigation (`68px` collapsed icon mode / `240px` expanded).
    5. *Top Search Bar*: Prominent pill-shaped global search bar with icon.
    6. *KPI Metric Cards*: 4-column metric blocks displaying large tabular figures (`28px`, bold 700), subtle status pill tags, and muted context labels.
    7. *Accent Treatment*: Restrained Cobalt Blue (`#1D4ED8`) for primary actions, paired with warm Amber/Orange (`#D97706`) accents from reference highlights.

---

## 2. Design Tokens & Palette Specifications

### 2.1 Color Palette
```css
:root {
  /* Surfaces & Backgrounds */
  --bg-app: #F8FAFC;            /* Clean light grey application canvas */
  --bg-surface: #FFFFFF;        /* Pure white for cards, panels, dialogs */
  --bg-surface-muted: #F1F5F9;  /* Muted table headers, search backgrounds */
  --bg-surface-hover: #E2E8F0;  /* Subtle interactive hover */
  --bg-dark-anchor: #0F172A;    /* Slate-900: brand header, split login panel */
  --bg-dark-surface: #1E293B;   /* Slate-800: elevated dark container */

  /* Borders & Dividers */
  --border-subtle: #E2E8F0;     /* Default 1px hairline container border */
  --border-medium: #CBD5E1;     /* Active form field border */
  --border-focus: #3B82F6;      /* High-visibility accessibility focus ring */

  /* Typography Colors */
  --text-primary: #0F172A;      /* High-contrast headings and body copy */
  --text-secondary: #475569;    /* Subheadings, metadata, table labels */
  --text-muted: #64748B;        /* Helper notes, placeholders, timestamps */
  --text-inverse: #FFFFFF;      /* Text on dark buttons and dark panels */

  /* Brand Accents */
  --accent-primary: #1D4ED8;       /* Deep Institutional Cobalt Blue */
  --accent-primary-hover: #1E40AF; /* Hover state for primary action */
  --accent-light: #EFF6FF;         /* Light blue tint for active tab/selection */
  --accent-pill: #3B82F6;          /* Bright blue badge & focus accent */

  /* Warm Reference Accent */
  --accent-warm: #D97706;          /* Warm Amber/Orange accent */
  --accent-warm-hover: #B45309;    /* Deep warm amber */
  --accent-warm-light: #FEF3C7;    /* Subtle amber background tint */

  /* Semantic Status Tokens */
  --status-success-bg: #ECFDF5;
  --status-success-text: #065F46;
  --status-success-border: #A7F3D0;

  --status-warning-bg: #FFFBEB;
  --status-warning-text: #92400E;
  --status-warning-border: #FDE68A;

  --status-error-bg: #FEF2F2;
  --status-error-text: #991B1B;
  --status-error-border: #FECACA;

  --status-info-bg: #F0F9FF;
  --status-info-text: #075985;
  --status-info-border: #BAE6FD;

  --status-neutral-bg: #F1F5F9;
  --status-neutral-text: #475569;
  --status-neutral-border: #E2E8F0;
}
```

### 2.2 Typography Stack & Scale
To guarantee universal, zero-network font rendering without fragile remote web-font dependencies, the typography uses a robust system font stack:

```css
--font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Helvetica Neue", Arial, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
```

| Token | Size | Line Height | Weight | Letter Spacing | Purpose |
|---|---|---|---|---|---|
| `display` | `32px` | `40px` | Bold (`700`) | `-0.025em` | Hero landing headlines |
| `h1` | `24px` | `32px` | SemiBold (`600`) | `-0.02em` | Main page titles |
| `h2` | `20px` | `28px` | SemiBold (`600`) | `-0.015em` | Section headers & modal titles |
| `h3` | `16px` | `24px` | SemiBold (`600`) | `-0.01em` | Card titles, group labels |
| `body-reg` | `14px` | `20px` | Regular (`400`) | `normal` | Default body copy, paragraphs |
| `body-med` | `14px` | `20px` | Medium (`500`) | `normal` | Interactive text, navigation labels |
| `body-sm` | `13px` | `18px` | Regular (`400`) | `normal` | Compact tables, card metadata |
| `label` | `12px` | `16px` | SemiBold (`600`) | `0.02em` | Form labels, table headers |
| `caption` | `11px` | `14px` | Regular (`400`) | `0.01em` | Fine print, timestamp footnotes |
| `metric` | `28px` | `34px` | Bold (`700`) | `-0.03em` | KPI numerals (`tabular-nums`) |

### 2.3 Radii, Shadows, and Elevation
```css
/* Corner Radii */
--radius-sm: 6px;      /* Micro controls, pill tags */
--radius-md: 10px;     /* Form inputs, primary buttons */
--radius-lg: 16px;     /* Content cards, side-panels */
--radius-xl: 20px;     /* Elevated dashboard cards */
--radius-pill: 9999px; /* Pill buttons, status tags, search bar */

/* Elevation Shadows */
--shadow-subtle: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
--shadow-card: 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04);
--shadow-elevated: 0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
--shadow-modal: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
```

---

## 3. UI Component Standards

### 3.1 Buttons & Interactive Controls
- **Primary Button**: Solid Cobalt (`#1D4ED8`), hover (`#1E40AF`), white text, `height: 40px`, padding `0 18px`, `border-radius: 10px`, semi-bold 14px.
- **Secondary / Outline Button**: White surface, `1px solid var(--border-subtle)`, dark text (`#0F172A`), hover background (`#F8FAFC`).
- **Pill Action Button**: (Inspired by `ref2.png` "Edit Brief" / "Preview Brief"): `border-radius: 9999px`, padding `0 16px`, height `36px`.
- **Ghost / Icon Button**: Transparent background, `1px solid transparent`, hover background (`var(--bg-surface-hover)`), `border-radius: 8px`.
- **Disabled State**: Opacity `0.5`, `cursor: not-allowed`, background `#E2E8F0`, text `#64748B`.

### 3.2 Form Inputs & Controls
- **Text Inputs & Dropdowns**: Height `40px`, `border: 1px solid var(--border-subtle)`, `border-radius: 10px`, padding `0 12px`, background `#FFFFFF`. On focus: `border-color: var(--accent-pill)` and outline ring.
- **Pill Search Bar**: Height `40px`, `border-radius: 9999px`, background `#FFFFFF`, leading search icon (`18px`, color `#64748B`), clear button on input.

### 3.3 Status Chips & Semantic Badges
- **Structure**: Icon + Label text (never color alone).
- **Format**: Padding `4px 10px`, `border-radius: 9999px`, `font-size: 12px`, `font-weight: 600`.
- **Pill Styles**:
  - `Draft`: Background `#F1F5F9`, text `#475569`, border `#E2E8F0`.
  - `Processing`: Background `#EFF6FF`, text `#1D4ED8`, border `#BAE6FD`.
  - `Needs review`: Background `#FFFBEB`, text `#92400E`, border `#FDE68A`.
  - `Ready to search`: Background `#ECFDF5`, text `#065F46`, border `#A7F3D0`.
  - `Returned for correction`: Background `#FEF2F2`, text `#991B1B`, border `#FECACA`.

### 3.4 KPI Metric Blocks (from `ref1.png`)
- 4-column responsive grid (`grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))`).
- Card layout: White surface, `1px solid var(--border-subtle)`, padding `20px`, `border-radius: 18px`.
- Top: KPI metric value (`28px`, bold, `tabular-nums`) + subtle badge tag.
- Bottom: Metric title (`13px`, text-muted) + comparative subtitle (`"vs prorated target"`).

### 3.5 Tables & Data Grids
- **Header**: Height `40px`, background `var(--bg-surface-muted)`, text `var(--text-secondary)`, `font-size: 12px`, `font-weight: 600`, text-transform uppercase, letter-spacing `0.04em`.
- **Row**: Height `52px`, `border-bottom: 1px solid var(--border-subtle)`, hover background `#F8FAFC`.
- **Alignment**: Text left-aligned; numerical quantities and dates right-aligned with `tabular-nums`.

### 3.6 Dual Ingestion Components
1. **Upload Dropzone**:
   - Dashed border (`2px dashed var(--border-medium)`), background `#F8FAFC`, hover background `#EFF6FF`.
   - Clear icon, primary label *"Drag files here or browse your device"*, supporting text specifying permitted formats: *"PDF, DOCX, XLSX, CSV (Up to 10MB)"*.
2. **Manual Data Entry Table**:
   - Category selector (Production, Overburden, Geological, Safety, Despatch).
   - Dynamic table rows: Field Name, Extracted/Entered Value, Unit (dropdown), Source Explanation.
   - Action controls: `Add Row`, `Save as Draft`, `Submit for Review`, `Cancel`.

### 3.7 AI Composer ("Ask MineSetu") & Grounded Citations
- **Composer Card**: Floating elevated input panel, multiline textarea, plus menu for document attachment, optional Thinking mode toggle.
- **Citation Badges**: Interactive pill tags displaying `[Document Name, Page #, Table #]`. Hover displays verified text snippet; clicking navigates to the Validation Workbench or document preview.
- **Empty & No-Evidence States**: Clean illustration/icon, clear message: *"Insufficient source evidence exists in authorized records to answer this inquiry."*, accompanied by suggested actions (Upload Document, Enter Data Manually, or Issue Information Request).

---

## 4. Accessibility & Contrast Audit

| Foreground Element | Background Surface | Measured Contrast Ratio | WCAG 2.1 AA Result |
|---|---|---|---|
| Text Primary (`#0F172A`) | Canvas / Surface (`#FFFFFF` / `#F8FAFC`) | **16.1 : 1** | PASS (AAA) |
| Text Secondary (`#475569`) | Surface (`#FFFFFF`) | **8.2 : 1** | PASS (AAA) |
| Text Muted (`#64748B`) | Surface (`#FFFFFF`) | **4.6 : 1** | PASS (AA) |
| Accent Primary (`#1D4ED8`) | Surface (`#FFFFFF`) | **6.8 : 1** | PASS (AA) |
| Text Inverse (`#FFFFFF`) | Primary Button (`#1D4ED8`) | **6.8 : 1** | PASS (AA) |
| Success Text (`#065F46`) | Success Background (`#ECFDF5`) | **7.4 : 1** | PASS (AAA) |
| Warning Text (`#92400E`) | Warning Background (`#FFFBEB`) | **6.1 : 1** | PASS (AA) |
| Error Text (`#991B1B`) | Error Background (`#FEF2F2`) | **7.2 : 1** | PASS (AAA) |
