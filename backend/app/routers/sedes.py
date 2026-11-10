from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import json
import os

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

def load_data():
    if not os.path.exists(DATA_PATH):
        return {"church": {}, "sedes": []}
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def load_users():
    if not os.path.exists(USERS_PATH):
        return []
    with open(USERS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_users(users):
    with open(USERS_PATH, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2, ensure_ascii=False)

@router.get("")
def get_all_sedes():
    data = load_data()
    return data.get("sedes", [])

@router.post("")
def create_sede(req: SedeCreate):
    data = load_data()
    sedes = data.get("sedes", [])
    
    # Generate clean id
    sede_id = req.id
    if not sede_id:
        clean = req.name.lower().replace("restauración", "").replace("restauracion", "").strip()
        sede_id = clean.replace(" ", "-") if clean else f"sede-{len(sedes) + 1}"

    # Check for duplicate
    if any(s["id"] == sede_id for s in sedes):
        raise HTTPException(status_code=400, detail="Ya existe una sede con este identificador o nombre")

    admin_username = req.sede_admin_username or f"admin_{sede_id.replace('-', '')}"
    admin_name = req.sede_admin_name or req.pastors
    admin_email = req.sede_admin_email or f"admin.{sede_id}@restauracionglobal.org"

    new_sede = {
        "id": sede_id,
        "name": req.name,
        "short_name": req.short_name or req.name.replace("Restauración ", "").replace("Restauracion ", ""),
        "type": req.type or "Sede Regional",
        "city": req.city,
        "state": req.state,
        "location": req.location or f"{req.city}, {req.state}",
        "pastors": req.pastors,
        "pastors_title": req.pastors_title or "Pastores de Sede",
        "schedule": req.schedule or "Domingos 10:00 am",
        "description": req.description or f"Sede oficial de la Iglesia Cristiana Evangélica Restauración en {req.city}.",
        "color": req.color or "#83050B",
        "badge": req.badge or "Sede",
        "social": {
            "instagram": req.instagram or "@restauracionglobal",
            "instagramUrl": req.instagram_url or "https://www.instagram.com/restauracionglobal"
        },
        "donation": {
            "bank": req.bank or "Banco de Venezuela",
            "taxId": req.tax_id or "V-18599632",
            "phone": req.phone or "0414-3172261",
            "accountHolder": req.account_holder or "Iglesia Restauración Global"
        },
        "sede_admin": {
            "name": admin_name,
            "username": admin_username,
            "email": admin_email,
            "role": "ADMIN_SEDE",
            "assignedBy": "Said Carrasquel / Linfante (Superadmin)",
            "status": "Activo"
        }
    }

    sedes.append(new_sede)
    save_data(data)

    # Register admin in users.json if not present
    users = load_users()
    if not any(u.get("username") == admin_username for u in users):
        new_user = {
            "id": max([u.get("id", 0) for u in users], default=0) + 1,
            "username": admin_username,
            "email": admin_email,
            "full_name": f"{admin_name} (Admin Sede {new_sede['short_name']})",
            "password": req.sede_admin_password or "123",
            "role": "ADMIN_SEDE",
            "sede": sede_id,
            "permissions": ["MANAGE_LOCAL_SEDE", "DISCIPLESHIP_EVALUATE", "LOCAL_ANNOUNCEMENTS"],
            "created_at": "2026-11-10 19:00:00"
        }
        users.append(new_user)
        save_users(users)

    return {"success": True, "message": "Sede creada satisfactoriamente", "sede": new_sede}

@router.delete("/{sede_id}")
def delete_sede(sede_id: str):
    data = load_data()
    sedes = data.get("sedes", [])
    filtered = [s for s in sedes if s["id"] != sede_id]
    if len(filtered) == len(sedes):
        raise HTTPException(status_code=404, detail="Sede no encontrada")
    data["sedes"] = filtered
    save_data(data)
    return {"success": True, "message": "Sede eliminada con éxito"}

@router.get("/church-info")
def get_church_info():
    data = load_data()
    return data.get("church", {})

@router.get("/admins")
def get_sede_admins():
    data = load_data()
    sedes = data.get("sedes", [])
    admins_list = []
    for s in sedes:
        admin_info = s.get("sede_admin", {
            "name": s.get("pastors", "Sin asignar"),
            "email": f"admin.{s['id']}@restauracionglobal.org",
            "username": f"admin_{s['id'].replace('-', '')}",
            "assigned_by": "Pastor Principal / Dueño (L. Infante)",
            "status": "Activo"
        })
        admins_list.append({
            "sede_id": s["id"],
            "sede_name": s["name"],
            "admin": admin_info
        })
    return admins_list

@router.post("/{sede_id}/assign-admin")
def assign_sede_admin(sede_id: str, req: AssignAdminRequest):
    data = load_data()
    sedes = data.get("sedes", [])
    target = None
    for s in sedes:
        if s["id"] == sede_id:
            target = s
            break
    if not target:
        raise HTTPException(status_code=404, detail="Sede no encontrada")

    target["sede_admin"] = {
        "name": req.admin_name,
        "email": req.admin_email or f"admin.{sede_id}@restauracionglobal.org",
        "username": req.admin_username or f"admin_{sede_id.replace('-', '')}",
        "notes": req.notes,
        "assigned_by": "Said Carrasquel / Linfante (Superadmin)",
        "status": "Activo"
    }

    save_data(data)
    return {"success": True, "message": f"Administrador asignado a {target['name']}", "sede_admin": target["sede_admin"]}

@router.get("/{sede_id}")
def get_sede_by_id(sede_id: str):
    data = load_data()
    sedes = data.get("sedes", [])
    for s in sedes:
        if s["id"] == sede_id:
            return s
    raise HTTPException(status_code=404, detail="Sede no encontrada")
