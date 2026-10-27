"""
Unit test reproducing UPSTREAM-BREAK-501.
Fails with TypeError when constructing the upstream gateway with deprecated parameters.
"""

import pytest
from scenarios.upstream_break.client import TelemetryIngressClient

def test_telemetry_client_query():
    client = TelemetryIngressClient(endpoint="https://telemetry.internal.infra/v1")
    # This invocation will crash with TypeError due to deprecated argument `strict_mode`
    result = client.get_resource_telemetry("pod-40291-x")
    assert result["status"] == "success"
    assert result["resource_id"] == "pod-40291-x"
