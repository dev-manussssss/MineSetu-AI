"""
MineSetu AI — Deterministic Arithmetic Engine & Math Guardrails
Prevents LLM math hallucinations by executing deterministic arithmetic over extracted numeric values.
"""

from typing import Dict, Any, List, Optional
import math


class ArithmeticGuard:
    """Computes exact mathematical operations over coal metrics."""

    @staticmethod
    def calculate_stripping_ratio(ob_m3: float, coal_tonnes: float) -> Optional[float]:
        """Stripping ratio = OB removal (m³) / Coal production (Tonnes)."""
        if coal_tonnes <= 0 or ob_m3 < 0:
            return None
        return round(ob_m3 / coal_tonnes, 2)

    @staticmethod
    def calculate_variance(claimed: float, baseline: float) -> Dict[str, Any]:
        """Computes variance and percentage discrepancy against approved baseline."""
        if baseline == 0:
            diff = claimed
            return {
                "claimed": claimed,
                "baseline": baseline,
                "difference": diff,
                "percentage": None,
                "exceeds_threshold": True,
                "direction": "increase" if diff > 0 else ("decrease" if diff < 0 else "neutral")
            }
        diff = claimed - baseline
        pct = round((diff / baseline) * 100.0, 2)
        # 10% threshold for statutory flagging
        exceeds = abs(pct) >= 10.0
        return {
            "claimed": claimed,
            "baseline": baseline,
            "difference": diff,
            "percentage": pct,
            "exceeds_threshold": exceeds,
            "direction": "increase" if diff > 0 else ("decrease" if diff < 0 else "neutral")
        }

    @staticmethod
    def aggregate_totals(items: List[Dict[str, float]], field: str) -> float:
        """Deterministically sums field across multiple items."""
        total = sum(item.get(field, 0.0) for item in items)
        return round(total, 2)
