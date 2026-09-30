# MDMS + Mindsetu AI — Engineering & AI Development Guidelines

## 0. Purpose

This repository is a prototype of an AI-enabled extension layer around the existing MDMS (Mine Data Management System) workflow.

The product is not a replacement for MDMS and must not visually or verbally imply that the prototype is an official Government of India, Ministry of Coal, CMPDI, CIL, NIC, or MDMS production system.

The application demonstrates how AI can be inserted into an existing mining/geological/production reporting workflow:

`Document → OCR/Extraction → Validation → Human Review → Approved Data → Reports / Analytics / AI Query`

The supplied SIH material defines three core AI modules:

1. Automated Report Generation
2. Topic Identification / Word Cloud
3. AI-Based Query & Response

The supplied RBAC material describes executive, technical, subsidiary, parliamentary-query, field, and system-administration roles. The role model in this repository is therefore a **prototype mapping based on the supplied project documents**, not a claim about the official live MDMS authorization model.

---

# 1. Non-Negotiable Rules

## 1.1 Security

- Never commit API keys.
- Never expose Grok/xAI API keys in React/client-side code.
- Never expose Supabase service-role credentials to the browser.
- Never put secrets in mock data.
- Use environment variables/secrets.
- Perform authorization server-side.
- Frontend hiding/disablement is UX only; it is not security.
- Use Supabase Row Level Security where applicable.
- Keep original uploaded documents immutable.
- Store derived/edited versions separately.
- Record important mutations in audit logs.
- Do not log raw secrets or unnecessary sensitive document content.

## 1.2 Data Integrity

- Never fabricate operational mining figures and label them as real.
- Demo records must be clearly synthetic/demo.
- Never silently overwrite source documents.
- Every extracted value should retain document/source lineage where practical.
- Differences between reports should be described as differences or potential inconsistencies until reviewed.
- AI output is assistive and must not automatically become authoritative data.

## 1.3 AI Reliability

AI output must be treated as an untrusted transformation until validated.

For document extraction:
`Original → AI extraction → validation → human review → approved record`

For AI query:
`User query → retrieval → grounded context → AI response → source display`

The UI must make source grounding visible.

Never show a confident-looking AI answer without indicating its supporting sources when the answer depends on project documents.

## 1.4 Product Positioning

The landing page must state that this is a prototype/replica experience of the existing MDMS workflow with additional AI layers.

Use language such as:
- "Prototype"
- "AI-enhanced MDMS concept"
- "Demonstration"
- "Extension layer"
- "Based on supplied project documentation"

Avoid:
- "Official MDMS"
- "Official CIL AI platform"
- "Government-certified"
- "Government-approved"
- "Production-ready government system"

unless the project owner later supplies authoritative evidence supporting such wording.

---

# 2. Repository Structure

Maintain clear separation of concerns.

```text
/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── features/
│   │   ├── routes/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── lib/
│   │   ├── config/
│   │   └── styles/
│   └── ...
├── backend/
│   ├── services/
│   ├── ai/
│   ├── validation/
│   └── ...
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed/
├── docs/
│   ├── skills-map.md
│   └── ...
├── mock-data/
├── public/
├── scripts/
├── tests/
├── guidelines.md
├── README.md
├── design.md
├── architecture.md
├── brain.md
├── rbac.md
├── database.md
├── api.md
├── ai-pipeline.md
├── security.md
├── mock-dataset.md
├── testing.md
├── vercel-deployment.md
├── changelog.md
├── .env.example
└── .gitignore
```

Exact folder names may be adapted to the chosen React setup, but the separation must remain.

---

# 3. Documentation Contract

Every documentation file has one responsibility.

## README.md

Must contain:
- project purpose
- architecture summary
- local setup
- environment variables
- development commands
- demo login instructions
- test commands
- deployment summary
- prototype disclaimer

Do not turn README into a giant architecture document.

## guidelines.md

This file is the master rulebook.

It controls:
- architecture discipline
- coding rules
- UX rules
- security
- RBAC
- AI behavior
- testing
- Git workflow
- documentation maintenance
- deployment
- definition of done

