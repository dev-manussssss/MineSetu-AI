"""
MineSetu AI — Durable Queue Background Worker
Polls processing_jobs table using atomic claim function with leases, retry backoff,
typed job dispatch (document_ocr, report_export, topic_modeling), and safe failure diagnostics.
"""

import time
import socket
import logging
from datetime import datetime, timezone
from typing import Optional

try:
    from .config import settings
    from .pipeline.extractor import DocumentExtractor
    from .pipeline.compiler import ReportCompiler
    from .pipeline.topic_modeler import TopicModeler
    from .models import ReportCompileRequest, ReportMetricRow
except (ImportError, ValueError):
    from config import settings
    from pipeline.extractor import DocumentExtractor
    from pipeline.compiler import ReportCompiler
    from pipeline.topic_modeler import TopicModeler
    from models import ReportCompileRequest, ReportMetricRow

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-worker")


class QueueWorker:
    """Consumes OCR, report compilation, and topic modeling jobs from PostgreSQL durable queue."""

    def __init__(self):
        self.worker_id = f"worker-{socket.gethostname()}-{int(time.time())}"
        self.extractor = DocumentExtractor()
        self.compiler = ReportCompiler()
        self.topic_modeler = TopicModeler()
        self.running = False
        self._supabase = None

    def _get_supabase(self):
        if self._supabase is None and settings.SUPABASE_URL and (settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY):
            try:
                from supabase import create_client
                key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
                self._supabase = create_client(
                    settings.SUPABASE_URL,
                    key
                )
            except Exception as e:
                logger.warning(f"Could not connect to Supabase: {e}")
        return self._supabase

    def claim_next_job(self) -> Optional[dict]:
        """Claims a single queued job atomically via claim_processing_job RPC."""
        sb = self._get_supabase()
        if not sb:
            return None

        try:
            res = sb.rpc("claim_processing_job", {
                "p_worker_id": self.worker_id,
                "p_lease_seconds": settings.JOB_LEASE_SECONDS
            }).execute()

            jobs = res.data
            if jobs and len(jobs) > 0:
                return jobs[0]
            return None
        except Exception as err:
            logger.error(f"Error claiming job: {err}")
            return None

    def process_job(self, job: dict):
        """Processes a claimed job based on its typed job_type dispatch."""
        job_id = job.get("id", "job-unknown")
        job_type = job.get("job_type", "document_ocr")
        entity_id = job.get("entity_id") or job.get("document_id")
        payload = job.get("payload") or {}
        logger.info(f"Processing job {job_id} [type={job_type}] for entity {entity_id}")

        sb = self._get_supabase()
        try:
            if job_type == "document_ocr":
                # Download binary from private storage if storage_path is present
                file_bytes = None
                storage_path = payload.get("storage_path")
                if sb and storage_path:
                    try:
                        res = sb.storage.from_("raw-documents").download(storage_path)
                        if res:
                            file_bytes = res
                    except Exception as down_err:
                        logger.warning(f"Storage download skipped for {storage_path}: {down_err}")

                result = self.extractor.process_document(
                    doc_id=str(entity_id) if entity_id else "demo-doc",
                    file_bytes=file_bytes,
                    file_name=payload.get("file_name", "return.pdf"),
                    text_content=payload.get("text_content")
                )

                # Persist extracted fields
                if sb and entity_id:
                    for f in result.extracted_fields:
                        bbox_data = (
                            f.bounding_box.model_dump()
                            if hasattr(f.bounding_box, 'model_dump')
                            else f.bounding_box.dict()
                            if f.bounding_box else None
                        )
                        sb.from_("extracted_records").insert({
                            "document_id": entity_id,
                            "page_number": f.page_number,
                            "field_name": f.field_name,
                            "field_label": f.label,
                            "extracted_value": str(f.value),
                            "unit": f.unit,
                            "confidence": f.confidence,
                            "bounding_box": bbox_data,
                            "status": "auto_extracted"
                        }).execute()

                    # Update document to needs_review with overall confidence and summary
                    sb.from_("documents").update({
                        "status": "needs_review",
                        "overall_confidence": result.overall_confidence,
                        "extracted_summary": result.summary
                    }).eq("id", entity_id).execute()

            elif job_type == "report_export":
                metric_rows = [ReportMetricRow(**m) for m in payload.get("metrics_table", [])]
                req = ReportCompileRequest(
                    report_id=str(entity_id),
                    title=payload.get("title", "Statutory Summary Report"),
                    reporting_period=payload.get("reporting_period", "August 2026"),
                    scope=payload.get("scope", "Multi-Subsidiary Consolidated"),
                    executive_summary=payload.get("executive_summary", "Compiled statutory summary"),
                    metrics_table=metric_rows,
                    sources=payload.get("sources", []),
                    formats=payload.get("formats", ["pdf", "docx", "xlsx"])
                )
                result = self.compiler.compile_all(req)

                if sb and entity_id:
                    for fmt, file_path in result.exported_files.items():
                        sb.from_("report_exports").insert({
                            "report_id": entity_id,
                            "format": fmt,
                            "storage_path": file_path,
                            "status": "ready"
                        }).execute()

            elif job_type == "topic_modeling":
                docs = payload.get("documents", [])
                result = self.topic_modeler.compute_topics(docs)

            else:
                raise ValueError(f"Unknown or unsupported job type: '{job_type}'")

            # Complete the processing job
            if sb:
                try:
                    sb.rpc("complete_processing_job", {
                        "p_job_id": job_id,
                        "p_worker_id": self.worker_id
                    }).execute()
                except Exception:
                    sb.from_("processing_jobs").update({
                        "status": "completed",
                        "completed_at": datetime.now(timezone.utc).isoformat(),
                        "locked_until": None,
                    }).eq("id", job_id).execute()

            logger.info(f"Successfully finished job {job_id} [type={job_type}]")
            return True

        except Exception as err:
            logger.error(f"Job {job_id} failed: {err}")
            if sb:
                try:
                    sb.rpc("fail_processing_job", {
                        "p_job_id": job_id,
                        "p_worker_id": self.worker_id,
                        "p_error_message": str(err)
                    }).execute()
                except Exception:
                    sb.from_("processing_jobs").update({
                        "status": "failed",
                        "error_message": str(err),
                        "locked_until": None
                    }).eq("id", job_id).execute()
            raise

    def run_poll_loop(self):
        """Main polling loop."""
        self.running = True
        logger.info(f"Worker {self.worker_id} started polling queue.")
        while self.running:
            job = self.claim_next_job()
            if job:
                try:
                    self.process_job(job)
                except Exception:
                    pass
            else:
                time.sleep(settings.POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    worker = QueueWorker()
    worker.run_poll_loop()
