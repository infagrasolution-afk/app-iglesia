from fastapi import APIRouter, Depends, status
from typing import List, Optional
from app import schemas, security
from app.json_storage import DonationStorage

router = APIRouter(prefix="/api/donations", tags=["Donations"])

@router.get("", response_model=List[schemas.DonationResponse])
def get_donations(
    current_user: Optional[dict] = Depends(security.get_current_user_optional)
):
    donations = DonationStorage.get_all()
    if current_user and current_user.get("role") != "ADMIN":
        donations = [d for d in donations if d.get("user_id") == current_user.get("id")]
    return donations

@router.post("", response_model=schemas.DonationResponse, status_code=status.HTTP_201_CREATED)
def create_donation(
    donation_in: schemas.DonationCreate,
    current_user: Optional[dict] = Depends(security.get_current_user_optional)
):
    user_id = current_user.get("id") if current_user else None
    return DonationStorage.create(donation_in.model_dump(), user_id=user_id)
