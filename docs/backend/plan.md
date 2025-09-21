# InterviewAce 后端实施方案（Python/FastAPI）

本方案基于 prd1.md 与 prd2.md，使用 Python 技术栈实现后端 API、生成服务与代码执行沙箱，支持前端（V0.dev 生成）集成。

## 技术栈与基础设施
- 语言与框架：Python 3.11 + FastAPI（ASGI, Pydantic v2）
- 数据库：PostgreSQL 15（SQLAlchemy 2.x + Alembic 迁移）
- 缓存/队列（可选）：Redis，用于任务排队与速率限制
- 向量/检索（可选）：暂不引入，MVP 用全文检索或 ILIKE
- 容器化：Docker/Docker Compose
- 代码执行沙箱：Docker SDK for Python（禁网、限时、限内存/CPU）
- 日志与监控：结构化日志 + Uvicorn 访问日志

## 模块划分
1. API 网关（FastAPI 应用）
   - 统一对外 REST API（`/api/v1/...`）
   - 调用 LLM Provider 完成“题目驱动的自动生成”（PRD1）
   - 调用沙箱服务执行代码并对比用例（PRD2）
2. 生成服务（LLM Provider 抽象）
   - Interface：定义 `generate_from_question(...)`，输出结构化 JSON（闪卡、思维导图、代码、项目应用）
   - Impl：默认使用 Mock/占位实现，支持通过环境变量切换 OpenAI/其他大模型
3. 知识库管理
   - 题目与生成内容存储、编辑、检索、导出
   - 基于 JSONB 存储 mindmap/flashcard 等结构化字段
4. 学习与复习（迭代）
   - SM-2（或 Anki）间隔重复调度（MVP 可延后）
5. 代码练习与沙箱
   - `POST /api/v1/execute`：Python MVP，后续扩展 C++/Java
   - Docker 限制：非 root、禁网、CPU/内存限制、超时 5s

## 数据模型（概览）
- `questions`
  - id, text, tags[], difficulty, created_at
- `knowledge_items`
  - id, question_id(FK), flashcard(JSONB), mindmap(JSONB), code(JSONB), project_usage(TEXT), created_at, updated_at
- `problems`
  - id, title, description(Markdown), difficulty, solution_code, solution_language, test_cases(JSONB)
- `reviews`（可选，迭代）
  - id, knowledge_item_id, next_review_at, ease_factor, interval, repetitions

详细字段见 `docs/backend/data_models.md`。

## API 设计（概览）
- PRD1（题目驱动生成/管理）
  - `POST /api/v1/questions` 创建题目（单条/批量）
  - `POST /api/v1/generate` 基于题目生成结构化内容（调用 LLM Provider）
  - `GET /api/v1/items/{id}` 获取生成内容
  - `PUT /api/v1/items/{id}` 更新（编辑后的保存）
  - `GET /api/v1/items` 列表/搜索/筛选
  - `GET /api/v1/items/{id}/export` 导出（Markdown/JSON）
- PRD2（代码练习与沙箱）
  - `GET /api/v1/problems/{id}` 获取题目+参考答案+测试用例
  - `POST /api/v1/execute` 在沙箱中执行用户代码并返回输出与判题结果

详细入参/出参见 `docs/backend/endpoints.md`。

## 实施阶段与里程碑
- Milestone: MVP-Backend (PRD1)
  1) 创建后端骨架（FastAPI, Docker, Compose, 配置）
  2) 建模与迁移（questions, knowledge_items）
  3) LLM Provider 接口 + Mock 实现
  4) 生成/获取/编辑/搜索 API
  5) 基础导出（JSON/Markdown）
- Milestone: Practice Module (PRD2)
  1) `problems` 模型与 CRUD API
  2) 代码执行沙箱（Python, Docker SDK, 资源限制）
  3) 判题逻辑（精确匹配 → 容错匹配）
  4) 扩展多语言（C++/Java，可选）
- Milestone: Iteration-1
  - 批量导入、间隔重复（SM-2）、全文搜索优化、鉴权/多用户（可选）

## 安全与性能
- LLM 输出结构化校验（Pydantic 模型校验）
- 沙箱禁网、限权、限时限内存、清理容器
- 请求速率限制（后续加入）
- 生成耗时控制：超时与重试

## 环境与配置
- `.env`/环境变量：数据库连接、LLM Key、沙箱限制参数等
- 本地开发：`docker compose up -d db` → `uvicorn app.main:app --reload`

## 测试与验收
- 单元测试：模型/服务/沙箱执行逻辑
- 集成测试：关键 API（生成、获取、执行）
- 验收标准：与 PRD1/PRD2 功能清单一致，前端可用

***

该文档用于指导后端按阶段落地，配套 issues 会拆分各项任务并追踪进度。

