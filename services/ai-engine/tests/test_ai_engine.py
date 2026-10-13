"""
MineSetu AI — Python AI Engine Unit Test Suite
Uses standard library unittest for zero-dependency test execution.
"""

import unittest
import sys
import os

# Add services/ai-engine directly to sys.path
ai_engine_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ai_engine_dir not in sys.path:
    sys.path.insert(0, ai_engine_dir)

from pipeline.extractor import DocumentExtractor
from pipeline.arithmetic_guard import ArithmeticGuard
from pipeline.topic_modeler import TopicModeler
from pipeline.compiler import ReportCompiler
from connectors.registry import ConnectorRegistry, ALL_27_PORTALS
from models import ReportCompileRequest, ReportMetricRow


class TestDocumentExtractor(unittest.TestCase):
    def setUp(self):
        self.extractor = DocumentExtractor()

    def test_extraction_of_statutory_metrics(self):
        sample_return = (
            "STATUTORY OPERATIONAL RETURN\n"
            "Raw Coal Production: 45,210 Tonnes\n"
            "Overburden Removal: 142,500 m3\n"
            "Coal Despatch: 41,800 Tonnes\n"
            "Average Ash Content: 38.4%\n"
            "Composite Stripping Ratio: 3.15 m3/T\n"
            "HEMM Fleet Availability: 84.6%\n"
        )
        res = self.extractor.process_document(
            doc_id="test-doc-001",
            text_content=sample_return
        )

        self.assertEqual(res.document_id, "test-doc-001")
        self.assertGreaterEqual(len(res.extracted_fields), 4)

        field_names = [f.field_name for f in res.extracted_fields]
        self.assertIn("coal_prod_tonnes", field_names)
        self.assertIn("ob_removal_m3", field_names)
        self.assertIn("ash_content_pct", field_names)

        # Check numeric conversions
        coal_field = next(f for f in res.extracted_fields if f.field_name == "coal_prod_tonnes")
        self.assertEqual(coal_field.value_num, 45210.0)
        self.assertEqual(coal_field.unit, "Tonnes")

        # Check normalized bounding boxes [0..1000]
        self.assertIsNotNone(coal_field.bounding_box)
        bbox = coal_field.bounding_box
        self.assertGreaterEqual(bbox.ymin, 0.0)
        self.assertLessEqual(bbox.ymax, 1000.0)
        self.assertGreaterEqual(bbox.xmin, 0.0)
        self.assertLessEqual(bbox.xmax, 1000.0)

    def test_empty_document_handling(self):
        res = self.extractor.process_document(doc_id="empty-doc", text_content="")
        self.assertEqual(res.document_id, "empty-doc")
        self.assertEqual(len(res.extracted_fields), 0)
        self.assertEqual(res.overall_confidence, 0.0)


class TestArithmeticGuard(unittest.TestCase):
    def test_stripping_ratio_calculation(self):
        ratio = ArithmeticGuard.calculate_stripping_ratio(142500.0, 45210.0)
        self.assertEqual(ratio, 3.15)

    def test_stripping_ratio_zero_division(self):
        ratio = ArithmeticGuard.calculate_stripping_ratio(142500.0, 0.0)
        self.assertIsNone(ratio)

    def test_variance_calculation_exceeds_threshold(self):
        # 45,210 vs 52,000 baseline (-13.06% variance) -> exceeds 10% threshold
        v = ArithmeticGuard.calculate_variance(45210.0, 52000.0)
        self.assertEqual(v["exceeds_threshold"], True)
        self.assertEqual(v["direction"], "decrease")
        self.assertAlmostEqual(v["percentage"], -13.06, places=1)

    def test_variance_calculation_within_threshold(self):
        # 51,000 vs 50,000 baseline (+2% variance) -> within 10% threshold
        v = ArithmeticGuard.calculate_variance(51000.0, 50000.0)
        self.assertEqual(v["exceeds_threshold"], False)
        self.assertEqual(v["direction"], "increase")
        self.assertEqual(v["percentage"], 2.0)

    def test_variance_zero_baseline_consistent_schema(self):
        v = ArithmeticGuard.calculate_variance(45210.0, 0.0)
        self.assertEqual(v["exceeds_threshold"], True)
        self.assertEqual(v["claimed"], 45210.0)
        self.assertEqual(v["baseline"], 0.0)
        self.assertEqual(v["difference"], 45210.0)
        self.assertIsNone(v["percentage"])
        self.assertEqual(v["direction"], "increase")

    def test_stripping_ratio_negative_ob(self):
        ratio = ArithmeticGuard.calculate_stripping_ratio(-500.0, 100.0)
        self.assertIsNone(ratio, "Negative overburden must return None")

    def test_aggregate_totals_deterministic(self):
        items = [{"prod": 10.5}, {"prod": 20.25}, {"prod": 5.0}]
        total = ArithmeticGuard.aggregate_totals(items, "prod")
        self.assertEqual(total, 35.75)


