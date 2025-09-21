from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import Optional
from uuid import UUID

from app.db import get_db
from app import models
from app.schemas import (
    KnowledgeItemOut,
    KnowledgeItemUpdate,
    PaginatedKnowledgeItems,
)


router = APIRouter(prefix="/api/v1", tags=["items"])


def to_out(item: models.KnowledgeItem) -> KnowledgeItemOut:
    return KnowledgeItemOut(
        id=item.id,
        question_id=item.question_id,
        flashcard=item.flashcard,
        mindmap=item.mindmap,
        code=item.code,
        project_usage=item.project_usage,
    )


@router.get("/items/{item_id}", response_model=KnowledgeItemOut)
def get_item(item_id: UUID, db: Session = Depends(get_db)):
    item = db.get(models.KnowledgeItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="item not found")
    return to_out(item)


@router.put("/items/{item_id}", response_model=KnowledgeItemOut)
def update_item(item_id: UUID, payload: KnowledgeItemUpdate, db: Session = Depends(get_db)):
    item = db.get(models.KnowledgeItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="item not found")

    if payload.flashcard is not None:
        item.flashcard = payload.flashcard.model_dump()
    if payload.mindmap is not None:
        item.mindmap = payload.mindmap
    if payload.code is not None:
        item.code = payload.code.model_dump()
    if payload.project_usage is not None:
        item.project_usage = payload.project_usage

    db.add(item)
    db.commit()
    db.refresh(item)
    return to_out(item)


@router.get("/items", response_model=PaginatedKnowledgeItems)
def list_items(
    q: Optional[str] = None,
    tag: Optional[str] = None,
    difficulty: Optional[str] = Query(default=None, pattern=r"^(easy|medium|hard)$"),
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
):
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    filters = []
    stmt_base = select(models.KnowledgeItem).join(models.Question, models.Question.id == models.KnowledgeItem.question_id)

    if q:
        filters.append(models.Question.text.ilike(f"%{q}%"))
    if tag:
        # array contains
        filters.append(models.Question.tags.contains([tag]))
    if difficulty:
        filters.append(models.Question.difficulty == difficulty)

    if filters:
        stmt_base = stmt_base.where(*filters)

    # total count
    total_stmt = select(func.count(models.KnowledgeItem.id)).join(models.Question, models.Question.id == models.KnowledgeItem.question_id)
    if filters:
        total_stmt = total_stmt.where(*filters)
    total = db.scalar(total_stmt) or 0

    stmt = stmt_base.order_by(models.KnowledgeItem.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    rows = db.execute(stmt).scalars().all()
    items = [to_out(r) for r in rows]
    return PaginatedKnowledgeItems(items=items, total=total, page=page, page_size=page_size)


@router.get("/items/{item_id}/export")
def export_item(item_id: UUID, format: str = Query(default="json", pattern=r"^(json|md)$"), db: Session = Depends(get_db)):
    item = db.get(models.KnowledgeItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="item not found")
    question = db.get(models.Question, item.question_id)

    if format == "json":
        return {
            "question": question.text if question else None,
            "flashcard": item.flashcard,
            "mindmap": item.mindmap,
            "code": item.code,
            "project_usage": item.project_usage,
        }

    # Markdown export
    flash = item.flashcard or {}
    code = item.code or {}
    pitfalls = "\n".join([f"  - {p}" for p in (flash.get("pitfalls") or [])])
    mindmap_json = item.mindmap or {}

    md_parts = [
        f"# Question\n\n{question.text if question else ''}",
        "\n## Flashcard",
        f"\n- Answer: {flash.get('answer','')}\n- Pitfalls:\n{pitfalls if pitfalls else '  - (none)'}",
        "\n## Mindmap (JSON)",
        f"\n```json\n{mindmap_json}\n```",
        "\n## Code",
        f"\n```{code.get('lang','')}\n{code.get('snippet','')}\n```\n\nExplanation: {code.get('explanation','')}",
        "\n## Project Usage",
        f"\n{item.project_usage or ''}",
    ]
    md = "\n".join(md_parts)
    return Response(content=md, media_type="text/markdown")

