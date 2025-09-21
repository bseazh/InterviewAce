#!/usr/bin/env python
"""Seed a sample coding problem for local development.

Usage:
    PYTHONPATH=backend python backend/scripts/seed_sample_problem.py

The script inserts a deterministic problem record if it does not already exist.
"""

from __future__ import annotations

import uuid

from app.db import SessionLocal
from app.models import Problem

SAMPLE_PROBLEM_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")

SAMPLE = {
    "id": SAMPLE_PROBLEM_ID,
    "title": "Binary Search",
    "description": (
        "# Binary Search\n\n"
        "Given a sorted array of integers nums and an integer target, return the index of the target if it is in nums.\n"
        "If not present, return -1. Assume nums may contain duplicate values.\n\n"
        "### Examples\n\n"
        "Input: nums = [1,3,5,6,9], target = 5\n\nOutput: 2\n"
    ),
    "difficulty": "easy",
    "solution_language": "python",
    "solution_code": (
        "def binary_search(nums, target):\n"
        "    left, right = 0, len(nums) - 1\n"
        "    while left <= right:\n"
        "        mid = (left + right) // 2\n"
        "        if nums[mid] == target:\n"
        "            return mid\n"
        "        if nums[mid] < target:\n"
        "            left = mid + 1\n"
        "        else:\n"
        "            right = mid - 1\n"
        "    return -1\n\n"
        "if __name__ == '__main__':\n"
        "    import sys\n"
        "    data = list(map(int, sys.stdin.read().strip().split()))\n"
        "    *nums, target = data\n"
        "    print(binary_search(nums, target))\n"
    ),
    "test_cases": [
        {"input": "1 3 5 6 9\n5", "expectedOutput": "2"},
        {"input": "1 3 5 6 9\n4", "expectedOutput": "-1"},
        {"input": "1\n1", "expectedOutput": "0"},
    ],
}


def main() -> None:
    session = SessionLocal()
    try:
        existing = session.get(Problem, SAMPLE_PROBLEM_ID)
        if existing:
            print(f"Problem already present with id {SAMPLE_PROBLEM_ID}")
            return
        problem = Problem(
            id=SAMPLE["id"],
            title=SAMPLE["title"],
            description=SAMPLE["description"],
            difficulty=SAMPLE["difficulty"],
            solution_language=SAMPLE["solution_language"],
            solution_code=SAMPLE["solution_code"],
            test_cases=SAMPLE["test_cases"],
        )
        session.add(problem)
        session.commit()
        print(f"Seeded problem {problem.title} with id {problem.id}")
    finally:
        session.close()


if __name__ == "__main__":
    main()
