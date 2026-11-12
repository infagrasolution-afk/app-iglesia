from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    """
    Modelo de Usuarios para PostgreSQL / SQLite.
    Soporta jerarquía completa: SUPER_ADMIN, ADMIN_SEDE, LIDER, MIEMBRO.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="MIEMBRO", nullable=False) # SUPER_ADMIN, ADMIN_SEDE, LIDER, MIEMBRO
    sede = Column(String(100), default="TODAS", index=True)      # 'TODAS' para superadmins o id de sede
    is_owner = Column(Boolean, default=False)
    is_global_pastor = Column(Boolean, default=False)
    phone = Column(String(50), nullable=True)
    permissions = Column(Text, nullable=True)                    # JSON string de permisos
    is_active = Column(Boolean, default=True)
    must_change_password = Column(Boolean, default=False)        # Obliga a cambiar clave en 1er login
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PasswordResetRequest(Base):
    """
    Solicitudes de recuperación de contraseña gestionadas y aprobadas por los Superadministradores.
    """
    __tablename__ = "password_resets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    identifier = Column(String(255), nullable=False)             # Username o Email
    full_name = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    sede_id = Column(String(50), nullable=True)
    status = Column(String(50), default="PENDIENTE")             # PENDIENTE, APROBADO, RECHAZADO
    temporary_password = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(String(255), nullable=True)


class Sede(Base):
    """
    Modelo de Sedes de la Iglesia Restauración.
    Permite administrar de forma centralizada todas las sedes del país.
    """
    __tablename__ = "sedes"

    id = Column(String(50), primary_key=True, index=True)        # Ej: 'plaza-venezuela', 'maracay'
    name = Column(String(255), nullable=False)
    short_name = Column(String(100), nullable=True)
    type = Column(String(100), default="Sede Regional")
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    location = Column(Text, nullable=True)
    pastors = Column(String(255), nullable=True)
    ministerial_team = Column(Text, nullable=True)
    schedule = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    color = Column(String(30), default="#83050B")
    badge = Column(String(50), nullable=True)
    
    # Datos de Ofrendas y Pago Móvil
    bank = Column(String(100), nullable=True)
    tax_id = Column(String(50), nullable=True)
    donation_phone = Column(String(50), nullable=True)
    account_holder = Column(String(255), nullable=True)
    
    # Redes Sociales
    instagram = Column(String(100), nullable=True)
    instagram_url = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Member(Base):
    """
    Directorio de Miembros de cada sede.
    Totalmente independiente por sede_id.
    """
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    sede_id = Column(String(50), index=True, nullable=False)     # Vinculación estricta a la sede
    sede_name = Column(String(255), nullable=True)
    role = Column(String(50), default="MIEMBRO")                 # MIEMBRO, SERVIDOR, LIDER
    ministry = Column(String(255), nullable=True)
    baptism_status = Column(String(50), default="Por Bautizar")
    discipleship_status = Column(String(100), default="En formación")
    joined_at = Column(String(50), nullable=True)
    created_by = Column(String(255), nullable=True)
    allowed_modules = Column(Text, nullable=True)                # JSON list of allowed module keys
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Announcement(Base):
    """
    Boletín Digital y Comunicados.
    sede_id = 'TODAS' para anuncios nacionales (superadmin).
    sede_id = 'maracay' para avisos locales de sede.
    """
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), default="Avisos Generales")
    is_important = Column(Boolean, default=False)
    sede_id = Column(String(50), default="TODAS", index=True)
    sede_name = Column(String(255), default="Todas las Sedes (Nacional)")
    created_by = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Prayer(Base):
    """
    Muro de Oración e Intercesión.
    """
    __tablename__ = "prayers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    author_name = Column(String(255), nullable=True)
    is_anonymous = Column(Boolean, default=False)
    visibility = Column(String(50), default="PUBLIC")            # PUBLIC, LEADERS
    status = Column(String(50), default="active")                # active, answered
    prayer_count = Column(Integer, default=0)
    sede_id = Column(String(50), default="TODAS", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Sermon(Base):
    """
    Prédicas, Series y Mensajes Dominicales.
    """
    __tablename__ = "sermons"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    series = Column(String(255), nullable=False)
    speaker = Column(String(255), nullable=False)
    audio_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    pdf_url = Column(String(500), nullable=True)
    date = Column(String(50), nullable=True)
    sede_id = Column(String(50), default="TODAS", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Donation(Base):
    """
    Registro y verificación de diezmos y ofrendas.
    """
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    donation_type = Column(String(100), nullable=False)          # Diezmo, Ofrenda, Pro-Templo
    amount = Column(Float, nullable=False)
    payment_method = Column(String(100), nullable=False)
    reference = Column(String(100), nullable=True)
    sede_id = Column(String(50), default="TODAS", index=True)
    donor_name = Column(String(255), nullable=True)
    donor_phone = Column(String(50), nullable=True)
    status = Column(String(50), default="CONFIRMADO")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DiscipleshipModule(Base):
    """
    Módulos de crecimiento y doctrina cristiana.
    """
    __tablename__ = "discipleship_modules"

    id = Column(String(50), primary_key=True, index=True)        # Ej: 'modulo-1'
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    level = Column(String(50), default="Fundamento")
    order_index = Column(Integer, default=1)
    lessons_json = Column(Text, nullable=True)                   # Contenido JSON de lecciones
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DiscipleshipSubmission(Base):
    """
    Respuestas y evaluaciones de los miembros por sede.
    """
    __tablename__ = "discipleship_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_name = Column(String(255), nullable=True)
    module_id = Column(String(50), index=True)
    sede_id = Column(String(50), index=True)
    answers_json = Column(Text, nullable=True)
    status = Column(String(50), default="PENDIENTE")             # PENDIENTE, APROBADO, CORREGIR
    evaluation_json = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
