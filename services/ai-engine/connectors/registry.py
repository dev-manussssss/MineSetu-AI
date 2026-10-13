"""
MineSetu AI — 27 Coal-Sector Portal Connector Registry
Maintains full taxonomy, tier classification, reachability, access classification,
idempotent ingestion, and cross-reference discrepancy detection.
"""

from typing import Dict, List, Any, Optional, Set
import hashlib
from datetime import datetime, timezone

try:
    from .base import BaseConnector, PortalRecord
    from .mvp_connectors import (
        SWCSConnector,
        MDMSConnector,
        CILProductionConnector,
        UttamQualityConnector,
        CCODashboardConnector,
        CMPDIDocsConnector,
    )
except (ImportError, ValueError):
    try:
        from connectors.base import BaseConnector, PortalRecord
        from connectors.mvp_connectors import (
            SWCSConnector,
            MDMSConnector,
            CILProductionConnector,
            UttamQualityConnector,
            CCODashboardConnector,
            CMPDIDocsConnector,
        )
    except (ImportError, ValueError):
        from base import BaseConnector, PortalRecord
        from mvp_connectors import (
            SWCSConnector,
            MDMSConnector,
            CILProductionConnector,
            UttamQualityConnector,
            CCODashboardConnector,
            CMPDIDocsConnector,
        )

