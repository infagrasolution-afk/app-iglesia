from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app import schemas, security
from app.json_db import PrayerJSONDB

router = APIRouter(prefix="/api/prayers", tags=["Prayers"])

@router.get("", response_model=List[schemas.PrayerResponse])
def get_prayers(
    filter_status: str = Query("all", description="all, active, answered"),
    user_role: str = Query("MIEMBRO", description="Current user role"),
    current_user: Optional[dict] = Depends(security.get_current_user_optional)
):
    role = current_user.get("role", user_role) if current_user else user_role
    return PrayerJSONDB.get_all(status_filter=filter_status, user_role=role)

@router.post("", response_model=schemas.PrayerResponse, status_code=status.HTTP_201_CREATED)
def create_prayer(
    prayer_in: schemas.PrayerCreate,
    current_user: Optional[dict] = Depends(security.get_current_user_optional)
):
    author_id = current_user.get("id") if current_user else None
    author_name = current_user.get("full_name", "Miembro de la Iglesia") if current_user else "Miembro de la Iglesia"

    new_prayer = PrayerJSONDB.create(
        prayer_in.dict(),
        author_name=author_name,
        author_id=author_id
    )
    return new_prayer

@router.post("/{prayer_id}/pray", response_model=schemas.PrayerResponse)
def pray_for_request(prayer_id: int):
    updated = PrayerJSONDB.pray(prayer_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Petición de oración no encontrada.")
    return updated

@router.patch("/{prayer_id}/status", response_model=schemas.PrayerResponse)
def update_prayer_status(
    prayer_id: int,
    status_in: schemas.PrayerStatusUpdate
):
    updated = PrayerJSONDB.update_status(prayer_id, status_in.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Petición de oración no encontrada.")
    return updated

@router.delete("/{prayer_id}", status_code=status.HTTP_200_OK)
def delete_prayer(
    prayer_id: int,
    current_user: dict = Depends(security.require_admin_or_pastor)
):
    success = PrayerJSONDB.delete(prayer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Petición de oración no encontrada.")
    return {"message": "Petición eliminada correctamente.", "id": prayer_id}
