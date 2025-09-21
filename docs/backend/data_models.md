# 数据模型（SQLAlchemy/Al embic 目标结构）

## questions
- id: UUID, PK
- text: TEXT, not null
- tags: TEXT[]（或 JSONB），可为空
- difficulty: VARCHAR(10) in ('easy','medium','hard')，可为空
- created_at: TIMESTAMP with time zone, default now()

## knowledge_items
- id: UUID, PK
- question_id: UUID, FK -> questions.id, index
- flashcard: JSONB { answer: str, pitfalls: [str] }
- mindmap: JSONB { root: str, children: [...] }
- code: JSONB { lang: str, snippet: str, explanation: str }
- project_usage: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ

约束：`question_id` 唯一或一对多均可，MVP 采用一对一（每题一份生成内容）。

## problems
- id: UUID, PK
- title: VARCHAR(255)
- description: TEXT (Markdown)
- difficulty: VARCHAR(10) in ('easy','medium','hard')
- solution_code: TEXT
- solution_language: VARCHAR(20)
- test_cases: JSONB [{ input: str, expectedOutput: str }]
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ

## reviews（迭代）
- id: UUID, PK
- knowledge_item_id: UUID, FK -> knowledge_items.id
- next_review_at: TIMESTAMPTZ
- ease_factor: FLOAT
- interval: INT
- repetitions: INT

索引建议：
- questions(text) GIN/tsvector（后续）
- questions(tags)
- knowledge_items(question_id)
- problems(difficulty)

