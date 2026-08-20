from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="MIEMBRO") # ADMIN, LIDER, MIEMBRO
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Prayer(Base):
    __tablename__ = "prayers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    author_name = Column(String, nullable=True)
    is_anonymous = Column(Boolean, default=False)
    visibility = Column(String, default="PUBLIC") # PUBLIC, LEADERS
    status = Column(String, default="active") # active, answered
    prayer_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String, default="Avisos Generales") # Eventos, Ayunos, Avisos Generales
    is_important = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Sermon(Base):
    __tablename__ = "sermons"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    series = Column(String, nullable=False)
    speaker = Column(String, nullable=False)
    audio_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    pdf_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    donation_type = Column(String, nullable=False) # Diezmo, Ofrenda, Pro-Templo
    amount = Column(Float, nullable=False)
    payment_method = Column(String, nullable=False)
    reference = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
