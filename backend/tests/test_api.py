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
        assert data["status"] in ("success", "fallback")
        assert "pr_url" in data

@pytest.mark.asyncio
async def test_repo_connect_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/repo/connect", json={"repoUrl": "Manthan-cpp/Chronos-SRE"})
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["repoInfo"]["name"] == "Chronos-SRE"
        assert "fileTree" in data

@pytest.mark.asyncio
async def test_incident_discover_mode_b_stacktrace():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post(
            "/api/incident/discover",
            json={
                "repoUrl": "Manthan-cpp/Chronos-SRE",
                "manualLog": 'File "backend/src/main.py", line 42, in test\nZeroDivisionError: division by zero'
            }
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["mode"] == "manual_stacktrace"
        assert len(data["scenarios"]) == 1
        assert "backend/src/main.py" in data["scenarios"][0]["failingFile"]
