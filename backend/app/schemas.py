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


class KnowledgeItemUpdate(BaseModel):
    flashcard: Optional[Flashcard] = None
    mindmap: Optional[dict] = None
    code: Optional[CodeSnippet] = None
    project_usage: Optional[str] = None


class PaginatedKnowledgeItems(BaseModel):
    items: List[KnowledgeItemOut]
    total: int
    page: int
    page_size: int


class ProblemOut(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    difficulty: Optional[str] = None
    solution_language: str
    solution_code: str
    test_cases: Optional[list[dict]] = None


class ExecuteRequest(BaseModel):
    language: str
    code: str
    stdin: Optional[str] = ""
    problem_id: Optional[UUID] = None


class CaseResult(BaseModel):
    expected: str
    actual: str
    passed: bool


class ExecuteResponse(BaseModel):
    stdout: str = ""
    stderr: str = ""
    executionTime: str
    memory: str = ""
    status: str  # success|error|timeout
    passed: Optional[bool] = None
    cases: Optional[List[CaseResult]] = None
