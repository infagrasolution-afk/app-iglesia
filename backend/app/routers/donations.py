from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app import schemas, security
from app.json_db import DonationJSONDB

router = APIRouter(prefix="/api/donations", tags=["Donations"])

@router.get("", response_model=List[schemas.DonationResponse])
def get_donations(current_user: Optional[dict] = Depends(security.get_current_user_optional)):
    donations = DonationJSONDB.get_all()
    if current_user and current_user.get("role") not in ["ADMIN", "PASTOR"]:
        user_id = current_user.get("id")
        donations = [d for d in donations if d.get("user_id") == user_id]
    return donations

@router.post("", response_model=schemas.DonationResponse, status_code=status.HTTP_201_CREATED)
def create_donation(
    donation_in: schemas.DonationCreate,
    current_user: Optional[dict] = Depends(security.get_current_user_optional)
):
    user_id = current_user.get("id") if current_user else None
    new_donation = DonationJSONDB.create(donation_in.dict(), user_id=user_id)
    return new_donation

@router.delete("/{donation_id}", status_code=status.HTTP_200_OK)
def delete_donation(
    donation_id: int,
    current_user: dict = Depends(security.require_admin_or_pastor)
):
    success = DonationJSONDB.delete(donation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Donación no encontrada.")
    return {"message": "Donación eliminada correctamente.", "id": donation_id}
