from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
import json
import os
import urllib.parse
import re

from app import models, security
from app.database import get_db

def clean_venezuela_phone(phone_str: str) -> str:
    """Formatea el número telefónico para WhatsApp internacional (código 58 para Venezuela)"""
    if not phone_str:
        return ""
    digits = re.sub(r"\D", "", phone_str)
    if not digits:
        return ""
    # Si comienza con 0 y tiene 11 dígitos (ej: 04120161906 -> 584120161906)
    if digits.startswith("0") and len(digits) == 11:
        return "58" + digits[1:]
    # Si tiene 10 dígitos y comienza con 4 (ej: 4120161906)
    if len(digits) == 10 and digits.startswith("4"):
        return "58" + digits
    # Si ya empieza con 58
    if digits.startswith("58"):
        return digits
    return digits

router = APIRouter(prefix="/api/members", tags=["Members"])

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "members.json")

class MemberCreate(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    sede_id: str
    sede_name: Optional[str] = None
    role: Optional[str] = "MIEMBRO"
    ministry: Optional[str] = "General"
    baptism_status: Optional[str] = "Bautizado"
    discipleship_status: Optional[str] = "En formación"
    created_by: Optional[str] = "Administrador"
    # Opciones para crear credenciales de acceso inicial si se desea
    create_access_user: Optional[bool] = False
    access_username: Optional[str] = None
    initial_password: Optional[str] = "123"

@router.get("")
def get_members(sede_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """
    Obtener miembros directamente desde la base de datos de Neon.
    Filtrado por sede para garantizar independencia de datos.
    """
    try:
        query = db.query(models.Member)
        if sede_id and sede_id != "TODAS":
            query = query.filter(models.Member.sede_id == sede_id)
        db_members = query.order_by(models.Member.id.desc()).all()
        
        return [
            {
                "id": m.id,
                "full_name": m.full_name,
                "email": m.email,
                "phone": m.phone,
                "sede_id": m.sede_id,
                "sede_name": m.sede_name,
                "role": m.role,
                "ministry": m.ministry,
                "baptism_status": m.baptism_status,
                "discipleship_status": m.discipleship_status,
                "joined_at": m.joined_at,
                "created_by": m.created_by
            }
            for m in db_members
        ]
    except Exception as e:
        print(f"Fallback to JSON on get_members: {e}")
        if os.path.exists(DATA_PATH):
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                members = json.load(f)
            if sede_id and sede_id != "TODAS":
                return [m for m in members if m.get("sede_id") == sede_id]
            return members
        return []

@router.post("")
def add_member(req: MemberCreate, db: Session = Depends(get_db)):
    """
    Registrar nuevo miembro en la base de datos de Neon.
    Si se crea acceso de usuario, se guarda encriptado y con must_change_password = True.
    """
    sede_names = {
        "plaza-venezuela": "Restauración Plaza Venezuela",
        "maracay": "Restauración Maracay",
        "la-suiza": "Restauración La Suiza",
        "sucre": "Restauración Sucre",
        "maracaibo": "Restauración Maracaibo"
    }
    final_sede_name = req.sede_name or sede_names.get(req.sede_id, req.sede_id)
    final_email = req.email or f"{req.full_name.lower().replace(' ', '.')}@email.com"

    try:
        new_db_member = models.Member(
            full_name=req.full_name,
            email=final_email,
            phone=req.phone or "No registrado",
            sede_id=req.sede_id,
            sede_name=final_sede_name,
            role=req.role or "MIEMBRO",
            ministry=req.ministry or "General",
            baptism_status=req.baptism_status or "Bautizado",
            discipleship_status=req.discipleship_status or "En formación",
            joined_at=datetime.utcnow().strftime("%Y-%m-%d"),
            created_by=req.created_by or "Administrador"
        )
        db.add(new_db_member)

        # Crear SIEMPRE cuenta de usuario en Neon para todo nuevo miembro (cualquier rol)
        initial_password = req.initial_password or "123"
        clean_name = "".join([c for c in req.full_name.lower().replace(" ", "").replace(".", "") if c.isalnum()])[:14]
        base_username = req.access_username or clean_name or f"user{int(datetime.utcnow().timestamp())}"
        
        # Garantizar que el username no colisione
        username = base_username
        existing_user = db.query(models.User).filter(
            (models.User.email == final_email) | (models.User.username == username)
        ).first()

        if existing_user:
            username = existing_user.username
        else:
            hashed = security.get_password_hash(initial_password)
            new_user = models.User(
                username=username,
                email=final_email,
                full_name=req.full_name,
                hashed_password=hashed,
                role=req.role or "MIEMBRO",
                sede=req.sede_id,
                phone=req.phone,
                must_change_password=True # ¡Obliga a cambiar clave en primer inicio de sesión!
            )
            db.add(new_user)

        db.commit()
        db.refresh(new_db_member)

        # Preparar mensaje de bienvenida por WhatsApp con remitente L. Infante (04120161906)
        clean_phone = clean_venezuela_phone(req.phone or "")
        whatsapp_message = (
            f"¡Hola, {req.full_name}! 🕊️\n\n"
            f"Te damos una bendecida bienvenida a la familia de la Iglesia Cristiana Restauración ({final_sede_name}).\n\n"
            f"Hemos activado tu cuenta de acceso a la plataforma del sistema con las siguientes credenciales:\n"
            f"👤 Usuario: {username}\n"
            f"📧 Correo: {final_email}\n"
            f"🔑 Contraseña temporal: {initial_password}\n\n"
            f"⚠️ Nota de seguridad: Al iniciar sesión por primera vez, el sistema te solicitará obligatoriamente cambiar tu contraseña por una personalizada.\n\n"
            f"Atentamente,\n"
            f"Luis Infante (linfante)\n"
            f"Superadministrador / Sistemas\n"
            f"📲 WhatsApp remitente: 04120161906"
        )
        whatsapp_url = f"https://wa.me/{clean_phone}?text={urllib.parse.quote(whatsapp_message)}" if clean_phone else ""

        member_dict = {
            "id": new_db_member.id,
            "full_name": new_db_member.full_name,
            "email": new_db_member.email,
            "phone": new_db_member.phone,
            "sede_id": new_db_member.sede_id,
            "sede_name": new_db_member.sede_name,
            "role": new_db_member.role,
            "ministry": new_db_member.ministry,
            "baptism_status": new_db_member.baptism_status,
            "discipleship_status": new_db_member.discipleship_status,
            "joined_at": new_db_member.joined_at,
            "created_by": new_db_member.created_by
        }
        return {
            "success": True,
            "member": member_dict,
            "credentials": {
                "username": username,
                "email": final_email,
                "initial_password": initial_password,
                "must_change_password": True
            },
            "whatsapp": {
                "phone": clean_phone,
                "message": whatsapp_message,
                "url": whatsapp_url,
                "sender_name": "Luis Infante (linfante)",
                "sender_phone": "04120161906"
            }
        }

    except Exception as e:
        db.rollback()
        print(f"Error saving to DB, using JSON fallback: {e}")
        # Fallback local
        members = []
        if os.path.exists(DATA_PATH):
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                members = json.load(f)
        new_id = max([m.get("id", 0) for m in members], default=0) + 1
        new_member = {
            "id": new_id,
            "full_name": req.full_name,
            "email": final_email,
            "phone": req.phone or "No registrado",
            "sede_id": req.sede_id,
            "sede_name": final_sede_name,
            "role": req.role or "MIEMBRO",
            "ministry": req.ministry or "General",
            "baptism_status": req.baptism_status or "Bautizado",
            "discipleship_status": req.discipleship_status or "En formación",
            "joined_at": datetime.utcnow().strftime("%Y-%m-%d"),
            "created_by": req.created_by or "Administrador"
        }
        members.insert(0, new_member)
        with open(DATA_PATH, "w", encoding="utf-8") as f:
            json.dump(members, f, indent=2, ensure_ascii=False)
        return {"success": True, "member": new_member}
