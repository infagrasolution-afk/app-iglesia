from fastapi import APIRouter, status, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
from app import schemas, models
from app.database import get_db
from app.json_storage import SermonStorage

router = APIRouter(prefix="/api/sermons", tags=["Sermons"])

@router.get("", response_model=List[schemas.SermonResponse])
def get_sermons(
    sede_id: Optional[str] = Query(None, description="Filter by sede_id or TODAS"),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(models.Sermon)
        if sede_id and sede_id != "TODAS":
            query = query.filter(models.Sermon.sede_id.in_([sede_id, "TODAS"]))
        sermons = query.order_by(models.Sermon.id.desc()).all()
        if sermons:
            return sermons
    except Exception as e:
        print(f"Fallback to JSON on get_sermons: {e}")

    return SermonStorage.get_all()

@router.post("", response_model=schemas.SermonResponse, status_code=status.HTTP_201_CREATED)
def create_sermon(sermon_in: schemas.SermonCreate, db: Session = Depends(get_db)):
    try:
        new_sermon = models.Sermon(
            title=sermon_in.title,
            series=sermon_in.series or "Serie Ministerial",
            speaker=sermon_in.speaker or "Pastor Said Carrasquel",
            audio_url=sermon_in.audio_url,
            video_url=sermon_in.video_url,
            pdf_url=sermon_in.pdf_url,
            date=sermon_in.date or datetime.utcnow().strftime("%Y-%m-%d"),
            sede_id=sermon_in.sede_id or "TODAS"
        )
        db.add(new_sermon)
        db.commit()
        db.refresh(new_sermon)
        return new_sermon
    except Exception as e:
        db.rollback()
        print(f"Fallback to JSON on create_sermon: {e}")
        return SermonStorage.create(sermon_in.model_dump())

@router.delete("/{sermon_id}")
def delete_sermon(sermon_id: int, db: Session = Depends(get_db)):
    try:
        sermon = db.query(models.Sermon).filter(models.Sermon.id == sermon_id).first()
        if not sermon:
            raise HTTPException(status_code=404, detail="Sermón no encontrado.")
        db.delete(sermon)
        db.commit()
        return {"success": True, "message": "Sermón eliminado de la base de datos."}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al eliminar sermón: {str(e)}")
