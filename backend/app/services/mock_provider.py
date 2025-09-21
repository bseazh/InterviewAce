from __future__ import annotations

from typing import Any, Dict


class MockProvider:
    def generate_from_question(self, question_text: str) -> Dict[str, Any]:
        # Deterministic, schema-compliant mock output
        return {
            "flashcard": {
                "answer": f"要点总结：{question_text} 的核心概念与常见陷阱。",
                "pitfalls": [
                    "表述不清导致理解偏差",
                    "忽略边界条件",
                ],
            },
            "mindmap": {
                "root": question_text[:20] + ("..." if len(question_text) > 20 else ""),
                "children": [
                    {"text": "定义", "children": []},
                    {"text": "应用场景", "children": [{"text": "面试问答", "children": []}]},
                    {"text": "优缺点", "children": []},
                ],
            },
            "code": {
                "lang": "python",
                "snippet": "def solution():\n    return 'demo'\n",
                "explanation": "示例代码用于演示结构，不代表真实解法。",
            },
            "project_usage": "在实际项目中可用于搭建知识卡片与复习素材。",
        }

