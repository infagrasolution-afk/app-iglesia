from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import text
from app.database import engine
from app import models
from app.routers import auth, prayers, announcements, sermons, donations, bible, emotions, discipleship, sedes, members

# Asegurar que todas las tablas y nuevas columnas existan en PostgreSQL / SQLite al iniciar
try:
    models.Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE members ADD COLUMN IF NOT EXISTS allowed_modules TEXT;"))
except Exception as e:
    print(f"Aviso inicializando tablas de base de datos: {e}")

app = FastAPI(
    title="Iglesia Restauración API",
    description="API REST Backend para la aplicación web y PWA móvil de la Iglesia Cristiana Restauración (Persistencia en Neon PostgreSQL Multi-Sede).",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5177",
        "http://127.0.0.1:5177",
        "http://localhost:8000",
        "http://localhost:8050"
    ],
    allow_origin_regex="https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers (Neon PostgreSQL Multi-Sede Persistence)
app.include_router(auth.router)
app.include_router(prayers.router)
app.include_router(announcements.router)
app.include_router(sermons.router)
app.include_router(donations.router)
app.include_router(bible.router)
app.include_router(emotions.router)
app.include_router(discipleship.router)
app.include_router(sedes.router)
app.include_router(members.router)

@app.get("/")
def root():
    return {
        "message": "Bienvenido a la API REST de la Iglesia Restauración",
        "storage": "Neon PostgreSQL (Multi-Sede)",
        "docs_url": "/docs",
        "status": "online"
    }

@app.get("/api/status")
def status_check():
    return {"status": "ok", "app": "Iglesia Restauración API", "version": "2.0.0", "storage": "Neon PostgreSQL"}
