import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()

# 1. Asegurar que Pastor Said Carrasquel y Luis Infante aparezcan en la tabla members para el directorio
cur.execute("""
INSERT INTO members (id, full_name, email, phone, sede_id, sede_name, role, ministry, baptism_status, discipleship_status, joined_at, created_by, allowed_modules)
VALUES 
(1, 'Pastor Said Carrasquel', 'scarrasquel@restauracion.org', 'ENC:v1:VD6wTkS5FGKJg3hwL-qV7gzbnHdWtpzwMt7J7wg=', 'TODAS', 'Todas las Sedes (Nacional)', 'SUPER_ADMIN', 'Dirección General / Superadmin', 'Bautizado', 'Graduado de Fundamentos', '2026-11-12', 'Superadministrador', '["prayers", "members", "discipleship", "emotions", "bible", "sedes", "about", "announcements", "sermons", "donations"]'),
(100, 'Luis Infante', 'linfante@restauracion.org', 'ENC:v1:VI3p4pWbj11rEbaTHeK3JWO7tEB2_QuccdgcNlA=', 'TODAS', 'Todas las Sedes (Nacional)', 'SUPER_ADMIN', 'Dirección General / Sistemas', 'Bautizado', 'Graduado de Fundamentos', '2026-11-12', 'Superadministrador', '["prayers", "members", "discipleship", "emotions", "bible", "sedes", "about", "announcements", "sermons", "donations"]')
ON CONFLICT (id) DO UPDATE 
SET full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    sede_id = EXCLUDED.sede_id,
    sede_name = EXCLUDED.sede_name,
    role = EXCLUDED.role,
    ministry = EXCLUDED.ministry,
    allowed_modules = EXCLUDED.allowed_modules;
""")

cur.execute("SELECT setval('members_id_seq', (SELECT COALESCE(MAX(id), 100) FROM members), true);")
conn.commit()

cur.execute("SELECT id, full_name, email, role, sede_id FROM members;")
print("MEMBERS DESPUES DE INSERTAR:", cur.fetchall())
cur.close()
conn.close()

