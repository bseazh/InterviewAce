from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.db import get_db
from app import models
from app.schemas import ProblemOut


router = APIRouter(prefix="/api/v1", tags=["problems"])


@router.get("/problems/{problem_id}", response_model=ProblemOut)
def get_problem(problem_id: UUID, db: Session = Depends(get_db)):
    p = db.get(models.Problem, problem_id)
    if not p:
        raise HTTPException(status_code=404, detail="problem not found")
    return ProblemOut(
        id=p.id,
        title=p.title,
        description=p.description,
        difficulty=p.difficulty,
        solution_language=p.solution_language,
        solution_code=p.solution_code,
        test_cases=p.test_cases,
    )

