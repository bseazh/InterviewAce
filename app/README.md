# InterviewAce Frontend (Next.js)

This Next.js app consumes the FastAPI backend in `../backend` for AI-generated interview preparation content and coding practice. It was scaffolded with V0.dev and extended to integrate the backend endpoints.

## Prerequisites
- Node.js 18+
- Backend API running locally (see `../backend/README.md`)

## Environment Variables
Copy the example file and adjust values to match your environment:

```bash
cp .env.local.example .env.local
```

- `NEXT_PUBLIC_API_BASE_URL` – base URL of the FastAPI service (default `http://localhost:8000`).
- `NEXT_PUBLIC_DEFAULT_PROBLEM_ID` – UUID of a seeded coding problem used by the practice module（运行 `PYTHONPATH=backend python backend/scripts/seed_sample_problem.py` 可自动注入示例题目，ID 为 `11111111-1111-1111-1111-111111111111`）。

Ensure the backend enables CORS for your frontend origin (defaults to `http://localhost:3000`).

## Install & Run

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

The UI currently exposes:
- **Knowledge Items** – fetches `/api/v1/items`, allows creating questions via `/questions` + `/generate`, deleting items, and viewing detailed flashcards/code insights.
- **Algorithm Practice** – loads a coding problem via `/problems/{id}`, runs code in the sandbox (`/execute`), and displays per-test-case judging results.

## Useful Notes
- When adding a question, the frontend composes a prompt and triggers backend generation; responses update immediately without page reload.
- Coding practice supports Python and C++ (matching backend sandbox capabilities). Adjust the sandbox if new languages are introduced.
- If the browser reports CORS issues, verify the backend `CORS_ORIGINS` setting in `.env`.

For additional architecture and backend details, refer to `../docs/`.
