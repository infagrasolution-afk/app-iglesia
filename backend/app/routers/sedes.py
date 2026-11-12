from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
import json
import os

from app import models, security
from app.database import get_db

router = APIRouter(prefix="/api/sedes", tags=["Sedes"])

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "sedes.json")

class AssignAdminRequest(BaseModel):
    name: str
    email: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = "123"
    notes: Optional[str] = None

class SedeCreate(BaseModel):
    id: Optional[str] = None
    name: str
    short_name: Optional[str] = None
    shortName: Optional[str] = None
    city: str
    state: str
    type: Optional[str] = "Sede Regional"
    location: Optional[str] = None
    pastors: Optional[str] = "Equipo Pastoral"
    pastors_title: Optional[str] = "Pastores de Sede"
    schedule: Optional[str] = "Domingos 10:00 am"
    description: Optional[str] = None
    color: Optional[str] = "#83050B"
    badge: Optional[str] = "Sede"
    bank: Optional[str] = None
    tax_id: Optional[str] = None
    phone: Optional[str] = None
    account_holder: Optional[str] = None
    instagram: Optional[str] = None
    instagram_url: Optional[str] = None
    sede_admin_name: Optional[str] = None
    sede_admin_username: Optional[str] = None
    sede_admin_email: Optional[str] = None
    sede_admin_password: Optional[str] = "123"
    # Nested structures sent by frontend Sedes.jsx
    donation: Optional[Dict[str, Any]] = None
    social: Optional[Dict[str, Any]] = None
    sede_admin: Optional[Dict[str, Any]] = None

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
                    "scheduleShort": s.schedule or "Domingos 10:00 AM",
                    "description": s.description,
                    "color": s.color,
                    "badge": s.badge or s.short_name or s.city,
                    "donation": {
                        "bank": s.bank or "Banco de Venezuela",
                        "taxId": s.tax_id or "V-18599632",
                        "phone": s.donation_phone or "0414-3172261",
                        "accountHolder": s.account_holder or s.name
                    },
                    "social": {
                        "instagram": s.instagram or "@restauracionglobal",
                        "instagramUrl": s.instagram_url or "https://www.instagram.com/restauracionglobal"
                    },
                    "sede_admin": {
                        "name": admin_user.full_name if admin_user else s.pastors,
                        "username": admin_user.username if admin_user else f"admin_{s.id.replace('-', '')}",
                        "email": admin_user.email if admin_user else f"admin.{s.id}@restauracionglobal.org",
                        "phone": (admin_user.phone if admin_user and admin_user.phone else s.donation_phone) or "",
                        "role": "ADMIN_SEDE",
                        "status": "Activo"
                    }
                })
            return result
    except Exception as e:
        print(f"Fallback to JSON on get_sedes: {e}")

    if os.path.exists(DATA_PATH):
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("sedes", [])
    return []

