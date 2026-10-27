"""
Nebius Token Factory Client for NVIDIA Nemotron-70B.
High-throughput inference client using the OpenAI-compatible SDK pointing to studio.nebius.ai.
"""

import time
import logging
from typing import AsyncGenerator, Dict, Any, List, Optional
from openai import AsyncOpenAI

from backend.src.config import settings
from backend.src.lib.token_logger import token_logger, TokenMetrics

logger = logging.getLogger("nebius_client")

class NebiusClient:
    def __init__(self):
        self.api_key = settings.nebius_api_key
        self.base_url = settings.nebius_base_url
        self.model = settings.nemotron_model
        self._is_active = bool(self.api_key and self.api_key != "your_nebius_token_factory_key_here")
        
        if self._is_active:
            self.client = AsyncOpenAI(
                base_url=self.base_url,
                api_key=self.api_key,
                timeout=60.0
            )
        else:
            self.client = None

    @property
    def is_configured(self) -> bool:
        return self._is_active

    async def stream_reasoning(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 3000
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Streams reasoning tokens from Nemotron-70B.
        Yields dicts with {"token": str, "ttft": float, "is_final": bool, "metrics": TokenMetrics}
        """
        if not self._is_active or not self.client:
            raise RuntimeError(
                "NEBIUS_API_KEY is not configured or contains placeholder in backend/.env. "
                "Please add your Nebius Token Factory key from studio.nebius.ai"
            )

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        start_time = time.time()
        ttft: Optional[float] = None
        completion_tokens = 0
        collected_text = []

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True
        )

        async for chunk in response:
            if not chunk.choices:
                continue
            delta = chunk.choices[0].delta
            content = delta.content or ""
            if content:
                if ttft is None:
                    ttft = round(time.time() - start_time, 3)
                completion_tokens += 1
                collected_text.append(content)
                yield {
                    "token": content,
                    "ttft": ttft,
                    "is_final": False,
                    "metrics": None
                }

        # Estimate prompt tokens (~4 chars/token heuristic or len/4)
        total_prompt_chars = sum(len(m["content"]) for m in messages)
        prompt_tokens = max(1, total_prompt_chars // 4)
        
        metrics = token_logger.record(
            model=self.model,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            start_time=start_time
        )

        yield {
            "token": "",
            "ttft": ttft or round(time.time() - start_time, 3),
            "is_final": True,
            "metrics": metrics,
            "full_text": "".join(collected_text)
        }

nebius_client = NebiusClient()