## design.md

Must contain:
- typography
- color tokens
- spacing scale
- radii
- shadows
- icon rules
- buttons
- inputs
- cards
- tables
- badges
- alerts
- modal/drawer rules
- dashboard grid
- responsive rules
- states
- animation
- accessibility
- visual references
- explicit do/don't list

Do not place business logic here.

## architecture.md

Must contain:
- high-level architecture
- frontend/backend boundary
- Supabase
- storage
- AI orchestration
- data flow
- authentication
- RBAC
- deployment
- trust boundaries
- failure boundaries

## brain.md

This is the persistent engineering memory.

Record:
- confirmed requirements
- architectural decisions
- important UX decisions
- unresolved questions
- assumptions
- constraints
- decisions rejected and why
- implementation changes
- known bugs
- lessons from prior iterations

Format decisions like:

```text
DATE:
DECISION:
WHY:
ALTERNATIVES CONSIDERED:
IMPACT:
FILES AFFECTED:
```

Never delete historical decisions merely because the implementation changed.

## rbac.md

Must be the source of truth for:
- roles
- permissions
- route access
- component/action access
- data scope
- approval rights
- upload rights
- query rights
- export rights

## database.md

Must document:
- tables
- fields
- relations
- indexes
- RLS
- migration policy
- seed data
- audit fields

## api.md

Must document:
- functions/endpoints
- auth requirements
- request schema
- response schema
- errors
- rate/size considerations
- AI service boundary

## ai-pipeline.md

Must document:
- document ingestion
- OCR
- extraction
- validation
- comparison
- topic identification
- report generation
- AI query/RAG
- source traceability
- AI failures
- retry behavior

## security.md

Must document:
- auth
- authorization
- RLS
- secrets
- file uploads
- logging
- audit
- least privilege
- threat considerations
- prototype limitations

## mock-dataset.md

Must describe every synthetic record:
- ID
- entity
- purpose
- source
- synthetic status
- relationships
- reset/seed behavior

## testing.md

Must document:
- unit testing
- integration testing
- RBAC testing
- route testing
- upload testing
- AI output validation
- regression testing
- responsive testing

## vercel-deployment.md

Must document:
- Vercel project
- framework preset
- build command
- output configuration
- environment variables
- Supabase URL/key configuration
- server-side AI configuration
- preview deployments
- production deployment
- rollback
- troubleshooting

## changelog.md

Every material change:
- date
- change
- reason
- affected files
- validation result

---

# 4. Design System Rules

## 4.1 Overall Visual Direction

The interface should feel:

- institutional
- modern
- calm
- precise
- professional
- data-oriented
- premium SaaS
- operational

It must not feel:
- flashy
- gaming-oriented
- consumer social-media-like
- template-generated
- overloaded with gradients
- like a generic AI landing page

The supplied visual references show a clean SaaS data-management interface with a left sidebar, search, tabs, filters, metric cards, structured records and content panels. Use these as composition inspiration, not as literal copied UI.

## 4.2 Typography

Use one primary UI font family.

Establish:
- Display
- H1
- H2
- H3
- Body
- Body Small
- Label
- Caption
- Data/metric

Avoid mixing several unrelated fonts.

Do not use huge typography to create artificial "premium" appearance.

## 4.3 Color

Use a neutral foundation.

Suggested token categories:

```text
--bg
--surface
--surface-muted
--border
--text-primary
--text-secondary
--text-muted
--accent
--success
--warning
--error
--info
```

The exact hex values belong in `design.md`.

Rules:
- One main accent.
- Semantic colors only when communicating state.
- Do not assign a different accent to every card.
- Avoid neon colors.
- Avoid excessive gradients.
- Avoid low-contrast grey-on-grey text.

## 4.4 Layout

Use:
- consistent max-widths
- predictable page padding
- 4/8px spacing system
- clear content hierarchy
- generous whitespace
- aligned card edges
- consistent table dimensions

Do not:
- randomly change padding between pages
- create unrelated card radii
- use different sidebar widths across routes
- use inconsistent page headers

