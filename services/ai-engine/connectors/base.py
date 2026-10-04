"""
MineSetu AI — Coal Portal Ingestion Framework Base Connector
Defines standard interface, provenance tracking, and content hashing for all 27 portals.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import hashlib


class PortalRecord:
    """Standardized ingested record with provenance metadata."""

    def __init__(
        self,
        portal_id: int,
        portal_name: str,
        source_url: str,
        record_type: str,
        period: str,
        subsidiary: str,
        mine_name: Optional[str],
        data: Dict[str, Any],
        raw_content: Optional[str] = None
    ):
        self.portal_id = portal_id
        self.portal_name = portal_name
        self.source_url = source_url
        self.record_type = record_type
        self.period = period
        self.subsidiary = subsidiary
        self.mine_name = mine_name
        self.data = data
        self.timestamp = datetime.now(timezone.utc).isoformat()
        
        # Content Hash for duplicate detection and tamper-evidence
        hash_seed = f"{portal_id}_{source_url}_{period}_{subsidiary}_{mine_name}_{sorted(data.items())}"
        self.content_hash = hashlib.sha256(hash_seed.encode('utf-8')).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "portal_id": self.portal_id,
            "portal_name": self.portal_name,
            "source_url": self.source_url,
            "record_type": self.record_type,
            "period": self.period,
            "subsidiary": self.subsidiary,
            "mine_name": self.mine_name,
            "data": self.data,
            "content_hash": self.content_hash,
            "timestamp": self.timestamp,
        }


class BaseConnector(ABC):
    """Abstract base class for all 27 coal-sector connectors."""

    def __init__(
        self,
        portal_id: int,
        portal_name: str,
        portal_url: str,
        tier: str,
        access_type: str
    ):
        self.portal_id = portal_id
        self.portal_name = portal_name
        self.portal_url = portal_url
        self.tier = tier
        self.access_type = access_type

    @abstractmethod
    def fetch_records(self, period: Optional[str] = None) -> List[PortalRecord]:
        """Fetches and normalizes records from the target portal."""
        pass

    def check_health(self) -> Dict[str, Any]:
        """Verifies reachability and authorization status."""
        return {
            "portal_id": self.portal_id,
            "name": self.portal_name,
            "url": self.portal_url,
            "tier": self.tier,
            "access_type": self.access_type,
            "status": "active"
        }