class TestConnectorRegistry(unittest.TestCase):
    def setUp(self):
        self.registry = ConnectorRegistry()

    def test_all_27_portals_classified(self):
        portals = self.registry.list_all_portals()
        self.assertEqual(len(portals), 27)
        self.assertEqual(len(ALL_27_PORTALS), 27)

    def test_six_active_mvp_connectors(self):
        active_ids = [p["id"] for p in self.registry.list_all_portals() if p["has_active_adapter"]]
        self.assertEqual(set(active_ids), {1, 3, 6, 7, 9, 15})

    def test_records_contain_sha256_provenance_hash(self):
        records = self.registry.fetch_all_mvp_records(period="August 2026")
        self.assertGreaterEqual(len(records), 6)
        for r in records:
            self.assertEqual(len(r.content_hash), 64)
            self.assertTrue(r.source_url.startswith("http"))
            self.assertIsNotNone(r.period)


class TestTopicModeler(unittest.TestCase):
    def test_thematic_clustering(self):
        docs = [
            "Excavation and stripping at Rajmahal OCP shovel dumper benches.",
            "Environmental clearance monitoring and effluent management consent.",
            "Captive railway siding rakes loaded for NTPC power despatch."
        ]
        res = TopicModeler().compute_topics(docs)
        self.assertEqual(res.model_version, "lda-coal-2026.1")
        self.assertGreaterEqual(len(res.clusters), 4)
        cluster_names = [c.name for c in res.clusters]
        self.assertIn("Excavation & Production", cluster_names)


class TestReportCompiler(unittest.TestCase):
    def test_multi_format_generation(self):
        req = ReportCompileRequest(
            report_id="test-rep-001",
            title="Monthly Production Summary",
            reporting_period="August 2026",
            scope="Consolidated",
            executive_summary="Verified production across ECL and SECL mines.",
            metrics_table=[
                ReportMetricRow(
                    subsidiary="ECL",
                    mine="Rajmahal OCP",
                    coal_tonnes="45,210",
                    ob_m3="142,500",
                    status="Verified",
                    confidence="94%"
                )
            ],
            sources=["ECL_Rajmahal_Aug2026.pdf"],
            formats=["pdf", "docx", "xlsx"]
        )
        res = ReportCompiler().compile_all(req)
        self.assertEqual(res.status, "completed")
        self.assertIn("pdf", res.exported_files)
        self.assertIn("docx", res.exported_files)
        self.assertIn("xlsx", res.exported_files)

    def test_report_compiler_single_format(self):
        req = ReportCompileRequest(
            report_id="test-rep-single",
            title="Single Format Test",
            reporting_period="August 2026",
            scope="Subsidiary",
            executive_summary="Testing single format compilation.",
            metrics_table=[],
            sources=[],
            formats=["pdf"]
        )
        res = ReportCompiler().compile_all(req)
        self.assertEqual(res.status, "completed")
        self.assertIn("pdf", res.exported_files)
        self.assertNotIn("docx", res.exported_files)
        self.assertNotIn("xlsx", res.exported_files)


class TestPhase2DocumentIngestionAndWorker(unittest.TestCase):
    def setUp(self):
        self.extractor = DocumentExtractor()
        from worker import QueueWorker
        self.worker = QueueWorker()

    def test_scanned_detection_and_honest_ocr_boundary(self):
        # Empty text with mock PDF stream represents scanned raster PDF
        res = self.extractor.process_document(
            doc_id="scanned-doc-001",
            text_content="",
            file_name="Scanned_Kusmunda_Return.pdf"
        )
        self.assertEqual(res.document_id, "scanned-doc-001")
        self.assertEqual(res.overall_confidence, 0.0)
        self.assertEqual(len(res.extracted_fields), 0)

    def test_stripping_ratio_consistency_cross_check(self):
        # Return with inconsistent stripping ratio (claimed 1.5 vs computed 142500/45210 = 3.15)
        inconsistent_return = (
            "STATUTORY OPERATIONAL RETURN\n"
            "Raw Coal Production: 45,210 Tonnes\n"
            "Overburden Removal: 142,500 m3\n"
            "Composite Stripping Ratio: 1.50 m3/T\n"
        )
        res = self.extractor.process_document(
            doc_id="inconsistent-doc",
            text_content=inconsistent_return
        )
        sr_field = next(f for f in res.extracted_fields if f.field_name == "stripping_ratio")
        self.assertLessEqual(sr_field.confidence, 70.0)
        self.assertIn("Warning: Claimed 1.5", sr_field.source_snippet)

    def test_worker_dispatches_document_ocr(self):
        job = {
            "id": "job-ocr-001",
            "job_type": "document_ocr",
            "entity_id": "test-doc-001",
            "payload": {
                "text_content": "Raw Coal Production: 45,210 Tonnes\nOverburden Removal: 142,500 m3"
            }
        }
        success = self.worker.process_job(job)
        self.assertTrue(success)

    def test_worker_dispatches_report_export(self):
        job = {
            "id": "job-rep-001",
            "job_type": "report_export",
            "entity_id": "test-rep-001",
            "payload": {
                "title": "Quarterly Operations",
                "formats": ["pdf"]
            }
        }
        success = self.worker.process_job(job)
        self.assertTrue(success)

    def test_worker_dispatches_topic_modeling(self):
        job = {
            "id": "job-top-001",
            "job_type": "topic_modeling",
            "payload": {
                "documents": ["Coal excavation daily progress", "Environmental monitoring compliance"]
            }
        }
        success = self.worker.process_job(job)
        self.assertTrue(success)

    def test_worker_rejects_unknown_job_type_safely(self):
        job = {
            "id": "job-unknown-001",
            "job_type": "unsupported_blockchain_action",
            "payload": {}
        }
        with self.assertRaises(ValueError) as ctx:
            self.worker.process_job(job)
        self.assertIn("Unknown or unsupported job type", str(ctx.exception))


