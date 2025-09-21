# API 端点设计（v1）

所有端点均以 `/api/v1` 为前缀，返回 JSON。示例错误响应：`{"detail": "..."}`。

## PRD1：题目驱动生成与知识库
- POST `/api/v1/questions`
  - 用途：创建题目（支持单条或批量）
  - Body：
    ```json
    { "items": [ {"text": "C++ 的虚函数有什么作用？", "tags": ["cpp"], "difficulty": "medium"} ] }
    ```
  - 返回：创建的题目数组（含 id）

- POST `/api/v1/generate`
  - 用途：基于题目内容，调用 LLM Provider 生成结构化内容
  - Body：
    ```json
    { "question_id": "uuid" }
    ```
  - 返回：`knowledge_item` 对象（见数据模型）

- GET `/api/v1/items/{id}`
  - 用途：获取生成内容（含题目元信息）
  - 返回示例：
    ```json
    {
      "id": "uuid",
      "question": {
        "id": "uuid",
        "text": "Describe virtual functions...",
        "tags": ["cpp", "oop"],
        "difficulty": "medium",
        "created_at": "2024-09-21T00:10:11.000Z"
      },
      "flashcard": { "answer": "...", "pitfalls": ["..."] },
      "mindmap": { "root": "..." },
      "code": { "lang": "python", "snippet": "...", "explanation": "..." },
      "project_usage": "...",
      "created_at": "2024-09-21T00:10:12.000Z"
    }
    ```

- PUT `/api/v1/items/{id}`
  - 用途：更新/保存用户修改（flashcard/mindmap/code/project_usage）
  - Body：部分或全部字段（见数据模型）
  - 返回：更新后的 `knowledge_item`

- GET `/api/v1/items`
  - 用途：分页与查询（关键词、标签、难度）
  - Query：`q`, `tag`, `difficulty`, `page`, `page_size`
  - 返回：列表与分页信息
- DELETE `/api/v1/items/{id}`
  - 用途：删除知识项（连带删除对应 question 记录）
  - 返回：204

- GET `/api/v1/items/{id}/export`
  - 用途：导出单条为 JSON/Markdown
  - Query：`format=json|md`
  - 返回：对应格式文本

## PRD2：编程题与代码沙箱
- GET `/api/v1/problems/{id}`
  - 用途：返回题目描述（Markdown）、参考答案（只读）、测试用例
  - 返回：
    ```json
    {
      "id": "uuid",
      "title": "二分查找",
      "description": "# 题目...",
      "difficulty": "easy",
      "solution_language": "python",
      "solution_code": "def binary_search(...): ...",
      "test_cases": [ {"input": "1 2 3\n5", "expectedOutput": "2"} ]
    }
    ```

- POST `/api/v1/execute`
  - 用途：在沙箱中执行用户代码，返回 stdout/stderr/性能数据与判题结果
  - Body：
    ```json
    { "language": "python", "code": "print('hi')", "stdin": "", "match": "exact|tolerant", "float_tolerance": 1e-6, "problem_id": "uuid?" }
    ```
  - 返回：
    ```json
    {
      "stdout": "hi\n",
      "stderr": "",
      "executionTime": "50ms",
      "memory": "10MB",
      "status": "success",   // success|error|timeout
      "passed": true,          // 若携带题目/用例判题
      "cases": [ {"expected": "...", "actual": "...", "passed": true} ]
    }
    ```
  - 语言：当前支持 `python`、`cpp`（MVP）。
  - 判题：`match=tolerant` 时忽略行尾空格、空行、按 token 对齐，数字采用 `float_tolerance` 容差比较。

## 错误码与约定
- 400 参数错误 / 422 校验失败
- 404 资源不存在
- 429 速率限制（后续）
- 500 服务器错误（包含沙箱执行异常）
