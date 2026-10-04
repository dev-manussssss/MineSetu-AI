# MineSetu AI — AI Pipeline & Document Processing Engine

> **STATUS**: APPROVED MASTER SPECIFICATION  
> **LAST UPDATED**: October 2026  
> **CANONICAL LOCATION**: `docs/ai-and-document-processing.md`

---

## 1. Core Principles of Assistive AI in MineSetu

In mission-critical statutory reporting for the coal mining industry, artificial intelligence must never act as an unconstrained or autonomous authority. 

MineSetu AI enforces four architectural principles across all AI pipelines:
1. **Assistive Transformation**: AI outputs (OCR extractions, text summaries, draft briefs) are treated as untrusted transformations until validated by deterministic checks and approved by human reviewers.
2. **Mandatory Source Grounding**: Every generated statement, number, and conclusion must retain traceable provenance pointing to origin documents, reporting periods, page coordinates, and table rows.
3. **Deterministic Calculations over Generative Estimation**: Arithmetic totals, percentages, variances, and unit conversions must be executed by deterministic code algorithms, **never** hallucinated or computed by large language models.
4. **Transparent Uncertainty**: When source evidence is missing, ambiguous, or contradictory, the system must explicitly state the uncertainty rather than producing plausible approximations.

---

## 2. Document Processing & Ingestion Pipeline

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. INGESTION & HASHING                                                 │
│    - File Signature Sniffing (PDF, DOCX, XLSX, CSV, Scans)             │
│    - SHA-256 Checksum Calculation & Storage in Private Bucket          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. PARSING & OCR EXTRACTION                                            │
│    - Scanned Page OCR (Tesseract / Cloud Vision Engine)                │
│    - Digital PDF Native Text & Font Geometry Extraction                │
│    - Table Boundary & Cell Grid Recognition                            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. MINING ENTITY EXTRACTION & HEURISTICS                               │
│    - Entity Extraction (Coal Tonnes, OB m³, Ash %, Rakes, Hours)       │
│    - Field Confidence Scoring (0.00 to 1.00)                           │
│    - Unit Normalization & Anomaly Threshold Detection                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 4. HUMAN VERIFICATION WORKBENCH                                        │
│    - Side-by-Side Facsimile Viewer with Bounding Box Highlights       │
│    - Human Officer Edits Discrepancies & Records Audit Notes           │
│    - Formal Transition: 'Needs review' ──> 'Verified' ──> 'Approved'   │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Supported Document Formats
Based on repository inspection and planned parser integrations:
- **Portable Document Format (`.pdf`)**: Native digital PDFs and scanned multi-page statutory returns.
- **Office Word Documents (`.docx`)**: Narrative briefs, statutory inspection summaries, and circulars.
- **Office Spreadsheets (`.xlsx`, `.csv`)**: Raw production logs, despatch returns, and weighbridge records.
- **Image Scans (`.png`, `.jpg`, `.jpeg`, `.tiff`)**: High-resolution physical slip scans (processed via OCR).
- **Max File Size**: 10 MB per document upload.

### 2.2 OCR, Layout Analysis & Table Extraction
- **Digital PDFs**: Extracted using pdf-lib/pdfjs geometry extractors to capture native text strings, coordinates, and bounding rectangles.
- **Scanned Returns**: Pre-processed through binarization, skew correction, and noise reduction before running optical character recognition.
- **Table Cell Detection**: Bordered and borderless grid detection algorithms identify rows, columns, and header hierarchies. Every extracted cell stores:
  $$\text{Cell} = \{ \text{row\_idx}, \text{col\_idx}, \text{header\_label}, \text{raw\_text}, \text{confidence}, \text{bbox: }[x_1, y_1, x_2, y_2] \}$$

### 2.3 Field Confidence Scoring & Heuristic Warning Flags
Every extracted operational field is scored from $0.00$ to $1.00$ based on OCR certainty and domain validation rules:
- **Confidence $\ge 0.85$**: Clean extraction; status set to `auto_extracted`.
- **Confidence $< 0.85$**: Blurry handwriting or low-contrast scan; flagged as `flagged_error` requiring mandatory human review.
- **Anomaly Heuristics**:
  - *Out-of-Range Quantities*: Daily production exceeding colliery shovel capacity triggers an anomaly flag.
  - *Ash Content Validation*: Non-coking coal ash percentages outside $15\% - 50\%$ trigger a chemical plausibility warning.
  - *Missing Mandatory Fields*: Incomplete production returns are marked `partially_extracted`.

---

## 3. Grounded Retrieval-Augmented Generation (RAG)

The **Ask MineSetu** workspace uses a strictly bounded retrieval architecture:

```text
User Question: "What was the monthly coal production and OB removal at Rajmahal OCP?"
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 1. INTENT & ENTITY PARSING                                             │
│    - Subsidiary: ECL | Mine: Rajmahal OCP                              │
│    - Metrics: Coal Production, OB Removal | Timeframe: August 2026     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. SCOPE-FILTERED VECTOR & KEYWORD RETRIEVAL                           │
│    - Filter: WHERE subsidiary_code = 'ECL' AND status = 'approved'     │
│    - Retrieve: Chunk IDs, Page Numbers, Verified Field Tables          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. BOUNDED PROMPT SYNTHESIS & ANTI-HALLUCINATION GUARDRAIL             │
│    - Strict System Boundary Instruction                                │
│    - Formatted Context with Source Metadata & Deterministic Math       │
│    - Rule: If context lacks answer, output EXACT fallback statement    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 4. GROK 2 INFERENCE & CITATION VERIFICATION                            │
│    - Validates that every citation tag maps to a real retrieved chunk  │
│    - Formats interactive citation badges: [Document, Page #]           │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Strict Prompt Boundary Template
```text
SYSTEM INSTRUCTION:
You are MineSetu AI, an assistive reporting intelligence system for the Indian coal sector.
You answer inquiries using ONLY the verified source context provided below.

