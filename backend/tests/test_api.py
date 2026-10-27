"""
Test suite for FastAPI endpoints and SSE event streaming.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.src.main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert "service" in data

@pytest.mark.asyncio
async def test_incident_trigger():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/incident/trigger", json={"scenarioId": "ASYNC-DEADLOCK-402"})
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "started"

@pytest.mark.asyncio
async def test_pr_create_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/pr/create", json={"scenarioId": "ASYNC-DEADLOCK-402"})
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert "pr_url" in data
