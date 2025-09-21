from __future__ import annotations

from app import models
from app.schemas import KnowledgeItemOut, QuestionMeta


def serialize_knowledge_item(item: models.KnowledgeItem) -> KnowledgeItemOut:
    question = item.question
    if question is None:
        raise ValueError("KnowledgeItem missing related question")

    flashcard = item.flashcard or {"answer": "", "pitfalls": []}
    code = item.code or {"lang": "", "snippet": "", "explanation": ""}

    return KnowledgeItemOut(
        id=item.id,
        question=QuestionMeta(
            id=question.id,
            text=question.text,
            tags=question.tags,
            difficulty=question.difficulty,
            created_at=question.created_at,
        ),
        flashcard=flashcard,
        mindmap=item.mindmap or {},
        code=code,
        project_usage=item.project_usage,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )
