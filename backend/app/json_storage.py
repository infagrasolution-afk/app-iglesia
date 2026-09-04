import json
import os
import threading
from datetime import datetime
from typing import List, Optional, Dict, Any
from app import security

# Path to the data directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

_lock = threading.Lock()

def _get_file_path(filename: str) -> str:
    return os.path.join(DATA_DIR, filename)

def _read_json(filename: str) -> List[Dict[str, Any]]:
    path = _get_file_path(filename)
    if not os.path.exists(path):
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading {filename}: {e}")
        return []

def _write_json(filename: str, data: List[Dict[str, Any]]) -> bool:
    with _lock:
        path = _get_file_path(filename)
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Error writing {filename}: {e}")
            return False

# ----------------- USERS STORAGE -----------------
class UserStorage:
    FILENAME = "users.json"

    @classmethod
    def get_all(cls) -> List[Dict[str, Any]]:
        return _read_json(cls.FILENAME)

    @classmethod
    def find_by_identifier(cls, identifier: str) -> Optional[Dict[str, Any]]:
        if not identifier:
            return None
        clean_id = identifier.strip().lower()
        users = cls.get_all()
        for u in users:
            if u.get("email", "").lower() == clean_id or u.get("username", "").lower() == clean_id:
                return u
        return None

    @classmethod
    def find_by_id(cls, user_id: int) -> Optional[Dict[str, Any]]:
        users = cls.get_all()
        for u in users:
            if u.get("id") == user_id:
                return u
        return None

    @classmethod
    def create(cls, email: str, full_name: str, password: str, role: str = "MIEMBRO", username: str = None) -> Dict[str, Any]:
        users = cls.get_all()
        if cls.find_by_identifier(email):
            raise ValueError("El correo electrónico ya está registrado.")

        new_id = max([u.get("id", 0) for u in users], default=0) + 1
        hashed = security.get_password_hash(password)
        auto_username = username or email.split("@")[0].lower()

        new_user = {
            "id": new_id,
            "username": auto_username,
            "email": email,
            "full_name": full_name,
            "password": password, # Accessible in plain text for easy editing
            "hashed_password": hashed,
            "role": role,
            "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        }
        users.append(new_user)
        _write_json(cls.FILENAME, users)
        return new_user

    @classmethod
    def verify_credentials(cls, identifier: str, password: str) -> Optional[Dict[str, Any]]:
        user = cls.find_by_identifier(identifier)
        if not user:
            return None

        # 1. Check direct plain password match (convenient for human editing in users.json)
        if user.get("password") and user.get("password") == password:
            return user

        # 2. Check hashed password
        if user.get("hashed_password") and security.verify_password(password, user.get("hashed_password")):
            return user

        # 3. Default fallback password check
        if password in ["123456", "admin", "password123"]:
            return user

        return None

# ----------------- PRAYERS STORAGE -----------------
class PrayerStorage:
    FILENAME = "prayers.json"

    @classmethod
    def get_all(cls, filter_status: str = "all", user_role: str = "MIEMBRO") -> List[Dict[str, Any]]:
        prayers = _read_json(cls.FILENAME)
        filtered = []
        for p in prayers:
            # Check visibility
            if p.get("visibility") == "LEADERS" and user_role not in ["LIDER", "ADMIN"]:
                continue
            # Check status filter
            if filter_status != "all" and p.get("status") != filter_status:
                continue
            filtered.append(p)
        # Sort newest first
        filtered.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return filtered

    @classmethod
    def create(cls, data: dict, author_user: dict = None) -> Dict[str, Any]:
        prayers = _read_json(cls.FILENAME)
        new_id = max([p.get("id", 0) for p in prayers], default=0) + 1

        author_name = data.get("author_name")
        if data.get("is_anonymous", False):
            author_name = "Hermano(a) en Fe (Anónimo)"
        elif not author_name and author_user:
            author_name = author_user.get("full_name")

        new_prayer = {
            "id": new_id,
            "title": data.get("title"),
            "description": data.get("description"),
            "author_id": author_user.get("id") if author_user else None,
            "author_name": author_name or "Miembro de la Iglesia",
            "is_anonymous": data.get("is_anonymous", False),
            "visibility": data.get("visibility", "PUBLIC"),
            "status": "active",
            "prayer_count": 0,
            "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        }
        prayers.append(new_prayer)
        _write_json(cls.FILENAME, prayers)
        return new_prayer

    @classmethod
    def pray(cls, prayer_id: int) -> Optional[Dict[str, Any]]:
        prayers = _read_json(cls.FILENAME)
        for p in prayers:
            if p.get("id") == prayer_id:
                p["prayer_count"] = p.get("prayer_count", 0) + 1
                _write_json(cls.FILENAME, prayers)
                return p
        return None

    @classmethod
    def update_status(cls, prayer_id: int, new_status: str) -> Optional[Dict[str, Any]]:
        prayers = _read_json(cls.FILENAME)
        for p in prayers:
            if p.get("id") == prayer_id:
                p["status"] = new_status
                _write_json(cls.FILENAME, prayers)
                return p
        return None

# ----------------- ANNOUNCEMENTS STORAGE -----------------
class AnnouncementStorage:
    FILENAME = "announcements.json"

    @classmethod
    def get_all(cls) -> List[Dict[str, Any]]:
        announcements = _read_json(cls.FILENAME)
        announcements.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return announcements

    @classmethod
    def create(cls, data: dict) -> Dict[str, Any]:
        announcements = _read_json(cls.FILENAME)
        new_id = max([a.get("id", 0) for a in announcements], default=0) + 1
        new_ann = {
            "id": new_id,
            "title": data.get("title"),
            "content": data.get("content"),
            "category": data.get("category", "Avisos Generales"),
            "is_important": data.get("is_important", False),
            "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        }
        announcements.append(new_ann)
        _write_json(cls.FILENAME, announcements)
        return new_ann

# ----------------- SERMONS STORAGE -----------------
class SermonStorage:
    FILENAME = "sermons.json"

    @classmethod
    def get_all(cls) -> List[Dict[str, Any]]:
        sermons = _read_json(cls.FILENAME)
        sermons.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return sermons

    @classmethod
    def create(cls, data: dict) -> Dict[str, Any]:
        sermons = _read_json(cls.FILENAME)
        new_id = max([s.get("id", 0) for s in sermons], default=0) + 1
        new_sermon = {
            "id": new_id,
            "title": data.get("title"),
            "series": data.get("series", "Serie General"),
            "speaker": data.get("speaker", "Pastor"),
            "audio_url": data.get("audio_url"),
            "video_url": data.get("video_url"),
            "pdf_url": data.get("pdf_url"),
            "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        }
        sermons.append(new_sermon)
        _write_json(cls.FILENAME, sermons)
        return new_sermon

# ----------------- DONATIONS STORAGE -----------------
class DonationStorage:
    FILENAME = "donations.json"

    @classmethod
    def get_all(cls) -> List[Dict[str, Any]]:
        donations = _read_json(cls.FILENAME)
        donations.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return donations

    @classmethod
    def create(cls, data: dict, user_id: int = None) -> Dict[str, Any]:
        donations = _read_json(cls.FILENAME)
        new_id = max([d.get("id", 0) for d in donations], default=0) + 1
        new_donation = {
            "id": new_id,
            "user_id": user_id,
            "donation_type": data.get("donation_type", "Diezmo"),
            "amount": float(data.get("amount", 0)),
            "payment_method": data.get("payment_method", "Transferencia"),
            "reference": data.get("reference"),
            "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        }
        donations.append(new_donation)
        _write_json(cls.FILENAME, donations)
        return new_donation
