"""
MineSetu AI — 27 Coal-Sector Portal Connector Registry
Maintains full taxonomy, tier classification, reachability, and adapter mapping.
"""

from typing import Dict, List, Any

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

ALL_27_PORTALS = [
    {"id": 1, "name": "Single Window Clearance System (SWCS / PRIMS)", "url": "https://swcs.coal.gov.in/", "tier": "MVP (Tier 1)", "access": "Public & Restricted"},
    {"id": 2, "name": "SWCS-EXPL (Exploration Clearances)", "url": "https://swcs.coal.gov.in/", "tier": "MVP (Tier 1)", "access": "Restricted"},
    {"id": 3, "name": "Mine Data Management System (MDMS)", "url": "https://mdms.cmpdi.co.in/", "tier": "MVP (Tier 1)", "access": "Restricted (Internal)"},
    {"id": 4, "name": "Online Coal Block Information System (OCBIS)", "url": "https://ocbis.cmpdi.co.in/", "tier": "Tier 2", "access": "Public Search"},
    {"id": 5, "name": "National Coal Portal (NCP)", "url": "https://ncp.cmpdi.co.in/", "tier": "Tier 2", "access": "Public Dashboard"},
    {"id": 6, "name": "CIL Production & Despatch", "url": "https://apps.coalindia.in/ords/f?p=119:2", "tier": "MVP (Tier 1)", "access": "Public Dashboard"},
    {"id": 7, "name": "Uttam Coal Quality App", "url": "https://uttam.coalindia.in/", "tier": "MVP (Tier 1)", "access": "Public Dashboard"},
    {"id": 8, "name": "Coal Directory of India", "url": "https://www.coalcontroller.gov.in/coal-directory-india", "tier": "MVP (Tier 1)", "access": "Public Downloads"},
    {"id": 9, "name": "Coal Controller Dashboard", "url": "https://www.coalcontroller.gov.in/coal-dashboard", "tier": "MVP (Tier 1)", "access": "Public Dashboard"},
    {"id": 10, "name": "Koyla Shakti Coal Dashboard", "url": "https://koylashakti.coal.gov.in/coaldashboard/", "tier": "Tier 2", "access": "Public / Role-Based"},
    {"id": 11, "name": "CLAMP (Coal Land Acquisition & Management)", "url": "https://www.clamp.coal.gov.in/", "tier": "Tier 2", "access": "Public & Restricted"},
    {"id": 12, "name": "CMSMS / Khanan Prahari", "url": "https://cmsms.ncog.gov.in/", "tier": "Tier 3", "access": "Restricted / App"},
    {"id": 13, "name": "Star Rating of Coal Mines", "url": "https://starrating.coal.gov.in/", "tier": "Tier 2", "access": "Public Results"},
    {"id": 14, "name": "PM GatiShakti National Master Plan (Coal Layer)", "url": "https://pmgatishakti.gov.in/", "tier": "Tier 3", "access": "Public & Restricted"},
    {"id": 15, "name": "CMPDI / CIL Technical Publications", "url": "https://www.cmpdi.co.in/", "tier": "MVP (Tier 1)", "access": "Public Documents"},
    {"id": 16, "name": "CIL Document Management System (DMS)", "url": "https://docs.coalindia.in/", "tier": "Tier 2", "access": "Restricted"},
    {"id": 17, "name": "e-Office Coal", "url": "https://coal.eoffice.gov.in/", "tier": "Tier 3", "access": "Restricted"},
    {"id": 18, "name": "e-Samiksha (Coal Sector Projects)", "url": "https://e-samiksha.gov.in/", "tier": "Tier 3", "access": "Restricted"},
    {"id": 19, "name": "PRAYAS (PMO Dashboard)", "url": "https://prayas.nic.in/", "tier": "Tier 3", "access": "Restricted"},
    {"id": 20, "name": "Coal Import Monitoring System (CIMS)", "url": "https://imports.coal.gov.in/", "tier": "Tier 2", "access": "Public / Restricted"},
    {"id": 21, "name": "Third Party Testing Agencies (TPA - CCO)", "url": "https://starrating.coal.gov.in/tpa_cco/", "tier": "Tier 3", "access": "Public & Restricted"},
    {"id": 22, "name": "UGMCA (Underground Mine Capacity Assessment)", "url": "https://ugmca.cmpdi.co.in/", "tier": "Tier 2", "access": "Restricted"},
    {"id": 23, "name": "CIL Integrated Command & Control Centre (ICCC)", "url": "https://iccc.coalindia.in/", "tier": "Tier 3", "access": "Restricted"},
    {"id": 24, "name": "Coal Safety Information System (CSIS)", "url": "https://apps.coalindia.in/ords/f?p=130:LOGIN_DESKTOP", "tier": "Tier 2", "access": "Restricted"},
    {"id": 25, "name": "DigiCoal Transformation Portal", "url": "https://digicoal.cilhq.coalindia.in/", "tier": "Tier 3", "access": "Internal"},
    {"id": 26, "name": "e-MB / e-Billing System", "url": "https://apps.coalindia.in/ords/f?p=247:LOGIN_DESKTOP", "tier": "Tier 3", "access": "Restricted"},
    {"id": 27, "name": "CIL Enterprise Resource Planning (ERP)", "url": "https://www.coalindia.in/", "tier": "Tier 3", "access": "Restricted"},
]


class ConnectorRegistry:
    """Registry coordinating all 27 portal connectors."""

    def __init__(self):
        self._active_connectors: Dict[int, BaseConnector] = {
            1: SWCSConnector(),
            3: MDMSConnector(),
            6: CILProductionConnector(),
            7: UttamQualityConnector(),
            9: CCODashboardConnector(),
            15: CMPDIDocsConnector(),
        }

    def list_all_portals(self) -> List[Dict[str, Any]]:
        """Returns metadata for all 27 portals with connector status."""
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
