import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query, status

router = APIRouter(prefix="/api/discipleship", tags=["Discipleship"])

DATA_FILE = Path(__file__).parent.parent.parent / "data" / "discipleship.json"

def load_data() -> Dict[str, Any]:
    if not DATA_FILE.exists():
        return {"program_info": {}, "modules": [], "disciples": [], "submissions": []}
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(data: Dict[str, Any]):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

@router.get("")
def get_discipleship_data():
    """Retorna la estructura completa del discipulado: módulos, lecciones, discípulos y entregas."""
    return load_data()

@router.get("/modules")
def get_modules():
    """Retorna los módulos y lecciones."""
    data = load_data()
    return data.get("modules", [])

@router.post("/lessons", status_code=status.HTTP_201_CREATED)
def create_lesson(payload: Dict[str, Any]):
    """Permite al discipulador/líder agregar una nueva lección a un módulo."""
    data = load_data()
    module_id = payload.get("module_id")
    if not module_id:
        raise HTTPException(status_code=400, detail="module_id es requerido")

    target_module = next((m for m in data.get("modules", []) if m["id"] == module_id), None)
    if not target_module:
        raise HTTPException(status_code=404, detail="Módulo no encontrado")

    lesson_id = f"les-{module_id}-{len(target_module.get('lessons', [])) + 1}"
    new_lesson = {
        "id": lesson_id,
        "module_id": module_id,
        "order": len(target_module.get("lessons", [])) + 1,
        "title": payload.get("title", "Nueva Lección"),
        "scripture": payload.get("scripture", "Santa Biblia"),
        "duration": payload.get("duration", "30 min"),
        "objective": payload.get("objective", ""),
        "content": payload.get("content", ""),
        "questions": payload.get("questions", []),
        "practical_task": payload.get("practical_task", "")
    }

    target_module.setdefault("lessons", []).append(new_lesson)
    save_data(data)
    return new_lesson

@router.post("/submissions", status_code=status.HTTP_201_CREATED)
def submit_activity(payload: Dict[str, Any]):
    """Permite al discípulo enviar las respuestas de su actividad para ser evaluado."""
    data = load_data()
    submission_id = f"sub-{int(datetime.utcnow().timestamp())}"
    new_sub = {
        "id": submission_id,
        "disciple_id": payload.get("disciple_id", 3),
        "disciple_name": payload.get("disciple_name", "Miembro en Discipulado"),
        "lesson_id": payload.get("lesson_id"),
        "lesson_title": payload.get("lesson_title", "Lección de Discipulado"),
        "submitted_at": datetime.utcnow().isoformat(),
        "answers": payload.get("answers", []),
        "practical_task_done": payload.get("practical_task_done", True),
        "practical_task_notes": payload.get("practical_task_notes", ""),
        "status": "PENDIENTE",
        "evaluation": None
    }

    data.setdefault("submissions", []).insert(0, new_sub)
    save_data(data)
    return new_sub

@router.post("/submissions/{submission_id}/evaluate")
def evaluate_submission(submission_id: str, payload: Dict[str, Any]):
    """Permite al discipulador evaluar una entrega, dar retroalimentación y avanzar el progreso del discípulo."""
    data = load_data()
    submissions = data.setdefault("submissions", [])
    sub = next((s for s in submissions if s["id"] == submission_id), None)
    if not sub:
        raise HTTPException(status_code=404, detail="Entrega no encontrada")

    eval_status = payload.get("status", "APROBADO")
    evaluation = {
        "status": eval_status,
        "score": payload.get("score", "Excelente (100%)"),
        "evaluated_by": payload.get("evaluated_by", "Pastor / Discipulador"),
        "evaluated_at": datetime.utcnow().isoformat(),
        "mentor_feedback": payload.get("mentor_feedback", "¡Buen trabajo en esta lección!")
    }

    sub["status"] = eval_status
    sub["evaluation"] = evaluation

    # Si fue aprobada, avanzar el progreso del discípulo
    if eval_status == "APROBADO":
        disciple_id = sub.get("disciple_id")
        lesson_id = sub.get("lesson_id")
        for d in data.get("disciples", []):
            if d["id"] == disciple_id or d["user_id"] == disciple_id:
                if lesson_id and lesson_id not in d.setdefault("completed_lessons", []):
                    d["completed_lessons"].append(lesson_id)

    save_data(data)
    return sub
