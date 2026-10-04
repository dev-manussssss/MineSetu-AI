# Synthetic Mock Dataset Specification — MDMS + Mindsetu AI

## 1. Data Integrity & Synthetic Framing

As enforced by `guidelines.md` (Sections 1.2 and 27):
- **All operational figures in this repository are strictly synthetic/demonstration records.**
- Every record carries:
  ```json
  {
    "is_demo": true,
    "source_type": "synthetic"
  }
  ```
- Real entity names (Coal India subsidiaries and institutes) are modeled to reflect authentic operational hierarchies, but figures (tonnages, stripping ratios, inspection percentages) are representative demo values.

---

## 2. Modeled Subsidiaries & Entities

| Code | Entity Name | Region / State | Typical Mine Types |
|---|---|---|---|
| **ECL** | Eastern Coalfields Limited | West Bengal & Jharkhand | Rajmahal OCP, Jhanjra Underground |
| **BCCL** | Bharat Coking Coal Limited | Dhanbad, Jharkhand | Kusunda OCP, Moonidih Underground |
| **CCL** | Central Coalfields Limited | Ranchi, Jharkhand | Ashok OCP, Piparwar OCP |
| **NCL** | Northern Coalfields Limited | Singrauli, MP & UP | Jayant OCP, Nigahi OCP |
| **WCL** | Western Coalfields Limited | Maharashtra & MP | Umrer OCP, Kamptee OCP |
| **SECL** | South Eastern Coalfields Limited | Bilaspur, Chhattisgarh | Gevra OCP, Dipka OCP, Kusmunda OCP |
| **MCL** | Mahanadi Coalfields Limited | Sambalpur, Odisha | Bhubaneswari OCP, Lakhanpur OCP |
| **CMPDI** | Central Mine Planning & Design Institute | Ranchi, Jharkhand | Exploration, Geotech & IT Nodal HQ |

---

## 3. Synthetic Seed Records Catalog

### 3.1 Documents (`DOC-SYN-001` to `DOC-SYN-008`)
- **`DOC-SYN-001`**: *Rajmahal OCP Daily Shift Log & Coal Despatch Summary (ECL)*
  - Status: `needs_review` | OCR Confidence: 89% | Pages: 2
- **`DOC-SYN-002`**: *Gevra Mega Project Excavation & OB Removal Return (SECL)*
  - Status: `completed` | OCR Confidence: 97% | Pages: 4
- **`DOC-SYN-003`**: *Moonidih Coking Coal Washery Yield Report (BCCL)*
  - Status: `partially_extracted` | OCR Confidence: 78% (flagged handwritten note) | Pages: 1
- **`DOC-SYN-004`**: *Jayant Continuous Miner Utilization Log (NCL)*
  - Status: `approved` | OCR Confidence: 99% | Pages: 3
- **`DOC-SYN-005`**: *Piparwar Coal Beneficiation & Despatch Return (CCL)*
  - Status: `completed` | OCR Confidence: 94% | Pages: 2
- **`DOC-SYN-006`**: *Umrer Deep Open Cast Environmental Clearance Audit (WCL)*
  - Status: `approved` | OCR Confidence: 98% | Pages: 5
- **`DOC-SYN-007`**: *Bhubaneswari Surface Miner Productivity Sheet (MCL)*
  - Status: `needs_review` | OCR Confidence: 86% | Pages: 2
- **`DOC-SYN-008`**: *CMPDI Regional Exploration Borehole Lithology Log (CMPDI)*
  - Status: `approved` | OCR Confidence: 96% | Pages: 6

### 3.2 Parliamentary Inquiries (`PQ-SYN-2026-01` to `PQ-SYN-2026-04`)
- **`PQ-SYN-2026-01`**: Lok Sabha Starred Q# 402 — *Safety Inspection Compliance in SECL Mines*
  - Status: `ai_draft_ready` | Sources: DOC-SYN-002, DGMS Annual Return
- **`PQ-SYN-2026-02`**: Rajya Sabha Unstarred Q# 119 — *Coal Despatch and Rake Availability at MCL*
  - Status: `under_review` | Sources: DOC-SYN-007, Railway Despatch Log
- **`PQ-SYN-2026-03`**: Lok Sabha Unstarred Q# 845 — *Status of Solar Microgrid Deployments across ECL Mines*
  - Status: `approved` | Sources: DOC-SYN-001, MoC Green Energy Report
- **`PQ-SYN-2026-04`**: Rajya Sabha Starred Q# 210 — *Heavy Earth Moving Machinery (HEMM) Breakdown Reduction*
  - Status: `intake` | Sources: DOC-SYN-004, DOC-SYN-005

---

## 4. Seed & Reset Policy

The System Administrator panel provides a one-click `Reset Synthetic Dataset` action that reinstates the factory mock baseline and flushes mock-derived test documents without altering the source code.
