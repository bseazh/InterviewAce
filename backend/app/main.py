from fastapi import FastAPI
from .config import get_settings


app = FastAPI(title="InterviewAce Backend", version="0.1.0")


@app.get("/health")
def health():
    settings = get_settings()
    return {"status": "ok", "env": settings.env}

