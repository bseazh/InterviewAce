from __future__ import annotations

import os
from abc import ABC, abstractmethod
from typing import Any, Dict


class LLMProvider(ABC):
    @abstractmethod
    def generate_from_question(self, question_text: str) -> Dict[str, Any]:
        """
        Returns a dict with keys: flashcard, mindmap, code, project_usage.
        Each key must follow the docs schema.
        """
        raise NotImplementedError


def get_provider() -> LLMProvider:
    provider_name = os.getenv("LLM_PROVIDER", "mock").lower()
    if provider_name == "mock":
        from .mock_provider import MockProvider

        return MockProvider()
    # Future: openai, others...
    from .mock_provider import MockProvider

    return MockProvider()

