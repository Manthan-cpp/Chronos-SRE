"""
Configuration module for Chronos-SRE.
Validates environment variables and provides sensible fallbacks for development.
"""
import os
from pathlib import Path
from dataclasses import dataclass, field

# Base paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BACKEND_DIR.parent
SCENARIOS_DIR = ROOT_DIR / "scenarios"

# Try loading .env if python-dotenv is present, otherwise read os.environ
try:
    from dotenv import load_dotenv
    load_dotenv(BACKEND_DIR / ".env")
except ImportError:
    pass

def default_cors() -> list[str]:
    raw_cors = os.getenv("CORS_ORIGINS", "")
    if raw_cors.strip():
        return [origin.strip() for origin in raw_cors.split(",") if origin.strip()]
    return ["http://localhost:3000", "http://127.0.0.1:3000"]

@dataclass
class Settings:
    nebius_api_key: str = os.getenv("NEBIUS_API_KEY", "")
    nebius_base_url: str = os.getenv("NEBIUS_BASE_URL", "https://api.studio.nebius.ai/v1/")
    nemotron_model: str = os.getenv("NEMOTRON_MODEL", "nvidia/nemotron-3.5-bolt-e4b")
    
    tavily_api_key: str = os.getenv("TAVILY_API_KEY", "")
    
    github_token: str = os.getenv("GITHUB_TOKEN", "")
    github_default_repo: str = os.getenv("GITHUB_DEFAULT_REPO", "")
    
    port: int = int(os.getenv("PORT", "8000"))
    host: str = os.getenv("HOST", "0.0.0.0")
    cors_origins: list[str] = field(default_factory=default_cors)

    def validate_keys(self) -> dict[str, bool]:
        """Check status of required integration keys."""
        return {
            "nebius": bool(self.nebius_api_key and self.nebius_api_key != "your_nebius_token_factory_key_here"),
            "tavily": bool(self.tavily_api_key and self.tavily_api_key != "your_tavily_api_key_here"),
            "github": bool(self.github_token and self.github_token != "your_github_pat_here"),
        }

settings = Settings()

if __name__ == "__main__":
    statuses = settings.validate_keys()
    print("========================================")
    print(" Chronos-SRE Environment Status")
    print("========================================")
    for service, is_active in statuses.items():
        status_str = "[OK] Configured" if is_active else "[MISSING / PLACEHOLDER]"
        print(f" {service.upper():<10}: {status_str}")
    print("========================================")
