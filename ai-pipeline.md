# AI Pipeline & Grok Integration — MDMS + Mindsetu AI

## 1. AI Pipeline Principles

As stipulated in `guidelines.md` (Sections 1.3, 12, 16, 28):
1. **Assistive Transformation**: AI outputs are untrusted until schema-validated and human-reviewed.
2. **Mandatory Source Grounding**: Every AI response must cite its origin documents, page numbers, and verified timestamps.
3. **Transparent Uncertainty**: When evidence is missing or documents conflict, the pipeline must explicitly flag `Insufficient source evidence` or `Conflicting values detected` rather than hallucinating answers.

---

## 2. Ingestion, OCR & Extraction Pipeline

```text
[ Scanned Paper / PDF Return ]
            │
            ▼
[ Ingestion & SHA-256 Hash ] ──> Supabase Storage (Immutable Raw Copy)
            │
            ▼
[ Document Parser & OCR Engine ]
  - Optical Character Recognition
  - Table Structure Extraction
  - Handwritten Entry Detection
            │
            ▼
[ Field Extraction & Normalization ]
  - Mining Entities (Gross Tonnes, Net Tonnes, Grade, Ash %, Moisture %, OB m³)
  - Confidence Scoring (0.0 to 1.0)
  - Anomaly & Threshold Checks
            │
            ▼
[ Ingestion Queue State ]
  - Confidence >= 0.85: 'needs_review'
  - Confidence < 0.85: 'partially_extracted' (with highlight warning)
  - Severe parsing error: 'failed'
            │
            ▼
[ Human Review Workbench ] ──> Nodal / Field Officer Sign-off ──> 'approved'
```

---

## 3. The Three Core SIH AI Modules

### Module 1: Automated Report Generation
- **Function**: Takes user-specified parameters (Subsidiary, Mine, Date Range, Category: Production/Safety/Offtake), aggregates approved database records, generates executive summaries, and compiles downloadable analytical briefs with source citations.
- **Guardrail**: Clearly labels narrative sections as `AI-Assisted Executive Brief` and tabulates verified numbers directly from approved records.

### Module 2: Topic Identification & Word Cloud
- **Function**: Processes unformatted remarks, inspection logs, accident investigation notes, and colliery daily diaries. Extracts TF-IDF and semantic embeddings to cluster topics (e.g. *Haul Road Maintenance*, *Monsoon Inundation*, *HEMM Availability*, *Environmental Clearance*).
- **Visualization**: Interactive SVG Word Cloud where word weight reflects frequency and urgency. Clicking any term filters documents and brings up related incident summaries.

### Module 3: AI-Based Query & Response (Grounded RAG)
- **Function**: Natural language search over the multi-subsidiary document archive.
- **Workflow**:
  1. Parse user intent and identify entities (Mine, Subsidiary, Metric, Date).
  2. Perform vector + keyword retrieval on approved records within the user's RBAC scope.
  3. Format prompt with strict boundary instructions:
     ```text
     Answer the user question using ONLY the provided sources below. 
     If the source documents do not contain the answer, reply with: 
     "Insufficient source evidence to answer this question."
     Always cite [Source ID, Page #] for every factual statement.
     ```
  4. Call Grok 2 API (`grok-beta` / `grok-2`).
  5. Validate that all citations match real document IDs in context.

---

## 4. Grok / xAI Integration & Resilience

- **Primary & Secondary Keys**:
  - `GROK_API_KEY_PRIMARY`: Handles regular inference load.
  - `GROK_API_KEY_FALLBACK`: Automatic failover on HTTP 429 (rate limit) or 503 (upstream outage).
- **Offline / Prototype Simulation**:
  - In demo environments without live Grok API keys configured, the application smoothly engages the local semantic inference engine with grounded answers from the synthetic dataset, maintaining full UX integrity without breaking.
