from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
import json
import os

from app import models, security
from app.database import get_db

router = APIRouter(prefix="/api/sedes", tags=["Sedes"])

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "sedes.json")
USERS_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "users.json")

class AssignAdminRequest(BaseModel):
    admin_name: str
    admin_email: Optional[str] = None
    admin_username: Optional[str] = None
    notes: Optional[str] = None

class SedeCreate(BaseModel):
    id: Optional[str] = None
    name: str
    short_name: Optional[str] = None
    city: str
    state: str
    type: Optional[str] = "Sede Regional"
    location: Optional[str] = None
    pastors: str
    pastors_title: Optional[str] = "Pastores de Sede"
    schedule: Optional[str] = "Domingos 10:00 am"
    description: Optional[str] = None
    color: Optional[str] = "#83050B"
    badge: Optional[str] = "Sede"
    bank: Optional[str] = "Banco de Venezuela"
    tax_id: Optional[str] = "V-18599632"
    phone: Optional[str] = "0414-3172261"
    account_holder: Optional[str] = "Iglesia Restauración Global"
    instagram: Optional[str] = "@restauracionglobal"
    instagram_url: Optional[str] = "https://www.instagram.com/restauracionglobal"
    sede_admin_name: Optional[str] = None
    sede_admin_username: Optional[str] = None
    sede_admin_email: Optional[str] = None
    sede_admin_password: Optional[str] = "123"

@router.get("")
def get_sedes(db: Session = Depends(get_db)):
    """
    Obtener sedes directamente de la base de datos de Neon.
    """
    try:
        db_sedes = db.query(models.Sede).all()
        if db_sedes and len(db_sedes) > 0:
            result = []
            for s in db_sedes:
                admin_user = db.query(models.User).filter(
                    models.User.sede == s.id,
                    models.User.role == "ADMIN_SEDE"
                ).first()
                result.append({
                    "id": s.id,
                    "name": s.name,
                    "shortName": s.short_name or s.name,
                    "type": s.type,
                    "city": s.city,
                    "state": s.state,
                    "location": s.location,
                    "pastors": s.pastors,
                    "schedule": s.schedule,
                    "description": s.description,
                    "color": s.color,
                    "badge": s.badge,
                    "donation": {
                        "bank": s.bank,
                        "taxId": s.tax_id,
                        "phone": s.donation_phone,
                        "accountHolder": s.account_holder
                    },
                    "social": {
                        "instagram": s.instagram,
                        "instagramUrl": s.instagram_url
                    },
                    "sede_admin": {
                        "name": admin_user.full_name if admin_user else s.pastors,
                        "username": admin_user.username if admin_user else f"admin_{s.id.replace('-', '')}",
                        "email": admin_user.email if admin_user else f"admin.{s.id}@restauracionglobal.org",
                        "role": "ADMIN_SEDE",
                        "status": "Activo"
                    }
                })
            return result
    except Exception as e:
        print(f"Fallback to JSON on get_sedes: {e}")

    # Fallback to JSON
    if os.path.exists(DATA_PATH):
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("sedes", [])
    return []

@router.post("")
def create_sede(req: SedeCreate, db: Session = Depends(get_db)):
    """
    Crear una nueva sede y su usuario administrador en Neon.
    El usuario administrador se crea con must_change_password = True.
    """
    clean_name = req.name.strip()
    generated_id = req.id or clean_name.lower().replace("restauración", "").replace("restauracion", "").strip().replace(" ", "-")
    if not generated_id:
        generated_id = f"sede-{int(datetime.utcnow().timestamp())}"

    admin_username = req.sede_admin_username or f"admin_{generated_id.replace('-', '')}"
    admin_name = req.sede_admin_name or req.pastors
    admin_email = req.sede_admin_email or f"admin.{generated_id}@restauracionglobal.org"

    try:
        existing_sede = db.query(models.Sede).filter(models.Sede.id == generated_id).first()
        if existing_sede:
            raise HTTPException(status_code=400, detail="Ya existe una sede con este identificador.")

        # Guardar Sede en Neon
        new_db_sede = models.Sede(
            id=generated_id,
            name=req.name,
            short_name=req.short_name or req.name.replace("Restauración ", "").replace("Restauracion ", ""),
            type=req.type or "Sede Regional",
            city=req.city,
            state=req.state,
            location=req.location or f"{req.city}, {req.state}",
            pastors=req.pastors,
            schedule=req.schedule or "Domingos 10:00 am",
            description=req.description or f"Sede de la Iglesia Restauración en {req.city}.",
            color=req.color or "#83050B",
            badge=req.badge or "Sede Regional",
            bank=req.bank or "Banco de Venezuela",
            tax_id=req.tax_id or "V-18599632",
            donation_phone=req.phone or "0414-3172261",
            account_holder=req.account_holder or req.name,
            instagram=req.instagram or "@restauracionglobal",
            instagram_url=req.instagram_url or "https://www.instagram.com/restauracionglobal"
        )
        db.add(new_db_sede)

        # Crear Usuario Administrador de Sede en Neon
        existing_user = db.query(models.User).filter(
            (models.User.username == admin_username) | (models.User.email == admin_email)
        ).first()

        if not existing_user:
            hashed_pw = security.get_password_hash(req.sede_admin_password or "123")
            new_admin_user = models.User(
                username=admin_username,
                email=admin_email,
                full_name=f"{admin_name} (Admin Sede {new_db_sede.short_name})",
                hashed_password=hashed_pw,
                role="ADMIN_SEDE",
                sede=generated_id,
                phone=req.phone,
                must_change_password=True # ¡Obliga a cambiar contraseña en primer login!
            )
            db.add(new_admin_user)

        db.commit()

        return {
            "success": True,
            "message": "Sede y Administrador creados exitosamente en la base de datos.",
            "sede": {
                "id": generated_id,
                "name": req.name,
                "city": req.city,
                "admin_username": admin_username,
                "must_change_password": True
            }
        }

    except Exception as e:
        db.rollback()
        print(f"Error creating sede in DB: {e}")
        raise HTTPException(status_code=500, detail=f"Error al registrar la sede: {str(e)}")

@router.delete("/{sede_id}")
def delete_sede(sede_id: str, db: Session = Depends(get_db)):
    """
    Eliminar una sede en Neon.
    """
    try:
        sede = db.query(models.Sede).filter(models.Sede.id == sede_id).first()
        if sede:
            db.delete(sede)
            db.commit()
            return {"success": True, "message": f"Sede {sede_id} eliminada de la base de datos."}
    except Exception as e:
        db.rollback()
        print(f"Error deleting sede in DB: {e}")

    return {"success": True, "message": f"Sede {sede_id} removida."}
