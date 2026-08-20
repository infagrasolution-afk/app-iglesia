from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, Base, SessionLocal
from app import models, security
from app.routers import auth, users, prayers, announcements, sermons, donations, bible, media
from app.json_db import (
    UserJSONDB,
    MediaJSONDB,
    SermonJSONDB,
    AnnouncementJSONDB,
    PrayerJSONDB,
    DonationJSONDB
)

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Iglesia Restauración API",
    description="API REST Backend para la aplicación web y PWA móvil de la Iglesia Restauración.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8050",
        "http://127.0.0.1:8050",
        "http://localhost:8000"
    ],
    allow_origin_regex="https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(media.router)
app.include_router(prayers.router)
app.include_router(announcements.router)
app.include_router(sermons.router)
app.include_router(donations.router)
app.include_router(bible.router)

@app.on_event("startup")
def seed_initial_data():
    # Initialize JSON DBs
    UserJSONDB.get_all()
    MediaJSONDB.get_all()
    SermonJSONDB.get_all()
    AnnouncementJSONDB.get_all()
    PrayerJSONDB.get_all()
    DonationJSONDB.get_all()

@app.get("/")
def root():
    return {
        "message": "Bienvenido a la API REST de la Iglesia Evangélica",
        "docs_url": "/docs",
        "status": "online"
    }

@app.get("/api/status")
def status_check():
    return {"status": "ok", "app": "Iglesia Evangélica API", "version": "1.0.0"}
