"""
MineSetu AI — Python AI Processing Engine Microservice
FastAPI entry point for OCR extraction, bounding-box calculation, multi-format compilation, and topic modeling.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

try:
    from .config import settings
    from .models import (
        DocumentProcessRequest,
        DocumentProcessResult,
        ReportCompileRequest,
        ReportCompileResult,
        TopicModelResult,
    )
    from .pipeline.extractor import DocumentExtractor
    from .pipeline.compiler import ReportCompiler
    from .pipeline.topic_modeler import TopicModeler
    from .pipeline.arithmetic_guard import ArithmeticGuard
except (ImportError, ValueError):
    from config import settings
    from models import (
        DocumentProcessRequest,
        DocumentProcessResult,
        ReportCompileRequest,
        ReportCompileResult,
        TopicModelResult,
    )
    from pipeline.extractor import DocumentExtractor
    from pipeline.compiler import ReportCompiler
    from pipeline.topic_modeler import TopicModeler
    from pipeline.arithmetic_guard import ArithmeticGuard

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="MineSetu AI processing microservice for document intelligence, OCR, report compilation, and topic modeling."
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

extractor = DocumentExtractor()
compiler = ReportCompiler()
topic_modeler = TopicModeler()


@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """Health check endpoint providing status of AI engine components."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "worker_enabled": settings.WORKER_ENABLED,
        "grok_model": settings.GROK_MODEL_ID,
        "embedding_dimensions": settings.EMBEDDING_DIMENSIONS,
    }


@app.post("/process/document", response_model=DocumentProcessResult)
def process_document(req: DocumentProcessRequest):
    """Processes a document to extract statutory metrics with normalized bounding boxes."""
    try:
        return extractor.process_document(doc_id=req.document_id)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document processing failed: {str(err)}"
        )


@app.post("/process/report", response_model=ReportCompileResult)
def compile_report(req: ReportCompileRequest):
    """Compiles multi-subsidiary operational reports into Word (.docx), Excel (.xlsx), and PDF."""
    try:
        return compiler.compile_all(req)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report compilation failed: {str(err)}"
        )


@app.post("/process/topics", response_model=TopicModelResult)
def extract_topics(documents: List[str]):
    """Extracts thematic clusters and builds word cloud distribution."""
    try:
        return topic_modeler.compute_topics(documents)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Topic extraction failed: {str(err)}"
        )


@app.post("/math/variance")
def calculate_variance(payload: Dict[str, float]):
    """Deterministic math calculation to prevent token hallucination on numbers."""
    claimed = payload.get("claimed", 0.0)
    baseline = payload.get("baseline", 0.0)
    return ArithmeticGuard.calculate_variance(claimed, baseline)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
