from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.db import get_db
from app import models
from app.schemas import (
    BulkQuestionsCreate,
    QuestionCreate,
    QuestionOut,
    GenerateRequest,
    KnowledgeItemOut,
)
from app.services.llm_provider import get_provider


router = APIRouter(prefix="/api/v1", tags=["questions"])


@router.post("/questions", response_model=list[QuestionOut])
def create_questions(payload: BulkQuestionsCreate, db: Session = Depends(get_db)):
    created = []
    for item in payload.items:
        q = models.Question(text=item.text, tags=item.tags, difficulty=item.difficulty)
        db.add(q)
        created.append(q)
    db.commit()
    for q in created:
        db.refresh(q)
    return [QuestionOut(id=q.id, text=q.text, tags=q.tags, difficulty=q.difficulty) for q in created]


@router.post("/generate", response_model=KnowledgeItemOut)
def generate_item(req: GenerateRequest, db: Session = Depends(get_db)):
    q: models.Question | None = db.get(models.Question, req.question_id)
    if not q:
        raise HTTPException(status_code=404, detail="question not found")

    provider = get_provider()
    data = provider.generate_from_question(q.text)

    item = models.KnowledgeItem(
        question_id=q.id,
        flashcard=data.get("flashcard"),
        mindmap=data.get("mindmap"),
        code=data.get("code"),
        project_usage=data.get("project_usage"),
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    # Assemble response using simple dict passthrough for nested structures
    return KnowledgeItemOut(
        id=item.id,
        question_id=item.question_id,
        flashcard=item.flashcard,
        mindmap=item.mindmap,
        code=item.code,
        project_usage=item.project_usage,
    )

