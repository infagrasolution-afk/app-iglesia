from fastapi import APIRouter, HTTPException, Query, Depends, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text
import json
import os
import urllib.parse
import re
import unicodedata

from app import models, security
from app.database import get_db

def generate_username_from_name(full_name: str) -> str:
    """
    Genera el usuario en formato: inicial del primer nombre + apellido.
    Ejemplo: 'Said Carrasquel' -> 'scarrasquel', 'Luis Infante' -> 'linfante'.
    """
    if not full_name:
        return ""
    norm = unicodedata.normalize("NFKD", full_name).encode("ascii", "ignore").decode("ascii").lower()
    words = [re.sub(r"[^a-z0-9]", "", w) for w in norm.split()]
    titles = {"pastor", "pastora", "apostol", "profeta", "evangelista", "maestro", "ing", "dr", "dra", "lic", "hno", "hna", "hermano", "hermana"}
    words = [w for w in words if w and w not in titles]
    if not words:
        return ""
    if len(words) == 1:
        return words[0][:16]
    if len(words) == 2:
        return (words[0][0] + words[1])[:18]
    if len(words) == 3:
        return (words[0][0] + words[2])[:18]
    # 4 o más palabras (Nombre1 Nombre2 Apellido1 Apellido2) -> inicial Nombre1 + Apellido1
    return (words[0][0] + words[2])[:18]

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
        db.execute(text("ALTER TABLE members ADD COLUMN IF NOT EXISTS birth_date VARCHAR(20);"))
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date VARCHAR(20);"))
        db.execute(text("ALTER TABLE members ALTER COLUMN phone TYPE VARCHAR(255);"))
        db.execute(text("ALTER TABLE users ALTER COLUMN phone TYPE VARCHAR(255);"))
        db.execute(text("ALTER TABLE users ALTER COLUMN email DROP NOT NULL;"))
        db.execute(text("ALTER TABLE members DROP CONSTRAINT IF EXISTS fk_members_sede;"))
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS app_settings (
                key VARCHAR(100) PRIMARY KEY,
                value TEXT NOT NULL,
                description VARCHAR(255),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """))
        db.commit()
    except Exception:
        db.rollback()

    # Encriptar teléfonos en texto plano existentes en la BD para garantizar privacidad total
    try:
        unencrypted_members = db.query(models.Member).filter(
            models.Member.phone.isnot(None),
            models.Member.phone != "No registrado",
            ~models.Member.phone.like("ENC:v1:%")
        ).all()
        changed = False
        for m in unencrypted_members:
            m.phone = security.encrypt_phone(m.phone)
            changed = True
        unencrypted_users = db.query(models.User).filter(
            models.User.phone.isnot(None),
            models.User.phone != "No registrado",
            ~models.User.phone.like("ENC:v1:%")
        ).all()
        for u in unencrypted_users:
            u.phone = security.encrypt_phone(u.phone)
            changed = True
        if changed:
            db.commit()
    except Exception:
        db.rollback()

def build_birthday_greeting(full_name: str, sede_name: str = "Iglesia Restauración") -> str:
    return (
        f"🎂 ¡Feliz y bendecido cumpleaños, {full_name}! 🎉🕊️\n\n"
        f"En nombre de toda la familia pastoral y congregacional de la Iglesia Restauración ({sede_name}), "
        f"hoy celebramos tu vida y damos gracias a Dios por un nuevo año de propósito, salud y gracia sobre ti.\n\n"
        f"📖 «Jehová te bendiga, y te guarde; Jehová haga resplandecer su rostro sobre ti, y tenga de ti misericordia; "
        f"Jehová alce sobre ti su rostro, y ponga en ti paz.» (Números 6:24-26)\n\n"
        f"¡Que el Señor conceda las peticiones de tu corazón en este nuevo año de vida! 🙌✨\n"
        f"Con amor en Cristo,\n"
        f"Iglesia Restauración"
    )

def get_birthday_notification_time(db: Session) -> str:
    """Retorna la hora configurada de notificación de cumpleaños (ej: '05:00', '19:00'). Por defecto 05:00."""
    try:
        setting = db.query(models.AppSetting).filter(models.AppSetting.key == "birthday_notification_time").first()
        if setting and setting.value:
            val = setting.value.strip()
            # Validar formato HH:MM
            if re.match(r"^(?:[01]\d|2[0-3]):[0-5]\d$", val):
                return val
    except Exception:
        pass
    return "05:00"

def dispatch_daily_5am_birthday_greetings(db: Session):
    """
    Revisa automáticamente si ya se alcanzó la hora programada (Hora Venezuela UTC-4),
    y para cada cumpleañero del día publica y envía automáticamente su mensaje
    de felicitación de parte de la Iglesia Restauración.
    """
    try:
        sched_time = get_birthday_notification_time(db)
        sched_h, sched_m = [int(p) for p in sched_time.split(":")]

        ve_now = datetime.utcnow() - timedelta(hours=4)
        now_minutes = ve_now.hour * 60 + ve_now.minute
        sched_minutes = sched_h * 60 + sched_m

        if now_minutes < sched_minutes:
            return []
        today_month = ve_now.month
        today_day = ve_now.day
        today_date_str = ve_now.strftime("%Y-%m-%d")

        members_with_bday = db.query(models.Member).filter(models.Member.birth_date.isnot(None)).all()
        dispatched = []
        for m in members_with_bday:
            bdate_str = (m.birth_date or "").strip()
            if not bdate_str:
                continue
            try:
                parts = bdate_str.split("-")
                if len(parts) != 3:
                    continue
                b_month = int(parts[1])
                b_day = int(parts[2])
            except Exception:
                continue

            if b_month == today_month and b_day == today_day:
                auto_category = f"Cumpleaños {today_date_str} ({sched_time})"
                expected_title = f"🎂 ¡Feliz Cumpleaños, {m.full_name}! 🎉"
                existing_ann = db.query(models.Announcement).filter(
                    models.Announcement.title == expected_title,
                    models.Announcement.category == auto_category
                ).first()
                if not existing_ann:
                    greeting_text = build_birthday_greeting(m.full_name, m.sede_name or m.sede_id)
                    new_ann = models.Announcement(
                        title=expected_title,
                        content=greeting_text,
                        category=auto_category,
                        is_important=True,
                        sede_id=m.sede_id or "TODAS",
                        sede_name=m.sede_name or "Todas las Sedes (Nacional)",
                        created_by=f"Iglesia Restauración (Envío Automático {sched_time})"
                    )
                    db.add(new_ann)
                    dispatched.append(m.full_name)
        if dispatched:
            db.commit()
        return dispatched
    except Exception:
        db.rollback()
        return []

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
    birth_date: Optional[str] = None
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

class BirthdayTimeSetting(BaseModel):
    time: str # Ej: '19:00', '05:00'

@router.get("/birthday-schedule")
def get_birthday_schedule(db: Session = Depends(get_db)):
    """Obtener la hora configurada para el envío de notificaciones de cumpleaños (HH:MM)."""
    _ensure_allowed_modules_column(db)
    sched_time = get_birthday_notification_time(db)
    return {"time": sched_time}

@router.post("/birthday-schedule")
def set_birthday_schedule(
    req: BirthdayTimeSetting,
    current_user: Optional[dict] = Depends(security.get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Permite al Superadmin configurar la hora en que se enviará la felicitación de cumpleaños."""
    if current_user and current_user.get("role") not in {"SUPER_ADMIN", "ADMIN_PRINCIPAL", "ADMIN"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo un Superadministrador puede configurar el horario de notificaciones."
        )

    val = req.time.strip()
    if not re.match(r"^(?:[01]\d|2[0-3]):[0-5]\d$", val):
        raise HTTPException(
            status_code=400,
            detail="Formato de hora inválido. Debe ser HH:MM (24 horas), por ejemplo '19:00' o '05:00'."
        )

    _ensure_allowed_modules_column(db)
    setting = db.query(models.AppSetting).filter(models.AppSetting.key == "birthday_notification_time").first()
    if not setting:
        setting = models.AppSetting(
            key="birthday_notification_time",
            value=val,
            description="Hora diaria programada (HH:MM en 24h) para envío automático de felicitaciones de cumpleaños."
        )
        db.add(setting)
    else:
        setting.value = val

    db.commit()
    # Ejecutar comprobación inmediata con el nuevo horario configurado
    dispatch_daily_5am_birthday_greetings(db)
    return {
        "success": True,
        "time": val,
        "message": f"Horario de felicitación de cumpleaños actualizado a las {val} exitosamente."
    }

@router.get("/birthdays")
def get_monthly_birthdays(
    month: Optional[int] = Query(None, description="Mes (1-12). Por defecto mes actual"),
    sede_id: Optional[str] = Query(None),
    viewer_role: Optional[str] = Query(None),
    viewer_sede: Optional[str] = Query(None),
    viewer_username: Optional[str] = Query(None),
    current_user: Optional[dict] = Depends(security.get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Obtiene los cumpleañeros del mes indicado (o del mes actual) con su mensaje de felicitación
    de parte de la Iglesia Restauración.
    """
    _ensure_allowed_modules_column(db)
    dispatch_daily_5am_birthday_greetings(db)
    sched_time = get_birthday_notification_time(db)
    sched_h, sched_m = [int(p) for p in sched_time.split(":")]

    ve_now = datetime.utcnow() - timedelta(hours=4)
    now_minutes = ve_now.hour * 60 + ve_now.minute
    sched_minutes = sched_h * 60 + sched_m
    is_time_reached = now_minutes >= sched_minutes

    target_month = month if (month and 1 <= month <= 12) else ve_now.month
    today_month = ve_now.month
    today_day = ve_now.day

    eff_role = (current_user.get("role") if current_user else viewer_role) or "MIEMBRO"
    eff_sede = (current_user.get("sede") if current_user else viewer_sede) or ""
    eff_uname = (current_user.get("username") if current_user else viewer_username) or ""

    query = db.query(models.Member).filter(models.Member.birth_date.isnot(None))
    if sede_id and sede_id != "TODAS":
        query = query.filter(models.Member.sede_id.in_([sede_id, "TODAS"]))

    all_with_bday = query.all()
    birthdays = []
    for m in all_with_bday:
        bdate_str = (m.birth_date or "").strip()
        if not bdate_str:
            continue
        try:
            parts = bdate_str.split("-")
            if len(parts) == 3:
                b_month = int(parts[1])
                b_day = int(parts[2])
            else:
                continue
        except Exception:
            continue

        if b_month != target_month:
            continue

        allowed_phone = security.can_view_phone(eff_role, eff_sede, eff_uname, m.sede_id)
        decrypted_phone = security.decrypt_phone(m.phone)
        clean_wa = clean_venezuela_phone(decrypted_phone) if (allowed_phone and decrypted_phone != "No registrado") else ""
        greeting_msg = build_birthday_greeting(m.full_name, m.sede_name or m.sede_id)
        wa_url = f"https://wa.me/{clean_wa}?text={urllib.parse.quote(greeting_msg)}" if clean_wa else ""

        birthdays.append({
            "id": m.id,
            "full_name": m.full_name,
            "birth_date": bdate_str,
            "birth_month": b_month,
            "birth_day": b_day,
            "is_today": (b_month == today_month and b_day == today_day),
            "sede_id": m.sede_id,
            "sede_name": m.sede_name,
            "role": m.role,
            "ministry": m.ministry,
            "phone": decrypted_phone if allowed_phone else "🔒 Encriptado (Privado)",
            "phone_visible": allowed_phone,
            "greeting_message": greeting_msg,
            "whatsapp_url": wa_url,
            "scheduled_time": sched_time,
            "auto_dispatched": (b_month == today_month and b_day == today_day and is_time_reached)
        })

    birthdays.sort(key=lambda x: x["birth_day"])
    return {
        "month": target_month,
        "count": len(birthdays),
        "scheduled_time": sched_time,
        "birthdays": birthdays
    }

@router.get("")
def get_members(
    sede_id: Optional[str] = Query(None),
    viewer_role: Optional[str] = Query(None),
    viewer_sede: Optional[str] = Query(None),
    viewer_username: Optional[str] = Query(None),
    current_user: Optional[dict] = Depends(security.get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Obtener miembros directamente desde la base de datos de Neon.
    Los números telefónicos están encriptados en la BD y solo se desencriptan
    para los dos Superadministradores y el Administrador/Encargado de cada Sede.
    """
    try:
        _ensure_allowed_modules_column(db)
        eff_role = (current_user.get("role") if current_user else viewer_role) or "MIEMBRO"
        eff_sede = (current_user.get("sede") if current_user else viewer_sede) or ""
        eff_uname = (current_user.get("username") if current_user else viewer_username) or ""

        query = db.query(models.Member)
        if sede_id and sede_id != "TODAS":
            query = query.filter(models.Member.sede_id.in_([sede_id, "TODAS"]))
        db_members = query.order_by(models.Member.id.desc()).all()

        # Mapear permisos, username y birth_date de usuarios
        all_users = db.query(models.User).all()
        users_by_email = {
            (u.email or "").lower(): u.permissions
            for u in all_users
            if u.email
        }
        usernames_by_email = {
            (u.email or "").lower(): u.username
            for u in all_users
            if u.email and u.username
        }
        usernames_by_fullname = {
            (u.full_name or "").lower(): u.username
            for u in all_users
            if u.full_name and u.username
        }
        bdate_by_fullname = {
            (u.full_name or "").lower(): getattr(u, "birth_date", None)
            for u in all_users
            if u.full_name and getattr(u, "birth_date", None)
        }

        result = []
        for m in db_members:
            user_perms = users_by_email.get((m.email or "").lower())
            modules_list = _parse_modules(m.allowed_modules or user_perms)
            resolved_username = (
                usernames_by_email.get((m.email or "").lower())
                or usernames_by_fullname.get((m.full_name or "").lower())
                or generate_username_from_name(m.full_name)
            )
            resolved_bdate = getattr(m, "birth_date", None) or bdate_by_fullname.get((m.full_name or "").lower())
            allowed_phone = security.can_view_phone(eff_role, eff_sede, eff_uname, m.sede_id)
            decrypted_phone = security.decrypt_phone(m.phone)
            visible_phone = decrypted_phone if allowed_phone else (
                "🔒 Encriptado (Privado)" if decrypted_phone != "No registrado" else "No registrado"
            )

            result.append({
                "id": m.id,
                "full_name": m.full_name,
                "username": resolved_username,
                "email": m.email or "",
                "phone": visible_phone,
                "phone_encrypted": True,
                "phone_visible": allowed_phone,
                "birth_date": resolved_bdate,
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

    # Si se intenta crear un SUPER_ADMIN o ADMIN_SEDE, validar que quien lo crea sea SUPER_ADMIN
    requested_role = (req.role or "MIEMBRO").upper()
    if requested_role in {"SUPER_ADMIN", "ADMIN_PRINCIPAL"} and effective_creator_role not in {"SUPER_ADMIN", "ADMIN_PRINCIPAL", "ADMIN"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: Solo un Superadministrador puede crear otro Superadministrador."
        )

    # Si es ADMIN_SEDE, forzar que solo pueda crear miembros en su propia sede
    if effective_creator_role == "ADMIN_SEDE" and current_user and current_user.get("sede") and current_user.get("sede") != "TODAS":
        req.sede_id = current_user.get("sede")

    sede_names = {
        "TODAS": "Todas las Sedes (Nacional)",
        "plaza-venezuela": "Restauración Plaza Venezuela",
        "maracay": "Restauración Maracay",
        "la-suiza": "Restauración La Suiza",
        "sucre": "Restauración Sucre",
        "maracaibo": "Restauración Maracaibo"
    }
    final_sede_name = req.sede_name or sede_names.get(req.sede_id, req.sede_id)
    final_email = (req.email or "").strip()

    # Validar lista de módulos permitidos (Superadmin y Admin de Sede tienen acceso a todos los módulos)
    if requested_role in {"SUPER_ADMIN", "ADMIN_SEDE"}:
        selected_modules = list(ALL_APP_MODULES)
    else:
        selected_modules = [m for m in (req.allowed_modules or DEFAULT_MEMBER_MODULES) if m in ALL_APP_MODULES]
        if not selected_modules:
            selected_modules = DEFAULT_MEMBER_MODULES
    modules_json = json.dumps(selected_modules, ensure_ascii=False)

    try:
        _ensure_allowed_modules_column(db)
        plain_phone = (req.phone or "").strip() or "No registrado"
        encrypted_phone = security.encrypt_phone(plain_phone)
        clean_bdate = (req.birth_date or "").strip() or None

        new_db_member = models.Member(
            full_name=req.full_name,
            email=final_email if final_email else None,
            phone=encrypted_phone,
            birth_date=clean_bdate,
            sede_id=req.sede_id,
            sede_name=final_sede_name,
            role=requested_role,
            ministry=req.ministry or ("Dirección General / Superadmin" if requested_role == "SUPER_ADMIN" else "General"),
            baptism_status=req.baptism_status or "Bautizado",
            discipleship_status=req.discipleship_status or "En formación",
            joined_at=datetime.utcnow().strftime("%Y-%m-%d"),
            created_by=req.created_by or "Administrador",
            allowed_modules=modules_json
        )
        db.add(new_db_member)

        # Crear o actualizar cuenta de usuario en Neon con sus módulos permitidos y rol
        initial_password = req.initial_password or "123"
        clean_name = generate_username_from_name(req.full_name)
        base_username = (req.access_username or "").strip().lower() or clean_name or f"user{int(datetime.utcnow().timestamp())}"

        username = base_username
        if final_email:
            existing_user = db.query(models.User).filter(
                (models.User.email == final_email) | (models.User.username == username)
            ).first()
        else:
            existing_user = db.query(models.User).filter(
                models.User.username == username
            ).first()

        user_sede_value = "TODAS" if requested_role == "SUPER_ADMIN" else req.sede_id

        if existing_user:
            username = (req.access_username or "").strip().lower() or clean_name or existing_user.username
            existing_user.username = username
            if final_email:
                existing_user.email = final_email
            existing_user.role = requested_role
            existing_user.sede = user_sede_value
            existing_user.phone = encrypted_phone
            if clean_bdate:
                existing_user.birth_date = clean_bdate
            existing_user.permissions = modules_json
            if req.initial_password:
                existing_user.hashed_password = security.get_password_hash(initial_password)
        else:
            hashed = security.get_password_hash(initial_password)
            new_user = models.User(
                username=username,
                email=final_email if final_email else None,
                full_name=req.full_name,
                hashed_password=hashed,
                role=requested_role,
                sede=user_sede_value,
                phone=encrypted_phone,
                birth_date=clean_bdate,
                permissions=modules_json,
                must_change_password=True
            )
            db.add(new_user)

        db.commit()
        db.refresh(new_db_member)

        # Preparar mensaje de bienvenida por WhatsApp con módulos habilitados y enlace de la app
        clean_phone = clean_venezuela_phone(plain_phone)
        email_line = f"📧 Correo: {final_email}\n" if final_email else ""
        whatsapp_message = (
            f"¡Hola, {req.full_name}! 🕊️\n\n"
            f"Te damos una bendecida bienvenida a la familia de la Iglesia Restauración ({final_sede_name}).\n\n"
            f"Hemos activado tu cuenta de acceso a la plataforma con las siguientes credenciales:\n"
            f"🌐 Enlace de la App: https://app-iglesia-frontend.onrender.com/\n"
            f"👤 Usuario: {username}\n"
            f"{email_line}"
            f"🔑 Contraseña temporal: {initial_password}\n\n"
            f"⚠️ Nota de seguridad: Al iniciar sesión por primera vez, el sistema te solicitará obligatoriamente cambiar tu contraseña."
        )
        whatsapp_url = f"https://wa.me/{clean_phone}?text={urllib.parse.quote(whatsapp_message)}" if clean_phone else ""

        member_dict = {
            "id": new_db_member.id,
            "full_name": new_db_member.full_name,
            "username": username,
            "email": new_db_member.email,
            "phone": plain_phone,
            "phone_encrypted": True,
            "phone_visible": True,
            "birth_date": new_db_member.birth_date,
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
            "birth_date": req.birth_date,
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
    birth_date: Optional[str] = None
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
        if req.phone is not None and not req.phone.startswith("🔒"):
            member.phone = security.encrypt_phone(req.phone)
        if req.birth_date is not None:
            member.birth_date = req.birth_date.strip() or None
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

        # Sincronizar birth_date y phone en tabla users si hay usuario vinculado por nombre o email
        linked_u = None
        if member.email:
            linked_u = db.query(models.User).filter(models.User.email.ilike(member.email)).first()
        if not linked_u and member.full_name:
            linked_u = db.query(models.User).filter(models.User.full_name.ilike(member.full_name)).first()
        if linked_u:
            if req.birth_date is not None:
                linked_u.birth_date = member.birth_date
            if req.phone is not None and not req.phone.startswith("🔒"):
                linked_u.phone = member.phone

        db.commit()
        db.refresh(member)
        return {
            "success": True,
            "member": {
                "id": member.id,
                "full_name": member.full_name,
                "email": member.email,
                "phone": security.decrypt_phone(member.phone),
                "phone_encrypted": True,
                "phone_visible": True,
                "birth_date": member.birth_date,
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
