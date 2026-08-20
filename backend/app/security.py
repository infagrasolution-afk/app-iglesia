import jwt
import bcrypt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

SECRET_KEY = "IGLESIA_EVANGELICA_SECRET_KEY_SUPER_SECURE"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8')[:72], hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if "sub" in to_encode and to_encode["sub"] is not None:
        to_encode["sub"] = str(to_encode["sub"])
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user_optional(token: str = Depends(oauth2_scheme)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_raw = payload.get("sub")
        if user_id_raw is None:
            return None
        user_id = int(user_id_raw)
    except Exception:
        return None
    
    from app.json_db import UserJSONDB
    user = UserJSONDB.get_by_id(user_id)
    return user

def get_current_user(token: str = Depends(oauth2_scheme)):
    user = get_current_user_optional(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión expirada o token inválido. Por favor inicia sesión.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def require_admin_or_pastor(current_user: dict = Depends(get_current_user)):
    user_role = current_user.get("role", "").upper()
    if user_role not in ["ADMIN", "PASTOR"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Se requieren permisos de Pastor o Administrador."
        )
    return current_user

