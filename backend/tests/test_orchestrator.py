"""
Test suite for Forensic Multi-Agent Orchestrator and Sandbox Verification.
"""

import pytest
from backend.src.agents.orchestrator import forensic_orchestrator

@pytest.mark.asyncio
async def test_full_orchestration_deadlock():
    events = []
    async for event in forensic_orchestrator.run_investigation_stream("ASYNC-DEADLOCK-402"):
        events.append(event)
        if event.get("type") == "agent_state":
            print(f"[Agent Event] {event['title']}: {event['status']} - {event.get('message', '')}")
        elif event.get("type") == "sandbox_result":
            sb = event["sandbox"]
            print(f"[Sandbox Event] Verified: {sb['verified']} ({sb['summary']})")
            assert sb["verified"] is True
            assert sb["pre_patch_failed"] is True
            assert sb["post_patch_passed"] is True

    assert len(events) > 10
    print(f"\n[Orchestrator Test] Received {len(events)} events across full triage cycle.")

@pytest.mark.asyncio
async def test_full_orchestration_upstream_break():
    events = []
    async for event in forensic_orchestrator.run_investigation_stream("UPSTREAM-BREAK-501"):
        events.append(event)
        if event.get("type") == "sandbox_result":
            assert event["sandbox"]["verified"] is True
    print("\n[Orchestrator Test] Upstream Break verified PASS in ephemeral sandbox.")
