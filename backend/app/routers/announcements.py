from fastapi import APIRouter, status
from typing import List, Optional

router = APIRouter(prefix="/api/announcements", tags=["Announcements"])

@router.get("", response_model=List[schemas.AnnouncementResponse])
def get_announcements(sede_id: Optional[str] = None):
    all_announcements = AnnouncementStorage.get_all()
    if not sede_id or sede_id == "TODAS":
        return all_announcements
    return [a for a in all_announcements if a.get("sede_id") in [sede_id, "TODAS", None]]

@router.post("", response_model=schemas.AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(announcement_in: schemas.AnnouncementCreate):
    return AnnouncementStorage.create(announcement_in.model_dump())
