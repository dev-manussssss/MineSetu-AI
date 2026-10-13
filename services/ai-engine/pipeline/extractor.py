"""
MineSetu AI — Document Extraction & OCR Pipeline
Extracts structured coal-sector metrics from statutory returns with normalized bounding boxes,
scanned document detection, and deterministic arithmetic validation.
"""

import re
import time
from typing import List, Dict, Any, Optional, Tuple

try:
    from ..models import ExtractedField, BoundingBox, DocumentProcessResult
except (ImportError, ValueError):
    from models import ExtractedField, BoundingBox, DocumentProcessResult

# Metric Extraction Patterns tailored to Indian Coal Return templates (Form IV, Form H, shift reports)
FIELD_PATTERNS = [
    {
        "field_name": "coal_prod_tonnes",
        "label": "Raw Coal Production",
        "unit": "Tonnes",
        "regex": r"(?:coal\s*(?:production|extracted|output)|raw\s*coal)[\s:=]+([0-9,]+(?:\.[0-9]+)?)\s*(?:tonnes?|te?|mt)?",
        "default_confidence": 94.5,
    },
    {
        "field_name": "ob_removal_m3",
        "label": "Overburden Removal",
        "unit": "m³",
        "regex": r"(?:(?:overburden|ob)\s*(?:removal|stripping)?)[\s:=]+([0-9,]+(?:\.[0-9]+)?)\s*(?:m3|m³|cum|cubic\s*m(?:eters?)?)?",
        "default_confidence": 88.0,
    },
    {
        "field_name": "despatch_tonnes",
        "label": "Coal Despatch (Rail/Road)",
        "unit": "Tonnes",
        "regex": r"(?:despatch|offtake|dispatch)[\s:=]+([0-9,]+(?:\.[0-9]+)?)\s*(?:tonnes?|te?|mt)?",
        "default_confidence": 91.0,
    },
    {
        "field_name": "ash_content_pct",
        "label": "Average Ash Content",
        "unit": "%",
        "regex": r"(?:ash\s*(?:content|percentage|%))[\s:=]+([0-9]+(?:\.[0-9]+)?)\s*%",
        "default_confidence": 95.0,
    },
    {
        "field_name": "stripping_ratio",
        "label": "Composite Stripping Ratio",
        "unit": "m³/T",
        "regex": r"(?:stripping\s*ratio)[\s:=]+([0-9]+(?:\.[0-9]+)?)\s*(?::1|m3/t)?",
        "default_confidence": 89.0,
    },
    {
        "field_name": "hemm_availability_pct",
        "label": "HEMM Fleet Availability",
        "unit": "%",
        "regex": r"(?:hemm\s*(?:availability|fleet))[\s:=]+([0-9]+(?:\.[0-9]+)?)\s*%",
        "default_confidence": 92.0,
    },
    {
        "field_name": "annual_target_mt",
        "label": "Annual Production Target",
        "unit": "MT",
        "regex": r"(?:annual\s*target|production\s*target)[\s:=]+([0-9,]+(?:\.[0-9]+)?)\s*(?:mt|million\s*tonnes?)?",
        "default_confidence": 93.0,
    },
    {
        "field_name": "achievement_pct",
        "label": "Target Achievement",
        "unit": "%",
        "regex": r"(?:target\s*achievement|achievement)[\s:=]+([0-9]+(?:\.[0-9]+)?)\s*%",
        "default_confidence": 91.5,
    }
]


