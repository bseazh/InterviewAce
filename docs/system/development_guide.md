# 开发与协作指南

## 1. 环境与依赖
- **操作系统**：Linux / macOS（Windows 需 WSL2）。
- **基础工具**：Docker / Docker Compose、Python 3.11、Node.js 18+（前端）、Make（可选）。
- **数据库**：PostgreSQL 15（Compose 自动拉起）。
- **LLM Key**：可选；本地默认使用 Mock Provider。

### 1.1 本地快速启动
```bash
cp .env.sample .env         # 配置数据库/连接信息
docker compose up -d        # 启动 Postgres + Backend
docker compose exec backend bash
alembic upgrade head        # 初始化数据库
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

前端（如果需要联调）：
```bash
cd app
npm install
npm run dev
```

## 2. 目录结构
- `app/`：Next.js 前端（V0.dev 输出，可自定义扩展）。
- `backend/`：FastAPI 项目，使用 SQLAlchemy + Alembic。
- `docs/`：规划与设计文档（本指南 + 架构 + 数据模型 + API）。
- `.env.sample`：环境变量模板。
- `docker-compose.yml`：本地开发编排。
- GitHub Issues (#1 ~ #10)：对应后端实施任务。

## 3. 配置与密钥管理
- 后端配置由 `backend/app/config.py` 管理，读取环境变量。
- 生产环境建议使用：
  - Vault/Parameter Store 管理密钥。
  - 分级配置（dev/staging/prod）与 `.env` 模板同步更新。
- LLM Provider：通过 `LLM_PROVIDER` 选择（mock/openai/...）。额外鉴权参数（API Key、base URL）后续在配置中补充。

## 4. 代码规范
- **Python**：
  - 格式化工具：`ruff` 或 `black`（建议在 CI 中统一）。
  - 类型提示：Pydantic v2 + `typing` 提升可维护性。
- **前端**：
  - 采用 ESLint + Prettier（V0 模板已包含基本配置）。
- **提交信息**：遵循 `type(scope): message`（例如 `feat(backend): ...`）。
- 不要覆盖/回滚用户已有提交；新增改动需解释上下文。

## 5. 测试策略
| 层级 | 内容 | 工具 |
|------|------|------|
| 单元测试 | 服务层（LLM mock、判题器、沙箱封装） | `pytest` |
| 集成测试 | FastAPI API（通过 TestClient） | `pytest` + `httpx` |
| 合同测试 | 前端调用后端接口的契约 | Postman/Thunder Client（可生成脚本） |
| 性能测试 | 沙箱执行、批量生成 | Locust / k6（后续） |

建议在 `backend/tests` 中逐步补充测试，CI 运行 `pytest` 与 `ruff`。

## 6. 迭代与发布流程
1. 需求拆分 → 创建/更新 GitHub Issue（里程碑：PRD1、PRD2）。
2. 在 feature 分支开发 → 提交 PR → CI 检查 → Code Review。
3. 合并至 main → 自动化部署至测试环境 → 手动验证 → Promote 到生产。
4. 发布后更新文档（变更日志、API 更新）并同步前端。

## 7. 运维与监控建议
- **日志**：结构化 JSON，集中采集（ELK/Splunk）。
- **监控指标**：
  - API QPS、错误率、响应时间。
  - LLM 调用成功率/耗时。
  - 沙箱执行次数、超时/错误率。
- **报警**：数据库连接池耗尽、沙箱失败率飙升、LLM quota 接近限制。
- **备份**：PostgreSQL 按日备份；知识数据可导出至对象存储。

## 8. 安全要点
- 沙箱：禁网、限制 CPU/内存、后续添加非 root 用户/只读文件系统。
- API：启用身份认证（JWT/OAuth）与速率限制；记录敏感操作日志。
- 数据：关键字段加密存储、传输使用 HTTPS。
- LLM：敏感信息脱敏，配置输出过滤器。

## 9. 后续 TODO（文档维度）
- 编写 API 示例（Postman Collection 或 HTTPie 脚本）。
- 梳理前端与后端的接口契约覆盖图。
- 制定测试覆盖率目标与质量门槛。
- 补充部署脚本（Terraform/Ansible/K8s manifests）。

