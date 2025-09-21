# Backend (FastAPI)

- Dev run: `uvicorn app.main:app --reload --port 8000`
- Health check: `GET http://localhost:8000/health`
- Settings via env vars (see `app/config.py`).

Install deps:
- With pip: `pip install -r requirements.txt`

## Docker & Postgres

1) 复制环境变量模板：`cp .env.sample .env`
2) 启动：`docker compose up -d`
3) 数据迁移：
   - 进入容器：`docker compose exec backend bash`
   - 运行 Alembic：`alembic upgrade head`

服务地址：`http://localhost:8000/health`

## Alembic（本地执行）

在 `backend/` 目录下：
- 升级：`alembic upgrade head`
- 回滚：`alembic downgrade -1`

## Seed 示例（可选）
提供了一个脚本自动插入演示题目（ID 固定为 `11111111-1111-1111-1111-111111111111`，供前端默认使用）：

```
PYTHONPATH=backend python backend/scripts/seed_sample_problem.py
```

脚本会在不存在时插入一条“Binary Search”题目，包含 3 个测试用例。运行成功后，可将该 ID 写入前端的 `.env.local` 中的 `NEXT_PUBLIC_DEFAULT_PROBLEM_ID`。
