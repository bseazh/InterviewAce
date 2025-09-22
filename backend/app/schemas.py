from __future__ import annotations

from typing import List, Optional, Dict
from datetime import datetime
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


class QuestionMeta(BaseModel):
    id: UUID
    text: str
    tags: Optional[List[str]] = None
    difficulty: Optional[str] = None
    created_at: Optional[datetime] = None


class KnowledgeItemOut(BaseModel):
    id: UUID
    question: QuestionMeta
    flashcard: Flashcard
    mindmap: dict  # 前端通常以通用结构消费
    code: CodeSnippet
    project_usage: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


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


class ProblemTestCase(BaseModel):
    input: str
    expectedOutput: str


class ProblemOut(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    difficulty: Optional[str] = None
    tags: Optional[List[str]] = None
    test_cases: List[ProblemTestCase]
    solution_languages: List[str]
    default_language: Optional[str] = None
    has_editorial: bool = False


class ProblemListItem(BaseModel):
    id: UUID
    title: str
    difficulty: Optional[str] = None
    tags: Optional[List[str]] = None
    solution_languages: List[str]


class ProblemSolution(BaseModel):
    language: str
    code: str
    explanation: Optional[str] = None


class ProblemImportRequest(BaseModel):
    title: str
    description: Optional[str]
    difficulty: Optional[str]
    tags: Optional[List[str]] = None
    test_cases: List[ProblemTestCase] = Field(min_length=1)
    solutions: List[ProblemSolution] = Field(min_length=1)
    editorial: Optional[str] = None


class ProblemSolutionResponse(BaseModel):
    language: str
    code: str
    explanation: Optional[str] = None


class ProblemEditorialResponse(BaseModel):
    editorial: str


class ExecuteRequest(BaseModel):
    language: str  # python | cpp
    code: str
    stdin: Optional[str] = ""
    problem_id: Optional[UUID] = None
    match: Optional[str] = Field(default="exact", pattern=r"^(exact|tolerant)$")
    float_tolerance: Optional[float] = 1e-6


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
