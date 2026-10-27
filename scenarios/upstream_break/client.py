"""
Third-Party Upstream Deprecation Scenario (UPSTREAM-BREAK-501)
Simulates an upstream breaking package upgrade where a keyword parameter was deprecated and removed.
"""

import logging
from typing import Dict, Any

logger = logging.getLogger("upstream_client")

class UpstreamGateway:
    """Upstream library (e.g. upgraded to v2.4.0 where 'strict_mode' was deprecated and removed in favor of 'validation_level')."""
    def __init__(self, endpoint: str, timeout: float = 10.0, validation_level: str = "strict"):
        self.endpoint = endpoint
        self.timeout = timeout
        self.validation_level = validation_level

    def query(self, resource_id: str) -> Dict[str, Any]:
        return {
            "status": "success",
            "resource_id": resource_id,
            "latency_ms": 42.1,
            "region": "us-east-nebius"
        }

class TelemetryIngressClient:
    def __init__(self, endpoint: str):
        self.endpoint = endpoint

    def get_resource_telemetry(self, resource_id: str) -> Dict[str, Any]:
        # BUG: The engineer used deprecated keyword argument `strict_mode=True` which no longer exists in UpstreamGateway v2.4.0
        gateway = UpstreamGateway(
            endpoint=self.endpoint,
            timeout=5.0,
            strict_mode=True  # BREAKING CHANGE: Raises TypeError
        )
        return gateway.query(resource_id)
