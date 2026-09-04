from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app import schemas, security
from app.json_storage import PrayerStorage

router = APIRouter(prefix="/api/prayers", tags=["Prayers"])

@router.get("", response_model=List[schemas.PrayerResponse])
def get_prayers(
    filter_status: str = Query("all", description="all, active, answered"),
    user_role: str = Query("MIEMBRO", description="Current user role for filtering: ADMIN, LIDER, MIEMBRO"),
    current_user: Optional[dict] = Depends(security.get_current_user_optional)
):
    effective_role = current_user.get("role") if current_user else user_role
    prayers = PrayerStorage.get_all(filter_status=filter_status, user_role=effective_role)
    
    # Mask author_name if anonymous
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
    current_user: Optional[dict] = Depends(security.get_current_user_optional)
):
    new_prayer = PrayerStorage.create(prayer_in.model_dump(), author_user=current_user)
    return new_prayer

@router.post("/{prayer_id}/pray", response_model=schemas.PrayerResponse)
def pray_for_request(prayer_id: int):
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
    status_in: schemas.PrayerStatusUpdate
):
    prayer = PrayerStorage.update_status(prayer_id, status_in.status)
    if not prayer:
        raise HTTPException(status_code=404, detail="Petición de oración no encontrada.")
    return prayer
