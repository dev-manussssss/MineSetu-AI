"""
MineSetu AI — 27 Portal Connectors Test Suite

Tests:
1. Taxonomy and metadata validation for all 27 statutory coal-sector portals
2. Deep functional execution for the 6 active MVP adapters (SWCS, MDMS, CIL Production, Uttam, CCO, CMPDI)
3. Correct labeling and fallback behavior for the 21 registered/staged portals
4. Batch sync and health checks across the connector registry
"""

import sys
import os
import unittest

# Ensure services/ai-engine is on python sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_DIR = os.path.dirname(CURRENT_DIR)
if SERVICE_DIR not in sys.path:
    sys.path.insert(0, SERVICE_DIR)

from connectors.registry import ALL_27_PORTALS, ConnectorRegistry
from connectors.base import BaseConnector, PortalRecord
from connectors.mvp_connectors import (
    SWCSConnector,
    MDMSConnector,
    CILProductionConnector,
    UttamQualityConnector,
    CCODashboardConnector,
    CMPDIDocsConnector,
)


class TestPortalConnectors(unittest.TestCase):
    def setUp(self):
        self.registry = ConnectorRegistry()

    def test_01_all_27_portals_metadata_and_taxonomy(self):
        """Validates all 27 portals exist with complete metadata and proper tiers."""
        self.assertEqual(len(ALL_27_PORTALS), 27, "Must contain exactly 27 coal-sector portals")
        
        seen_ids = set()
        seen_names = set()
        valid_tiers = {"MVP (Tier 1)", "Tier 2", "Tier 3"}

        for p in ALL_27_PORTALS:
            self.assertIn("id", p)
            self.assertIn("name", p)
            self.assertIn("url", p)
            self.assertIn("tier", p)
            self.assertIn("access", p)

            # ID bounds and uniqueness
            self.assertIsInstance(p["id"], int)
            self.assertTrue(1 <= p["id"] <= 27)
            self.assertNotIn(p["id"], seen_ids, f"Duplicate portal ID: {p['id']}")
            seen_ids.add(p["id"])

            # Name uniqueness and URL format
            self.assertNotIn(p["name"], seen_names, f"Duplicate portal name: {p['name']}")
            seen_names.add(p["name"])
            self.assertTrue(p["url"].startswith("http"), f"Invalid portal URL: {p['url']}")

            # Tier classification
            self.assertIn(p["tier"], valid_tiers, f"Invalid tier for portal {p['name']}")

        self.assertEqual(len(seen_ids), 27)

    def test_02_registry_list_all_portals(self):
        """Validates registry list_all_portals marks active vs planned correctly."""
        portals = self.registry.list_all_portals()
        self.assertEqual(len(portals), 27)

        active_ids = {1, 3, 6, 7, 9, 15}
        for p in portals:
            if p["id"] in active_ids:
                self.assertTrue(p["has_active_adapter"], f"Portal {p['id']} should have active adapter")
                self.assertEqual(p["status"], "connected")
            else:
                self.assertFalse(p["has_active_adapter"], f"Portal {p['id']} should be planned")
                self.assertEqual(p["status"], "planned")

    def test_03_active_mvp_connectors_execution(self):
        """Executes real fetch operations on all 6 active MVP adapters."""
        active_ids = [1, 3, 6, 7, 9, 15]

        for pid in active_ids:
            connector = self.registry.get_connector(pid)
            self.assertIsInstance(connector, BaseConnector)
            self.assertEqual(connector.portal_id, pid)

            records = connector.fetch_records()
            self.assertIsInstance(records, list)
            self.assertGreater(len(records), 0, f"Connector {pid} ({connector.portal_name}) returned 0 records")

            for rec in records:
                self.assertIsInstance(rec, PortalRecord)
                self.assertEqual(rec.portal_id, pid)
                self.assertIsNotNone(rec.portal_name)
                self.assertTrue(rec.source_url.startswith("http"))
                self.assertIsInstance(rec.data, dict)
                self.assertGreater(len(rec.data), 0, "Record data must not be empty")

    def test_04_individual_mvp_connector_specifics(self):
        """Verifies domain-specific fields from each MVP connector."""
        # 1. SWCS
        swcs = SWCSConnector()
        swcs_records = swcs.fetch_records()
        self.assertTrue(any("consent_to_operate_validity" in r.data for r in swcs_records))

        # 3. MDMS
        mdms = MDMSConnector()
        mdms_records = mdms.fetch_records()
        self.assertTrue(any("coal_prod_tonnes" in r.data for r in mdms_records))

        # 6. CIL Production
        cil = CILProductionConnector()
        cil_records = cil.fetch_records()
        self.assertTrue(any("total_production_mt" in r.data for r in cil_records))

        # 7. Uttam Coal Quality
        uttam = UttamQualityConnector()
        uttam_records = uttam.fetch_records()
        self.assertTrue(any("declared_grade" in r.data for r in uttam_records))

        # 9. Coal Controller Dashboard
        cco = CCODashboardConnector()
        cco_records = cco.fetch_records()
        self.assertTrue(any("all_india_coal_production_mt" in r.data for r in cco_records))

        # 15. CMPDI Technical Documents
        cmpdi = CMPDIDocsConnector()
        cmpdi_records = cmpdi.fetch_records()
        self.assertTrue(any("measured_reserves_mt" in r.data for r in cmpdi_records))

    def test_05_planned_connectors_throw_value_error(self):
        """Verifies accessing planned connectors safely indicates planned status."""
        planned_ids = [2, 4, 5, 8, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]

        for pid in planned_ids:
            with self.assertRaises(ValueError) as ctx:
                self.registry.get_connector(pid)
            self.assertIn("planned but not active", str(ctx.exception))

    def test_06_batch_sync_active_connectors(self):
        """Verifies syncing all active connectors aggregates multi-portal returns."""
        total_records = 0
        active_ids = [1, 3, 6, 7, 9, 15]

        for pid in active_ids:
            conn = self.registry.get_connector(pid)
            recs = conn.fetch_records()
            total_records += len(recs)

        self.assertGreaterEqual(total_records, 6, "Must yield at least 1 record per active portal")

    def test_07_sha256_provenance_and_tamper_detection(self):
        """Verifies SHA-256 hash determinism and sensitivity to modifications."""
        rec1 = PortalRecord(
            portal_id=1,
            portal_name="SWCS",
            source_url="https://swcs.coal.gov.in/test",
            record_type="statutory",
            period="Q2 FY 2026",
            subsidiary="ECL",
            mine_name="Rajmahal",
            data={"prod": 500.0}
        )
        rec2 = PortalRecord(
            portal_id=1,
            portal_name="SWCS",
            source_url="https://swcs.coal.gov.in/test",
            record_type="statutory",
            period="Q2 FY 2026",
            subsidiary="ECL",
            mine_name="Rajmahal",
            data={"prod": 500.0}
        )
        rec_tampered = PortalRecord(
            portal_id=1,
            portal_name="SWCS",
            source_url="https://swcs.coal.gov.in/test",
            record_type="statutory",
            period="Q2 FY 2026",
            subsidiary="ECL",
            mine_name="Rajmahal",
            data={"prod": 500.1}  # Slight modification
        )

        self.assertEqual(rec1.content_hash, rec2.content_hash, "Identical content must yield identical hash")
        self.assertNotEqual(rec1.content_hash, rec_tampered.content_hash, "Tampered content must yield different hash")
        self.assertEqual(len(rec1.content_hash), 64, "SHA-256 hash must be 64 hex characters")

    def test_08_record_serialization_completeness(self):
        """Verifies that to_dict includes all required provenance and audit keys."""
        rec = PortalRecord(
            portal_id=3,
            portal_name="MDMS",
            source_url="https://mdms.cmpdi.co.in/test",
            record_type="production_return",
            period="August 2026",
            subsidiary="SECL",
            mine_name="Gevra",
            data={"coal_prod_tonnes": 524300.0}
        )
        d = rec.to_dict()
        required_keys = {"portal_id", "portal_name", "source_url", "record_type", "period", "subsidiary", "mine_name", "data", "content_hash", "timestamp"}
        self.assertTrue(required_keys.issubset(d.keys()), f"Missing keys in to_dict: {required_keys - set(d.keys())}")
        self.assertEqual(d["data"]["coal_prod_tonnes"], 524300.0)

    def test_09_connector_health_check_reporting(self):
        """Verifies check_health on all 6 MVP connectors returns active status."""
        active_ids = [1, 3, 6, 7, 9, 15]
        for pid in active_ids:
            conn = self.registry.get_connector(pid)
            health = conn.check_health()
            self.assertEqual(health["portal_id"], pid)
            self.assertEqual(health["status"], "active")
            self.assertIn("tier", health)
            self.assertIn("access_type", health)

    def test_10_fetch_all_mvp_records_convenience_method(self):
        """Verifies fetch_all_mvp_records on the registry returns aggregated list."""
        records = self.registry.fetch_all_mvp_records("August 2026")
        self.assertIsInstance(records, list)
        self.assertGreaterEqual(len(records), 7)  # MDMS returns 2, others return at least 1


if __name__ == "__main__":
    unittest.main()
