"""
Nebius Token Factory Throughput & TTFT Spike Test.
Measures real tokens/second and TTFT for nvidia/llama-3.1-nemotron-70b-instruct.
"""

import sys
import asyncio
import pytest
from backend.src.config import settings
from backend.src.services.nebius_client import nebius_client

@pytest.mark.asyncio
async def test_nebius_client_connectivity():
    if not nebius_client.is_configured:
        pytest.skip("NEBIUS_API_KEY is not configured in backend/.env. Skipping live Nebius Token Factory inference test.")

    print(f"\n[Spike] Connecting to Nebius Token Factory ({settings.nebius_base_url})...")
    print(f"[Spike] Target model: {settings.nemotron_model}")

    prompt = (
        "Explain in 2 sentences why circular lock acquisition in asyncio causes an unrecoverable deadlock."
    )
    
    first_token_received = False
    ttft = 0.0
    tokens_streamed = 0
    full_response = ""

    async for chunk in nebius_client.stream_reasoning(prompt=prompt, max_tokens=150):
        if chunk["token"]:
            if not first_token_received:
                first_token_received = True
                ttft = chunk["ttft"]
                print(f"[Spike] TTFT (Time to First Token): {ttft:.3f}s")
            tokens_streamed += 1
            sys.stdout.write(chunk["token"])
            sys.stdout.flush()
        
        if chunk["is_final"]:
            metrics = chunk["metrics"]
            print("\n------------------------------------------------------------")
            print(f"[Spike] Total completion tokens: {metrics.completion_tokens}")
            print(f"[Spike] Duration: {metrics.duration_seconds}s")
            print(f"[Spike] Throughput: {metrics.tokens_per_second} tokens/sec")
            print("------------------------------------------------------------")
            assert metrics.tokens_per_second > 0
            assert metrics.completion_tokens > 10

if __name__ == "__main__":
    asyncio.run(test_nebius_client_connectivity())
