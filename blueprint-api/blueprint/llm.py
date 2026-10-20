"""One call to the model through OpenRouter, strict JSON back (Phase 3b B2).

- The key comes from the environment (on the server only:
  /srv/lubobali-secrets/blueprint.env), never from code or git.
- The answer must fit the pydantic model, or we retry ONCE with the
  validation error, then give up (the caller shows a friendly message).
- Hard limits in code, not in the prompt (OWASP LLM10): max output
  tokens, timeout. The budget breaker lives in the service (B3).
"""

from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass

import httpx
from pydantic import BaseModel, ValidationError

URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "anthropic/claude-opus-5.5"
TIMEOUT_S = 60.0
# Temporary provider errors: one retry after a short pause (B6 eval run saw
# a few minutes of them). Anything else (401, 400, ...) fails at once.
RETRY_STATUS = frozenset({429, 500, 502, 503, 504})
RETRY_PAUSE_S = 2.0


class LLMError(Exception):
    """The model could not give a valid answer (after one retry)."""


@dataclass(frozen=True)
class Result[M: BaseModel]:
    value: M
    cost_usd: float
    tokens_in: int
    tokens_out: int
    tries: int


def _response_format(model: type[BaseModel]) -> dict:
    return {
        "type": "json_schema",
        "json_schema": {"name": model.__name__, "strict": True, "schema": model.model_json_schema()},
    }


def _call(client: httpx.Client, *, key: str, model_id: str, messages: list[dict], fmt: dict, max_tokens: int) -> dict:
    r = client.post(
        URL,
        headers={"Authorization": f"Bearer {key}", "X-Title": "lubobali.com blueprint"},
        json={
            "model": model_id,
            "messages": messages,
            "response_format": fmt,
            "max_tokens": max_tokens,
            "temperature": 0.4,
            "usage": {"include": True},
            # Never route to providers that keep or train on our data.
            "provider": {"data_collection": "deny"},
        },
        timeout=TIMEOUT_S,
    )
    r.raise_for_status()
    return r.json()


def _call_with_retry(client: httpx.Client, **kw) -> dict:
    try:
        return _call(client, **kw)
    except httpx.HTTPStatusError as e:
        if e.response.status_code not in RETRY_STATUS:
            raise
        time.sleep(RETRY_PAUSE_S)
        return _call(client, **kw)


def ask[M: BaseModel](
    messages: list[dict],
    model: type[M],
    *,
    max_tokens: int,
    model_id: str | None = None,
    client: httpx.Client | None = None,
    context: dict | None = None,
) -> Result[M]:
    """Ask once, validate, retry once with the error, else LLMError."""
    key = os.environ.get("OPENROUTER_API_KEY", "")  # server env only, never an argument
    if not key:
        raise LLMError("OPENROUTER_API_KEY is not set")
    model_id = model_id or os.environ.get("BLUEPRINT_MODEL", DEFAULT_MODEL)
    fmt = _response_format(model)
    own = client is None
    client = client or httpx.Client()
    cost = 0.0
    tok_in = tok_out = 0
    msgs = list(messages)
    try:
        for attempt in (1, 2):
            data = _call_with_retry(client, key=key, model_id=model_id, messages=msgs, fmt=fmt, max_tokens=max_tokens)
            usage = data.get("usage") or {}
            cost += float(usage.get("cost") or 0.0)
            tok_in += int(usage.get("prompt_tokens") or 0)
            tok_out += int(usage.get("completion_tokens") or 0)
            text = data["choices"][0]["message"].get("content") or ""
            try:
                value = model.model_validate(json.loads(text), context=context)
                return Result(value=value, cost_usd=cost, tokens_in=tok_in, tokens_out=tok_out, tries=attempt)
            except (json.JSONDecodeError, ValidationError) as e:
                if attempt == 2:
                    raise LLMError(f"invalid answer after retry: {str(e)[:300]}") from e
                msgs = [
                    *messages,
                    {"role": "assistant", "content": text[:4000]},
                    {
                        "role": "user",
                        "content": f"That JSON was rejected: {str(e)[:600]}\nReturn the corrected JSON only.",
                    },
                ]
    except httpx.HTTPStatusError as e:
        raise LLMError(f"model call failed: HTTP {e.response.status_code}") from e
    except httpx.HTTPError as e:
        raise LLMError(f"model call failed: {type(e).__name__}") from e
    finally:
        if own:
            client.close()
    raise LLMError("unreachable")
