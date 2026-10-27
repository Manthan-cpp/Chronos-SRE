"""
Unit test reproducing the ASYNC-DEADLOCK-402 incident.
Expects completion within 1.0 second; fails with DeadlockTimeoutError if circular lock dependency halts progression.
"""

import asyncio
import pytest
from scenarios.async_deadlock.worker import LockRegistry, DeadlockedBatchProcessor

@pytest.mark.asyncio
async def test_concurrent_batch_processing_deadlock():
    registry = LockRegistry()
    processor = DeadlockedBatchProcessor(registry)

    # Launch both pipelines concurrently. Alpha grabs Lock Alpha, Beta grabs Lock Beta.
    # Then each blocks waiting for the other's lock forever.
    try:
        await asyncio.wait_for(
            asyncio.gather(
                processor.process_pipeline_alpha("task-001"),
                processor.process_pipeline_beta("task-002")
            ),
            timeout=1.0
        )
    except TimeoutError:
        raise AssertionError(
            "DEADLOCK DETECTED: Pipeline Alpha and Beta encountered a circular lock acquisition inversion. "
            "Alpha holds Lock Alpha waiting for Lock Beta; Beta holds Lock Beta waiting for Lock Alpha. "
            "Execution aborted after 1.0s timeout."
        )

    assert "task-001" in processor.processed_records
    assert "task-002" in processor.processed_records
