import os
import psycopg2
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
url = os.getenv('DATABASE_URL')
conn = psycopg2.connect(url)
cur = conn.cursor()

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

# 1. Verificar usuarios actuales
cur.execute("SELECT id, username, full_name, role, hashed_password, must_change_password FROM users;")
print("Usuarios existentes:")
for u in cur.fetchall():
    print(f"ID: {u[0]} | User: {u[1]} | Nombre: {u[2]} | Rol: {u[3]} | MustChange: {u[5]}")

superadmins = [
    {
        "username": "scarrasquel",
        "raw_pass": "said1234",
        "full_name": "Pastor Said Carrasquel",
        "email": "scarrasquel@restauracion.org",
        "role": "SUPER_ADMIN",
        "sede": "TODAS",
        "is_owner": True,
        "is_global_pastor": True,
        "phone": "+584120000001"
    },
    {
        "username": "linfante",
        "raw_pass": "aa11..**",
        "full_name": "Luis Infante",
        "email": "linfante@restauracion.org",
        "role": "SUPER_ADMIN",
        "sede": "TODAS",
        "is_owner": True,
        "is_global_pastor": False,
        "phone": "+584120000002"
    }
]

print("\nConfigurando Superadmins...")
for sa in superadmins:
    hashed = pwd_context.hash(sa["raw_pass"])
    cur.execute("SELECT id FROM users WHERE username = %s;", (sa["username"],))
    row = cur.fetchone()
    if row:
        print(f"Actualizando usuario {sa['username']} (ID {row[0]})...")
        cur.execute("""
            UPDATE users 
            SET hashed_password = %s,
                full_name = %s,
                email = %s,
                role = %s,
                sede = %s,
                is_owner = %s,
                is_global_pastor = %s,
                phone = %s,
                is_active = TRUE,
                must_change_password = FALSE
            WHERE username = %s;
        """, (hashed, sa["full_name"], sa["email"], sa["role"], sa["sede"], sa["is_owner"], sa["is_global_pastor"], sa["phone"], sa["username"]))
    else:
        print(f"Creando nuevo usuario {sa['username']}...")
        cur.execute("""
            INSERT INTO users (
                username, hashed_password, full_name, email, role, sede, 
                is_owner, is_global_pastor, phone, is_active, must_change_password
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, TRUE, FALSE
            );
        """, (sa["username"], hashed, sa["full_name"], sa["email"], sa["role"], sa["sede"], sa["is_owner"], sa["is_global_pastor"], sa["phone"]))

conn.commit()
print("\nSuperadmins guardados y verificados exitosamente en Neon PostgreSQL!")

# Probar verificación con pwd_context
for sa in superadmins:
    cur.execute("SELECT username, hashed_password, role, must_change_password FROM users WHERE username = %s;", (sa["username"],))
    res = cur.fetchone()
    is_valid = pwd_context.verify(sa["raw_pass"], res[1])
    print(f"Verificación de login para '{res[0]}': Clave correcta = {is_valid} | Rol = {res[2]} | MustChange = {res[3]}")

cur.close()
conn.close()
