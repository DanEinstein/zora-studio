import json
import os
from collections.abc import AsyncIterator
from typing import Any

import httpx

OLLAMA_BASE = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
MODEL_NAME = os.getenv("OLLAMA_MODEL", "gemma3:1b")
TAGS_URL = f"{OLLAMA_BASE}/api/tags"
GENERATE_URL = f"{OLLAMA_BASE}/api/generate"


def _model_matches(name: str) -> bool:
    return name == MODEL_NAME or MODEL_NAME in name


async def check_ollama() -> tuple[bool, bool]:
    """Return (ollama_reachable, model_ready)."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(TAGS_URL)
            response.raise_for_status()
            payload: dict[str, Any] = response.json()
            models = payload.get("models") or []
            ready = any(
                _model_matches(str(m.get("name", "")))
                or _model_matches(str(m.get("model", "")))
                for m in models
                if isinstance(m, dict)
            )
            return True, ready
    except Exception:
        return False, False


async def stream_generate(
    system_prompt: str,
    user_prompt: str,
) -> AsyncIterator[str]:
    """Stream tokens from Ollama /api/generate (NDJSON)."""
    payload = {
        "model": MODEL_NAME,
        "prompt": user_prompt,
        "system": system_prompt,
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream("POST", GENERATE_URL, json=payload) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line.strip():
                    continue
                try:
                    chunk = json.loads(line)
                except json.JSONDecodeError:
                    continue

                if chunk.get("error"):
                    raise RuntimeError(str(chunk["error"]))

                token = chunk.get("response")
                if token:
                    yield token

                if chunk.get("done"):
                    break
