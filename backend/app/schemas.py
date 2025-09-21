from __future__ import annotations

from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class QuestionCreate(BaseModel):
    text: str
    tags: Optional[List[str]] = None
    difficulty: Optional[str] = Field(default=None, pattern=r"^(easy|medium|hard)$")


class QuestionOut(BaseModel):
    id: UUID
    text: str
    tags: Optional[List[str]] = None
    difficulty: Optional[str] = None


class BulkQuestionsCreate(BaseModel):
    items: List[QuestionCreate]


class Flashcard(BaseModel):
    answer: str
    pitfalls: List[str] = []


class MindmapNode(BaseModel):
    text: str
    children: List['MindmapNode'] = []


MindmapNode.model_rebuild()


class CodeSnippet(BaseModel):
    lang: str
    snippet: str
    explanation: str


class KnowledgeItemOut(BaseModel):
    id: UUID
    question_id: UUID
    flashcard: Flashcard
    mindmap: dict  # 前端通常以通用结构消费
    code: CodeSnippet
    project_usage: Optional[str] = None


class GenerateRequest(BaseModel):
    question_id: UUID

