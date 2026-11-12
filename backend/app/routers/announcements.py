from fastapi import APIRouter, status, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from app import schemas, models
from app.database import get_db

router = APIRouter(prefix="/api/announcements", tags=["Announcements"])

@router.get("", response_model=List[schemas.AnnouncementResponse])
def get_announcements(sede_id: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Obtener comunicados directamente desde la base de datos de Neon.
    Filtra por sede o 'TODAS'.
    """
    query = db.query(models.Announcement)
    if sede_id and sede_id != "TODAS":
        query = query.filter(models.Announcement.sede_id.in_([sede_id, "TODAS"]))
    return query.order_by(models.Announcement.created_at.desc()).all()

@router.post("", response_model=schemas.AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(announcement_in: schemas.AnnouncementCreate, db: Session = Depends(get_db)):
    """
    Publicar nuevo anuncio directamente en Neon.
    """
    new_ann = models.Announcement(
        title=announcement_in.title,
        content=announcement_in.content,
        category=announcement_in.category or "Avisos Generales",
        is_important=announcement_in.is_important,
        sede_id=announcement_in.sede_id or "TODAS",
        sede_name=announcement_in.sede_name or "Todas las Sedes (Nacional)",
        created_by=announcement_in.created_by or "Superadmin"
    )
    db.add(new_ann)
    db.commit()
    db.refresh(new_ann)
    return new_ann

@router.delete("/{announcement_id}")
def delete_announcement(announcement_id: int, db: Session = Depends(get_db)):
    """
    Eliminar un anuncio en Neon.
    """
    ann = db.query(models.Announcement).filter(models.Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado.")
    db.delete(ann)
    db.commit()
    return {"success": True, "message": "Anuncio eliminado exitosamente."}
