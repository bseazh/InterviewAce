from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers.questions import router as questions_router
from .routers.items import router as items_router
from .routers.problems import router as problems_router
from .routers.execute import router as execute_router


settings = get_settings()

app = FastAPI(title="InterviewAce Backend", version="0.1.0")

origins = settings.cors_origins or ["*"]
allow_credentials = True
if "*" in origins:
    allow_credentials = False
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "env": settings.env}


app.include_router(questions_router)
app.include_router(items_router)
app.include_router(problems_router)
app.include_router(execute_router)