## 4.5 Cards

Cards should group information, not decorate the screen.

Each card should answer:
"What information or action belongs together here?"

Avoid:
- cards inside cards inside cards
- unnecessary shadows
- excessive border thickness
- 12 KPI cards above every page

## 4.6 Icons

Use one icon library.

Rules:
- consistent stroke width
- consistent size scale
- icon-only buttons require tooltip/accessible label
- never use emoji as functional UI icons
- avoid icons that have different visual styles

---

# 5. Empillard Lessons Carried Forward

The previous Empillard work established several practical lessons that must be treated as constraints for this project.

## Required

- clean
- smooth
- professional
- SaaS-like
- premium polish
- generous spacing
- dark charcoal surfaces can be used where appropriate
- high-contrast white/light typography on dark surfaces
- restrained accent usage
- soft borders
- subtle shadows
- rounded cards
- consistent typography
- consistent layout
- polished tables
- polished forms
- search/filter/sort/pagination where appropriate
- responsive behavior
- accessibility basics
- subtle animation

## Explicitly Avoid

- fake/random scanner numbers
- fake-looking AI statistics
- random colors
- excessive gradients
- visual clutter
- generic dashboard-template appearance
- unrelated decorative illustrations
- excessive animation
- inconsistent components
- broken empty/loading/error states
- UI buttons without real behavior
- pages that look unfinished

The scanner/document workflow must represent a credible pipeline from scanned input to extracted data and then into validation/admin/accounting-equivalent data flow. Do not generate random scanner values merely to make a dashboard look busy.

---

# 6. Landing Page Rules

Route: `/`

The landing page must communicate the product in under one screenful of reading.

Required sequence:

1. Header
2. Hero
3. Problem
4. AI layer
5. Three modules
6. Workflow
7. RBAC
8. Architecture
9. Prototype disclaimer
10. Footer

Primary CTA:
`Enter AI-Enhanced MDMS`

Secondary:
`View Architecture`

The page must not look like a generic "AI startup" website.

---

# 7. Login Rules

Route:

`/login`

Required:
- role selector
- demo credential selector
- prefilled demo credentials
- demo login
- manual login
- return to landing

Every demo account must be clearly labeled:

`DEMO ACCOUNT — SYNTHETIC DATA`

Never use credentials resembling real employee credentials.

---

# 8. RBAC Rules

The application must have a centralized permission model.

Recommended conceptual objects:

```text
roles
permissions
role_permissions
user_roles
data_scopes
```

Avoid:

```js
if (user.role === "admin") ...
if (user.role === "manager") ...
```

repeated throughout the application.

Prefer:

```js
can(user, "documents.upload")
can(user, "documents.verify")
can(user, "reports.generate")
can(user, "queries.execute")
```

and:

```js
getNavigationForRole(user)
```

The same permission registry should control:
- route access
- navigation
- buttons
- actions
- API authorization
- data scope

---

# 9. Prototype Roles

The supplied project materials define a role model that includes:

1. Ministry Executive
2. CIL Executive Management
3. CMPDI Nodal Expert
4. Subsidiary Manager
5. Parliamentary Query Cell
6. Field/Mine Data Officer
7. System Administrator

The prototype may also model the supplied MDMS authority concepts such as:
- CMPDI ICT / system administration
- NIC / MoC IT Cell
- CCO
- CIL HQ nodal officers
- subsidiary-level managers
- mine/project officers
- SCCL/NLCIL nodal data officers
- executive viewers
- parliamentary Q&A desk

These should not automatically become additional UI roles unless needed. They can be represented as personas/sub-roles under the main permission model.

---

# 10. Navigation Rules

Do not give every role the same sidebar.

Generate navigation from configuration.

Example conceptual configuration:

```js
{
  id: "documents",
  label: "Documents",
  icon: "FileText",
  permissions: ["documents.view"]
}
```

Then role permissions determine visibility.

Possible navigation:

## Ministry Executive

- Dashboard
- Executive Analytics
- AI Query
- Parliamentary Responses
- Reports
- Notifications
- Profile

## CIL Executive