class TestPhase4ReportCompilationAndAnalytics(unittest.TestCase):
    """Verifies Phase 4 multi-format compilation, arithmetic guards, formula sanitization, and topic modeling."""

    def setUp(self):
        self.compiler = ReportCompiler()
        self.topic_modeler = TopicModeler()

    def test_formula_injection_sanitization(self):
        from pipeline.compiler import sanitize_cell_value
        self.assertEqual(sanitize_cell_value("=cmd|' /C calc'!A0"), "'=cmd|' /C calc'!A0")
        self.assertEqual(sanitize_cell_value("@SUM(A1:A10)"), "'@SUM(A1:A10)")
        self.assertEqual(sanitize_cell_value("+12345"), "'+12345")
        self.assertEqual(sanitize_cell_value("-999"), "'-999")
        self.assertEqual(sanitize_cell_value("Rajmahal OCP"), "Rajmahal OCP")
        self.assertEqual(sanitize_cell_value(45210), 45210)

    def test_multi_format_compilation_creates_valid_files(self):
        req = ReportCompileRequest(
            report_id="rep-test-phase4-001",
            title="Q2 Operational Review",
            reporting_period="Q2 FY 2026",
            scope="Consolidated",
            executive_summary="Consolidated quarterly review of monitored Coal India operational returns.",
            metrics_table=[
                ReportMetricRow(
                    subsidiary="ECL",
                    mine="Rajmahal OCP",
                    coal_tonnes="45,210",
                    ob_m3="142,500",
                    status="Verified",
                    confidence="98%"
                ),
                ReportMetricRow(
                    subsidiary="SECL",
                    mine="Gevra OCP",
                    coal_tonnes="524,300",
                    ob_m3="1,120,000",
                    status="Approved",
                    confidence="99%"
                )
            ],
            sources=["ECL_Rajmahal_Aug2026.pdf", "SECL_Gevra_Sep2026.pdf"],
            formats=["docx", "xlsx", "pdf"]
        )

        result = self.compiler.compile_all(req)
        self.assertEqual(result.status, "completed")
        self.assertIn("docx", result.exported_files)
        self.assertIn("xlsx", result.exported_files)
        self.assertIn("pdf", result.exported_files)

        for fmt, path in result.exported_files.items():
            self.assertTrue(os.path.exists(path), f"File {path} must exist on disk")
            size = os.path.getsize(path)
            self.assertGreater(size, 0, f"File {path} must not be zero-byte (size={size})")

    def test_arithmetic_cross_checks_in_report(self):
        rows = [
            ReportMetricRow(
                subsidiary="ECL",
                mine="Rajmahal OCP",
                coal_tonnes="45,210",
                ob_m3="142,500",
                status="Verified",
                confidence="98%"
            ),
            ReportMetricRow(
                subsidiary="SECL",
                mine="Gevra OCP",
                coal_tonnes="524,300",
                ob_m3="1,120,000",
                status="Approved",
                confidence="99%"
            )
        ]
        summary = self.compiler._compute_arithmetic_summary(rows)
        self.assertEqual(summary["total_coal_tonnes"], 569510.0)
        self.assertEqual(summary["total_ob_m3"], 1262500.0)
        # Stripping ratio = 1262500 / 569510 = 2.22
        self.assertEqual(summary["consolidated_stripping_ratio"], 2.22)
        self.assertEqual(len(summary["row_checks"]), 2)

    def test_topic_modeling_corpus_extraction(self):
        docs = [
            "Daily coal excavation reached peak output across northern dragline benches with shovel-dumper spreads.",
            "Quarterly air quality and water monitoring reports submitted to State Pollution Control Board.",
            "Eighteen BOXN rakes loaded at captive railway siding for NTPC thermal power station.",
            "Statutory DGMS safety inspection completed with zero reportable accidents."
        ]
        result = self.topic_modeler.compute_topics(docs)
        self.assertEqual(result.total_documents, 4)
        self.assertGreater(result.vocabulary_size, 5)
        self.assertEqual(len(result.clusters), 4)
        cluster_names = [c.name for c in result.clusters]
        self.assertIn("Excavation & Production", cluster_names)
        self.assertIn("Environmental Clearances & Forest Land", cluster_names)


if __name__ == "__main__":
    unittest.main()