# Full taxonomy of all 27 statutory coal sector portals
ALL_27_PORTALS = [
    {
        "id": 1,
        "name": "Single Window Clearance System (SWCS / PRIMS)",
        "url": "https://swcs.coal.gov.in/",
        "tier": "MVP (Tier 1)",
        "access": "Public & Restricted",
        "access_classification": "restricted_internal"
    },
    {
        "id": 2,
        "name": "SWCS-EXPL (Exploration Clearances)",
        "url": "https://swcs.coal.gov.in/",
        "tier": "MVP (Tier 1)",
        "access": "Restricted",
        "access_classification": "restricted_internal"
    },
    {
        "id": 3,
        "name": "Mine Data Management System (MDMS)",
        "url": "https://mdms.cmpdi.co.in/",
        "tier": "MVP (Tier 1)",
        "access": "Restricted (Internal)",
        "access_classification": "restricted_internal"
    },
    {
        "id": 4,
        "name": "Online Coal Block Information System (OCBIS)",
        "url": "https://ocbis.cmpdi.co.in/",
        "tier": "Tier 2",
        "access": "Public Search",
        "access_classification": "verified_static_snapshot"
    },
    {
        "id": 5,
        "name": "National Coal Portal (NCP)",
        "url": "https://ncp.cmpdi.co.in/",
        "tier": "Tier 2",
        "access": "Public Dashboard",
        "access_classification": "verified_static_snapshot"
    },
    {
        "id": 6,
        "name": "CIL Production & Despatch",
        "url": "https://apps.coalindia.in/ords/f?p=119:2",
        "tier": "MVP (Tier 1)",
        "access": "Public Dashboard",
        "access_classification": "live_pollable"
    },
    {
        "id": 7,
        "name": "Uttam Coal Quality App",
        "url": "https://uttam.coalindia.in/",
        "tier": "MVP (Tier 1)",
        "access": "Public Dashboard",
        "access_classification": "live_pollable"
    },
    {
        "id": 8,
        "name": "Coal Directory of India",
        "url": "https://www.coalcontroller.gov.in/coal-directory-india",
        "tier": "MVP (Tier 1)",
        "access": "Public Downloads",
        "access_classification": "verified_static_snapshot"
    },
    {
        "id": 9,
        "name": "Coal Controller Dashboard",
        "url": "https://www.coalcontroller.gov.in/coal-dashboard",
        "tier": "MVP (Tier 1)",
        "access": "Public Dashboard",
        "access_classification": "live_pollable"
    },
    {
        "id": 10,
        "name": "Koyla Shakti Coal Dashboard",
        "url": "https://koylashakti.coal.gov.in/coaldashboard/",
        "tier": "Tier 2",
        "access": "Public / Role-Based",
        "access_classification": "live_pollable"
    },
    {
        "id": 11,
        "name": "CLAMP (Coal Land Acquisition & Management)",
        "url": "https://www.clamp.coal.gov.in/",
        "tier": "Tier 2",
        "access": "Public & Restricted",
        "access_classification": "restricted_internal"
    },
    {
        "id": 12,
        "name": "CMSMS / Khanan Prahari",
        "url": "https://cmsms.ncog.gov.in/",
        "tier": "Tier 3",
        "access": "Restricted / App",
        "access_classification": "blocked_restricted"
    },
    {
        "id": 13,
        "name": "Star Rating of Coal Mines",
        "url": "https://starrating.coal.gov.in/",
        "tier": "Tier 2",
        "access": "Public Results",
        "access_classification": "live_pollable"
    },
    {
        "id": 14,
        "name": "PM GatiShakti National Master Plan (Coal Layer)",
        "url": "https://pmgatishakti.gov.in/",
        "tier": "Tier 3",
        "access": "Public & Restricted",
        "access_classification": "blocked_restricted"
    },
    {
        "id": 15,
        "name": "CMPDI / CIL Technical Publications",
        "url": "https://www.cmpdi.co.in/",
        "tier": "MVP (Tier 1)",
        "access": "Public Documents",
        "access_classification": "verified_static_snapshot"
    },
    {
        "id": 16,
        "name": "CIL Document Management System (DMS)",
        "url": "https://docs.coalindia.in/",
        "tier": "Tier 2",
        "access": "Restricted",
        "access_classification": "restricted_internal"
    },
    {
        "id": 17,
        "name": "e-Office Coal",
        "url": "https://coal.eoffice.gov.in/",
        "tier": "Tier 3",
        "access": "Restricted",
        "access_classification": "restricted_internal"
    },
    {
        "id": 18,
        "name": "e-Samiksha (Coal Sector Projects)",
        "url": "https://e-samiksha.gov.in/",
        "tier": "Tier 3",
        "access": "Restricted",
        "access_classification": "blocked_restricted"
    },
    {
        "id": 19,
        "name": "PRAYAS (PMO Dashboard)",
        "url": "https://prayas.nic.in/",
        "tier": "Tier 3",
        "access": "Restricted",
        "access_classification": "blocked_restricted"
    },
    {
        "id": 20,
        "name": "Coal Import Monitoring System (CIMS)",
        "url": "https://imports.coal.gov.in/",
        "tier": "Tier 2",
        "access": "Public / Restricted",
        "access_classification": "verified_static_snapshot"
    },
    {
        "id": 21,
        "name": "Third Party Testing Agencies (TPA - CCO)",
        "url": "https://starrating.coal.gov.in/tpa_cco/",
        "tier": "Tier 3",
        "access": "Public & Restricted",
        "access_classification": "blocked_restricted"
    },
    {
        "id": 22,
        "name": "UGMCA (Underground Mine Capacity Assessment)",
        "url": "https://ugmca.cmpdi.co.in/",
        "tier": "Tier 2",
        "access": "Restricted",
        "access_classification": "restricted_internal"
    },
    {
        "id": 23,
        "name": "CIL Integrated Command & Control Centre (ICCC)",
        "url": "https://iccc.coalindia.in/",
        "tier": "Tier 3",
        "access": "Restricted",
        "access_classification": "blocked_restricted"
    },
    {
        "id": 24,
        "name": "Coal Safety Information System (CSIS)",
        "url": "https://apps.coalindia.in/ords/f?p=130:LOGIN_DESKTOP",
        "tier": "Tier 2",
        "access": "Restricted",
        "access_classification": "restricted_internal"
    },
    {
        "id": 25,
        "name": "DigiCoal Transformation Portal",
        "url": "https://digicoal.cilhq.coalindia.in/",
        "tier": "Tier 3",
        "access": "Internal",
        "access_classification": "restricted_internal"
    },
    {
        "id": 26,
        "name": "e-MB / e-Billing System",
        "url": "https://apps.coalindia.in/ords/f?p=247:LOGIN_DESKTOP",
        "tier": "Tier 3",
        "access": "Restricted",
        "access_classification": "restricted_internal"
    },
    {
        "id": 27,
        "name": "CIL Enterprise Resource Planning (ERP)",
        "url": "https://www.coalindia.in/",
        "tier": "Tier 3",
        "access": "Restricted",
        "access_classification": "restricted_internal"
    },
]


