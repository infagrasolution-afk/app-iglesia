from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, prayers, announcements, sermons, donations, bible, emotions, discipleship, sedes, members

app = FastAPI(
    title="Iglesia Restauración API",
    description="API REST Backend para la aplicación web y PWA móvil de la iglesia Restauración (Almacenamiento JSON).",
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

# Include Routers (now running 100% on JSON Storage)
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
        "storage": "JSON Files (backend/data/)",
        "docs_url": "/docs",
        "status": "online"
    }

@app.get("/api/status")
def status_check():
    return {"status": "ok", "app": "Iglesia Restauración API", "version": "1.0.0", "storage": "JSON"}
