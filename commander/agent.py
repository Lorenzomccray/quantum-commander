from __future__ import annotations

from typing import Optional

# Configuration
from app.settings import settings

# Provider SDKs
try:
    from openai import OpenAI  # type: ignore
except Exception:  # pragma: no cover
    OpenAI = None  # type: ignore

try:
    import anthropic  # type: ignore
except Exception:  # pragma: no cover
    anthropic = None  # type: ignore

try:
    from groq import Groq  # type: ignore
except Exception:  # pragma: no cover
    Groq = None  # type: ignore


class _EchoAgent:
    def run_persisted(self, message: str) -> str:
        return f"Echo: {message}"


class _OpenAIAgent:
    def __init__(self, api_key: str, model: str):
        if OpenAI is None:
            raise RuntimeError("openai package not available")
        self.client = OpenAI(api_key=api_key)
        self.model = model

    def run_persisted(self, message: str) -> str:
        try:
            resp = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": message}],
                temperature=0.2,
                max_tokens=400,
            )
            return (resp.choices[0].message.content or "").strip()
        except Exception as e:
            return f"Error: {e}"


class _AnthropicAgent:
    def __init__(self, api_key: str, model: str):
        if anthropic is None:
            raise RuntimeError("anthropic package not available")
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = model

    def run_persisted(self, message: str) -> str:
        try:
            msg = self.client.messages.create(
                model=self.model,
                max_tokens=400,
                temperature=0.2,
                messages=[{"role": "user", "content": message}],
            )
            # msg.content is a list of content blocks
            parts = []
            for block in getattr(msg, "content", []) or []:
                if getattr(block, "type", None) == "text":
                    parts.append(getattr(block, "text", ""))
            return "".join(parts).strip() or "(no content)"
        except Exception as e:
            return f"Error: {e}"


class _GroqAgent:
    def __init__(self, api_key: str, model: str):
        if Groq is None:
            raise RuntimeError("groq package not available")
        self.client = Groq(api_key=api_key)
        self.model = model

    def run_persisted(self, message: str) -> str:
        try:
            resp = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": message}],
                temperature=0.2,
                max_tokens=400,
            )
            return (resp.choices[0].message.content or "").strip()
        except Exception as e:
            return f"Error: {e}"


def make_agent():
    provider = (settings.MODEL_PROVIDER or "openai").lower()

    if provider == "openai" and settings.OPENAI_API_KEY:
        try:
            return _OpenAIAgent(api_key=settings.OPENAI_API_KEY, model=settings.OPENAI_MODEL)
        except Exception as e:
            return _EchoAgent()

    if provider == "anthropic" and settings.ANTHROPIC_API_KEY:
        try:
            return _AnthropicAgent(api_key=settings.ANTHROPIC_API_KEY, model=settings.ANTHROPIC_MODEL)
        except Exception:
            return _EchoAgent()

    if provider == "groq" and settings.GROQ_API_KEY:
        try:
            return _GroqAgent(api_key=settings.GROQ_API_KEY, model=settings.GROQ_MODEL)
        except Exception:
            return _EchoAgent()

    # Fallback if no provider/keys
    return _EchoAgent()

