from fastapi import APIRouter, HTTPException, status
from app import schemas, security
from app.json_storage import UserStorage

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserResponse)
def register(user_in: schemas.UserCreate):
    try:
        new_user = UserStorage.create(
            email=user_in.email,
            full_name=user_in.full_name,
            password=user_in.password,
            role=user_in.role
        )
        return new_user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=schemas.Token)
def login(login_data: schemas.LoginRequest):
    user = UserStorage.verify_credentials(login_data.email, login_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas.")
    
    token = security.create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }
