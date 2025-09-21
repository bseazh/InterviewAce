当然可以！我们来聚焦你提到的第二部分核心功能：**交互式代码练习与默写**。

这部分的目标是**从“知道”到“会写”**，通过“先看、再藏、后默写”的流程，强化肌肉记忆和逻辑实现能力。

下面是针对这个模块的超详细PRD，可以直接拿去指导开发。

---

### **PRD 文档 v2.1 - 交互式编程训练模块**

#### **1. 模块定位与用户故事**

**模块目标**：为用户提供一个集“题目浏览、答案学习、隐藏默写、在线运行、即时反馈”于一体的闭环代码练习环境。

**用户故事**:
> 作为一名正在准备面试的程序员，当我学习完一个知识点（如“二分查找”）后，我希望：
> 1.  能立刻看到一个经典的“二分查找”编程题，包括题目描述和一份高质量的参考答案。
> 2.  在我理解答案后，可以点击一个按钮把答案藏起来，然后在一个空白的编辑器里，凭记忆和理解自己重新实现一遍。
> 3.  在写的过程中，如果卡壳了，可以随时再把答案“偷看”一眼。
> 4.  写完后，我能直接点击“运行”，用预设的测试用例来验证我的代码是否正确，并立即看到输出结果。

---

#### **2. 核心交互流程 (UI/UX Flow)**

这个模块的核心是一个**三栏式布局**的页面：

| 左侧：题目描述区 | 中间：代码编辑区 | 右侧：输出与测试区 |
| :--- | :--- | :--- |
| **(固定)** 题目详情 | **(可切换)** 代码编辑器 | **(动态)** 运行结果/测试用例 |

**详细流程拆解:**

1.  **初始加载 (学习模式)**：
    *   **左侧**：加载并渲染题目的 Markdown 描述。
    *   **中间**：**默认显示“参考答案”页签**，代码编辑器中加载标准答案代码，**设为只读模式 (Read-only)**，防止用户误改。
    *   **右侧**：显示该题目的“测试用例”列表（例如：输入 `[1, 3, 5, 7]`, 目标 `5`，预期输出 `2`）。

2.  **切换至练习模式**:
    *   用户点击中间区域上方的 **`[隐藏答案，开始练习]`** 按钮。
    *   **中间**：代码编辑区切换到 **“我的代码”页签**。
    *   编辑器内容变为空白（或保留上次用户输入的草稿），并变为**可编辑状态**。
    *   按钮文字变为 **`[查看答案]`**。

3.  **编码与运行**:
    *   用户在“我的代码”编辑器中编写代码。
    *   点击下方的 **`[运行代码]`** 按钮。
    *   **动作**：前端将“我的代码”+“测试用例的输入”发送到后端API。
    *   **右侧**：输出区进入“加载中”状态。后端返回结果后，显示代码的实际输出、运行时间、内存消耗，并用 ✅ 或 ❌ 标记与预期输出是否匹配。

4.  **随时查看答案**:
    *   在练习模式下，用户可以随时点击 **`[查看答案]`** 按钮。
    *   **中间**：代码编辑区切回“参考答案”页签，显示标准答案（仍然是只读）。
    *   用户看完后，可以再切回“我的代码”页签，**他之前写的代码必须仍然存在**，不会丢失。



---

#### **3. 功能需求与技术实现**

| 功能点 | 需求细节 | 前端技术实现 | 后端技术实现 |
| :--- | :--- | :--- | :--- |
| **题目描述面板** | - 支持 Markdown 渲染，包括代码块、列表、图片等。<br>- 样式清晰，阅读体验好。 | - React/Vue 组件<br>- 使用 `react-markdown` 或 `marked.js` 库进行渲染。 | - 从数据库读取题目描述字段 (TEXT/Markdown格式)。 |
| **代码编辑面板** | - **双页签设计**：“参考答案”和“我的代码”。<br>- 支持多语言语法高亮 (C++, Java, Python等)。<br>- 具备行号、自动缩进、括号匹配等基础功能。<br>- “我的代码”内容需要**本地持久化**（刷新不丢失）。 | - **Monaco Editor** (VS Code核心编辑器)。<br>- 使用 `useState` 或 Redux/Zustand 管理当前激活的页签 (`activeTab`)。<br>- 将“我的代码”内容存储在 `localStorage` 中，与题目ID关联。 | - 从数据库读取标准答案代码。 |
| **操作按钮** | - `[隐藏答案/查看答案]`：切换编辑器的页签。<br>- `[运行代码]`：触发API调用。<br>- `[重置代码]`：清空“我的代码”编辑器。 | - React/Vue 的 `onClick` 事件处理函数。 | - 无 |
| **输出与测试面板** | - 显示代码的 `stdout` (标准输出) 和 `stderr` (错误信息)。<br>- 对比实际输出和预期输出，给出“通过”或“未通过”的明确提示。<br>- 显示执行时间和内存占用。 | - 根据API返回结果动态渲染。<br>- 错误信息使用红色高亮。 | - **核心模块**: 见下方的**代码执行沙箱**。 |