- Dashboard
- Enterprise Analytics
- Subsidiary Performance
- AI Query
- Reports
- Approvals
- Notifications
- Profile

## CMPDI Nodal Expert

- Dashboard
- Documents
- Ingestion Queue
- OCR Review
- Validation
- Topic Intelligence
- AI Query
- Reports
- Audit Trail
- Profile

## Subsidiary Manager

- Dashboard
- Mine Data
- Documents
- Validation
- Approvals
- Reports
- Analytics
- AI Query
- Profile

## Parliamentary Query Cell

- Dashboard
- Query Inbox
- Historical Archive
- AI Query
- Draft Responses
- Sources
- Query Tracking
- Export
- Profile

## Field/Mine Officer

- Dashboard
- Upload
- My Documents
- OCR Issues
- Verification
- Mine Data
- Restricted Search
- Profile

## System Administrator

- Dashboard
- Users
- Roles & Permissions
- System Health
- AI Services
- Storage
- Audit Logs
- Configuration
- Demo Data
- Profile

This is a prototype mapping and must remain editable through `rbac.md`.

---

# 11. Buttons & Actions

Every important button must have:
- purpose
- permission
- handler
- loading state
- success state
- error state

Examples:

```text
Upload Document
Run OCR
Review Extraction
Approve
Reject
Request Correction
Compare
Generate Report
Ask AI
View Sources
Export
Submit for Approval
Sign Off
```

Never create decorative CTA buttons.

Never make "AI" a generic button that does nothing.

---

# 12. Document Intelligence

The UI should represent:

```text
UPLOAD
↓
PROCESSING
↓
OCR / EXTRACTION
↓
STRUCTURED DATA
↓
CONFIDENCE / WARNINGS
↓
HUMAN REVIEW
↓
APPROVED
↓
REPORT / QUERY / ANALYTICS
```

Required states:

- queued
- processing
- completed
- partially extracted
- needs review
- rejected
- failed

Document detail should include:
- original file
- metadata
- page count
- processing status
- extracted text
- structured fields
- source/page reference
- confidence
- warnings
- reviewer notes
- version history

---

# 13. Comparison Module

Comparison must make differences easy to understand.

Sections:
- comparison summary
- field changes
- numerical changes
- added values
- removed values
- missing values
- source references
- reviewer notes

Use neutral terminology:

`Difference detected`

instead of:

`AI found an error`

unless a human has confirmed the error.

---

# 14. Report Generation

The report builder should collect:

- report type
- time range
- scope
- subsidiary
- mine/project
- dataset
- source set

Output should contain:
- title
- metadata
- summary
- tables
- charts where appropriate
- source references
- generation timestamp
- user
- data version

Report generation should never imply that AI-created narrative is automatically official.

---

# 15. Topic Intelligence

The module should support:
- keywords
- topic clusters
- document frequency
- semantic grouping
- word cloud
- related documents

The word cloud is a visual aid, not the complete analytics product.

---

# 16. AI Query

The query system should support:

```text
User Question
↓
Scope / Permission Check
↓
Retrieve permitted sources
↓
Build grounded context
↓
AI generation
↓
Validate response
↓
Display answer + sources
```

The user should be able to inspect:
- source document
- source page
- retrieved excerpt
- related documents
- query timestamp

If sources do not support the answer, the UI should say that the evidence was insufficient rather than inventing an answer.

---

# 17. Parliamentary Query Workflow

Prototype flow:

```text
Incoming Query
→ classify
→ search archive
→ retrieve sources
→ draft response
→ source verification
→ human review
→ executive approval
→ export
→ audit
```

The system must distinguish:
- AI draft
- reviewed draft
- approved response

Never blur these states.

---

# 18. Supabase Rules

Use Supabase for:
- authentication
- PostgreSQL
- storage
- RLS
- server-side/edge functions
- structured application data

Do not put all application logic into a single giant Edge Function.

Separate:
- document functions
- AI functions
- report functions
- query functions
- administrative functions

Use migrations for schema changes.

Never manually modify production schema without a migration.

---

# 19. Grok/xAI API Rules

