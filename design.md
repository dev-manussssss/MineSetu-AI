# Design System Specification — MDMS + Mindsetu AI

## 1. Visual Reference & Style Heritage

This design system is modeled directly on the institutional SaaS reference screenshots in `deisgn reference/` (`ref1.png` and `ref2.png`).

- **Dominant Feel**: Ultra-clean, modern, calm, operational, data-dense, with spacious layout.
- **Surface Hierarchy**: Pure light surfaces (`#FFFFFF`), subtle tinted backgrounds (`#F8FAFC`), crisp hairline borders (`#E2E8F0`), and dark charcoal surfaces (`#0F172A`) for executive navigation and contrast.
- **Card Styling**: Generous corner radii (`16px` to `20px`), thin `1px` borders, subtle elevated drop-shadows (`0 1px 3px rgba(0,0,0,0.05)`).
- **Navigation**: Slim iconic left sidebar (`68px` or `240px` expanded), rounded pill top navigation tabs, pill search input (`40px` height with search icon).
- **KPI Metrics**: 4-column metric blocks with large bold values (`28px` font-weight 700), subtle status pill tags, and clean muted labels (`13px` font-weight 500).

---

## 2. Design Tokens

### 2.1 Color Palette
```css
:root {
  /* Surfaces & Backgrounds */
  --bg-app: #F8FAFC;
  --bg-surface: #FFFFFF;
  --bg-surface-muted: #F1F5F9;
  --bg-surface-hover: #E2E8F0;
  --bg-dark: #0F172A;
  --bg-dark-surface: #1E293B;

  /* Borders & Dividers */
  --border-subtle: #E2E8F0;
  --border-medium: #CBD5E1;
  --border-focus: #3B82F6;

  /* Typography */
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #64748B;
  --text-inverse: #FFFFFF;

  /* Brand & Accents */
  --accent-primary: #1D4ED8;       /* Deep Institutional Cobalt */
  --accent-primary-hover: #1E40AF;
  --accent-light: #EFF6FF;
  --accent-pill: #3B82F6;

  /* Semantic State Tokens */
  --success-bg: #ECFDF5;
  --success-text: #065F46;
  --success-border: #A7F3D0;

  --warning-bg: #FFFBEB;
  --warning-text: #92400E;
  --warning-border: #FDE68A;

  --error-bg: #FEF2F2;
  --error-text: #991B1B;
  --error-border: #FECACA;

  --info-bg: #F0F9FF;
  --info-text: #075985;
  --info-border: #BAE6FD;

  /* Pill & Tag Specific (from reference) */
  --tag-match-bg: #F5F3FF;
  --tag-match-text: #6D28D9;
  --tag-match-border: #DDD6FE;
}
```

### 2.2 Typography Scale
Primary font: System UI / Inter / Plus Jakarta Sans font stack:
`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif`.

- **Display**: `32px` | Line-height `40px` | Bold `700`
- **H1**: `24px` | Line-height `32px` | SemiBold `600`
- **H2**: `20px` | Line-height `28px` | SemiBold `600`
- **H3**: `16px` | Line-height `24px` | SemiBold `600`
- **Body Regular**: `14px` | Line-height `20px` | Regular `400`
- **Body Medium**: `14px` | Line-height `20px` | Medium `500`
- **Body Small**: `13px` | Line-height `18px` | Regular `400`
- **Label / Tag**: `12px` | Line-height `16px` | SemiBold `600`
- **Caption / Meta**: `11px` | Line-height `14px` | Regular `400`
- **KPI Metric**: `28px` | Line-height `34px` | Bold `700`

### 2.3 Radii & Elevation
- **Card Radius**: `18px`
- **Button Radius**: `10px` (or `24px` for full pills)
- **Input Radius**: `12px`
- **Tag / Badge Radius**: `8px` (or `9999px` for pill tags)
- **Shadow Light**: `0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)`
- **Shadow Medium**: `0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)`
- **Shadow Elevated**: `0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)`

---

## 3. UI Component Standards

### 3.1 Buttons
- **Primary**: Solid blue `#1D4ED8` or `#2563EB`, white text, soft hover brightness, focus ring.
- **Secondary / Outline**: White surface, 1px border `#E2E8F0`, dark text, hover light grey `#F8FAFC`.
- **Ghost**: No border, subtle hover background.
- **Destructive**: Deep crimson `#DC2626` or light tint `#FEF2F2`.
- **States**: Every button includes `:hover`, `:active`, `:focus-visible`, and `disabled:opacity-50` with spinner in loading state.

### 3.2 Pill Navigation & Tabs
- Horizontal list of pill buttons matching `ref1.png`:
  - Default: Light grey/transparent background, text `#64748B`.
  - Active: Dark surface `#0F172A` with white text, or solid white pill on grey track with bold text.

### 3.3 Cards & Metric Containers
- Outer card: `border: 1px solid var(--border-subtle); border-radius: 18px; background: #FFFFFF; padding: 24px;`.
- Inner KPI grid: 4 columns, responsive stack on mobile.
- Each KPI has a prominent number, subtitle, and optional trend pill badge.

### 3.4 Tables
- Clean border-collapse with subtle separator lines (`#E2E8F0`).
- Header row: `#F8FAFC`, uppercase label `12px`, tracking `0.05em`.
- Alternating or clean rows with hover highlight `#F8FAFC`.

---

## 4. Visual Do's & Don'ts

| Do | Don't |
|---|---|
| Use high contrast, legible typography | Use low-contrast grey-on-grey text |
| Use restrained institutional blue accents | Use neon green, purple, or candy gradients |
| Use consistent 16-20px card radii | Mix sharp 0px and rounded 32px arbitrarily |
| Always show document source lineage | Show AI outputs without sources |
| Label all demo figures as synthetic | Label mock data as real official figures |
| Provide loading, empty, and error states | Leave blank screens or unhandled states |
