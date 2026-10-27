"""
Connection Pool Starvation Scenario (POOL-LEAK-503)
Simulates an asynchronous database connection pool where unhandled exceptions leak connections until starvation occurs.
"""

import asyncio
import logging
from typing import List, Optional

logger = logging.getLogger("db_pool")

class PoolExhaustedError(Exception):
    pass

class PooledConnection:
    def __init__(self, conn_id: int):
        self.conn_id = conn_id
        self.in_use = False

    async def execute(self, query: str) -> str:
        await asyncio.sleep(0.01)
        return f"RESULT_FOR_{query}"

class AsyncConnectionPool:
    def __init__(self, max_connections: int = 3):
        self.max_connections = max_connections
        self._available: List[PooledConnection] = [PooledConnection(i) for i in range(max_connections)]
        self._lock = asyncio.Lock()

    async def acquire(self, timeout: float = 0.5) -> PooledConnection:
        start_time = asyncio.get_event_loop().time()
        while True:
            async with self._lock:
                if self._available:
                    conn = self._available.pop(0)
                    conn.in_use = True
                    return conn
            
            # Check timeout
            elapsed = asyncio.get_event_loop().time() - start_time
            if elapsed >= timeout:
                raise PoolExhaustedError(
                    f"Connection pool exhausted (0/{self.max_connections} available). "
                    f"Timeout waiting for free connection after {timeout:.2f}s."
                )
            await asyncio.sleep(0.05)

    async def release(self, conn: PooledConnection) -> None:
        async with self._lock:
            conn.in_use = False
            self._available.append(conn)

class DatabaseService:
    def __init__(self, pool: AsyncConnectionPool):
        self.pool = pool

    async def handle_user_request(self, user_id: str, trigger_fault: bool = False) -> str:
        # BUG: Connection is acquired directly without a try...finally block or context manager.
        # If an exception occurs, the connection is NEVER returned to the pool!
        conn = await self.pool.acquire(timeout=0.5)
        
        if trigger_fault:
            logger.error(f"Simulating unhandled fault in transaction for user {user_id}")
            raise RuntimeError(f"Database transaction failure on write for user {user_id}")
            
        result = await conn.execute(f"SELECT * FROM users WHERE id = '{user_id}'")
        await self.pool.release(conn)
        return result
