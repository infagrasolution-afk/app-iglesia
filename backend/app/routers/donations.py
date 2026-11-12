from fastapi import APIRouter, Depends, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app import schemas, security, models
from app.database import get_db
from app.json_storage import DonationStorage

router = APIRouter(prefix="/api/donations", tags=["Donations"])

ADMIN_ROLES = {"SUPER_ADMIN", "ADMIN_PRINCIPAL", "ADMIN_SEDE", "ADMIN"}

@router.get("", response_model=List[schemas.DonationResponse])
def get_donations(
    sede_id: Optional[str] = Query(None, description="Filter by sede_id"),
    current_user: Optional[dict] = Depends(security.get_current_user_optional),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(models.Donation)
        if sede_id and sede_id != "TODAS":
            query = query.filter(models.Donation.sede_id == sede_id)

        if current_user:
            role = current_user.get("role", "MIEMBRO")
            if role not in ADMIN_ROLES:
                query = query.filter(models.Donation.user_id == current_user.get("id"))
            elif role == "ADMIN_SEDE" and current_user.get("sede") and current_user.get("sede") != "TODAS":
                query = query.filter(models.Donation.sede_id == current_user.get("sede"))

        donations = query.order_by(models.Donation.created_at.desc()).all()
        return donations
    except Exception as e:
        print(f"Fallback to JSON on get_donations: {e}")
        donations = DonationStorage.get_all()
        if current_user and current_user.get("role") not in ADMIN_ROLES:
            donations = [d for d in donations if d.get("user_id") == current_user.get("id")]
        return donations

@router.post("", response_model=schemas.DonationResponse, status_code=status.HTTP_201_CREATED)
def create_donation(
    donation_in: schemas.DonationCreate,
    current_user: Optional[dict] = Depends(security.get_current_user_optional),
    db: Session = Depends(get_db)
):
    user_id = current_user.get("id") if current_user else None
    donor_name = donation_in.donor_name or (current_user.get("full_name") if current_user else "Miembro de la Congregación")
    sede_id = donation_in.sede_id or (current_user.get("sede") if current_user else "TODAS") or "TODAS"

    try:
        new_donation = models.Donation(
            user_id=user_id,
            donation_type=donation_in.donation_type,
            amount=donation_in.amount,
            payment_method=donation_in.payment_method,
            reference=donation_in.reference or "CONFIRMADO_ONLINE",
            sede_id=sede_id,
            donor_name=donor_name,
            donor_phone=donation_in.donor_phone,
            status="CONFIRMADO"
        )
        db.add(new_donation)
        db.commit()
        db.refresh(new_donation)
        return new_donation
    except Exception as e:
        db.rollback()
        print(f"Fallback to JSON on create_donation: {e}")
        return DonationStorage.create(donation_in.model_dump(), user_id=user_id)
