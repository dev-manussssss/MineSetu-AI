"""
MineSetu AI — Durable Queue Background Worker
Polls processing_jobs table using atomic claim function with leases and recovery.
"""

import time
import socket
import logging
from datetime import datetime, timezone
from typing import Optional

try:
    from .config import settings
    from .pipeline.extractor import DocumentExtractor
except (ImportError, ValueError):
    from config import settings
    from pipeline.extractor import DocumentExtractor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-worker")


class QueueWorker:
    """Consumes OCR and document processing jobs from PostgreSQL durable queue."""

    def __init__(self):
        self.worker_id = f"worker-{socket.gethostname()}-{time.time()}"
        self.extractor = DocumentExtractor()
        self.running = False
        self._supabase = None

    def _get_supabase(self):
        if self._supabase is None and settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            try:
                from supabase import create_client
                self._supabase = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_SERVICE_ROLE_KEY
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
        """Processes a claimed document job."""
        job_id = job["id"]
        doc_id = job.get("entity_id") or job.get("document_id")
        logger.info(f"Processing job {job_id} for document {doc_id}")

        sb = self._get_supabase()
        try:
            # Execute document extraction
            result = self.extractor.process_document(doc_id=str(doc_id) if doc_id else "demo-doc")

            # Store extracted fields in extracted_records
            if sb and doc_id:
                for f in result.extracted_fields:
                    bbox_data = None
                    if f.bounding_box:
                        bbox_data = f.bounding_box.model_dump() if hasattr(f.bounding_box, 'model_dump') else f.bounding_box.dict()

                    sb.from_("extracted_records").insert({
                        "document_id": doc_id,
                        "page_number": f.page_number,
                        "field_name": f.field_name,
                        "field_label": f.label,
                        "extracted_value": str(f.value),
                        "unit": f.unit,
                        "confidence": f.confidence,
                        "bounding_box": bbox_data,
                        "status": "auto_extracted"
                    }).execute()

                # Update job to completed via RPC, fallback to table update
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
                        "payload": {
                            "page_count": result.page_count,
                            "field_count": len(result.extracted_fields),
                            "processing_time_ms": result.processing_time_ms
                        }
                    }).eq("id", job_id).execute()

                # Update document status to needs_review
                sb.from_("documents").update({
                    "status": "needs_review",
                    "overall_confidence": result.overall_confidence
                }).eq("id", doc_id).execute()

            logger.info(f"Successfully finished job {job_id}")
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

    def run_poll_loop(self):
        """Main polling loop."""
        self.running = True
        logger.info(f"Worker {self.worker_id} started polling queue.")
        while self.running:
            job = self.claim_next_job()
            if job:
                self.process_job(job)
            else:
                time.sleep(settings.POLL_INTERVAL_SECONDS)
