from fastapi import APIRouter, HTTPException, Query, Depends, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
import json
import os
import urllib.parse
import re

from app import models, security
from app.database import get_db

ALL_APP_MODULES = [
    "prayers", "members", "discipleship", "emotions", "bible",
    "sedes", "about", "announcements", "sermons", "donations"
]

DEFAULT_MEMBER_MODULES = [
    "prayers", "discipleship", "emotions", "bible",
    "sedes", "about", "announcements", "sermons", "donations"
]

MODULE_LABELS = {
    "prayers": "Muro de Oración",
    "members": "Directorio de Miembros",
    "discipleship": "Discipulado Bíblico",
    "emotions": "Frasco de Emociones",
    "bible": "Santa Biblia",
    "sedes": "Nuestras Sedes",
    "about": "Nuestra Iglesia",
    "announcements": "Anuncios y Boletín",
    "sermons": "Sermones y Podcast",
    "donations": "Diezmos y Ofrendas"
}

ALLOWED_CREATOR_ROLES = {"SUPER_ADMIN", "ADMIN_PRINCIPAL", "ADMIN_SEDE", "ADMIN"}

def _ensure_allowed_modules_column(db: Session):
    try:
        db.execute(text("ALTER TABLE members ADD COLUMN IF NOT EXISTS allowed_modules TEXT;"))
        db.commit()
    except Exception:
        db.rollback()

def _parse_modules(raw_val: Optional[str], fallback_list: Optional[List[str]] = None) -> List[str]:
    if raw_val:
        try:
            parsed = json.loads(raw_val) if isinstance(raw_val, str) else raw_val
            if isinstance(parsed, list) and len(parsed) > 0:
                valid = [m for m in parsed if m in ALL_APP_MODULES]
                if valid:
                    return valid
        except Exception:
            pass
    return fallback_list if fallback_list is not None else DEFAULT_MEMBER_MODULES

def clean_venezuela_phone(phone_str: str) -> str:
    """Formatea el número telefónico para WhatsApp internacional (código 58 para Venezuela)"""
    if not phone_str:
        return ""
    digits = re.sub(r"\D", "", phone_str)
    if not digits:
        return ""
    if digits.startswith("0") and len(digits) == 11:
        return "58" + digits[1:]
    if len(digits) == 10 and digits.startswith("4"):
        return "58" + digits
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
    creator_role: Optional[str] = "SUPER_ADMIN"
    allowed_modules: Optional[List[str]] = None
    create_access_user: Optional[bool] = False
    access_username: Optional[str] = None
    initial_password: Optional[str] = "123"

