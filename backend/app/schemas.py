from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth & User Schemas
class UserBase(BaseModel):
    email: Optional[str] = ""
    full_name: str
    role: str = "MIEMBRO" # ADMIN, PASTOR, LIDER, MIEMBRO
    phone: Optional[str] = ""
    status: Optional[str] = "Activo"

class UserCreate(UserBase):
    password: Optional[str] = "123456"

class UserAdminCreate(UserBase):
    password: Optional[str] = "123456"

class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: Optional[str] = None
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginRequest(BaseModel):
    email: str
    password: str

class PasswordResetRequest(BaseModel):
    username: str
    phone: str
    new_password: Optional[str] = "123456"

# Prayer Schemas
class PrayerCreate(BaseModel):
    title: str
    description: str
    is_anonymous: bool = False
    visibility: str = "PUBLIC" # PUBLIC or LEADERS

class PrayerResponse(BaseModel):
    id: int
    title: str
    description: str
    author_id: Optional[int] = None
    author_name: Optional[str] = None
    is_anonymous: bool
    visibility: str
    status: str
    prayer_count: int
    created_at: datetime
    class Config:
        from_attributes = True

class PrayerStatusUpdate(BaseModel):
    status: str

# Announcement Schemas
class AnnouncementCreate(BaseModel):
    title: str
    content: str
    category: str = "Avisos Generales"
    is_important: bool = False

class AnnouncementResponse(AnnouncementCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Sermon Schemas
class SermonCreate(BaseModel):
    title: str
    series: str
    speaker: str
    audio_url: Optional[str] = None
    video_url: Optional[str] = None
    pdf_url: Optional[str] = None

class SermonResponse(SermonCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Donation Schemas
class DonationCreate(BaseModel):
    donation_type: str
    amount: float
    payment_method: str
    reference: Optional[str] = None

class DonationResponse(DonationCreate):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Media / Gallery Schemas
class MediaBase(BaseModel):
    title: str
    description: Optional[str] = ""
    media_type: str = "photo" # photo or video
    url: str
    thumbnail_url: Optional[str] = None
    category: str = "Eventos" # Eventos, Cultos, Retiros, Jóvenes, Escuela Dominical

class MediaCreate(MediaBase):
    pass

class MediaUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    media_type: Optional[str] = None
    url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    category: Optional[str] = None

class MediaResponse(MediaBase):
    id: int
    created_at: str
    class Config:
        from_attributes = True

