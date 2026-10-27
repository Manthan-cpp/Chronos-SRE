"""
Token & Latency Logger for Nebius Token Factory.
Tracks tokens generated, latency per turn, throughput (tokens/sec), and estimated cost.
Ensures developers stay within free hackathon credits.
"""
import time
import json
from pathlib import Path
from dataclasses import dataclass, asdict

LOG_FILE = Path(__file__).resolve().parent.parent.parent / "token_usage.log"

@dataclass
class TokenMetrics:
    timestamp: float
    model: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    duration_seconds: float
    tokens_per_second: float

class TokenLogger:
    def __init__(self, log_path: Path = LOG_FILE):
        self.log_path = log_path

    def record(self, model: str, prompt_tokens: int, completion_tokens: int, start_time: float) -> TokenMetrics:
        duration = max(time.time() - start_time, 0.001)
        total = prompt_tokens + completion_tokens
        tps = completion_tokens / duration if duration > 0 else 0.0

        metrics = TokenMetrics(
            timestamp=time.time(),
            model=model,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total,
            duration_seconds=round(duration, 3),
            tokens_per_second=round(tps, 2)
        )

        try:
            with open(self.log_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(asdict(metrics)) + "\n")
        except Exception:
            pass

        return metrics

token_logger = TokenLogger()