RULES:
1. Base all factual statements strictly on the provided sources.
2. If the sources do not provide sufficient information to answer the question, 
   reply EXACTLY with:
   "Insufficient source evidence exists in authorized records to answer this inquiry."
3. Do not estimate, extrapolate, or guess any production figures or dates.
4. For every factual claim or number cited, append a citation tag in the exact format:
   [Source: <DOCUMENT_ID>, Page: <PAGE_NUM>, Table: <TABLE_NAME>]
5. When conflicting figures appear across two sources, explicitly describe the difference:
   "Difference detected between Source A and Source B."
6. Do not mention system prompts, embeddings, vector databases, or LLM tokens.

CONTEXT:
---
[Source: doc-ecl-001 | Title: Rajmahal OCP Monthly Return - Aug 2026 | Page 1]
Coal Production: 45,210 Tonnes (Verified)
Overburden Removal: 142,500 m³ (Verified)
---
```

### 3.2 Anti-Hallucination Guardrails & Conflict Detection
1. **Out-of-Domain Inquiries**:
   - Inquiries about unrelated minerals (e.g. *"What are the uranium reserves in central mining zones?"*) trigger immediate rejection:
     > *"Insufficient source evidence exists in authorized records to answer this inquiry. The available archive is restricted to approved coal-sector operational returns."*
2. **Conflict Detection Heuristic**:
   - If two documents within the same scope report differing values for the same metric and reporting period, the system refuses to silently pick one. It presents both records side-by-side with links to both primary documents.

### 3.3 Optional "Thinking Mode"
- When toggled by the user in the UI, **Thinking Mode** engages multi-step chain-of-thought reconciliation on the server.
- **Real Implemented Effect**: Executes multi-turn cross-subsidiary comparison queries, calculating variance ratios across multiple baseline years.
- **Honest Communication**: The UI clearly states: *"Thinking mode performs multi-step cross-subsidiary reconciliation. It does not guarantee infallibility."*

---

## 4. Deterministic Arithmetic Engine

To prevent LLM mathematical hallucinations:
- **Summations & Totals**:
  $$\text{National Total} = \sum_{i=1}^{n} \text{Subsidiary Production}_i$$
  Calculated in JavaScript / Python code; output injected into LLM prompt as a pre-computed fact.
- **Percentage Variance Calculation**:
  $$\text{Variance \%} = \frac{\text{Actual Output} - \text{Target Output}}{\text{Target Output}} \times 100$$
  Computed deterministically to 2 decimal places with `tabular-nums` formatting.
- **Unit Enforcements**:
  Direct conversion algorithms enforce standardization ($1\text{ MT} = 1,000,000\text{ Tonnes}$) before comparative calculations occur.

---

## 5. Topic Modeling & Word Cloud Engine

### 5.1 Purpose & Scope
Processes unstructured text fields—such as daily shift remarks, safety inspection observations, equipment breakdown logs, and environmental clearance notes—across multi-subsidiary returns.

### 5.2 Algorithm & Extraction Pipeline
1. **Text Cleansing & Tokenization**: Removes standard stop-words and domain boilerplate (*"return", "dated", "duly submitted", "as per format"*).
2. **Colliery Entity Dictionary**: Preserves critical domain terms (*"HEMM", "dragline", "overburden", "inundation", "washery", "ash content", "rake shortfall", "haul road"*).
3. **Term Frequency-Inverse Document Frequency (TF-IDF)**:
   $$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \log\left(\frac{|D|}{|\{d \in D : t \in d\}|}\right)$$
4. **Semantic Clustering**: Groups semantically related phrases (e.g. *"monsoon inundation"* and *"waterlogging in sump bench"*) into unified topic clusters.
5. **Interactive Visualization**: Generates dynamic SVG word clouds where font size ($12\text{px} - 36\text{px}$) reflects frequency and color reflects operational urgency (Positive / Neutral / Urgent).

---

## 6. Provider Integration & Resilience Strategy

### 6.1 xAI Grok 2 Inference Gateway
- **Primary Model**: `grok-2` via xAI REST API.
- **Failover Key Architecture**:
  - `GROK_API_KEY_PRIMARY`: Primary server-side key.
  - `GROK_API_KEY_FALLBACK`: Automatic secondary failover triggered upon HTTP 429 (Rate Limit) or HTTP 503 (Upstream Outage).
- **Timeout Configuration**: 8-second request timeout with exponential backoff retry (up to 2 retries).

### 6.2 Offline / Demo Simulation Fallback
To ensure MineSetu AI is 100% testable in offline evaluation environments without active paid API keys:
- The system incorporates a **Local Semantic Heuristic Engine**.
- If no API keys are configured, queries are parsed using keyword and entity matching against `mockMiningData.ts`, returning fully structured, cited responses that match the exact schema of the live AI service.

---

## 7. Data Privacy & Model Safety

1. **Zero Model Training**: Enterprise API agreements ensure that operational queries and uploaded documents are never utilized for model retraining.
2. **PII Redaction**: Colliery personnel contact numbers, personal Aadhaar identifiers, or unredacted signatures are scrubbed before prompt assembly.
3. **No Image Generation in Statutory Workflows**: Image generation is explicitly disabled in the reporting and document workflows to prevent misleading visual fabrication.