---

#### **4. 核心后端技术：代码执行沙箱 (Code Execution Sandbox)**

这是本模块技术复杂度最高的部分，必须保证**安全**和**隔离**。

1.  **API 端点设计**:
    *   `POST /api/v1/execute`
    *   **Request Body**:
        ```json
        {
          "language": "python", // "cpp", "java"
          "code": "...", // 用户在“我的代码”中输入的内容
          "stdin": "1 2\n3 4" // 测试用例的输入
        }
        ```
    *   **Response Body**:
        ```json
        {
          "stdout": "3\n7",
          "stderr": "",
          "executionTime": "50ms",
          "memory": "10.2MB",
          "status": "success" // "error", "timeout"
        }
        ```

2.  **执行流程**:
    1.  **接收请求**：Node.js (Express/NestJS) 服务器接收到 API 请求。
    2.  **创建隔离环境**：使用 **Docker** 为每次执行创建一个临时的、轻量级的容器。
        *   例如，对于 Python，使用 `python:3.9-slim` 镜像。
        *   **安全策略**：容器必须以非 `root` 用户运行，禁用网络访问 (`--net=none`)，并设置严格的资源限制（如 CPU 1核，内存 256MB，执行时间 5秒）。
    3.  **注入代码**：将用户代码和输入数据写入容器内的文件（如 `main.py` 和 `input.txt`）。
    4.  **执行与监控**：在容器内执行编译/运行命令（如 `python main.py < input.txt`），同时捕获 `stdout` 和 `stderr`。
    5.  **销毁容器**：执行完毕后，立即销毁该容器，确保环境干净。
    6.  **返回结果**：将捕获的输出、错误和性能数据格式化后返回给前端。

---

#### **5. 数据模型 (Database Schema)**

在你的数据库中，`problems` 表需要这样设计：

```sql
CREATE TABLE problems (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT, -- Markdown格式的题目描述
    difficulty VARCHAR(10) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    
    -- 核心：解决方案部分
    solution_code TEXT NOT NULL,
    solution_language VARCHAR(20) NOT NULL,
    
    -- 核心：测试用例部分 (使用JSONB类型存储数组)
    test_cases JSONB -- 格式: [{"input": "...", "expectedOutput": "..."}, ...]
);
```

---

#### **6. 阶段性目标**

**第一阶段 (MVP)**：
*   实现完整的三栏布局和核心交互流程。
*   支持 **Python** 语言的在线执行。
*   实现基于**精确文本匹配**的简单判题。
*   完成“隐藏/显示答案”和“本地草稿保存”功能。

**第二阶段 (优化)**：
*   扩展支持 C++ 和 Java（需要处理编译步骤）。
*   优化判题逻辑，忽略行末空格、空行等差异。
*   在知识库卡片中添加“去练习”按钮，直接跳转到对应的编程题。

---

**给 Codex 的指令**:
> 1.  **Frontend**: Create a React component named `CodingPracticePage` with a three-panel layout using Flexbox or CSS Grid. The left panel renders Markdown from a prop. The middle panel uses Monaco Editor and has two tabs: "Solution" (read-only) and "My Code" (editable). The right panel displays the output from an API call.
> 2.  **Backend**: Create a Node.js Express endpoint at `POST /api/execute`. This endpoint should accept `language`, `code`, and `stdin`. It must use the `dockerode` library to programmatically create, run, and destroy a Docker container to execute the user's code securely. The container must have network disabled and resource limits (1 CPU, 256MB RAM, 5s timeout). Capture stdout/stderr and return it as JSON.

这个 PRD 提供了从用户体验到技术实现的全方位细节，应该足以让你和 Codex 清晰地开始工作了。
