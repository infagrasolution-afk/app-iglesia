from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "MIEMBRO"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginRequest(BaseModel):
    email: str
    password: str

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
    sede_id: Optional[str] = "TODAS"
    sede_name: Optional[str] = "Todas las Sedes (Nacional)"
    created_by: Optional[str] = "Pastor Principal / Admin"

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
