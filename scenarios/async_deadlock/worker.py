"""
Async Worker Deadlock Scenario (ASYNC-DEADLOCK-402) - RESOLVED
Enforces global deterministic lock ordering (Lock Alpha before Lock Beta) to eliminate circular waiting.
"""

import asyncio
import logging
from typing import Dict, Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("worker")

class LockRegistry:
    def __init__(self):
        self.lock_alpha = asyncio.Lock()
        self.lock_beta = asyncio.Lock()

class DeadlockedBatchProcessor:
    def __init__(self, registry: LockRegistry):
        self.registry = registry
        self.processed_records: Dict[str, Any] = {}

    async def process_pipeline_alpha(self, item_id: str) -> None:
        async with self.registry.lock_alpha:
            await asyncio.sleep(0.01)
            async with self.registry.lock_beta:
                self.processed_records[item_id] = "PROCESSED_BY_ALPHA"

    async def process_pipeline_beta(self, item_id: str) -> None:
        # FIX: Acquire Lock Alpha FIRST to preserve deterministic hierarchy
        async with self.registry.lock_alpha:
            await asyncio.sleep(0.01)
            async with self.registry.lock_beta:
                self.processed_records[item_id] = "PROCESSED_BY_BETA"
