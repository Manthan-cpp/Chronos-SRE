"""
Async Worker Deadlock Scenario (ASYNC-DEADLOCK-402)
Real concurrency deadlock where two asynchronous batch workers cross-depend on locks.
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
        """Pipeline Alpha acquires Lock A, performs work, then acquires Lock B."""
        logger.info(f"Alpha: Attempting to acquire Lock Alpha for {item_id}")
        async with self.registry.lock_alpha:
            logger.info(f"Alpha: Acquired Lock Alpha for {item_id}")
            # Emulate I/O pause to trigger race condition
            await asyncio.sleep(0.05)
            logger.info(f"Alpha: Attempting to acquire Lock Beta for {item_id}")
            async with self.registry.lock_beta:
                logger.info(f"Alpha: Acquired Lock Beta, completing {item_id}")
                self.processed_records[item_id] = "PROCESSED_BY_ALPHA"

    async def process_pipeline_beta(self, item_id: str) -> None:
        """Pipeline Beta acquires Lock B first, then attempts Lock A (classic circular lock dependency)."""
        logger.info(f"Beta: Attempting to acquire Lock Beta for {item_id}")
        async with self.registry.lock_beta:
            logger.info(f"Beta: Acquired Lock Beta for {item_id}")
            # Emulate I/O pause to trigger race condition
            await asyncio.sleep(0.05)
            logger.info(f"Beta: Attempting to acquire Lock Alpha for {item_id}")
            async with self.registry.lock_alpha:
                logger.info(f"Beta: Acquired Lock Alpha, completing {item_id}")
                self.processed_records[item_id] = "PROCESSED_BY_BETA"
