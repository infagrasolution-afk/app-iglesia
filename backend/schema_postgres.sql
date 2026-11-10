-- =====================================================================
-- ESQUEMA COMPLETO PARA POSTGRESQL - IGLESIA RESTAURACIÓN GLOBAL
-- =====================================================================
-- Compatible con PostgreSQL 13, 14, 15, 16+ y servicios cloud (Supabase, Neon, AWS RDS)
-- Diseñado con soporte multi-sede estricto e independencia por sede.
-- =====================================================================

-- 1. TABLA: SEDES
CREATE TABLE IF NOT EXISTS sedes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    type VARCHAR(100) DEFAULT 'Sede Regional',
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    location TEXT,
    pastors VARCHAR(255),
    ministerial_team TEXT,
    schedule VARCHAR(255),
    description TEXT,
    color VARCHAR(30) DEFAULT '#83050B',
    badge VARCHAR(50),
    bank VARCHAR(100),
    tax_id VARCHAR(50),
    donation_phone VARCHAR(50),
    account_holder VARCHAR(255),
    instagram VARCHAR(100),
    instagram_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: USUARIOS (SUPER ADMIN, ADMIN DE SEDE, LÍDERES, MIEMBROS)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'MIEMBRO' NOT NULL, -- SUPER_ADMIN, ADMIN_SEDE, LIDER, MIEMBRO
    sede VARCHAR(100) DEFAULT 'TODAS' NOT NULL,  -- 'TODAS' para superadmins o id de sede
    is_owner BOOLEAN DEFAULT FALSE,
    is_global_pastor BOOLEAN DEFAULT FALSE,
    phone VARCHAR(50),
    permissions TEXT,                            -- Lista o JSON de permisos
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_sede ON users(sede);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. TABLA: DIRECTORIO DE MIEMBROS (INDEPENDIENTE POR SEDE)
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    sede_id VARCHAR(50) NOT NULL,               -- Vinculación a sedes(id)
    sede_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'MIEMBRO',         -- MIEMBRO, SERVIDOR, LIDER
    ministry VARCHAR(255),
    baptism_status VARCHAR(50) DEFAULT 'Por Bautizar',
    discipleship_status VARCHAR(100) DEFAULT 'En formación',
    joined_at VARCHAR(50),
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_members_sede FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_members_sede_id ON members(sede_id);

-- 4. TABLA: ANUNCIOS Y BOLETÍN DIGITAL
-- sede_id = 'TODAS' indica alcance nacional (superadmins)
-- sede_id = id de sede indica alcance local
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'Avisos Generales',
    is_important BOOLEAN DEFAULT FALSE,
    sede_id VARCHAR(50) DEFAULT 'TODAS' NOT NULL,
    sede_name VARCHAR(255) DEFAULT 'Todas las Sedes (Nacional)',
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcements_sede_id ON announcements(sede_id);

-- 5. TABLA: MURO DE ORACIÓN E INTERCESIÓN
CREATE TABLE IF NOT EXISTS prayers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(255),
    is_anonymous BOOLEAN DEFAULT FALSE,
    visibility VARCHAR(50) DEFAULT 'PUBLIC',     -- PUBLIC, LEADERS
    status VARCHAR(50) DEFAULT 'active',         -- active, answered
    prayer_count INTEGER DEFAULT 0,
    sede_id VARCHAR(50) DEFAULT 'TODAS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prayers_sede_id ON prayers(sede_id);
CREATE INDEX IF NOT EXISTS idx_prayers_status ON prayers(status);

-- 6. TABLA: PRÉDICAS Y MENSAJES DOMINICALES
CREATE TABLE IF NOT EXISTS sermons (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    series VARCHAR(255) NOT NULL,
    speaker VARCHAR(255) NOT NULL,
    audio_url VARCHAR(500),
    video_url VARCHAR(500),
    pdf_url VARCHAR(500),
    date VARCHAR(50),
    sede_id VARCHAR(50) DEFAULT 'TODAS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA: OFRENDAS Y DIEZMOS
CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    donation_type VARCHAR(100) NOT NULL,         -- Diezmo, Ofrenda, Pro-Templo, Misiones
    amount NUMERIC(14, 2) NOT NULL,
    payment_method VARCHAR(100) NOT NULL,        -- Pago Móvil, Transferencia, Zelle, Efectivo
    reference VARCHAR(100),
    sede_id VARCHAR(50) DEFAULT 'TODAS',
    donor_name VARCHAR(255),
    donor_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'CONFIRMADO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_donations_sede_id ON donations(sede_id);

-- 8. TABLA: MÓDULOS DE DISCIPULADO Y CRECIMIENTO
CREATE TABLE IF NOT EXISTS discipleship_modules (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(50) DEFAULT 'Fundamento',
    order_index INTEGER DEFAULT 1,
    lessons_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABLA: EVALUACIONES Y TAREAS DE DISCIPULADO
CREATE TABLE IF NOT EXISTS discipleship_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    module_id VARCHAR(50) REFERENCES discipleship_modules(id) ON DELETE CASCADE,
    sede_id VARCHAR(50) NOT NULL,
    answers_json JSONB,
    status VARCHAR(50) DEFAULT 'PENDIENTE',      -- PENDIENTE, APROBADO, CORREGIR
    evaluation_json JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_discipleship_submissions_sede ON discipleship_submissions(sede_id);
