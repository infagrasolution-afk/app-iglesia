from fastapi import APIRouter, status
from typing import List
from app import schemas
from app.json_storage import AnnouncementStorage

router = APIRouter(prefix="/api/announcements", tags=["Announcements"])

@router.get("", response_model=List[schemas.AnnouncementResponse])
def get_announcements():
    return AnnouncementStorage.get_all()

@router.post("", response_model=schemas.AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(announcement_in: schemas.AnnouncementCreate):
    return AnnouncementStorage.create(announcement_in.model_dump())