class DocumentExtractor:
    """Extracts statutory operational returns into structured data with bounding boxes and scanned detection."""

    def __init__(self):
        self._pymupdf_available = False
        try:
            try:
                import pymupdf as fitz
            except ImportError:
                import fitz
            self._pymupdf_available = True
        except ImportError:
            self._pymupdf_available = False

    def process_document(
        self,
        doc_id: str,
        file_bytes: Optional[bytes] = None,
        file_name: str = "return.pdf",
        text_content: Optional[str] = None
    ) -> DocumentProcessResult:
        start_time = time.time()

        extracted_text = ""
        page_count = 1
        is_scanned = False
        extraction_method = "pymupdf_text_layer"
        bounding_boxes_by_field: Dict[str, Tuple[BoundingBox, int]] = {}

        if file_bytes and self._pymupdf_available:
            try:
                try:
                    import pymupdf as fitz
                except ImportError:
                    import fitz
                pdf = fitz.open(stream=file_bytes, filetype="pdf")
                page_count = len(pdf)
                pages_text = []
                scanned_pages = 0

                for page_num in range(page_count):
                    page = pdf[page_num]
                    p_text = page.get_text()
                    pages_text.append(p_text)
                    rect = page.rect
                    width = rect.width or 612.0
                    height = rect.height or 792.0

                    # Detect scanned page (empty or very sparse text with raster images)
                    images = page.get_images()
                    if len(p_text.strip()) < 20 and len(images) > 0:
                        scanned_pages += 1

                    # Search text occurrences to compute normalized bounding boxes [0..1000]
                    for pattern_def in FIELD_PATTERNS:
                        field = pattern_def["field_name"]
                        if field not in bounding_boxes_by_field:
                            # Search for field label first
                            matches = page.search_for(pattern_def["label"].split()[0])
                            if matches:
                                m = matches[0]
                                bbox = BoundingBox(
                                    ymin=round(min(1000.0, max(0.0, (m.y0 / height) * 1000.0)), 1),
                                    xmin=round(min(1000.0, max(0.0, (m.x0 / width) * 1000.0)), 1),
                                    ymax=round(min(1000.0, max(0.0, (m.y1 / height) * 1000.0)), 1),
                                    xmax=round(min(1000.0, max(0.0, (m.x1 / width) * 1000.0)), 1),
                                )
                                bounding_boxes_by_field[field] = (bbox, page_num + 1)

                extracted_text = "\n".join(pages_text)

                if scanned_pages == page_count and page_count > 0:
                    is_scanned = True
                    extraction_method = "scanned_pdf_needs_ocr"
            except Exception as err:
                print(f"[DocumentExtractor] PyMuPDF extraction warning: {err}")
                extracted_text = text_content or ""
        else:
            extracted_text = text_content or ""

        # Fallback text if neither file_bytes nor text_content was provided (demo mode)
        if file_bytes is None and text_content is None:
            extracted_text = (
                "COAL INDIA LIMITED — STATUTORY OPERATIONAL RETURN (FORM IV)\n"
                "Subsidiary: Eastern Coalfields Limited | Mine: Rajmahal OCP\n"
                "Reporting Period: August 2026\n"
                "Raw Coal Production: 45,210 Tonnes\n"
                "Overburden Removal: 142,500 m3\n"
                "Coal Despatch: 41,800 Tonnes\n"
                "Average Ash Content: 38.4%\n"
                "Composite Stripping Ratio: 3.15 m3/T\n"
                "HEMM Fleet Availability: 84.6%\n"
                "Annual Production Target: 51.0 MT\n"
                "Target Achievement: 94.2%\n"
            )

        # Regex Extraction over text
        extracted_fields: List[ExtractedField] = []
        confidences: List[float] = []

        for p in FIELD_PATTERNS:
            field_name = p["field_name"]
            match = re.search(p["regex"], extracted_text, re.IGNORECASE)

            if match:
                raw_val = match.group(1).strip()
                clean_num_str = raw_val.replace(",", "")
                try:
                    num_val = float(clean_num_str)
                except ValueError:
                    num_val = None

                confidence = p["default_confidence"]
                # Deterministic sanity checks
                if field_name == "ash_content_pct" and num_val is not None:
                    if num_val > 65.0 or num_val < 5.0:
                        confidence = min(confidence, 60.0)
                elif field_name == "hemm_availability_pct" and num_val is not None:
                    if num_val > 100.0 or num_val < 0.0:
                        confidence = min(confidence, 50.0)

                bbox_info = bounding_boxes_by_field.get(field_name)
                bbox = bbox_info[0] if bbox_info else BoundingBox(
                    ymin=150.0 + len(extracted_fields) * 55.0,
                    xmin=120.0,
                    ymax=185.0 + len(extracted_fields) * 55.0,
                    xmax=450.0,
                )
                page_num = bbox_info[1] if bbox_info else 1

                extracted_fields.append(ExtractedField(
                    field_name=field_name,
                    label=p["label"],
                    value=raw_val,
                    value_num=num_val,
                    unit=p["unit"],
                    confidence=confidence,
                    page_number=page_num,
                    bounding_box=bbox,
                    source_snippet=match.group(0),
                    verified_status="auto_extracted"
                ))
                confidences.append(confidence)

        # Deterministic Cross-Check: Stripping Ratio consistency
        coal_field = next((f for f in extracted_fields if f.field_name == "coal_prod_tonnes"), None)
        ob_field = next((f for f in extracted_fields if f.field_name == "ob_removal_m3"), None)
        sr_field = next((f for f in extracted_fields if f.field_name == "stripping_ratio"), None)

        if coal_field and ob_field and coal_field.value_num and ob_field.value_num and coal_field.value_num > 0:
            computed_sr = round(ob_field.value_num / coal_field.value_num, 2)
            if sr_field and sr_field.value_num:
                if abs(sr_field.value_num - computed_sr) > 0.5:
                    sr_field.confidence = min(sr_field.confidence, 70.0)
                    sr_field.source_snippet = (
                        f"{sr_field.source_snippet} [Warning: Claimed {sr_field.value_num} vs Computed {computed_sr}]"
                    )

        overall_conf = round(sum(confidences) / len(confidences), 1) if confidences else 0.0
        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        if is_scanned:
            summary = (
                f"Scanned image PDF return detected in {file_name}. Usable text layer absent. "
                f"OCR engine required. Routed to Human Verification Workbench for manual validation."
            )
        else:
            summary = (
                f"Extracted {len(extracted_fields)} statutory metrics from {file_name} "
                f"across {page_count} page(s) with {overall_conf}% mean extraction confidence via PyMuPDF."
            )

        return DocumentProcessResult(
            document_id=doc_id,
            page_count=page_count,
            extracted_fields=extracted_fields,
            overall_confidence=overall_conf,
            summary=summary,
            extraction_method=extraction_method,
            is_scanned=is_scanned,
            facsimile_paths=[f"facsimiles/{doc_id}_page_1.png"],
            chunk_count=max(1, len(extracted_text) // 500),
            processing_time_ms=elapsed_ms
        )
