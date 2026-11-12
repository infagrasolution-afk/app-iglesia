from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "MIEMBRO"
    username: Optional[str] = None
    sede: Optional[str] = "TODAS"
    is_owner: Optional[bool] = False
    is_global_pastor: Optional[bool] = False
    must_change_password: Optional[bool] = False

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginRequest(BaseModel):
    email: str
    password: str

class ChangePasswordRequest(BaseModel):
    user_id: int
    new_password: str
    old_password: Optional[str] = None

class PasswordResetCreate(BaseModel):
    identifier: str # Username o Email
    phone: Optional[str] = None
    sede_id: Optional[str] = None
    full_name: Optional[str] = None

class PasswordResetResponse(BaseModel):
    id: int
    identifier: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    sede_id: Optional[str] = None
    status: str
    temporary_password: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class PasswordResetApproval(BaseModel):
    status: str # "APROBADO" o "RECHAZADO"
    temporary_password: Optional[str] = "123"


# Prayer Schemas
class PrayerCreate(BaseModel):
    title: str
    description: str
    author_name: Optional[str] = None
    is_anonymous: bool = False
    visibility: str = "PUBLIC" # PUBLIC or LEADERS
    sede_id: Optional[str] = "TODAS"

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
    sede_id: Optional[str] = "TODAS"
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
    date: Optional[str] = None
    sede_id: Optional[str] = "TODAS"

class SermonResponse(SermonCreate):
    id: int
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# Donation Schemas
class DonationCreate(BaseModel):
    donation_type: str
    amount: float
    payment_method: str
    reference: Optional[str] = None
    sede_id: Optional[str] = "TODAS"
    donor_name: Optional[str] = None
    donor_phone: Optional[str] = None

class DonationResponse(DonationCreate):
    id: int
    user_id: Optional[int] = None
    status: Optional[str] = "CONFIRMADO"
    created_at: datetime
    class Config:
        from_attributes = True
