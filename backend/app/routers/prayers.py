from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app import schemas, security, models
from app.database import get_db
from app.json_storage import PrayerStorage

router = APIRouter(prefix="/api/prayers", tags=["Prayers"])

LEADER_ROLES = {"SUPER_ADMIN", "ADMIN_PRINCIPAL", "ADMIN_SEDE", "ADMIN", "LIDER"}

def _format_prayer(p: models.Prayer) -> dict:
    return {
        "id": p.id,
        "title": p.title,
        "description": p.description,
        "author_id": p.author_id,
        "author_name": "Hermano(a) en Fe (Anónimo)" if p.is_anonymous else (p.author_name or "Miembro de la Iglesia"),
        "is_anonymous": bool(p.is_anonymous),
        "visibility": p.visibility or "PUBLIC",
        "status": p.status or "active",
        "prayer_count": p.prayer_count or 0,
        "sede_id": p.sede_id or "TODAS",
        "created_at": p.created_at
    }

@router.get("", response_model=List[schemas.PrayerResponse])
def get_prayers(
    filter_status: str = Query("all", description="all, active, answered"),
    user_role: str = Query("MIEMBRO", description="Current user role for filtering"),
    sede_id: Optional[str] = Query(None, description="Filter by sede_id"),
    current_user: Optional[dict] = Depends(security.get_current_user_optional),
    db: Session = Depends(get_db)
):
    effective_role = (current_user.get("role") if current_user else user_role) or "MIEMBRO"
    try:
        query = db.query(models.Prayer)
        if filter_status in ("active", "answered"):
            query = query.filter(models.Prayer.status == filter_status)
        if effective_role not in LEADER_ROLES:
            query = query.filter(models.Prayer.visibility == "PUBLIC")
        if sede_id and sede_id != "TODAS":
            query = query.filter(models.Prayer.sede_id.in_([sede_id, "TODAS"]))

        prayers = query.order_by(models.Prayer.created_at.desc()).all()
        return [_format_prayer(p) for p in prayers]
    except Exception as e:
        print(f"Fallback to JSON on get_prayers: {e}")
        prayers = PrayerStorage.get_all(filter_status=filter_status, user_role=effective_role)
        results = []
        for p in prayers:
            item = p.copy()
            if item.get("is_anonymous"):
                item["author_name"] = "Hermano(a) en Fe (Anónimo)"
            results.append(item)
        return results

@router.post("", response_model=schemas.PrayerResponse, status_code=status.HTTP_201_CREATED)
def create_prayer(
    prayer_in: schemas.PrayerCreate,
    current_user: Optional[dict] = Depends(security.get_current_user_optional),
    db: Session = Depends(get_db)
):
    author_id = current_user.get("id") if current_user else None
    author_name = (
        "Hermano(a) en Fe (Anónimo)"
        if prayer_in.is_anonymous
        else (prayer_in.author_name or (current_user.get("full_name") if current_user else "Miembro de la Iglesia"))
    )
    sede_id = prayer_in.sede_id or (current_user.get("sede") if current_user else "TODAS") or "TODAS"

    try:
        new_prayer = models.Prayer(
            title=prayer_in.title,
            description=prayer_in.description,
            author_id=author_id,
            author_name=author_name,
            is_anonymous=prayer_in.is_anonymous,
            visibility=prayer_in.visibility or "PUBLIC",
            status="active",
            prayer_count=1,
            sede_id=sede_id
        )
        db.add(new_prayer)
        db.commit()
        db.refresh(new_prayer)
        return _format_prayer(new_prayer)
    except Exception as e:
        db.rollback()
        print(f"Fallback to JSON on create_prayer: {e}")
        return PrayerStorage.create(prayer_in.model_dump(), author_user=current_user)

@router.post("/{prayer_id}/pray", response_model=schemas.PrayerResponse)
def pray_for_request(prayer_id: int, db: Session = Depends(get_db)):
    try:
        prayer = db.query(models.Prayer).filter(models.Prayer.id == prayer_id).first()
        if not prayer:
            raise HTTPException(status_code=404, detail="Petición de oración no encontrada.")
        prayer.prayer_count = (prayer.prayer_count or 0) + 1
        db.commit()
        db.refresh(prayer)
        return _format_prayer(prayer)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Fallback to JSON on pray_for_request: {e}")
        prayer = PrayerStorage.pray(prayer_id)
        if not prayer:
            raise HTTPException(status_code=404, detail="Petición de oración no encontrada.")
        item = prayer.copy()
        if item.get("is_anonymous"):
            item["author_name"] = "Hermano(a) en Fe (Anónimo)"
        return item

@router.patch("/{prayer_id}/status", response_model=schemas.PrayerResponse)
def update_prayer_status(
    prayer_id: int,
    status_in: schemas.PrayerStatusUpdate,
    db: Session = Depends(get_db)
):
    try:
        prayer = db.query(models.Prayer).filter(models.Prayer.id == prayer_id).first()
        if not prayer:
            raise HTTPException(status_code=404, detail="Petición de oración no encontrada.")
        prayer.status = status_in.status
        db.commit()
        db.refresh(prayer)
        return _format_prayer(prayer)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Fallback to JSON on update_prayer_status: {e}")
        prayer = PrayerStorage.update_status(prayer_id, status_in.status)
        if not prayer:
            raise HTTPException(status_code=404, detail="Petición de oración no encontrada.")
        return prayer

@router.delete("/{prayer_id}")
def delete_prayer(prayer_id: int, db: Session = Depends(get_db)):
    try:
        prayer = db.query(models.Prayer).filter(models.Prayer.id == prayer_id).first()
        if not prayer:
            raise HTTPException(status_code=404, detail="Petición de oración no encontrada.")
        db.delete(prayer)
        db.commit()
        return {"success": True, "message": "Petición de oración eliminada."}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar petición: {str(e)}")
