"""
MineSetu AI — 6 MVP Coal Portal Connectors
Implements adapters for SWCS, MDMS, CIL Production, Uttam Quality, CCO, and CMPDI Docs.
"""

from typing import List, Optional

try:
    from .base import BaseConnector, PortalRecord
except (ImportError, ValueError):
    try:
        from connectors.base import BaseConnector, PortalRecord
    except (ImportError, ValueError):
        from base import BaseConnector, PortalRecord


class SWCSConnector(BaseConnector):
    """Portal #1 / #2: Single Window Clearance System (SWCS & SWCS-EXPL)."""

    def __init__(self):
        super().__init__(
            portal_id=1,
            portal_name="Single Window Clearance System (SWCS / PRIMS)",
            portal_url="https://swcs.coal.gov.in/",
            tier="MVP (Tier 1)",
            access_type="Public & Restricted"
        )

    def fetch_records(self, period: Optional[str] = "Q2 FY 2026") -> List[PortalRecord]:
        return [
            PortalRecord(
                portal_id=1,
                portal_name=self.portal_name,
                source_url=f"{self.portal_url}proposals/ECL-2026-089",
                record_type="statutory_clearance",
                period=period or "Current",
                subsidiary="ECL",
                mine_name="Rajmahal OCP",
                data={
                    "stage_ii_forest_clearance": "Approved",
                    "consent_to_operate_validity": "2028-03-31",
                    "ec_capacity_mtpa": 17.0,
                    "application_number": "SWCS/EC/2026/089"
                }
            )
        ]


class MDMSConnector(BaseConnector):
    """Portal #3: Mine Data Management System (MDMS) — Core Synthetic Extension Model."""

    def __init__(self):
        super().__init__(
            portal_id=3,
            portal_name="Mine Data Management System (MDMS)",
            portal_url="https://mdms.cmpdi.co.in/",
            tier="MVP (Tier 1)",
            access_type="Restricted (Internal Extension Model)"
        )

    def fetch_records(self, period: Optional[str] = "August 2026") -> List[PortalRecord]:
        return [
            PortalRecord(
                portal_id=3,
                portal_name=self.portal_name,
                source_url=f"{self.portal_url}api/v1/returns/ECL/Rajmahal/2026-08",
                record_type="production_return",
                period=period or "Current",
                subsidiary="ECL",
                mine_name="Rajmahal OCP",
                data={
                    "coal_prod_tonnes": 45210.0,
                    "ob_removal_m3": 142500.0,
                    "despatch_tonnes": 41800.0,
                    "stripping_ratio": 3.15,
                    "status": "pending_verification"
                }
            ),
            PortalRecord(
                portal_id=3,
                portal_name=self.portal_name,
                source_url=f"{self.portal_url}api/v1/returns/SECL/Gevra/2026-08",
                record_type="production_return",
                period=period or "Current",
                subsidiary="SECL",
                mine_name="Gevra Mega OCP",
                data={
                    "coal_prod_tonnes": 524300.0,
                    "ob_removal_m3": 1120000.0,
                    "despatch_tonnes": 510000.0,
                    "stripping_ratio": 2.14,
                    "status": "approved"
                }
            )
        ]


class CILProductionConnector(BaseConnector):
    """Portal #6: CIL Production & Despatch Dashboard (Oracle APEX)."""

    def __init__(self):
        super().__init__(
            portal_id=6,
            portal_name="Coal India Limited Production & Despatch",
            portal_url="https://apps.coalindia.in/ords/f?p=119:2",
            tier="MVP (Tier 1)",
            access_type="Public Dashboard"
        )

    def fetch_records(self, period: Optional[str] = "August 2026") -> List[PortalRecord]:
        return [
            PortalRecord(
                portal_id=6,
                portal_name=self.portal_name,
                source_url=f"{self.portal_url}&p_period=202608",
                record_type="macro_subsidiary_kpi",
                period=period or "August 2026",
                subsidiary="CIL Consolidated",
                mine_name=None,
                data={
                    "total_production_mt": 53.6,
                    "target_production_mt": 55.0,
                    "achievement_pct": 97.4,
                    "total_offtake_mt": 56.2,
                    "growth_yoy_pct": 4.8
                }
            )
        ]


class UttamQualityConnector(BaseConnector):
    """Portal #7: Uttam Third-Party Coal Quality Dashboard."""

    def __init__(self):
        super().__init__(
            portal_id=7,
            portal_name="Uttam Coal Quality Management",
            portal_url="https://uttam.coalindia.in/",
            tier="MVP (Tier 1)",
            access_type="Public Dashboard"
        )

    def fetch_records(self, period: Optional[str] = "August 2026") -> List[PortalRecord]:
        return [
            PortalRecord(
                portal_id=7,
                portal_name=self.portal_name,
                source_url=f"{self.portal_url}analytics/quality?sub=ECL&colliery=Rajmahal",
                record_type="third_party_analysis",
                period=period or "August 2026",
                subsidiary="ECL",
                mine_name="Rajmahal OCP",
                data={
                    "declared_grade": "G11",
                    "analyzed_grade": "G11",
                    "mean_gcv_kcal_kg": 4120,
                    "mean_ash_pct": 38.4,
                    "mean_moisture_pct": 8.2,
                    "grade_conformity_pct": 98.1
                }
            )
        ]


class CCODashboardConnector(BaseConnector):
    """Portal #8 / #9: Coal Controller Organization Directory & Dashboard."""

    def __init__(self):
        super().__init__(
            portal_id=9,
            portal_name="Coal Controller Organization Statistics",
            portal_url="https://www.coalcontroller.gov.in/coal-dashboard",
            tier="MVP (Tier 1)",
            access_type="Public Downloads & Dashboard"
        )

    def fetch_records(self, period: Optional[str] = "FY 2025-26") -> List[PortalRecord]:
        return [
            PortalRecord(
                portal_id=9,
                portal_name=self.portal_name,
                source_url=f"{self.portal_url}/monthly-review-aug-2026.pdf",
                record_type="national_coal_statistics",
                period=period or "FY 2025-26",
                subsidiary="National Total",
                mine_name=None,
                data={
                    "all_india_coal_production_mt": 72.8,
                    "coking_coal_mt": 5.4,
                    "non_coking_coal_mt": 67.4,
                    "captive_commercial_prod_mt": 14.1
                }
            )
        ]


class CMPDIDocsConnector(BaseConnector):
    """Portal #15: CMPDI / CIL Technical Publications & Geological Archives."""

    def __init__(self):
        super().__init__(
            portal_id=15,
            portal_name="CMPDI Technical Documentation & Geological Reports",
            portal_url="https://www.cmpdi.co.in/",
            tier="MVP (Tier 1)",
            access_type="Public Documents"
        )

    def fetch_records(self, period: Optional[str] = "2026") -> List[PortalRecord]:
        return [
            PortalRecord(
                portal_id=15,
                portal_name=self.portal_name,
                source_url=f"{self.portal_url}publications/geological_report_rajmahal_block_b.pdf",
                record_type="geological_reserve_estimate",
                period=period or "2026",
                subsidiary="ECL",
                mine_name="Rajmahal Block B",
                data={
                    "measured_reserves_mt": 284.5,
                    "indicated_reserves_mt": 112.0,
                    "seam_thickness_mean_m": 12.4,
                    "calorific_value_mean": "G11-G12"
                }
            )
        ]
