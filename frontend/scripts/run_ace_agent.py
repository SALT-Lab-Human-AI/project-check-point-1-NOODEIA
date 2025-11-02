"""
Runtime entrypoint for the ACE-enabled LangGraph agent.

Reads a JSON payload from stdin with the following structure:
{
  "messages": [{"role": "...", "content": "..."}],
  "mode": "cot|tot|react|''",
  "scratch": {...},
  "thread_id": "optional-thread-identifier"
}

Writes a JSON response to stdout with the agent's answer, mode,
and any scratch metadata (including ACE delta stats).
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path
import io
import re
from contextlib import redirect_stdout
from typing import Any, Optional

# Ensure local modules are available when spawned with a different cwd
SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from langgraph_agent_ace import build_ace_graph  # noqa: E402
from langgraph_utile import _extract_final  # noqa: E402


def _clean_answer(answer: Optional[str]) -> Optional[str]:
    if not answer:
        return answer
    final = _extract_final(answer)
    if final:
        return final.strip()
    cleaned = re.sub(r"<scratchpad>.*?</scratchpad>", "", answer, flags=re.DOTALL)
    stripped_lines = [ln.strip() for ln in cleaned.splitlines() if ln.strip()]
    if stripped_lines:
        return stripped_lines[-1]
    cleaned_stripped = cleaned.strip()
    return cleaned_stripped or answer


def _log(message: str) -> None:
    """Write structured logs to stderr so Next.js dev server shows the workflow."""
    sys.stderr.write(f"[ACE Runner] {message}\n")
    sys.stderr.flush()


def _load_payload() -> dict:
    """Read and parse the JSON payload from stdin."""
    raw = sys.stdin.read()
    if not raw.strip():
        raise ValueError("No input received on stdin")
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON payload: {exc}") from exc


def _ensure_messages(messages: list | None) -> list:
    """Normalise incoming messages into LangGraph-compatible dictionaries."""
    if not messages:
        return []

    normalised = []
    for msg in messages:
        if not isinstance(msg, dict):
            raise ValueError("Each message must be an object with 'role' and 'content'")
        role = msg.get("role")
        content = msg.get("content")
        if not role or not isinstance(role, str):
            raise ValueError("Message role must be a non-empty string")
        if content is None:
            raise ValueError("Message content must be provided")
        normalised.append({
            "role": role,
            "content": str(content),
        })
    return normalised


def _preview(text: Any, limit: int = 120) -> str:
    if text is None:
        return ""
    text = str(text)
    length = len(text)
    if length <= limit:
        return text
    return f"{text[:limit]}… [len={length}]"


def main() -> int:
    """Execute the ACE agent and emit the response as JSON."""
    payload = _load_payload()
    _log("Received payload from Next.js route")

    messages = _ensure_messages(payload.get("messages"))
    mode = payload.get("mode") or ""
    scratch = payload.get("scratch") or {}

    # Default: enable online learning so ACE can grow its memory
    scratch.setdefault("ace_online_learning", True)

    thread_id = payload.get("thread_id") or f"ace-thread-{int(time.time() * 1000)}"
    truncated_msgs = [
        f"{m.get('role', '?')}: {_preview(m.get('content', ''))}"
        for m in messages
    ]
    _log(
        f"Preparing LangGraph invocation | thread_id={thread_id} | "
        f"mode_hint={'(auto)' if not mode else mode} | messages={len(messages)}"
    )
    for idx, msg in enumerate(truncated_msgs, 1):
        _log(f"  msg[{idx}] {msg}")

    app = build_ace_graph()
    config = {"configurable": {"thread_id": thread_id}}

    state = {
        "messages": messages,
        "mode": mode,
        "scratch": scratch,
        "result": {},
    }

    _log("Invoking LangGraph application")
    log_buffer = io.StringIO()
    with redirect_stdout(log_buffer):
        output = app.invoke(state, config=config)
    log_text = log_buffer.getvalue()
    if log_text:
        _log("LangGraph stdout:")
        for line in log_text.strip().splitlines():
            _log(f"  {line}")

    response = {
        "answer": _clean_answer(output.get("result", {}).get("answer")),
        "mode": output.get("mode"),
        "result": output.get("result", {}),
        "scratch": output.get("scratch", {}),
    }

    ace_delta = response.get("scratch", {}).get("ace_delta")
    _log(
        "Invocation complete | "
        f"mode={response.get('mode')} | "
        f"answer_preview={str(response.get('answer'))[:120]!r} | "
        f"ace_delta={ace_delta or 'n/a'}"
    )

    json.dump(response, sys.stdout, ensure_ascii=False)
    sys.stdout.write("\n")
    sys.stdout.flush()
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # pragma: no cover - surfaced to caller
        # Emit structured error so the caller can surface context
        error_payload = {"error": str(exc)}
        json.dump(error_payload, sys.stdout, ensure_ascii=False)
        sys.stdout.write("\n")
        sys.stdout.flush()
        raise SystemExit(1)
