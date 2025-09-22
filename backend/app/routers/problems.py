from __future__ import annotations

from typing import Dict, Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import UUID

from app.db import get_db
from app import models
from app.schemas import (
    ProblemOut,
    ProblemSolutionResponse,
    ProblemImportRequest,
    ProblemTestCase,
    ProblemListItem,
    ProblemEditorialResponse,
)


router = APIRouter(prefix="/api/v1", tags=["problems"])


@router.get("/problems", response_model=List[ProblemListItem])
def list_problems(difficulty: Optional[str] = Query(default=None), tag: Optional[str] = Query(default=None), db: Session = Depends(get_db)):
    stmt = select(models.Problem)
    if difficulty:
        stmt = stmt.where(models.Problem.difficulty == difficulty)
    if tag:
        stmt = stmt.where(models.Problem.tags.contains([tag]))
    stmt = stmt.order_by(models.Problem.created_at.desc())
    rows = db.execute(stmt).scalars().all()
    items: List[ProblemListItem] = []
    for p in rows:
        solutions_map: Dict[str, Dict[str, str]] = p.solution_snippets or {}
        languages = list(solutions_map.keys())
        if not languages and p.solution_language:
            languages = [p.solution_language]
        items.append(
            ProblemListItem(
                id=p.id,
                title=p.title,
                difficulty=p.difficulty,
                tags=p.tags,
                solution_languages=languages,
            )
        )
    return items


@router.get("/problems/{problem_id}", response_model=ProblemOut)
def get_problem(problem_id: UUID, db: Session = Depends(get_db)):
    p = db.get(models.Problem, problem_id)
    if not p:
        raise HTTPException(status_code=404, detail="problem not found")
    solutions_map: Dict[str, Dict[str, str]] = p.solution_snippets or {}
    languages = list(solutions_map.keys())
    if not languages and p.solution_language:
        languages = [p.solution_language]
    default_language = p.default_language or (languages[0] if languages else p.solution_language)
    test_cases_data = p.test_cases or []
    serialized_cases = [ProblemTestCase(**tc) for tc in test_cases_data]
    return ProblemOut(
        id=p.id,
        title=p.title,
        description=p.description,
        difficulty=p.difficulty,
        tags=p.tags,
        test_cases=serialized_cases,
        solution_languages=languages,
        default_language=default_language,
        has_editorial=bool(p.editorial),
    )


@router.get("/problems/{problem_id}/solution", response_model=ProblemSolutionResponse)
def get_problem_solution(problem_id: UUID, language: Optional[str] = Query(default=None), db: Session = Depends(get_db)):
    p = db.get(models.Problem, problem_id)
    if not p:
        raise HTTPException(status_code=404, detail="problem not found")
    solutions_map: Dict[str, Dict[str, str]] = p.solution_snippets or {}

    target_lang = language or p.default_language or p.solution_language
    if target_lang is None:
        raise HTTPException(status_code=404, detail="no solution available")

    if target_lang in solutions_map:
        data = solutions_map[target_lang]
        return ProblemSolutionResponse(language=target_lang, code=data.get("code", ""), explanation=data.get("explanation"))

    # fallback to legacy columns
    if p.solution_language == target_lang and p.solution_code:
        return ProblemSolutionResponse(language=target_lang, code=p.solution_code, explanation=None)

    raise HTTPException(status_code=404, detail="solution for language not found")


@router.post("/problems/import", response_model=ProblemOut, status_code=201)
def import_problem(payload: ProblemImportRequest, db: Session = Depends(get_db)):
    if not payload.solutions:
        raise HTTPException(status_code=400, detail="at least one solution is required")

    solution_map: Dict[str, Dict[str, str]] = {}
    for sol in payload.solutions:
        lang = sol.language.lower()
        solution_map[lang] = {"code": sol.code, "explanation": sol.explanation or ""}

    default_lang = payload.solutions[0].language.lower()

    problem = models.Problem(
        title=payload.title,
        description=payload.description,
        difficulty=payload.difficulty,
        tags=payload.tags,
        solution_language=default_lang,
        solution_code=payload.solutions[0].code,
        solution_snippets=solution_map,
        default_language=default_lang,
        test_cases=[tc.model_dump() for tc in payload.test_cases],
        editorial=payload.editorial,
    )

    db.add(problem)
    db.commit()
    db.refresh(problem)

    return get_problem(problem.id, db)


@router.get("/problems/{problem_id}/editorial", response_model=ProblemEditorialResponse)
def get_problem_editorial(problem_id: UUID, db: Session = Depends(get_db)):
    p = db.get(models.Problem, problem_id)
    if not p:
        raise HTTPException(status_code=404, detail="problem not found")
    if not p.editorial:
        raise HTTPException(status_code=404, detail="editorial not available")
    return ProblemEditorialResponse(editorial=p.editorial)
