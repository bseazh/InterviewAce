from fastapi import FastAPI
from .config import get_settings
from .routers.questions import router as questions_router


app = FastAPI(title="InterviewAce Backend", version="0.1.0")


@app.get("/health")
def health():
    settings = get_settings()
    return {"status": "ok", "env": settings.env}


app.include_router(questions_router)
