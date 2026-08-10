from fastapi  import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import analytics, quiz, reports

app = FastAPI(
    title="CyberSafe API",
    description="Backend for the CyberSafe learning + community feed platform.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reports.router)
app.include_router(quiz.router)
app.include_router(analytics.router)


@app.get("/")
def read_root():
    return {"message": "CyberSafe API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}