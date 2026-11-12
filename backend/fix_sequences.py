import os
import sys
import psycopg2
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(__file__))
from app import security

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
url = os.getenv('DATABASE_URL')
conn = psycopg2.connect(url)
cur = conn.cursor()

# Asegurar que las columnas allowed_modules y birth_date existan y phone tenga longitud suficiente para encriptación
try:
    cur.execute("ALTER TABLE members ADD COLUMN IF NOT EXISTS allowed_modules TEXT;")
    cur.execute("ALTER TABLE members ADD COLUMN IF NOT EXISTS birth_date VARCHAR(20);")
    cur.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date VARCHAR(20);")
    cur.execute("ALTER TABLE members ALTER COLUMN phone TYPE VARCHAR(255);")
    cur.execute("ALTER TABLE users ALTER COLUMN phone TYPE VARCHAR(255);")
    cur.execute("ALTER TABLE users ALTER COLUMN email DROP NOT NULL;")
    cur.execute("ALTER TABLE members DROP CONSTRAINT IF EXISTS fk_members_sede;")
    conn.commit()
    print("Esquema de 'members' y 'users' actualizado en Neon PostgreSQL (birth_date y phone encriptado).")
except Exception as e:
    conn.rollback()
    print(f"Aviso actualizando esquema: {e}")

# Encriptar números telefónicos en texto plano en members y users
try:
    cur.execute("SELECT id, phone FROM members WHERE phone IS NOT NULL AND phone != 'No registrado' AND phone NOT LIKE 'ENC:v1:%';")
    for m_id, m_phone in cur.fetchall():
        enc = security.encrypt_phone(m_phone)
        cur.execute("UPDATE members SET phone = %s WHERE id = %s;", (enc, m_id))
    cur.execute("SELECT id, phone FROM users WHERE phone IS NOT NULL AND phone != 'No registrado' AND phone NOT LIKE 'ENC:v1:%';")
    for u_id, u_phone in cur.fetchall():
        enc = security.encrypt_phone(u_phone)
        cur.execute("UPDATE users SET phone = %s WHERE id = %s;", (enc, u_id))
    conn.commit()
    print("Teléfonos existentes encriptados exitosamente en Neon PostgreSQL.")
except Exception as e:
    conn.rollback()
    print(f"Aviso encriptando teléfonos: {e}")

cur.execute("SELECT id, full_name, email, phone, birth_date, sede_id, role FROM members ORDER BY id DESC;")
rows = cur.fetchall()
print(f"Miembros actuales en Neon PostgreSQL ({len(rows)}):", rows)

tables_with_sequences = [
    ('members', 'members_id_seq'),
    ('users', 'users_id_seq'),
    ('announcements', 'announcements_id_seq'),
    ('sermons', 'sermons_id_seq'),
    ('prayers', 'prayers_id_seq'),
    ('donations', 'donations_id_seq'),
    ('discipleship_submissions', 'discipleship_submissions_id_seq'),
    ('password_resets', 'password_resets_id_seq')
]

for table, seq in tables_with_sequences:
    try:
        cur.execute(f"SELECT COALESCE(MAX(id), 0) FROM {table};")
        max_id = cur.fetchone()[0]
        cur.execute(f"SELECT setval('{seq}', %s, %s);", (max_id if max_id > 0 else 1, True if max_id > 0 else False))
        print(f"Secuencia '{seq}' fijada en {max_id}")
    except Exception as e:
        conn.rollback()
        print(f"Error fijando secuencia {seq}: {e}")
        continue
    else:
        conn.commit()

print("\nTodas las secuencias de PostgreSQL han sido sincronizadas!")
cur.close()
conn.close()
