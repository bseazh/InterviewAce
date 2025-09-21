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
进入容器后可用 SQL 手动插入一条 problems 数据以便 PRD2 测试：

```
psql "$DATABASE_URL" <<'SQL'
INSERT INTO problems (id, title, description, difficulty, solution_code, solution_language, test_cases)
VALUES (
  gen_random_uuid(),
  '二分查找',
  '# 题目\n给定有序数组和目标值，返回索引或 -1',
  'easy',
  'def binary_search(a, t):\n    l, r = 0, len(a)-1\n    while l <= r:\n        m = (l+r)//2\n        if a[m]==t: return m\n        if a[m] < t: l=m+1\n        else: r=m-1\n    return -1',
  'python',
  '[{"input": "1 3 5 7\n5", "expectedOutput": "2"}]'::jsonb
);
SQL
```
