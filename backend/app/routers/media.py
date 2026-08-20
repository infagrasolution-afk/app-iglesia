from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app import schemas, security
from app.json_db import MediaJSONDB

router = APIRouter(prefix="/api/media", tags=["Media Gallery"])

@router.get("", response_model=List[schemas.MediaResponse])
def get_media(
    media_type: Optional[str] = Query(None, description="Filtrar por tipo: photo, video"),
    category: Optional[str] = Query(None, description="Filtrar por categoría: Eventos, Cultos, Retiros, Jóvenes")
):
    items = MediaJSONDB.get_all()
    if media_type:
        items = [m for m in items if m.get("media_type", "").lower() == media_type.lower()]
    if category and category != "Todos":
        items = [m for m in items if m.get("category", "").lower() == category.lower()]
    return items

@router.get("/{media_id}", response_model=schemas.MediaResponse)
def get_media_by_id(media_id: int):
    item = MediaJSONDB.get_by_id(media_id)
    if not item:
        raise HTTPException(status_code=404, detail="Archivo multimedia no encontrado.")
    return item

@router.post("", response_model=schemas.MediaResponse, status_code=status.HTTP_201_CREATED)
def create_media(
    media_in: schemas.MediaCreate,
    current_user: dict = Depends(security.require_admin_or_pastor)
):
    new_item = MediaJSONDB.create(media_in.dict())
    return new_item

@router.put("/{media_id}", response_model=schemas.MediaResponse)
def update_media(
    media_id: int,
    media_in: schemas.MediaUpdate,
    current_user: dict = Depends(security.require_admin_or_pastor)
):
    updated = MediaJSONDB.update(media_id, media_in.dict())
    if not updated:
        raise HTTPException(status_code=404, detail="Archivo multimedia no encontrado.")
    return updated

@router.delete("/{media_id}", status_code=status.HTTP_200_OK)
def delete_media(
    media_id: int,
    current_user: dict = Depends(security.require_admin_or_pastor)
):
    success = MediaJSONDB.delete(media_id)
    if not success:
        raise HTTPException(status_code=404, detail="Archivo multimedia no encontrado.")
    return {"message": "Archivo eliminado correctamente.", "id": media_id}
