from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.config import settings
from app.database.db import engine
from app.database.models import Base

from app.api import health
from app.api import routes_text
from app.api import routes_risk
from app.api import routes_face
from app.api import routes_speech
from app.api import routes_assistant


# ---------------------------------------------------------
# Create FastAPI Application
# ---------------------------------------------------------
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Multi-Modal Emotion Recognition System API with Mental Health Assistant"
)


# ---------------------------------------------------------
# CORS Configuration (Frontend Ready)
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Startup Event
# ---------------------------------------------------------
@app.on_event("startup")
def on_startup():
    logger.info("Starting Emotion Monitoring API...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully.")
    logger.info("All models and services initialized.")


# ---------------------------------------------------------
# Root Endpoint
# ---------------------------------------------------------
@app.get("/")
def root():
    return {
        "message": "Emotion Monitoring API with Mental Health Assistant is running",
        "version": "1.0.0"
    }


# ---------------------------------------------------------
# Include Routers
# ---------------------------------------------------------
app.include_router(health.router, prefix="/api", tags=["Health"])

app.include_router(routes_text.router, prefix="/api", tags=["Text Emotion"])

app.include_router(routes_risk.router, prefix="/api", tags=["Risk Analysis"])

app.include_router(routes_face.router, prefix="/api", tags=["Face Emotion"])

app.include_router(routes_speech.router, prefix="/api", tags=["Speech Emotion"])

app.include_router(
    routes_assistant.router,
    prefix="/api",
    tags=["Mental Health Assistant"]
)
