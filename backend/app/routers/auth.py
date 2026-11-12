from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime
import json

from app import schemas, security, models
from app.database import get_db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

ALL_APP_MODULES = [
    "prayers", "members", "discipleship", "emotions", "bible",
    "sedes", "about", "announcements", "sermons", "donations"
]

@router.post("/login")
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    """
    Inicio de sesión autenticado 100% contra la base de datos PostgreSQL en Neon.
    Permite ingresar con correo electrónico o nombre de usuario.
    Retorna el token y si el usuario debe cambiar su contraseña obligatoriamente.
    """
    clean_identifier = login_data.email.strip().lower()

    # Buscar usuario por email o por username
    user = db.query(models.User).filter(
        or_(
            models.User.email.ilike(clean_identifier),
            models.User.username.ilike(clean_identifier)
        )
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas o usuario no registrado."
        )

    # Verificar contraseña encriptada o compatibilidad de transición
    is_valid = False
    if user.hashed_password.startswith("$2b$"):
        is_valid = security.verify_password(login_data.password, user.hashed_password)
    else:
        # Si estaba en texto plano, validar y re-hashear automáticamente en PostgreSQL
        if login_data.password == user.hashed_password:
            is_valid = True
            user.hashed_password = security.get_password_hash(login_data.password)
            db.commit()

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña incorrecta."
        )

    # Generar Token JWT
    token = security.create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "username": user.username,
        "role": user.role,
        "sede": user.sede
    })

    # Resolver módulos permitidos (allowed_modules)
    allowed_modules = ALL_APP_MODULES
    if user.role not in ("SUPER_ADMIN", "ADMIN_PRINCIPAL", "ADMIN_SEDE", "ADMIN"):
        parsed_modules = None
        if user.permissions:
            try:
                parsed = json.loads(user.permissions)
                if isinstance(parsed, list) and len(parsed) > 0:
                    parsed_modules = [m for m in parsed if m in ALL_APP_MODULES]
            except Exception:
                pass
        if not parsed_modules:
            member_rec = db.query(models.Member).filter(models.Member.email.ilike(user.email)).first()
            if member_rec and member_rec.allowed_modules:
                try:
                    parsed = json.loads(member_rec.allowed_modules)
                    if isinstance(parsed, list) and len(parsed) > 0:
                        parsed_modules = [m for m in parsed if m in ALL_APP_MODULES]
                except Exception:
                    pass
        if parsed_modules:
            allowed_modules = parsed_modules

    # Resolver fecha de nacimiento del usuario (desde users o vinculada en members)
    resolved_birth_date = getattr(user, "birth_date", None)
    if not resolved_birth_date:
        member_query = db.query(models.Member)
        member_match = None
        if user.email:
            member_match = member_query.filter(models.Member.email.ilike(user.email)).first()
        if not member_match and user.full_name:
            member_match = member_query.filter(models.Member.full_name.ilike(user.full_name)).first()
        if member_match and getattr(member_match, "birth_date", None):
            resolved_birth_date = member_match.birth_date

    user_dict = {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role,
        "sede": user.sede,
        "is_owner": user.is_owner,
        "is_global_pastor": user.is_global_pastor,
        "must_change_password": bool(user.must_change_password),
        "phone": security.decrypt_phone(user.phone) if user.phone else None,
        "birth_date": resolved_birth_date,
        "allowed_modules": allowed_modules
    }

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_dict,
        "must_change_password": bool(user.must_change_password)
    }

@router.post("/change-password")
def change_password(data: schemas.ChangePasswordRequest, db: Session = Depends(get_db)):
    """
    Cambio obligatorio o voluntario de contraseña.
    Hashea la nueva contraseña con bcrypt y la persiste en PostgreSQL,
    desactivando el flag 'must_change_password'.
    """
    user = db.query(models.User).filter(models.User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres.")

    # Hashear y actualizar en la base de datos
    user.hashed_password = security.get_password_hash(data.new_password)
    user.must_change_password = False
    db.commit()

    return {
        "success": True,
        "message": "Contraseña actualizada exitosamente en la base de datos.",
        "must_change_password": False
    }

@router.post("/request-reset")
def request_password_reset(data: schemas.PasswordResetCreate, db: Session = Depends(get_db)):
    """
    El usuario solicita recuperación de contraseña desde la pantalla de login.
    Se crea una solicitud pendiente en la base de datos para aprobación de los Superadministradores.
    """
    clean_id = data.identifier.strip().lower()

    # Intentar vincular con el usuario si existe
    user = db.query(models.User).filter(
        or_(
            models.User.email.ilike(clean_id),
            models.User.username.ilike(clean_id)
        )
    ).first()

    reset_req = models.PasswordResetRequest(
        user_id=user.id if user else None,
        identifier=data.identifier.strip(),
        full_name=user.full_name if user else data.full_name,
        phone=data.phone or (user.phone if user else None),
        sede_id=user.sede if user else data.sede_id,
        status="PENDIENTE"
    )

    db.add(reset_req)
    db.commit()
    db.refresh(reset_req)

    return {
        "success": True,
        "request_id": reset_req.id,
        "message": "Tu solicitud ha sido enviada a los Superadministradores. Una vez aprobada, recibirás tus credenciales temporales."
    }

@router.get("/reset-requests", response_model=List[schemas.PasswordResetResponse])
def get_pending_reset_requests(db: Session = Depends(get_db)):
    """
    Listar solicitudes de recuperación de contraseña para los Superadministradores.
    """
    return db.query(models.PasswordResetRequest).order_by(models.PasswordResetRequest.created_at.desc()).all()

@router.post("/reset-requests/{request_id}/approve")
def approve_password_reset(request_id: int, approval: schemas.PasswordResetApproval, db: Session = Depends(get_db)):
    """
    El Superadmin aprueba la solicitud: asigna clave temporal (ej: '123')
    y marca al usuario con must_change_password = True para que la cambie al ingresar.
    """
    req = db.query(models.PasswordResetRequest).filter(models.PasswordResetRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada.")

    req.status = approval.status
    req.resolved_at = datetime.utcnow()
    req.resolved_by = "Superadministrador"

    if approval.status == "APROBADO":
        temp_pass = approval.temporary_password or "123"
        req.temporary_password = temp_pass

        # Si hay usuario vinculado, actualizar su contraseña y marcar must_change_password
        if req.user_id:
            user = db.query(models.User).filter(models.User.id == req.user_id).first()
            if user:
                user.hashed_password = security.get_password_hash(temp_pass)
                user.must_change_password = True

    db.commit()

    return {
        "success": True,
        "status": req.status,
        "temporary_password": req.temporary_password,
        "message": f"Solicitud marcada como {approval.status}."
    }