class ConnectorRegistry:
    """Registry coordinating all 27 portal connectors with idempotent deduplication and cross-checks."""

    def __init__(self):
        self._active_connectors: Dict[int, BaseConnector] = {
            1: SWCSConnector(),
            3: MDMSConnector(),
            6: CILProductionConnector(),
            7: UttamQualityConnector(),
            9: CCODashboardConnector(),
            15: CMPDIDocsConnector(),
        }
        self._ingested_hashes: Set[str] = set()

    def list_all_portals(self) -> List[Dict[str, Any]]:
        """Returns metadata for all 27 portals with connector status and honest access classification."""
        result = []
        for p in ALL_27_PORTALS:
            is_active = p["id"] in self._active_connectors
            result.append({
                **p,
                "has_active_adapter": is_active,
                "status": "connected" if is_active else "planned"
            })
        return result

    def get_connector(self, portal_id: int) -> BaseConnector:
        if portal_id in self._active_connectors:
            return self._active_connectors[portal_id]
        raise ValueError(f"Portal adapter {portal_id} is planned but not active in MVP.")

    def fetch_all_mvp_records(self, period: str = "August 2026") -> List[PortalRecord]:
        """Harvests records across all 6 active MVP adapters."""
        all_records = []
        for portal_id, connector in self._active_connectors.items():
            records = connector.fetch_records(period=period)
            all_records.extend(records)
        return all_records

    def ingest_all_idempotent(
        self,
        period: str = "August 2026",
        existing_hashes: Optional[Set[str]] = None
    ) -> Dict[str, Any]:
        """
        Idempotent ingestion across active adapters.
        Skips records whose SHA-256 content_hash was previously ingested.
        """
        known_hashes = existing_hashes if existing_hashes is not None else self._ingested_hashes
        all_fetched = self.fetch_all_mvp_records(period=period)

        new_records = []
        duplicate_count = 0

        for rec in all_fetched:
            if rec.content_hash in known_hashes:
                duplicate_count += 1
            else:
                new_records.append(rec)
                known_hashes.add(rec.content_hash)
                self._ingested_hashes.add(rec.content_hash)

        return {
            "period": period,
            "total_processed": len(all_fetched),
            "new_records_count": len(new_records),
            "duplicate_count": duplicate_count,
            "new_records": [r.to_dict() for r in new_records],
            "synced_at": datetime.now(timezone.utc).isoformat()
        }

    def detect_discrepancies(self, records: Optional[List[PortalRecord]] = None) -> List[Dict[str, Any]]:
        """
        Cross-references official public macro figures (CCO / CIL statistics)
        against colliery returns (MDMS / subsidiary returns) and statutory targets.
        """
        recs = records or self.fetch_all_mvp_records()
        discrepancies = []

        # Find CCO national and CIL consolidated figures
        cco_rec = next((r for r in recs if r.portal_id == 9), None)
        cil_rec = next((r for r in recs if r.portal_id == 6), None)
        mdms_recs = [r for r in recs if r.portal_id == 3]

        if cco_rec and cil_rec:
            cco_prod = cco_rec.data.get("all_india_coal_production_mt", 0.0)
            cil_prod = cil_rec.data.get("total_production_mt", 0.0)
            captive_commercial = cco_rec.data.get("captive_commercial_prod_mt", 0.0)

            # Check: All-India should equal CIL + Captive/Commercial + SCCL
            expected_min = cil_prod + captive_commercial
            if cco_prod < expected_min:
                diff = round(expected_min - cco_prod, 2)
                discrepancies.append({
                    "type": "national_consolidation_variance",
                    "severity": "medium",
                    "metric": "all_india_coal_production_mt",
                    "reported_cco": cco_prod,
                    "reported_cil": cil_prod,
                    "captive_commercial": captive_commercial,
                    "variance_mt": diff,
                    "explanation": f"CCO national total ({cco_prod} MT) is lower than CIL ({cil_prod} MT) + Captive ({captive_commercial} MT). Verify reporting cut-off dates."
                })

        # Check colliery returns against stripping ratio baselines
        for mr in mdms_recs:
            sr = mr.data.get("stripping_ratio", 0.0)
            coal = mr.data.get("coal_prod_tonnes", 0.0)
            ob = mr.data.get("ob_removal_m3", 0.0)

            if coal > 0 and ob > 0:
                expected_sr = round(ob / coal, 2)
                if abs(expected_sr - sr) > 0.05:
                    discrepancies.append({
                        "type": "colliery_stripping_ratio_mismatch",
                        "severity": "high",
                        "mine_name": mr.mine_name,
                        "subsidiary": mr.subsidiary,
                        "reported_ratio": sr,
                        "computed_ratio": expected_sr,
                        "variance": round(abs(expected_sr - sr), 2),
                        "explanation": f"Reported stripping ratio ({sr}) does not match OB/Coal calculation ({expected_sr}) for {mr.mine_name}."
                    })

        return discrepancies
