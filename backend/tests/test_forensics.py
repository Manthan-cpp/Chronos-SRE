"""
Test suite for Telemetry Sifter and Git AST Inspector.
"""

from pathlib import Path
from backend.src.forensics.sifter import telemetry_sifter
from backend.src.forensics.git_ast import code_ast_inspector
from scenarios.runner import run_scenario

def test_telemetry_sifting_on_deadlock():
    telemetry = run_scenario("ASYNC-DEADLOCK-402")
    sifted = telemetry_sifter.sift(
        scenario_id="ASYNC-DEADLOCK-402",
        service=telemetry["service"],
        raw_output=telemetry["raw_output"]
    )
    assert sifted.exception_type in ["AssertionError", "TimeoutError"]
    assert "DEADLOCK DETECTED" in sifted.error_message or "worker.py" in sifted.stack_trace_snippet
    print(f"\n[Forensics Test] Successfully sifted {sifted.scenario_id}: {sifted.exception_type}")

def test_ast_inspector_on_upstream_break():
    target = Path("scenarios/upstream_break/client.py")
    analysis = code_ast_inspector.analyze_file(target)
    assert "calls_with_kwargs" in analysis
    kw_calls = [c for c in analysis["calls_with_kwargs"] if "strict_mode" in c.get("keywords", [])]
    assert len(kw_calls) > 0
    print(f"\n[AST Test] Found suspicious kwargs in {target}: {kw_calls[0]}")
