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

def load_data():
    if not os.path.exists(DATA_PATH):
        return {"church": {}, "sedes": []}
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

@router.get("")
def get_all_sedes():
    data = load_data()
    return data.get("sedes", [])

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
        "assigned_by": "Administrador Principal / Linfante",
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
