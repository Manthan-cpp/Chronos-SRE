"""
Scenarios Telemetry Emitter and Runner
Runs real pytest scenarios, extracts crash logs and stack traces, and emits OpenTelemetry-compliant JSON payloads.
"""

import sys
import os
import json
import uuid
import time
import subprocess
from pathlib import Path
from typing import Dict, Any

SCENARIO_MAP = {
    "ASYNC-DEADLOCK-402": {
        "dir": "async_deadlock",
        "test_file": "scenarios/async_deadlock/test_worker.py",
        "service": "order-orchestrator",
        "environment": "production-us-east-1"
    },
    "UPSTREAM-BREAK-501": {
        "dir": "upstream_break",
        "test_file": "scenarios/upstream_break/test_client.py",
        "service": "telemetry-ingress",
        "environment": "production-eu-west-1"
    },
    "POOL-LEAK-503": {
        "dir": "pool_leak",
        "test_file": "scenarios/pool_leak/test_pool.py",
        "service": "billing-database-proxy",
        "environment": "production-us-west-2"
    }
}

# Aliases for convenience
ALIAS_MAP = {
    "async_deadlock": "ASYNC-DEADLOCK-402",
    "upstream_break": "UPSTREAM-BREAK-501",
    "pool_leak": "POOL-LEAK-503"
}

def run_scenario(scenario_key: str) -> Dict[str, Any]:
    norm_key = ALIAS_MAP.get(scenario_key.lower(), scenario_key.upper())
    if norm_key not in SCENARIO_MAP:
        raise ValueError(f"Unknown scenario: {scenario_key}. Valid options: {list(SCENARIO_MAP.keys())}")

    meta = SCENARIO_MAP[norm_key]
    test_path = meta["test_file"]

    start_time = time.time()
    trace_id = uuid.uuid4().hex
    span_id = uuid.uuid4().hex[:16]

    # Run actual pytest runner
    cmd = [sys.executable, "-m", "pytest", test_path, "-v", "--no-header"]
    res = subprocess.run(cmd, capture_output=True, text=True)
    duration_ms = round((time.time() - start_time) * 1000, 2)

    status = "PASSED" if res.returncode == 0 else "FAILED"

    # Extract failure reason from output
    raw_output = res.stdout + "\n" + res.stderr
    error_summary = "All tests passed successfully."
    if status == "FAILED":
        lines = [l for l in raw_output.splitlines() if "FAILED" in l or "Error" in l or "AssertionError" in l]
        error_summary = lines[-1].strip() if lines else "Test execution failed."

    payload = {
        "trace_id": trace_id,
        "span_id": span_id,
        "scenario_id": norm_key,
        "service": meta["service"],
        "environment": meta["environment"],
        "status": status,
        "return_code": res.returncode,
        "duration_ms": duration_ms,
        "error_summary": error_summary,
        "raw_output": raw_output.strip(),
        "attributes": {
            "test_target": test_path,
            "runner_runtime": f"Python {sys.version.split()[0]}",
            "telemetry_format": "OpenTelemetry v1.28.0 compatible"
        }
    }
    return payload

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "ASYNC-DEADLOCK-402"
    result = run_scenario(target)
    print(json.dumps(result, indent=2))
    sys.exit(result["return_code"])
