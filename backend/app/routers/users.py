from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app import schemas, security
from app.json_db import UserJSONDB

router = APIRouter(prefix="/api/users", tags=["Users Administration"])

@router.get("", response_model=List[schemas.UserResponse])
def get_users(
    role: Optional[str] = Query(None, description="Filtrar por rol: ADMIN, PASTOR, LIDER, MIEMBRO"),
    search: Optional[str] = Query(None, description="Buscar por nombre o correo"),
    current_user: dict = Depends(security.require_admin_or_pastor)
):
    users = UserJSONDB.get_all()
    
    if role:
        users = [u for u in users if u.get("role", "").upper() == role.upper()]
        
    if search:
        s = search.lower()
        users = [
            u for u in users
            if s in u.get("full_name", "").lower() or s in u.get("email", "").lower()
        ]

    # Return users cleaned of hashed passwords
    cleaned_users = [{k: v for k, v in u.items() if k != "hashed_password"} for u in users]
    return cleaned_users

@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user_by_id(
    user_id: int,
    current_user: dict = Depends(security.require_admin_or_pastor)
):
    user = UserJSONDB.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return {k: v for k, v in user.items() if k != "hashed_password"}

@router.post("", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: schemas.UserAdminCreate,
    current_user: dict = Depends(security.require_admin_or_pastor)
):
    existing = UserJSONDB.get_by_email(user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado.")

    new_user = UserJSONDB.create(user_in.dict())
    return {k: v for k, v in new_user.items() if k != "hashed_password"}

@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    user_in: schemas.UserUpdate,
    current_user: dict = Depends(security.require_admin_or_pastor)
):
    target = UserJSONDB.get_by_id(user_id)
    if not target:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    # Check email conflict if updating email
    if user_in.email and user_in.email.lower() != target.get("email", "").lower():
        existing = UserJSONDB.get_by_email(user_in.email)
        if existing:
            raise HTTPException(status_code=400, detail="El correo ya está en uso por otro usuario.")

    updated = UserJSONDB.update(user_id, user_in.dict())
    return {k: v for k, v in updated.items() if k != "hashed_password"}

@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int,
    current_user: dict = Depends(security.require_admin_or_pastor)
):
    # Prevent self-deletion
    if current_user.get("id") == user_id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta en sesión.")

    success = UserJSONDB.delete(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    return {"message": "Usuario eliminado correctamente.", "user_id": user_id}