@router.get("")
def get_members(sede_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """
    Obtener miembros directamente desde la base de datos de Neon.
    Filtrado por sede para garantizar independencia de datos e incluye allowed_modules.
    """
    try:
        _ensure_allowed_modules_column(db)
        query = db.query(models.Member)
        if sede_id and sede_id != "TODAS":
            query = query.filter(models.Member.sede_id == sede_id)
        db_members = query.order_by(models.Member.id.desc()).all()

        # Mapear permisos de usuarios en caso de que algún miembro antiguo los tenga en users.permissions
        users_by_email = {
            (u.email or "").lower(): u.permissions
            for u in db.query(models.User).all()
            if u.email
        }

        result = []
        for m in db_members:
            user_perms = users_by_email.get((m.email or "").lower())
            modules_list = _parse_modules(m.allowed_modules or user_perms)
            result.append({
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
                "created_by": m.created_by,
                "allowed_modules": modules_list
            })
        return result
    except Exception as e:
        print(f"Fallback to JSON on get_members: {e}")
        if os.path.exists(DATA_PATH):
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                members = json.load(f)
            if sede_id and sede_id != "TODAS":
                members = [m for m in members if m.get("sede_id") == sede_id]
            for m in members:
                if "allowed_modules" not in m:
                    m["allowed_modules"] = DEFAULT_MEMBER_MODULES
            return members
        return []

@router.post("")
def add_member(
    req: MemberCreate,
    current_user: Optional[dict] = Depends(security.get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Registrar nuevo miembro en la base de datos de Neon.
    Restringido exclusivamente a SUPER_ADMIN y ADMIN_SEDE.
    Guarda los módulos permitidos (allowed_modules) tanto en members como en users.
    """
    effective_creator_role = (current_user.get("role") if current_user else req.creator_role) or "SUPER_ADMIN"
    if effective_creator_role not in ALLOWED_CREATOR_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: Solo los Superadministradores y Administradores de Sede pueden registrar nuevos miembros."
        )

    # Si es ADMIN_SEDE, forzar que solo pueda crear miembros en su propia sede
    if effective_creator_role == "ADMIN_SEDE" and current_user and current_user.get("sede") and current_user.get("sede") != "TODAS":
        req.sede_id = current_user.get("sede")

    sede_names = {
        "plaza-venezuela": "Restauración Plaza Venezuela",
        "maracay": "Restauración Maracay",
        "la-suiza": "Restauración La Suiza",
        "sucre": "Restauración Sucre",
        "maracaibo": "Restauración Maracaibo"
    }
    final_sede_name = req.sede_name or sede_names.get(req.sede_id, req.sede_id)
    final_email = req.email or f"{req.full_name.lower().replace(' ', '.')}@email.com"

    # Validar lista de módulos permitidos
    selected_modules = [m for m in (req.allowed_modules or DEFAULT_MEMBER_MODULES) if m in ALL_APP_MODULES]
    if not selected_modules:
        selected_modules = DEFAULT_MEMBER_MODULES
    modules_json = json.dumps(selected_modules, ensure_ascii=False)

    try:
        _ensure_allowed_modules_column(db)
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
            created_by=req.created_by or "Administrador",
            allowed_modules=modules_json
        )
        db.add(new_db_member)

        # Crear o actualizar cuenta de usuario en Neon con sus módulos permitidos
        initial_password = req.initial_password or "123"
        clean_name = "".join([c for c in req.full_name.lower().replace(" ", "").replace(".", "") if c.isalnum()])[:14]
        base_username = req.access_username or clean_name or f"user{int(datetime.utcnow().timestamp())}"

        username = base_username
        existing_user = db.query(models.User).filter(
            (models.User.email == final_email) | (models.User.username == username)
        ).first()

        if existing_user:
            username = existing_user.username
            existing_user.permissions = modules_json
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
                permissions=modules_json,
                must_change_password=True
            )
            db.add(new_user)

        db.commit()
        db.refresh(new_db_member)

        # Preparar mensaje de bienvenida por WhatsApp con módulos habilitados
        clean_phone = clean_venezuela_phone(req.phone or "")
        modules_names_str = ", ".join([MODULE_LABELS.get(m, m) for m in selected_modules])
        whatsapp_message = (
            f"¡Hola, {req.full_name}! 🕊️\n\n"
            f"Te damos una bendecida bienvenida a la familia de la Iglesia Cristiana Restauración ({final_sede_name}).\n\n"
            f"Hemos activado tu cuenta de acceso a la plataforma del sistema con las siguientes credenciales:\n"
            f"👤 Usuario: {username}\n"
            f"📧 Correo: {final_email}\n"
            f"🔑 Contraseña temporal: {initial_password}\n\n"
            f"📱 Módulos habilitados en tu cuenta:\n"
            f"✅ {modules_names_str}\n\n"
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
            "created_by": new_db_member.created_by,
            "allowed_modules": selected_modules
        }
        return {
            "success": True,
            "member": member_dict,
            "credentials": {
                "username": username,
                "email": final_email,
                "initial_password": initial_password,
                "must_change_password": True,
                "allowed_modules": selected_modules
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
            "created_by": req.created_by or "Administrador",
            "allowed_modules": selected_modules
        }
        members.insert(0, new_member)
        with open(DATA_PATH, "w", encoding="utf-8") as f:
            json.dump(members, f, indent=2, ensure_ascii=False)
        return {"success": True, "member": new_member}

class MemberUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    sede_id: Optional[str] = None
    sede_name: Optional[str] = None
    role: Optional[str] = None
    ministry: Optional[str] = None
    baptism_status: Optional[str] = None
    discipleship_status: Optional[str] = None
    allowed_modules: Optional[List[str]] = None

@router.put("/{member_id}")
def update_member(
    member_id: int,
    req: MemberUpdate,
    current_user: Optional[dict] = Depends(security.get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Actualizar datos y módulos permitidos de un miembro en Neon PostgreSQL (Solo Superadmin y Admin Sede)."""
    if current_user and current_user.get("role") not in ALLOWED_CREATOR_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los Superadministradores y Administradores de Sede pueden modificar miembros."
        )

    try:
        _ensure_allowed_modules_column(db)
        member = db.query(models.Member).filter(models.Member.id == member_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Miembro no encontrado.")
        if req.full_name is not None:
            member.full_name = req.full_name
        if req.email is not None:
            member.email = req.email
        if req.phone is not None:
            member.phone = req.phone
        if req.sede_id is not None:
            member.sede_id = req.sede_id
        if req.sede_name is not None:
            member.sede_name = req.sede_name
        if req.role is not None:
            member.role = req.role
        if req.ministry is not None:
            member.ministry = req.ministry
        if req.baptism_status is not None:
            member.baptism_status = req.baptism_status
        if req.discipleship_status is not None:
            member.discipleship_status = req.discipleship_status

        if req.allowed_modules is not None:
            valid_mods = [m for m in req.allowed_modules if m in ALL_APP_MODULES]
            if not valid_mods:
                valid_mods = DEFAULT_MEMBER_MODULES
            mods_json = json.dumps(valid_mods, ensure_ascii=False)
            member.allowed_modules = mods_json

            # Sincronizar también en la tabla users para el login del miembro
            if member.email:
                linked_user = db.query(models.User).filter(models.User.email.ilike(member.email)).first()
                if linked_user:
                    linked_user.permissions = mods_json

        db.commit()
        db.refresh(member)
        return {
            "success": True,
            "member": {
                "id": member.id,
                "full_name": member.full_name,
                "email": member.email,
                "phone": member.phone,
                "sede_id": member.sede_id,
                "sede_name": member.sede_name,
                "role": member.role,
                "ministry": member.ministry,
                "baptism_status": member.baptism_status,
                "discipleship_status": member.discipleship_status,
                "joined_at": member.joined_at,
                "created_by": member.created_by,
                "allowed_modules": _parse_modules(member.allowed_modules)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error actualizando miembro: {str(e)}")

@router.delete("/{member_id}")
def delete_member(
    member_id: int,
    current_user: Optional[dict] = Depends(security.get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Eliminar miembro de Neon PostgreSQL (Solo Superadmin y Admin Sede)."""
    if current_user and current_user.get("role") not in ALLOWED_CREATOR_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los Superadministradores y Administradores de Sede pueden eliminar miembros."
        )
    try:
        member = db.query(models.Member).filter(models.Member.id == member_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Miembro no encontrado.")
        db.delete(member)
        db.commit()
        return {"success": True, "message": "Miembro eliminado exitosamente."}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error eliminando miembro: {str(e)}")
