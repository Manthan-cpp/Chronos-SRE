"""
Tavily Search Grounding Spike Test.
Verifies real-time live search queries against package changelogs and GitHub issues.
"""

import pytest
from backend.src.services.tavily_search import tavily_service

def test_tavily_search_resolution():
    query = "Python asyncio Lock circular dependency deadlock prevention"
    results = tavily_service.search_errata(query, max_results=2)
    assert len(results) > 0
    assert "title" in results[0]
    assert "snippet" in results[0]
    print(f"\n[Tavily Spike] Successfully retrieved {len(results)} search results for query: '{query}'")
    for r in results:
        print(f" - {r['title']} ({r.get('url', 'no-url')})")

if __name__ == "__main__":
    test_tavily_search_resolution()
