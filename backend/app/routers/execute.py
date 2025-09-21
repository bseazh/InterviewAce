from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app import models
from app.schemas import ExecuteRequest, ExecuteResponse, CaseResult
from app.services.sandbox import execute_code


router = APIRouter(prefix="/api/v1", tags=["execute"])


@router.post("/execute", response_model=ExecuteResponse)
def execute(req: ExecuteRequest, db: Session = Depends(get_db)):
    # If problem_id specified, run per test case and aggregate
    if req.problem_id:
        p = db.get(models.Problem, req.problem_id)
        if not p:
            raise HTTPException(status_code=404, detail="problem not found")
        cases: List[CaseResult] = []
        all_passed = True
        last_stdout = ""
        last_stderr = ""
        exec_time = "0ms"
        status = "success"
        for c in p.test_cases or []:
            stdin = (c.get("input") or "")
            expected = (c.get("expectedOutput") or "")
            res = execute_code(req.language, req.code, stdin)
            actual = res.get("stdout") or ""
            last_stdout = actual
            last_stderr = res.get("stderr") or ""
            exec_time = res.get("executionTime") or "0ms"
            status = res.get("status") or "success"
            passed = (actual.strip() == expected.strip()) and status == "success" and (not last_stderr)
            all_passed = all_passed and passed
            cases.append(CaseResult(expected=expected, actual=actual, passed=passed))
        return ExecuteResponse(
            stdout=last_stdout,
            stderr=last_stderr,
            executionTime=exec_time,
            memory="",
            status=status,
            passed=all_passed,
            cases=cases,
        )

    # Single run using provided stdin
    res = execute_code(req.language, req.code, req.stdin or "")
    return ExecuteResponse(
        stdout=res.get("stdout", ""),
        stderr=res.get("stderr", ""),
        executionTime=res.get("executionTime", "0ms"),
        memory=res.get("memory", ""),
        status=res.get("status", "success"),
    )