@router.post("")
def create_sede(req: SedeCreate, db: Session = Depends(get_db)):
    """
    Crear una nueva sede y su usuario administrador en Neon.
    Soporta tanto formato plano como anidado (donation, social, sede_admin).
    El usuario administrador se crea con must_change_password = True.
    """
    clean_name = req.name.strip()
    generated_id = req.id or clean_name.lower().replace("restauración", "").replace("restauracion", "").strip().replace(" ", "-")
    if not generated_id:
        generated_id = f"sede-{int(datetime.utcnow().timestamp())}"

    donation_dict = req.donation or {}
    social_dict = req.social or {}
    admin_dict = req.sede_admin or {}

    final_short_name = req.short_name or req.shortName or req.name.replace("Restauración ", "").replace("Restauracion ", "")
    final_bank = donation_dict.get("bank") or req.bank or "Banco de Venezuela"
    final_tax_id = donation_dict.get("taxId") or donation_dict.get("tax_id") or req.tax_id or "V-18599632"
    final_phone = donation_dict.get("phone") or req.phone or "0414-3172261"
    final_holder = donation_dict.get("accountHolder") or donation_dict.get("account_holder") or req.account_holder or req.name
    final_ig = social_dict.get("instagram") or req.instagram or "@restauracionglobal"
    final_ig_url = social_dict.get("instagramUrl") or social_dict.get("instagram_url") or req.instagram_url or "https://www.instagram.com/restauracionglobal"

    admin_username = admin_dict.get("username") or req.sede_admin_username or f"admin_{generated_id.replace('-', '')}"
    admin_name = admin_dict.get("name") or req.sede_admin_name or req.pastors or "Administrador Local"
    admin_email = admin_dict.get("email") or req.sede_admin_email or f"admin.{generated_id}@restauracionglobal.org"
    admin_password = admin_dict.get("password") or req.sede_admin_password or "123"
    admin_phone = admin_dict.get("phone") or final_phone

    try:
        existing_sede = db.query(models.Sede).filter(models.Sede.id == generated_id).first()
        if existing_sede:
            raise HTTPException(status_code=400, detail="Ya existe una sede con este identificador.")

        new_db_sede = models.Sede(
            id=generated_id,
            name=req.name,
            short_name=final_short_name,
            type=req.type or "Sede Regional",
            city=req.city,
            state=req.state,
            location=req.location or f"{req.city}, {req.state}",
            pastors=req.pastors or "Equipo Pastoral",
            schedule=req.schedule or "Domingos 10:00 am",
            description=req.description or f"Sede de la Iglesia Restauración en {req.city}.",
            color=req.color or "#83050B",
            badge=req.badge or final_short_name,
            bank=final_bank,
            tax_id=final_tax_id,
            donation_phone=final_phone,
            account_holder=final_holder,
            instagram=final_ig,
            instagram_url=final_ig_url
        )
        db.add(new_db_sede)

        existing_user = db.query(models.User).filter(
            (models.User.username == admin_username) | (models.User.email == admin_email)
        ).first()

        if not existing_user:
            hashed_pw = security.get_password_hash(admin_password)
            new_admin_user = models.User(
                username=admin_username,
                email=admin_email,
                full_name=f"{admin_name} (Admin Sede {final_short_name})",
                hashed_password=hashed_pw,
                role="ADMIN_SEDE",
                sede=generated_id,
                phone=admin_phone,
                must_change_password=True
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

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error creating sede in DB: {e}")
        raise HTTPException(status_code=500, detail=f"Error al registrar la sede: {str(e)}")

@router.put("/{sede_id}/admin")
def assign_sede_admin(sede_id: str, req: AssignAdminRequest, db: Session = Depends(get_db)):
    """
    Asignar o actualizar el Administrador de Sede en Neon PostgreSQL.
    """
    try:
        sede = db.query(models.Sede).filter(models.Sede.id == sede_id).first()
        admin_username = (req.username or f"admin_{sede_id.replace('-', '')}").strip()
        admin_email = (req.email or f"admin.{sede_id}@restauracionglobal.org").strip()

        admin_user = db.query(models.User).filter(
            (models.User.sede == sede_id) & (models.User.role == "ADMIN_SEDE")
        ).first()

        if not admin_user:
            admin_user = db.query(models.User).filter(
                (models.User.username == admin_username) | (models.User.email == admin_email)
            ).first()

        if admin_user:
            admin_user.full_name = req.name
            admin_user.username = admin_username
            admin_user.email = admin_email
            admin_user.sede = sede_id
            admin_user.role = "ADMIN_SEDE"
            if req.phone:
                admin_user.phone = req.phone
            if req.password:
                admin_user.hashed_password = security.get_password_hash(req.password)
                admin_user.must_change_password = True
        else:
            hashed_pw = security.get_password_hash(req.password or "123")
            admin_user = models.User(
                username=admin_username,
                email=admin_email,
                full_name=req.name,
                hashed_password=hashed_pw,
                role="ADMIN_SEDE",
                sede=sede_id,
                phone=req.phone,
                must_change_password=True
            )
            db.add(admin_user)

        if sede and req.name:
            sede.pastors = req.name

        db.commit()
        return {
            "success": True,
            "message": f"Administrador de sede {sede_id} actualizado en Neon PostgreSQL.",
            "sede_admin": {
                "name": admin_user.full_name,
                "username": admin_user.username,
                "email": admin_user.email,
                "phone": admin_user.phone,
                "role": "ADMIN_SEDE",
                "status": "Activo"
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al asignar administrador: {str(e)}")

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
