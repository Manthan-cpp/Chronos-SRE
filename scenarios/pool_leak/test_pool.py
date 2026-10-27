"""
Unit test reproducing POOL-LEAK-503.
Verifies that consecutive failing requests leak pool connections, causing PoolExhaustedError on healthy requests.
"""

import pytest
from scenarios.pool_leak.pool import AsyncConnectionPool, DatabaseService, PoolExhaustedError

@pytest.mark.asyncio
async def test_connection_pool_leak_and_starvation():
    pool = AsyncConnectionPool(max_connections=3)
    service = DatabaseService(pool)

    # 3 requests fail and leak all 3 available connections
    for i in range(3):
        try:
            await service.handle_user_request(f"usr-{i}", trigger_fault=True)
        except RuntimeError:
            pass  # Application swallowed or logged error, but pool connection was lost

    # The 4th request is completely valid, but the pool is starved (0/3 available)
    # This must crash with PoolExhaustedError
    with pytest.raises(PoolExhaustedError, match="Connection pool exhausted"):
        await service.handle_user_request("usr-healthy-99", trigger_fault=False)
    
    # Asserting that a normal request CANNOT succeed because of the leak
    # In a healthy fixed service, healthy requests should succeed
    raise AssertionError(
        "CRITICAL ALERT: Pool Starvation Confirmed. 3 connections leaked due to unhandled exceptions. "
        "Healthy traffic blocked with PoolExhaustedError."
    )
