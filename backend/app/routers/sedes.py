from fastapi import APIRouter, HTTPException
import json
import os

router = APIRouter(prefix="/api/sedes", tags=["Sedes"])

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "sedes.json")

def load_data():
    if not os.path.exists(DATA_PATH):
        return {"church": {}, "sedes": []}
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("")
def get_all_sedes():
    data = load_data()
    return data.get("sedes", [])

@router.get("/church-info")
def get_church_info():
    data = load_data()
    return data.get("church", {})

@router.get("/{sede_id}")
def get_sede_by_id(sede_id: str):
    data = load_data()
    sedes = data.get("sedes", [])
    for s in sedes:
        if s["id"] == sede_id:
            return s
    raise HTTPException(status_code=404, detail="Sede no encontrada")
