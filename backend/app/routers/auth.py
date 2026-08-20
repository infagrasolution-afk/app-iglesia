from fastapi import APIRouter, Depends, HTTPException, status
from app import schemas, security
from app.json_db import UserJSONDB

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserResponse)
def register(user_in: schemas.UserCreate):
    existing = UserJSONDB.get_by_email(user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado.")
    
    new_user = UserJSONDB.create(user_in.dict())
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(login_data: schemas.LoginRequest):
    user = UserJSONDB.get_by_email(login_data.email)
    if not user or not security.verify_password(login_data.password, user.get("hashed_password", "")):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas. Verifique su correo o contraseña.")
    
    if user.get("status") == "Inactivo":
        raise HTTPException(status_code=403, detail="Su usuario está inactivo. Por favor contacte al pastor o administrador.")

    token = security.create_access_token({
        "sub": user["id"],
        "email": user["email"],
        "role": user["role"]
    })
    
    # Return user data excluding hashed_password
    user_response = {k: v for k, v in user.items() if k != "hashed_password"}
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_response
    }

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: dict = Depends(security.get_current_user)):
    return {k: v for k, v in current_user.items() if k != "hashed_password"}

@router.post("/reset-password")
def reset_password(reset_data: schemas.PasswordResetRequest):
    user = UserJSONDB.get_by_email(reset_data.username)
    if not user:
        raise HTTPException(status_code=404, detail="El usuario ingresado no se encuentra registrado.")
    
    user_phone_clean = "".join(filter(str.isdigit, user.get("phone", "")))
    req_phone_clean = "".join(filter(str.isdigit, reset_data.phone))
    
    if not req_phone_clean or (req_phone_clean not in user_phone_clean and user_phone_clean not in req_phone_clean):
        raise HTTPException(status_code=400, detail="El número de teléfono ingresado no coincide con el registrado en su cuenta.")
    
    new_pwd = reset_data.new_password if reset_data.new_password and reset_data.new_password.strip() else "123456"
    UserJSONDB.update(user["id"], {"password": new_pwd})
    
    return {"message": "Su contraseña ha sido restablecida con éxito. Ya puede iniciar sesión."}

