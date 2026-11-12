import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
url = os.getenv('DATABASE_URL')
conn = psycopg2.connect(url)
cur = conn.cursor()

# Asegurar que la columna allowed_modules exista en members
try:
    cur.execute("ALTER TABLE members ADD COLUMN IF NOT EXISTS allowed_modules TEXT;")
    conn.commit()
    print("Columna 'allowed_modules' verificada en tabla 'members'.")
except Exception as e:
    conn.rollback()
    print(f"Aviso verificando columna allowed_modules: {e}")

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
        cur.execute(f"SELECT setval('{seq}', %s, true);", (max_id if max_id > 0 else 1,))
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
