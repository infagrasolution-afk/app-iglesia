from fastapi import APIRouter, status
from typing import List
from app import schemas
from app.json_storage import SermonStorage

router = APIRouter(prefix="/api/sermons", tags=["Sermons"])

@router.get("", response_model=List[schemas.SermonResponse])
def get_sermons():
    return SermonStorage.get_all()

@router.post("", response_model=schemas.SermonResponse, status_code=status.HTTP_201_CREATED)
def create_sermon(sermon_in: schemas.SermonCreate):
    return SermonStorage.create(sermon_in.model_dump())
