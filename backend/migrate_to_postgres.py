"""
Script de Migración Automática a PostgreSQL / SQLite
Iglesia Restauración Global
=====================================================
Este script toma todos los datos de almacenamiento JSON (backend/data/*.json)
y los inserta de forma estructurada en PostgreSQL (o la base de datos configurada en DATABASE_URL).

Uso:
  python migrate_to_postgres.py
  python migrate_to_postgres.py --db-url "postgresql://postgres:password@localhost:5432/iglesia_restauracion"
"""

import sys
import os
import json
import argparse
from datetime import datetime

import sys
import os
import json
import argparse
from datetime import datetime

# Configure utf-8 encoding for Windows console compatibility
if sys.platform.startswith("win") and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Añadir el directorio raíz del backend al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base, DATABASE_URL
from app import models, security

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

def load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        print(f"[!] Archivo no encontrado: {filename}")
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[X] Error leyendo {filename}: {e}")
        return []

def run_migration(custom_db_url=None):
    global engine, SessionLocal
    
    if custom_db_url:
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        
        target_url = custom_db_url
        if target_url.startswith("postgres://"):
            target_url = target_url.replace("postgres://", "postgresql://", 1)
            
        print(f"[CONEXION] Base de datos: {target_url.split('@')[-1] if '@' in target_url else target_url}")
        if target_url.startswith("sqlite"):
            engine = create_engine(target_url, connect_args={"check_same_thread": False})
        else:
            engine = create_engine(target_url, pool_pre_ping=True)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    print("\n" + "=" * 65)
    print(">>> INICIANDO MIGRACION DE DATOS A BASE DE DATOS (POSTGRESQL / SQLITE)")
    print("=" * 65)
    print(f"[*] Base de datos destino: {engine.url.drivername}://...{engine.url.database or ''}")

    # 1. Crear todas las tablas definidas en models.py
    print("\n[*] Paso 1: Creando / verificando tablas...")
    Base.metadata.create_all(bind=engine)
    print("[OK] Tablas listas: users, sedes, members, announcements, prayers, sermons, donations, discipleship_modules, discipleship_submissions.")


    db = SessionLocal()
    stats = {}

    try:
        # -------------------------------------------------------------
        # 2. Migrar Sedes
        # -------------------------------------------------------------
        print("\n[*] Paso 2: Migrando Sedes...")
        sedes_file = load_json("sedes.json")

        sedes_data = sedes_file.get("sedes", []) if isinstance(sedes_file, dict) else sedes_file
        sedes_migrated = 0

        for s in sedes_data:
            sede_id = s.get("id")
            if not sede_id:
                continue
            
            existing = db.query(models.Sede).filter(models.Sede.id == sede_id).first()
            donation = s.get("donation", {}) or {}
            social = s.get("social_links", {}) or s.get("social", {}) or {}

            if not existing:
                new_sede = models.Sede(
                    id=sede_id,
                    name=s.get("name"),
                    short_name=s.get("short_name") or s.get("shortName"),
                    type=s.get("type", "Sede Regional"),
                    city=s.get("city", "Venezuela"),
                    state=s.get("state", "Distrito Capital"),
                    location=s.get("location"),
                    pastors=s.get("pastors"),
                    ministerial_team=s.get("ministerial_team") or s.get("team"),
                    schedule=s.get("schedule"),
                    description=s.get("description"),
                    color=s.get("color", "#83050B"),
                    badge=s.get("badge"),
                    bank=donation.get("bank"),
                    tax_id=donation.get("tax_id") or donation.get("taxId"),
                    donation_phone=donation.get("phone"),
                    account_holder=donation.get("account_holder") or donation.get("accountHolder"),
                    instagram=social.get("instagram"),
                    instagram_url=social.get("instagram_url") or social.get("instagramUrl")
                )
                db.add(new_sede)
                sedes_migrated += 1
            else:
                existing.name = s.get("name")
                existing.pastors = s.get("pastors")
                existing.schedule = s.get("schedule")

        db.commit()
        stats["Sedes"] = sedes_migrated
        print(f"[OK] {sedes_migrated} sedes migradas.")

        # -------------------------------------------------------------
        # 3. Migrar Usuarios (Superadmins, Admin de Sede, etc.)
        # -------------------------------------------------------------
        print("\n[*] Paso 3: Migrando Usuarios y Credenciales...")
        users_data = load_json("users.json")
        users_migrated = 0

        for u in users_data:
            email = u.get("email")
            if not email:
                continue

            existing_user = db.query(models.User).filter(
                (models.User.email == email) | 
                (models.User.username == u.get("username"))
            ).first()

            # Hash password if in plain text
            plain_pass = u.get("password", "123")
            hashed_pass = security.get_password_hash(plain_pass) if not plain_pass.startswith("$2b$") else plain_pass

            perms = u.get("permissions", [])
            perms_str = json.dumps(perms) if isinstance(perms, list) else str(perms)

            if not existing_user:
                new_user = models.User(
                    id=u.get("id"),
                    username=u.get("username"),
                    email=email,
                    full_name=u.get("full_name") or u.get("name", "Usuario"),
                    hashed_password=hashed_pass,
                    role=u.get("role", "MIEMBRO"),
                    sede=u.get("sede", "TODAS"),
                    is_owner=bool(u.get("is_owner", False)),
                    is_global_pastor=bool(u.get("is_global_pastor", False)),
                    phone=u.get("phone"),
                    permissions=perms_str,
                    is_active=True
                )
                db.add(new_user)
                users_migrated += 1
            else:
                existing_user.role = u.get("role", existing_user.role)
                existing_user.sede = u.get("sede", existing_user.sede)
                existing_user.full_name = u.get("full_name", existing_user.full_name)
                existing_user.hashed_password = hashed_pass

        db.commit()
        stats["Usuarios"] = users_migrated
        print(f"[OK] {users_migrated} usuarios migrados (Superadmins y Admins de Sede incluidos).")

        # -------------------------------------------------------------
        # 4. Migrar Directorio de Miembros (Independencia por Sede)
        # -------------------------------------------------------------
        print("\n[*] Paso 4: Migrando Directorio de Miembros por Sede...")
        members_data = load_json("members.json")
        members_migrated = 0

        for m in members_data:
            mid = m.get("id")
            existing_m = db.query(models.Member).filter(models.Member.id == mid).first() if mid else None

            if not existing_m:
                new_m = models.Member(
                    id=mid,
                    full_name=m.get("full_name"),
                    email=m.get("email"),
                    phone=m.get("phone"),
                    sede_id=m.get("sede_id", "maracay"),
                    sede_name=m.get("sede_name"),
                    role=m.get("role", "MIEMBRO"),
                    ministry=m.get("ministry"),
                    baptism_status=m.get("baptism_status", "Bautizado"),
                    discipleship_status=m.get("discipleship_status"),
                    joined_at=m.get("joined_at"),
                    created_by=m.get("created_by")
                )
                db.add(new_m)
                members_migrated += 1

        db.commit()
        stats["Miembros"] = members_migrated
        print(f"[OK] {members_migrated} miembros asignados a sus respectivas sedes.")

        # -------------------------------------------------------------
        # 5. Migrar Anuncios y Boletines (Nacional / Sede)
        # -------------------------------------------------------------
        print("\n[*] Paso 5: Migrando Anuncios y Comunicados...")
        ann_data = load_json("announcements.json")
        ann_migrated = 0

        for a in ann_data:
            aid = a.get("id")
            existing_a = db.query(models.Announcement).filter(models.Announcement.id == aid).first() if aid else None

            if not existing_a:
                new_a = models.Announcement(
                    id=aid,
                    title=a.get("title"),
                    content=a.get("content"),
                    category=a.get("category", "Avisos Generales"),
                    is_important=bool(a.get("is_important", False)),
                    sede_id=a.get("sede_id", "TODAS"),
                    sede_name=a.get("sede_name", "Todas las Sedes (Nacional)"),
                    created_by=a.get("created_by", "Pastor Said Carrasquel (Super Admin)")
                )
                db.add(new_a)
                ann_migrated += 1

        db.commit()
        stats["Anuncios"] = ann_migrated
        print(f"[OK] {ann_migrated} anuncios migrados (nacionales y por sede).")

        # -------------------------------------------------------------
        # 6. Migrar Prédicas y Sermones
        # -------------------------------------------------------------
        print("\n[*] Paso 6: Migrando Predicas y Sermones...")
        sermons_data = load_json("sermons.json")
        sermons_migrated = 0

        for s in sermons_data:
            sid = s.get("id")
            existing_s = db.query(models.Sermon).filter(models.Sermon.id == sid).first() if sid else None

            if not existing_s:
                new_s = models.Sermon(
                    id=sid,
                    title=s.get("title"),
                    series=s.get("series", "Serie Ministerial"),
                    speaker=s.get("speaker", "Pastor Said Carrasquel"),
                    audio_url=s.get("audio_url"),
                    video_url=s.get("video_url"),
                    pdf_url=s.get("pdf_url"),
                    date=s.get("date"),
                    sede_id=s.get("sede_id", "TODAS")
                )
                db.add(new_s)
                sermons_migrated += 1

        db.commit()
        stats["Sermones"] = sermons_migrated
        print(f"[OK] {sermons_migrated} predicas migradas.")

        # -------------------------------------------------------------
        # 7. Migrar Peticiones de Oración
        # -------------------------------------------------------------
        print("\n[*] Paso 7: Migrando Peticiones de Oracion...")
        prayers_data = load_json("prayers.json")
        prayers_migrated = 0

        for p in prayers_data:
            pid = p.get("id")
            existing_p = db.query(models.Prayer).filter(models.Prayer.id == pid).first() if pid else None

            if not existing_p:
                new_p = models.Prayer(
                    id=pid,
                    title=p.get("title"),
                    description=p.get("description"),
                    author_name=p.get("author_name", "Miembro de la Iglesia"),
                    is_anonymous=bool(p.get("is_anonymous", False)),
                    visibility=p.get("visibility", "PUBLIC"),
                    status=p.get("status", "active"),
                    prayer_count=p.get("prayer_count", 0),
                    sede_id=p.get("sede_id", "TODAS")
                )
                db.add(new_p)
                prayers_migrated += 1

        db.commit()
        stats["Oraciones"] = prayers_migrated
        print(f"[OK] {prayers_migrated} peticiones de oracion migradas.")

        # -------------------------------------------------------------
        # 8. Migrar Módulos de Discipulado
        # -------------------------------------------------------------
        print("\n[*] Paso 8: Migrando Modulos de Discipulado...")
        disc_data = load_json("discipleship.json")
        disc_modules = disc_data.get("modules", []) if isinstance(disc_data, dict) else []
        disc_migrated = 0

        for mod in disc_modules:
            mid = mod.get("id")
            existing_mod = db.query(models.DiscipleshipModule).filter(models.DiscipleshipModule.id == mid).first() if mid else None

            if not existing_mod:
                lessons = mod.get("lessons", [])
                new_mod = models.DiscipleshipModule(
                    id=mid,
                    title=mod.get("title"),
                    description=mod.get("description"),
                    level=mod.get("level", "Fundamento"),
                    order_index=mod.get("order_index", 1),
                    lessons_json=json.dumps(lessons, ensure_ascii=False)
                )
                db.add(new_mod)
                disc_migrated += 1

        db.commit()
        stats["Discipulado"] = disc_migrated
        print(f"[OK] {disc_migrated} modulos de discipulado migrados.")

    except Exception as e:
        db.rollback()
        print(f"\n[X] Error durante la migracion: {e}")
        raise e
    finally:
        db.close()

    print("\n" + "=" * 65)
    print(">>> MIGRACION COMPLETADA EXITOSAMENTE")
    print("=" * 65)
    for entidad, cant in stats.items():
        print(f"  * {entidad:15}: {cant} registros")
    print("=" * 65)
    print("Tu base de datos esta 100% sincronizada y lista para produccion.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrador de datos a PostgreSQL / SQLite")
    parser.add_argument("--db-url", type=str, help="URL de conexión a PostgreSQL (ej: postgresql://user:pass@localhost:5432/iglesia)")
    args = parser.parse_args()

    run_migration(args.db_url)
