"""
MineSetu AI — AI Processing Engine Data Models & Schemas
"""

from typing import List, Optional, Dict, Any
from enum import Enum

try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:  # type: ignore
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def dict(self):
            return {k: v.dict() if hasattr(v, 'dict') else v for k, v in self.__dict__.items() if not k.startswith('_')}
        def model_dump(self):
            return self.dict()

    def Field(default=None, **kwargs):  # type: ignore
        return default


class JobStatus(str, Enum):
    QUEUED = "queued"
    CLAIMED = "claimed"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRY_PENDING = "retry_pending"


class BoundingBox(BaseModel):
    """Normalized bounding box coordinates [0..1000] for UI overlay."""
    ymin: float = Field(..., ge=0, le=1000, description="Top-left Y coordinate")
    xmin: float = Field(..., ge=0, le=1000, description="Top-left X coordinate")
    ymax: float = Field(..., ge=0, le=1000, description="Bottom-right Y coordinate")
    xmax: float = Field(..., ge=0, le=1000, description="Bottom-right X coordinate")


class ExtractedField(BaseModel):
    field_name: str
    label: str
    value: str
    value_num: Optional[float] = None
    unit: str
    confidence: float = Field(..., ge=0, le=100)
    page_number: int = 1
    bounding_box: Optional[BoundingBox] = None
    source_snippet: Optional[str] = None
    verified_status: str = "auto_extracted"


class DocumentProcessRequest(BaseModel):
    document_id: str
    storage_path: str
    organization_id: Optional[str] = None
    mine_id: Optional[str] = None
    subsidiary_code: Optional[str] = None
    category: Optional[str] = "production"
    generate_facsimiles: bool = True
    generate_embeddings: bool = True


class DocumentProcessResult(BaseModel):
    document_id: str
    page_count: int
    extracted_fields: List[ExtractedField]
    overall_confidence: float
    summary: str
    facsimile_paths: List[str] = []
    chunk_count: int = 0
    processing_time_ms: float


class ReportMetricRow(BaseModel):
    subsidiary: str
    mine: str
    coal_tonnes: str
    ob_m3: str
    status: str
    confidence: str


class ReportCompileRequest(BaseModel):
    report_id: str
    title: str
    report_type: str = "Quarterly Operational Review"
    reporting_period: str = "Q2 FY 2026"
    scope: str = "Multi-Subsidiary Consolidated"
    selected_subsidiaries: List[str] = ["ECL", "SECL"]
    executive_summary: str
    metrics_table: List[ReportMetricRow] = []
    sources: List[str] = []
    formats: List[str] = ["pdf", "docx", "xlsx"]


class ReportCompileResult(BaseModel):
    report_id: str
    exported_files: Dict[str, str]  # format -> storage_path / download_url
    compilation_time_ms: float
    status: str = "completed"


class TopicClusterResult(BaseModel):
    name: str
    weight: int
    category: str
    doc_count: int
    top_terms: List[str]
    sample_excerpts: List[str]


class TopicModelResult(BaseModel):
    model_version: str
    total_documents: int
    clusters: List[TopicClusterResult]
    vocabulary_size: int
    computed_at: str
