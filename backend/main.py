from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import coaches, clients, programs, calls, evaluations, dashboard
from database import engine
from sql_models import Base
from config import get_settings

settings = get_settings()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Beavermind Emulator API", version="1.0.0")

allow_origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(coaches.router, prefix=settings.API_PREFIX)
app.include_router(clients.router, prefix=settings.API_PREFIX)
app.include_router(programs.router, prefix=settings.API_PREFIX)
app.include_router(calls.router, prefix=settings.API_PREFIX)
app.include_router(evaluations.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)

@app.get("/health")
def health():
    return {"status": "ok"}