Two API keys may be configured.

Recommended concept:

```text
GROK_API_KEY_PRIMARY
GROK_API_KEY_FALLBACK
```

or workload-specific names if required.

Never:
- put them in `VITE_*`
- put them in client JavaScript
- commit them
- return them from API responses
- display them in UI

The browser should call a trusted backend function.

Conceptually:

```text
React
  ↓
Supabase/Server Function
  ↓
AI Service
  ↓
Grok API
```

All AI responses should be schema-validated.

---

# 20. Environment Variables

Maintain `.env.example`.

Example categories:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=
GROK_API_KEY_PRIMARY=
GROK_API_KEY_FALLBACK=
```

Only public client variables may use the `VITE_` prefix.

Never put private keys in `VITE_` variables.

Actual secrets belong in:
- local `.env`
- Vercel Environment Variables
- Supabase Secrets

Never in GitHub.

---

# 21. GitHub Rules

Use a clean repository.

Recommended branches:

```text
main
develop
feature/*
fix/*
chore/*
```

Commit format:

```text
feat: add OCR review queue
fix: correct role navigation
docs: update RBAC matrix
refactor: split AI service
test: add permission coverage
```

Do not commit:
- `.env`
- API keys
- large temporary files
- build output unless explicitly required
- personal screenshots
- debug logs
- generated secrets

Before pushing:

```text
lint
test
build
git diff
git status
```

---

# 22. Vercel Rules

The application must be Vercel-friendly.

Requirements:
- deterministic build
- no local filesystem dependency
- no localhost URLs
- no secrets in frontend
- correct environment variables
- server functions for privileged operations
- graceful API failures
- production-safe asset paths

Every pull request/feature should be preview-buildable where practical.

Before production:
- test preview deployment
- test login
- test role switching
- test protected routes
- test document upload
- test AI request
- test error states
- test environment variables

---

# 23. Testing Rules

Minimum testing areas:

## Unit
- permission checks
- data formatting
- API schema validation
- utility functions

## Integration
- login
- role resolution
- route protection
- document upload
- document processing
- report generation
- AI query

## RBAC
For every role test:
- allowed route
- denied route
- allowed action
- denied action
- data scope

## UI
Test:
- loading
- empty
- error
- success
- long content
- no results
- network failure

## Responsive
Check:
- desktop
- tablet
- mobile

---

# 24. Accessibility

Minimum:
- keyboard navigation
- visible focus
- semantic buttons
- accessible labels
- sufficient contrast
- table headers
- modal focus handling
- error messages connected to inputs
- reduced motion consideration

Do not rely on color alone for status.

Example:

Bad:
`green = approved`

Better:
`Approved` + icon + semantic color.

---

# 25. Performance

Keep the Vercel deployment lightweight.

Rules:
- lazy-load large routes
- avoid giant dependency bundles
- compress/optimize images
- paginate large datasets
- virtualize very large tables if needed
- do not load every document into the browser
- cache appropriate read-only data
- debounce search
- cancel stale requests where useful

Never make the initial landing page wait for the AI backend.

---

# 26. Error Handling

Every major operation needs:

```text
Idle
Loading
Success
Empty
Error
```

For AI:

```text
Queued
Processing
Completed
Insufficient evidence
Validation failed
Service unavailable
Retry available
```

Do not expose raw stack traces to users.

Show technical details in developer logs only.

---

# 27. Mock Data

Use synthetic data.

Recommended sample entities:
- CMPDI
- ECL
- BCCL
- CCL
- NCL
- WCL
- SECL
- MCL

These names are part of the supplied project context, but all prototype figures must be synthetic unless the project owner supplies an authoritative dataset.

Every synthetic record should be identifiable.

Example:

```json
{
  "is_demo": true,
  "source_type": "synthetic"
}
```

---

# 28. AI Hallucination Prevention

Never make unsupported claims.

If retrieval returns no evidence:

```text
Insufficient source evidence to answer this question.
```

If documents conflict:

```text
Conflicting values were found across the selected sources.
Review is required.
```

If OCR confidence is low:

```text
Low-confidence extraction detected.
Human verification required.
```

This language is preferable to pretending that AI certainty equals factual certainty.

---

# 29. Auditability

Important actions should create audit events:

- upload
- OCR execution
- extraction correction
- approval
- rejection
- report generation
- query execution
- response export
- role change
- permission change
- system configuration change

Audit event fields should include:

```text
id
actor_user_id
action
entity_type
entity_id
timestamp
result
metadata
```

Do not store unnecessary sensitive payloads.

---

# 30. Skills Mapping

Create `docs/skills-map.md`.

The user has stated that 13 development skills are installed.

The repository must NOT invent the missing skill names.

Known skills currently available from project context:

| Skill | Project Use |
|---|---|
| brainstorming | architecture/product exploration |
| systematic-debugging | debugging/regression |
| writing-plans | implementation planning |
| frontend-design | UI/design system |
| backend-dev-guidelines | backend architecture |
| api-design | API contracts |
| git-advanced-workflows | Git/branching/release workflow |

When the full 13-skill list is available, add all remaining skills to the table.

For every skill document:
- name
- purpose
- trigger
- phase
- inputs
- expected outputs
- validation

Do not write "used" unless the skill was actually invoked.

---

# 31. AI Coding Workflow

Before coding a major feature:

1. Read `brain.md`.
2. Read relevant section of `guidelines.md`.
3. Read `design.md`.
4. Read `rbac.md` if permissions are involved.
5. Read `architecture.md` if data flow changes.
6. Create/update an implementation plan.
7. Implement small units.
8. Test.
9. Update documentation.
10. Update `brain.md` if a decision changed.

Do not jump directly from prompt to hundreds of lines of code.

---

# 32. Design Review Checklist

Before accepting a page ask:

### Visual
- Is hierarchy obvious?
- Is spacing consistent?
- Are cards necessary?
- Is the accent restrained?
- Does it look professional?
- Does it feel like one product?

### UX
- Does the user know what to do?
- Are buttons understandable?
- Are loading/error/empty states present?
- Is navigation role-appropriate?

### Data
- Is the source visible?
- Is demo data clearly synthetic?
- Are differences distinguishable from confirmed errors?

### Security
- Is the route protected?
- Is backend authorization present?
- Are secrets protected?

### Technical
- Is the component reusable?
- Is business logic separated?
- Does the build pass?

---

# 33. Common AI Mistakes to Avoid

Do not:

- generate a beautiful landing page and ignore the application
- make every role identical
- build fake analytics with random values
- create 50 decorative KPI cards
- create buttons without handlers
- expose API keys
- hard-code user permissions
- duplicate entire dashboards per role
- mix API calls directly into presentation components
- create a single 3000-line component
- ignore mobile behavior
- ignore empty/error states
- forget audit trails
- forget source references
- claim AI is always accurate
- use fake government seals/logos
- claim official integration
- copy the reference screenshot literally
- turn every feature into an "AI" gimmick
- use excessive gradients
- use inconsistent icons
- use arbitrary typography
- use fake scanner values
- treat a prototype as production infrastructure

---

# 34. Definition of Done

A feature is complete only if:

- [ ] UI implemented
- [ ] Route implemented
- [ ] RBAC implemented
- [ ] Backend authorization implemented
- [ ] Data contract defined
- [ ] Loading state
- [ ] Empty state
- [ ] Error state
- [ ] Success state
- [ ] Responsive behavior
- [ ] Accessibility basics
- [ ] Tests
- [ ] No secrets exposed
- [ ] Documentation updated
- [ ] `brain.md` updated if architecture/UX changed
- [ ] Build passes
- [ ] Lint passes
- [ ] No obvious console errors

---

# 35. Final Quality Principle

The target is not:

> "A website with AI features."

The target is:

> "A credible MDMS-oriented operational prototype in which AI is inserted into document ingestion, validation, comparison, reporting and source-grounded query workflows, while respecting role-based access and auditability."

The interface must communicate:

`Existing workflow + AI intelligence + human validation + traceability`

not:

`generic AI dashboard`.
