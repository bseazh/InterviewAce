from __future__ import annotations

from typing import Tuple


def _normalize_lines(s: str) -> list[str]:
    # Split into lines, strip trailing spaces, drop leading/trailing blank lines
    lines = [ln.rstrip() for ln in (s or "").splitlines()]
    # trim empty head/tail
    while lines and lines[0] == "":
        lines.pop(0)
    while lines and lines[-1] == "":
        lines.pop()
    return lines


def _try_float(v: str):
    try:
        return float(v)
    except Exception:
        return None


def compare_outputs(expected: str, actual: str, mode: str = "exact", float_tol: float = 1e-6) -> Tuple[bool, str]:
    """
    Return (passed, hint)
    - exact: strict string equality after normalizing newlines
    - tolerant: ignore trailing spaces, ignore blank boundary lines, and compare tokens;
      if both tokens numeric, compare within float_tol.
    """
    if mode == "exact":
        return (expected == actual, "")

    exp_lines = _normalize_lines(expected)
    act_lines = _normalize_lines(actual)
    if len(exp_lines) != len(act_lines):
        return (False, f"line_count expected={len(exp_lines)} actual={len(act_lines)}")
    for i, (e, a) in enumerate(zip(exp_lines, act_lines), start=1):
        e_tokens = e.split()
        a_tokens = a.split()
        if len(e_tokens) != len(a_tokens):
            return (False, f"line {i}: token_count expected={len(e_tokens)} actual={len(a_tokens)}")
        for j, (et, at) in enumerate(zip(e_tokens, a_tokens), start=1):
            e_num = _try_float(et)
            a_num = _try_float(at)
            if e_num is not None and a_num is not None:
                if abs(e_num - a_num) > float_tol:
                    return (False, f"line {i} token {j}: |{e_num}-{a_num}|>{float_tol}")
            else:
                if et != at:
                    return (False, f"line {i} token {j}: '{et}'!='{at}'")
    return (True, "")

