from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app import schemas, security
from app.json_db import SermonJSONDB

router = APIRouter(prefix="/api/sermons", tags=["Sermons"])

@router.get("", response_model=List[schemas.SermonResponse])
def get_sermons():
    return SermonJSONDB.get_all()

@router.get("/{sermon_id}", response_model=schemas.SermonResponse)
def get_sermon_by_id(sermon_id: int):
    item = SermonJSONDB.get_by_id(sermon_id)
    if not item:
        raise HTTPException(status_code=404, detail="Sermón no encontrado.")
    return item

@router.post("", response_model=schemas.SermonResponse, status_code=status.HTTP_201_CREATED)
def create_sermon(
    sermon_in: schemas.SermonCreate,
    current_user: dict = Depends(security.require_admin_or_pastor)
):
    new_item = SermonJSONDB.create(sermon_in.dict())
    return new_item

@router.put("/{sermon_id}", response_model=schemas.SermonResponse)
def update_sermon(
    sermon_id: int,
    sermon_in: schemas.SermonCreate,
    current_user: dict = Depends(security.require_admin_or_pastor)
):
    updated = SermonJSONDB.update(sermon_id, sermon_in.dict())
    if not updated:
        raise HTTPException(status_code=404, detail="Sermón no encontrado.")
    return updated

@router.delete("/{sermon_id}", status_code=status.HTTP_200_OK)
def delete_sermon(
    sermon_id: int,
    current_user: dict = Depends(security.require_admin_or_pastor)
):
    success = SermonJSONDB.delete(sermon_id)
    if not success:
        raise HTTPException(status_code=404, detail="Sermón no encontrado.")
    return {"message": "Sermón eliminado correctamente.", "id": sermon_id}
