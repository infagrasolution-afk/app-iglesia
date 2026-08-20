from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app import schemas, security
from app.json_db import AnnouncementJSONDB

router = APIRouter(prefix="/api/announcements", tags=["Announcements"])

@router.get("", response_model=List[schemas.AnnouncementResponse])
def get_announcements():
    return AnnouncementJSONDB.get_all()

@router.get("/{announcement_id}", response_model=schemas.AnnouncementResponse)
def get_announcement_by_id(announcement_id: int):
    item = AnnouncementJSONDB.get_by_id(announcement_id)
    if not item:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado.")
    return item

@router.post("", response_model=schemas.AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(
    announcement_in: schemas.AnnouncementCreate,
    current_user: dict = Depends(security.require_admin_or_pastor)
):
    new_item = AnnouncementJSONDB.create(announcement_in.dict())
    return new_item

@router.put("/{announcement_id}", response_model=schemas.AnnouncementResponse)
def update_announcement(
    announcement_id: int,
    announcement_in: schemas.AnnouncementCreate,
    current_user: dict = Depends(security.require_admin_or_pastor)
):
    updated = AnnouncementJSONDB.update(announcement_id, announcement_in.dict())
    if not updated:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado.")
    return updated

@router.delete("/{announcement_id}", status_code=status.HTTP_200_OK)
def delete_announcement(
    announcement_id: int,
    current_user: dict = Depends(security.require_admin_or_pastor)
):
    success = AnnouncementJSONDB.delete(announcement_id)
    if not success:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado.")
    return {"message": "Anuncio eliminado correctamente.", "id": announcement_id}
