import jwt
import bcrypt
import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

from app.json_storage import UserStorage

SECRET_KEY = "IGLESIA_EVANGELICA_SECRET_KEY_SUPER_SECURE"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
PHONE_ENC_PREFIX = "ENC:v1:"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

def _derive_keystream(iv: bytes, length: int) -> bytes:
    out = bytearray()
    counter = 0
    key_bytes = SECRET_KEY.encode("utf-8")
    while len(out) < length:
        block = hmac.new(key_bytes, iv + counter.to_bytes(4, "big"), hashlib.sha256).digest()
        out.extend(block)
        counter += 1
    return bytes(out[:length])

def encrypt_phone(plain_phone: str) -> str:
    """
    Encripta el número de teléfono con cifrado simétrico autenticado (HMAC-SHA256 + IV aleatorio)
    para almacenarlo de forma segura en PostgreSQL y evitar filtraciones de datos.
    """
    if not plain_phone:
        return "No registrado"
    clean = plain_phone.strip()
    if not clean or clean == "No registrado" or clean.startswith("🔒"):
        return "No registrado"
    if clean.startswith(PHONE_ENC_PREFIX):
        return clean
    pt_bytes = clean.encode("utf-8")
    iv = secrets.token_bytes(8)
    ks = _derive_keystream(iv, len(pt_bytes))
    ct = bytes(a ^ b for a, b in zip(pt_bytes, ks))
    tag = hmac.new(SECRET_KEY.encode("utf-8"), iv + ct, hashlib.sha256).digest()[:8]
    token = base64.urlsafe_b64encode(iv + tag + ct).decode("ascii")
    return f"{PHONE_ENC_PREFIX}{token}"

def decrypt_phone(stored_phone: str) -> str:
    """
    Desencripta un número telefónico almacenado en formato ENC:v1:...
    Si estaba en texto plano por registros antiguos, lo devuelve directamente.
    """
    if not stored_phone:
        return "No registrado"
    clean = stored_phone.strip()
    if not clean or clean == "No registrado":
        return "No registrado"
    if not clean.startswith(PHONE_ENC_PREFIX):
        return clean
    try:
        raw = base64.urlsafe_b64decode(clean[len(PHONE_ENC_PREFIX):].encode("ascii"))
        if len(raw) < 16:
            return "No registrado"
        iv = raw[:8]
        tag = raw[8:16]
        ct = raw[16:]
        expected_tag = hmac.new(SECRET_KEY.encode("utf-8"), iv + ct, hashlib.sha256).digest()[:8]
        if not hmac.compare_digest(tag, expected_tag):
            return "No registrado"
        ks = _derive_keystream(iv, len(ct))
        pt = bytes(a ^ b for a, b in zip(ct, ks))
        return pt.decode("utf-8")
    except Exception:
        return "No registrado"

def can_view_phone(
    viewer_role: str = None,
    viewer_sede: str = None,
    viewer_username: str = None,
    member_sede_id: str = None
) -> bool:
    """
    Solo permite ver el número de teléfono desencriptado a:
    1) Los Superadministradores (linfante, scarrasquel o rol SUPER_ADMIN / ADMIN_PRINCIPAL)
    2) Los encargados de cada sede (rol ADMIN_SEDE) para los miembros de su propia sede.
    """
    role_up = (viewer_role or "").upper().strip()
    uname_low = (viewer_username or "").lower().strip()
    if role_up in {"SUPER_ADMIN", "ADMIN_PRINCIPAL", "ADMIN"} or uname_low in {"linfante", "scarrasquel"}:
        return True
    if role_up == "ADMIN_SEDE":
        if not viewer_sede or viewer_sede == "TODAS" or not member_sede_id:
            return True
        return viewer_sede.lower().strip() == member_sede_id.lower().strip()
    return False

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
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user_optional(token: str = Depends(oauth2_scheme)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        stored = UserStorage.find_by_id(user_id)
        if stored:
            return stored
        return {
            "id": int(user_id) if str(user_id).isdigit() else user_id,
            "email": payload.get("email"),
            "username": payload.get("username"),
            "role": payload.get("role"),
            "sede": payload.get("sede")
        }
    except jwt.PyJWTError:
        return None


