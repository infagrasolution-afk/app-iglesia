import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app import models
from app.database import get_db

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
def get_discipleship_data(db: Session = Depends(get_db)):
    """Retorna la estructura completa del discipulado sincronizada con Neon PostgreSQL."""
    data = load_data()

    try:
        db_modules = db.query(models.DiscipleshipModule).order_by(models.DiscipleshipModule.order_index.asc()).all()
        if db_modules:
            merged_modules = []
            local_modules_map = {m.get("id"): m for m in data.get("modules", [])}
            for mod in db_modules:
                local_mod = local_modules_map.get(mod.id, {})
                lessons = []
                if mod.lessons_json:
                    try:
                        lessons = json.loads(mod.lessons_json) if isinstance(mod.lessons_json, str) else mod.lessons_json
                    except Exception:
                        lessons = local_mod.get("lessons", [])
                else:
                    lessons = local_mod.get("lessons", [])

                merged_modules.append({
                    **local_mod,
                    "id": mod.id,
                    "title": mod.title,
                    "description": mod.description,
                    "level": mod.level or local_mod.get("level", "Fundamento"),
                    "order_index": mod.order_index,
                    "lessons": lessons
                })
            data["modules"] = merged_modules

        db_subs = db.query(models.DiscipleshipSubmission).order_by(models.DiscipleshipSubmission.submitted_at.desc()).all()
        if db_subs:
            existing_subs_ids = set()
            pg_subs = []
            for s in db_subs:
                ans_obj = {}
                if s.answers_json:
                    try:
                        ans_obj = json.loads(s.answers_json) if isinstance(s.answers_json, str) else s.answers_json
                    except Exception:
                        ans_obj = {}
                eval_obj = None
                if s.evaluation_json:
                    try:
                        eval_obj = json.loads(s.evaluation_json) if isinstance(s.evaluation_json, str) else s.evaluation_json
                    except Exception:
                        eval_obj = None

                sub_id = ans_obj.get("submission_key") or f"sub-pg-{s.id}"
                existing_subs_ids.add(sub_id)
                pg_subs.append({
                    "id": sub_id,
                    "db_id": s.id,
                    "disciple_id": s.user_id or ans_obj.get("disciple_id", 3),
                    "disciple_name": s.user_name or "Miembro en Discipulado",
                    "lesson_id": ans_obj.get("lesson_id") or s.module_id,
                    "lesson_title": ans_obj.get("lesson_title", "Lección de Discipulado"),
                    "submitted_at": s.submitted_at.isoformat() if s.submitted_at else datetime.utcnow().isoformat(),
                    "answers": ans_obj.get("answers", []),
                    "practical_task_done": ans_obj.get("practical_task_done", True),
                    "practical_task_notes": ans_obj.get("practical_task_notes", ""),
                    "status": s.status or "PENDIENTE",
                    "evaluation": eval_obj
                })

            local_only = [ls for ls in data.get("submissions", []) if ls.get("id") not in existing_subs_ids]
            data["submissions"] = pg_subs + local_only
    except Exception as e:
        print(f"Fallback to local JSON on get_discipleship_data: {e}")

    return data

@router.get("/modules")
def get_modules(db: Session = Depends(get_db)):
    """Retorna los módulos y lecciones."""
    data = get_discipleship_data(db)
    return data.get("modules", [])

@router.post("/lessons", status_code=status.HTTP_201_CREATED)
def create_lesson(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """Permite al discipulador/líder agregar una nueva lección a un módulo y guardarla en Neon."""
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

    # Sincronizar con Neon PostgreSQL
    try:
        db_mod = db.query(models.DiscipleshipModule).filter(models.DiscipleshipModule.id == module_id).first()
        if db_mod:
            db_mod.lessons_json = json.dumps(target_module["lessons"], ensure_ascii=False)
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error syncing lesson to DB: {e}")

    return new_lesson

@router.post("/submissions", status_code=status.HTTP_201_CREATED)
def submit_activity(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """Permite al discípulo enviar las respuestas de su actividad para ser evaluado en Neon."""
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

    # Persistir también en Neon PostgreSQL
    try:
        lesson_id_str = str(payload.get("lesson_id") or "")
        # Extraer module_id si viene como les-mod-1-1
        parts = lesson_id_str.split("-")
        inferred_mod_id = f"{parts[1]}-{parts[2]}" if len(parts) >= 3 else "mod-1"

        db_sub = models.DiscipleshipSubmission(
            user_id=payload.get("disciple_id") if isinstance(payload.get("disciple_id"), int) else None,
            user_name=new_sub["disciple_name"],
            module_id=inferred_mod_id,
            sede_id=payload.get("sede_id", "TODAS"),
            answers_json=json.dumps({
                "submission_key": submission_id,
                "disciple_id": new_sub["disciple_id"],
                "lesson_id": new_sub["lesson_id"],
                "lesson_title": new_sub["lesson_title"],
                "answers": new_sub["answers"],
                "practical_task_done": new_sub["practical_task_done"],
                "practical_task_notes": new_sub["practical_task_notes"]
            }, ensure_ascii=False),
            status="PENDIENTE"
        )
        db.add(db_sub)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error saving submission to DB: {e}")

    return new_sub

@router.post("/submissions/{submission_id}/evaluate")
def evaluate_submission(submission_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    """Permite al discipulador evaluar una entrega, dar retroalimentación y avanzar el progreso del discípulo."""
    data = load_data()
    submissions = data.setdefault("submissions", [])
    sub = next((s for s in submissions if s["id"] == submission_id), None)

    eval_status = payload.get("status", "APROBADO")
    evaluation = {
        "status": eval_status,
        "score": payload.get("score", "Excelente (100%)"),
        "evaluated_by": payload.get("evaluated_by", "Pastor / Discipulador"),
        "evaluated_at": datetime.utcnow().isoformat(),
        "mentor_feedback": payload.get("mentor_feedback", "¡Buen trabajo en esta lección!")
    }

    if sub:
        sub["status"] = eval_status
        sub["evaluation"] = evaluation

        if eval_status == "APROBADO":
            disciple_id = sub.get("disciple_id")
            lesson_id = sub.get("lesson_id")
            for d in data.get("disciples", []):
                if d["id"] == disciple_id or d.get("user_id") == disciple_id:
                    if lesson_id and lesson_id not in d.setdefault("completed_lessons", []):
                        d["completed_lessons"].append(lesson_id)

        save_data(data)

    # Actualizar en Neon PostgreSQL si existe
    try:
        db_subs = db.query(models.DiscipleshipSubmission).all()
        for db_s in db_subs:
            ans = {}
            if db_s.answers_json:
                try:
                    ans = json.loads(db_s.answers_json) if isinstance(db_s.answers_json, str) else db_s.answers_json
                except Exception:
                    pass
            if ans.get("submission_key") == submission_id or f"sub-pg-{db_s.id}" == submission_id:
                db_s.status = eval_status
                db_s.evaluation_json = json.dumps(evaluation, ensure_ascii=False)
                db.commit()
                if not sub:
                    return {
                        "id": submission_id,
                        "status": eval_status,
                        "evaluation": evaluation
                    }
                break
    except Exception as e:
        db.rollback()
        print(f"Error updating submission evaluation in DB: {e}")

    if not sub:
        raise HTTPException(status_code=404, detail="Entrega no encontrada")

    return sub
