# Testing Strategy & Quality Assurance — MDMS + Mindsetu AI

## 1. Quality Assurance Hierarchy

As required by `guidelines.md` (Sections 23 and 34):
Testing spans five core tiers to ensure zero runtime regressions, complete RBAC policy compliance, and deterministic build outputs.

---

## 2. Test Suites & Coverage Areas

### 2.1 Unit Testing
- **Permission Evaluator (`can(user, permission)`)**:
  - Validates that unauthorized roles receive `false` on protected actions (e.g. `field_officer` cannot approve documents or view national analytics).
  - Validates full access for `sys_admin` and scoped access for `subsidiary_mgr`.
- **Data Formatting & Normalization**:
  - Tests parsing of numerical coal tonnages, formatting currency, date parsing, and confidence percentage rounding.
- **AI Citation Validator**:
  - Checks that generated responses only link to documents present in the source candidate list.

### 2.2 Integration Testing
- **Authentication & Demo Persona Switching**:
  - Verifies that selecting any of the 7 demo personas correctly switches the active user context, JWT mock, and available navigation links.
- **Document Ingestion Workflow**:
  - Verifies state transitions: `queued` → `processing` → `needs_review` → `approved`.
- **Extraction Verification**:
  - Tests manual override of OCR field values and verifies that an audit log entry is recorded with before/after diffs.
- **AI Query & Hallucination Prevention**:
  - Injects out-of-domain queries to assert that the engine returns `Insufficient source evidence` rather than fabricating numbers.

### 2.3 RBAC & Route Access Testing
For every one of the 7 roles, test:
1. Allowed route loads successfully.
2. Denied route redirects to unauthorized screen or fallback dashboard with clear explanatory banner.
3. Action buttons (e.g. "Approve Document", "Export Response") are disabled or hidden when permissions are absent.

### 2.4 UI & Accessibility Testing
- **State Coverage**: Every asynchronous view must demonstrate `Idle`, `Loading` (skeleton/spinner), `Success`, `Empty`, and `Error` states.
- **Keyboard Navigation**: Form inputs, pill tabs, modal dialogs, and table pagination must be navigable via Tab/Enter/Escape.
- **Contrast**: Text elements meet WCAG AA standards (minimum 4.5:1 ratio for normal text).

### 2.5 Responsive Testing
- Desktop (> 1280px): Multi-column layouts, expanded split panels.
- Tablet (768px - 1024px): Collapsed sidebar, wrapped KPI cards.
- Mobile (< 768px): Mobile drawer navigation, vertical stacked cards, horizontal scrollable tables.

---

## 3. Execution Commands

```bash
# Run unit and integration tests
npm run test

# Run TypeScript typecheck
npm run typecheck

# Verify production bundle compilation
npm run build
```
