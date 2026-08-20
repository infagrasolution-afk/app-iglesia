import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.security import get_password_hash

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

def ensure_data_dir():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)

def load_json(file_name: str) -> List[Dict[str, Any]]:
    ensure_data_dir()
    file_path = os.path.join(DATA_DIR, file_name)
    if not os.path.exists(file_path):
        return []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_json(file_name: str, data: List[Dict[str, Any]]) -> None:
    ensure_data_dir()
    file_path = os.path.join(DATA_DIR, file_name)
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

class UserJSONDB:
    FILE_NAME = "users.json"

    @classmethod
    def get_all(cls) -> List[Dict[str, Any]]:
        users = load_json(cls.FILE_NAME)
        if not users:
            cls.seed_default_users()
            users = load_json(cls.FILE_NAME)
        return users

    @classmethod
    def get_by_id(cls, user_id: int) -> Optional[Dict[str, Any]]:
        users = cls.get_all()
        for u in users:
            if u["id"] == user_id:
                return u
        return None

    @classmethod
    def get_by_email(cls, email: str) -> Optional[Dict[str, Any]]:
        users = cls.get_all()
        for u in users:
            if u["email"].lower() == email.lower():
                return u
        return None

    @classmethod
    def create(cls, user_data: Dict[str, Any]) -> Dict[str, Any]:
        users = cls.get_all()
        new_id = max([u["id"] for u in users], default=0) + 1
        
        email_user = user_data.get("email", "").strip()
        if not email_user:
            # Auto-generate username: Initial of first name + Last name (e.g. Linfante, Jperez)
            parts = user_data["full_name"].strip().split()
            first_initial = parts[0][0].upper() if parts else "U"
            last_name = parts[-1].capitalize() if len(parts) > 1 else (parts[0][1:].lower() if parts else "suario")
            email_user = f"{first_initial}{last_name}"

        raw_pwd = user_data.get("password") or "123456"
        hashed_pwd = get_password_hash(raw_pwd)

        new_user = {
            "id": new_id,
            "email": email_user,
            "full_name": user_data["full_name"],
            "hashed_password": hashed_pwd,
            "role": user_data.get("role", "MIEMBRO"),
            "phone": user_data.get("phone", ""),
            "status": user_data.get("status", "Activo"),
            "created_at": datetime.now().isoformat()
        }
        users.append(new_user)
        save_json(cls.FILE_NAME, users)
        return new_user

    @classmethod
    def update(cls, user_id: int, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        users = cls.get_all()
        updated_user = None
        for i, u in enumerate(users):
            if u["id"] == user_id:
                up_dict = {k: v for k, v in update_data.items() if v is not None}
                if "password" in up_dict and up_dict["password"]:
                    up_dict["hashed_password"] = get_password_hash(up_dict.pop("password"))
                elif "password" in up_dict:
                    up_dict.pop("password")
                
                users[i].update(up_dict)
                updated_user = users[i]
                break
        if updated_user:
            save_json(cls.FILE_NAME, users)
        return updated_user

    @classmethod
    def delete(cls, user_id: int) -> bool:
        users = cls.get_all()
        filtered = [u for u in users if u["id"] != user_id]
        if len(filtered) < len(users):
            save_json(cls.FILE_NAME, filtered)
            return True
        return False

    @classmethod
    def seed_default_users(cls):
        admin_pwd_hash = get_password_hash("aa11..**")
        default_users = [
            {
                "id": 1,
                "email": "Linfante",
                "full_name": "Pastor Luis Infante",
                "hashed_password": admin_pwd_hash,
                "role": "ADMIN",
                "phone": "+58 414 1234567",
                "status": "Activo",
                "created_at": datetime.now().isoformat()
            }
        ]
        save_json(cls.FILE_NAME, default_users)


class MediaJSONDB:
    FILE_NAME = "media.json"

    @classmethod
    def get_all(cls) -> List[Dict[str, Any]]:
        media = load_json(cls.FILE_NAME)
        if not media:
            cls.seed_default_media()
            media = load_json(cls.FILE_NAME)
        return media

    @classmethod
    def get_by_id(cls, media_id: int) -> Optional[Dict[str, Any]]:
        items = cls.get_all()
        for m in items:
            if m["id"] == media_id:
                return m
        return None

    @classmethod
    def create(cls, media_data: Dict[str, Any]) -> Dict[str, Any]:
        items = cls.get_all()
        new_id = max([m["id"] for m in items], default=0) + 1

        new_item = {
            "id": new_id,
            "title": media_data["title"],
            "description": media_data.get("description", ""),
            "media_type": media_data.get("media_type", "photo"), # photo or video
            "url": media_data["url"],
            "thumbnail_url": media_data.get("thumbnail_url") or media_data["url"],
            "category": media_data.get("category", "Eventos"),
            "created_at": datetime.now().isoformat()
        }
        items.insert(0, new_item) # Insert at top
        save_json(cls.FILE_NAME, items)
        return new_item

    @classmethod
    def update(cls, media_id: int, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        items = cls.get_all()
        updated = None
        for i, m in enumerate(items):
            if m["id"] == media_id:
                up_dict = {k: v for k, v in update_data.items() if v is not None}
                items[i].update(up_dict)
                updated = items[i]
                break
        if updated:
            save_json(cls.FILE_NAME, items)
        return updated

    @classmethod
    def delete(cls, media_id: int) -> bool:
        items = cls.get_all()
        filtered = [m for m in items if m["id"] != media_id]
        if len(filtered) < len(items):
            save_json(cls.FILE_NAME, filtered)
            return True
        return False

    @classmethod
    def seed_default_media(cls):
        save_json(cls.FILE_NAME, [])


class SermonJSONDB:
    FILE_NAME = "sermons.json"

    @classmethod
    def get_all(cls) -> List[Dict[str, Any]]:
        return load_json(cls.FILE_NAME)

    @classmethod
    def get_by_id(cls, item_id: int) -> Optional[Dict[str, Any]]:
        items = cls.get_all()
        for item in items:
            if item["id"] == item_id:
                return item
        return None

    @classmethod
    def create(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        items = cls.get_all()
        new_id = max([i["id"] for i in items], default=0) + 1
        new_item = {
            "id": new_id,
            "title": data["title"],
            "series": data.get("series", "Serie General"),
            "speaker": data.get("speaker", "Pastor Luis Infante"),
            "audio_url": data.get("audio_url", ""),
            "video_url": data.get("video_url", ""),
            "pdf_url": data.get("pdf_url", ""),
            "created_at": datetime.now().isoformat()
        }
        items.insert(0, new_item)
        save_json(cls.FILE_NAME, items)
        return new_item

    @classmethod
    def update(cls, item_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        items = cls.get_all()
        updated = None
        for i, item in enumerate(items):
            if item["id"] == item_id:
                up_dict = {k: v for k, v in data.items() if v is not None}
                items[i].update(up_dict)
                updated = items[i]
                break
        if updated:
            save_json(cls.FILE_NAME, items)
        return updated

    @classmethod
    def delete(cls, item_id: int) -> bool:
        items = cls.get_all()
        filtered = [i for i in items if i["id"] != item_id]
        if len(filtered) < len(items):
            save_json(cls.FILE_NAME, filtered)
            return True
        return False


class AnnouncementJSONDB:
    FILE_NAME = "announcements.json"

    @classmethod
    def get_all(cls) -> List[Dict[str, Any]]:
        return load_json(cls.FILE_NAME)

    @classmethod
    def get_by_id(cls, item_id: int) -> Optional[Dict[str, Any]]:
        items = cls.get_all()
        for item in items:
            if item["id"] == item_id:
                return item
        return None

    @classmethod
    def create(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        items = cls.get_all()
        new_id = max([i["id"] for i in items], default=0) + 1
        new_item = {
            "id": new_id,
            "title": data["title"],
            "content": data["content"],
            "category": data.get("category", "Avisos Generales"),
            "is_important": data.get("is_important", False),
            "created_at": datetime.now().isoformat()
        }
        items.insert(0, new_item)
        save_json(cls.FILE_NAME, items)
        return new_item

    @classmethod
    def update(cls, item_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        items = cls.get_all()
        updated = None
        for i, item in enumerate(items):
            if item["id"] == item_id:
                up_dict = {k: v for k, v in data.items() if v is not None}
                items[i].update(up_dict)
                updated = items[i]
                break
        if updated:
            save_json(cls.FILE_NAME, items)
        return updated

    @classmethod
    def delete(cls, item_id: int) -> bool:
        items = cls.get_all()
        filtered = [i for i in items if i["id"] != item_id]
        if len(filtered) < len(items):
            save_json(cls.FILE_NAME, filtered)
            return True
        return False


class PrayerJSONDB:
    FILE_NAME = "prayers.json"

    @classmethod
    def get_all(cls, status_filter: str = "all", user_role: str = "MIEMBRO") -> List[Dict[str, Any]]:
        items = load_json(cls.FILE_NAME)
        # Filter by visibility if user is not ADMIN, PASTOR, or LIDER
        if user_role.upper() not in ["ADMIN", "PASTOR", "LIDER"]:
            items = [p for p in items if p.get("visibility") != "LEADERS"]

        if status_filter != "all":
            items = [p for p in items if p.get("status") == status_filter]

        return items

    @classmethod
    def get_by_id(cls, item_id: int) -> Optional[Dict[str, Any]]:
        items = load_json(cls.FILE_NAME)
        for item in items:
            if item["id"] == item_id:
                return item
        return None

    @classmethod
    def create(cls, data: Dict[str, Any], author_name: str = "Miembro", author_id: Optional[int] = None) -> Dict[str, Any]:
        items = load_json(cls.FILE_NAME)
        new_id = max([i["id"] for i in items], default=0) + 1

        is_anon = data.get("is_anonymous", False)
        display_author = "Hermano(a) en Fe (Anónimo)" if is_anon else author_name

        new_item = {
            "id": new_id,
            "title": data["title"],
            "description": data["description"],
            "author_id": author_id,
            "author_name": display_author,
            "is_anonymous": is_anon,
            "visibility": data.get("visibility", "PUBLIC"), # PUBLIC or LEADERS
            "status": "active", # active or answered
            "prayer_count": 1,
            "created_at": datetime.now().isoformat()
        }
        items.insert(0, new_item)
        save_json(cls.FILE_NAME, items)
        return new_item

    @classmethod
    def pray(cls, item_id: int) -> Optional[Dict[str, Any]]:
        items = load_json(cls.FILE_NAME)
        updated = None
        for i, item in enumerate(items):
            if item["id"] == item_id:
                items[i]["prayer_count"] = items[i].get("prayer_count", 0) + 1
                updated = items[i]
                break
        if updated:
            save_json(cls.FILE_NAME, items)
        return updated

    @classmethod
    def update_status(cls, item_id: int, new_status: str) -> Optional[Dict[str, Any]]:
        items = load_json(cls.FILE_NAME)
        updated = None
        for i, item in enumerate(items):
            if item["id"] == item_id:
                items[i]["status"] = new_status
                updated = items[i]
                break
        if updated:
            save_json(cls.FILE_NAME, items)
        return updated

    @classmethod
    def delete(cls, item_id: int) -> bool:
        items = load_json(cls.FILE_NAME)
        filtered = [i for i in items if i["id"] != item_id]
        if len(filtered) < len(items):
            save_json(cls.FILE_NAME, filtered)
            return True
        return False


class DonationJSONDB:
    FILE_NAME = "donations.json"

    @classmethod
    def get_all(cls) -> List[Dict[str, Any]]:
        return load_json(cls.FILE_NAME)

    @classmethod
    def create(cls, data: Dict[str, Any], user_id: Optional[int] = None) -> Dict[str, Any]:
        items = cls.get_all()
        new_id = max([i["id"] for i in items], default=0) + 1
        new_item = {
            "id": new_id,
            "user_id": user_id,
            "donation_type": data["donation_type"],
            "amount": float(data["amount"]),
            "payment_method": data["payment_method"],
            "reference": data.get("reference", ""),
            "created_at": datetime.now().isoformat()
        }
        items.insert(0, new_item)
        save_json(cls.FILE_NAME, items)
        return new_item

    @classmethod
    def delete(cls, item_id: int) -> bool:
        items = cls.get_all()
        filtered = [i for i in items if i["id"] != item_id]
        if len(filtered) < len(items):
            save_json(cls.FILE_NAME, filtered)
            return True
        return False


