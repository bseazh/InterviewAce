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
