from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import json
import os

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

def load_members():
    if not os.path.exists(DATA_PATH):
        return []
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_members(data):
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

@router.get("")
def get_members(sede_id: Optional[str] = Query(None)):
    members = load_members()
    if sede_id and sede_id != "TODAS":
        return [m for m in members if m.get("sede_id") == sede_id]
    return members

@router.post("")
def add_member(req: MemberCreate):
    members = load_members()
    new_id = max([m.get("id", 0) for m in members], default=0) + 1

    sede_names = {
        "plaza-venezuela": "Restauración Plaza Venezuela",
        "maracay": "Restauración Maracay",
        "la-suiza": "Restauración La Suiza",
        "sucre": "Restauración Sucre",
        "maracaibo": "Restauración Maracaibo"
    }

    new_member = {
        "id": new_id,
        "full_name": req.full_name,
        "email": req.email or f"{req.full_name.lower().replace(' ', '.')}@email.com",
        "phone": req.phone or "No registrado",
        "sede_id": req.sede_id,
        "sede_name": req.sede_name or sede_names.get(req.sede_id, req.sede_id),
        "role": req.role or "MIEMBRO",
        "ministry": req.ministry or "General",
        "baptism_status": req.baptism_status or "Bautizado",
        "discipleship_status": req.discipleship_status or "En formación",
        "joined_at": datetime.utcnow().strftime("%Y-%m-%d"),
        "created_by": req.created_by
    }

    members.append(new_member)
    save_members(members)
    return {"success": True, "member": new_member}
