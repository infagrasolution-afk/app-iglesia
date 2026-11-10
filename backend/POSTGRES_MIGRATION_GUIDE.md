# Guía de Migración a PostgreSQL - Iglesia Restauración Global

Esta guía explica paso a paso cómo migrar todo el sistema de la app de la Iglesia Restauración a **PostgreSQL** de forma inmediata y sin pérdida de datos.

---

## 1. Requisitos Previos

Instalar las dependencias de base de datos en el entorno virtual de Python:

```bash
cd backend
pip install -r requirements.txt
```
*(Incluye `sqlalchemy>=2.0.0`, `psycopg2-binary>=2.9.9`, `python-dotenv` y `fastapi`).*

---

## 2. Configuración de Conexión (`.env`)

Copia o edita el archivo `.env` en la carpeta `backend/`:

```bash
cp .env.example .env
```

Configura tu variable `DATABASE_URL`:

### Opción A: PostgreSQL Local
```env
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/iglesia_restauracion
DB_MODE=database
```

### Opción B: PostgreSQL en Docker
```bash
docker run --name iglesia-postgres -e POSTGRES_PASSWORD=said1234 -e POSTGRES_DB=iglesia_restauracion -p 5432:5432 -d postgres:16
```
```env
DATABASE_URL=postgresql://postgres:said1234@localhost:5432/iglesia_restauracion
DB_MODE=database
```

### Opción C: Servicios Cloud (Supabase, Neon, Render, Railway, AWS RDS)
```env
DATABASE_URL=postgresql://usuario:password@ep-proyecto.us-east-1.aws.neon.tech/iglesia_restauracion?sslmode=require
DB_MODE=database
```

---

## 3. Ejecutar la Migración Automática (1 Solo Comando)

Para migrar automáticamente todos los usuarios (`scarrasquel`, `linfante`, administradores de sede), sedes, directorio de miembros por sede, anuncios y discipulado desde los archivos JSON a PostgreSQL:

```bash
python migrate_to_postgres.py
```

O pasando la URL de conexión directamente por parámetro:

```bash
python migrate_to_postgres.py --db-url "postgresql://postgres:tu_password@localhost:5432/iglesia_restauracion"
```

El script se encargará automáticamente de:
1. Crear todas las tablas con sus tipos de datos, índices y claves foráneas.
2. Insertar y actualizar sedes y administradores.
3. Hashear contraseñas de forma segura con `bcrypt`.
4. Asignar los miembros y anuncios a su respectiva sede respetando la independencia territorial.

---

## 4. Creación Manual del Esquema (Opcional)

Si prefieres crear las tablas directamente desde **pgAdmin**, **DBeaver** o **psql**, puedes ejecutar el script SQL nativo incluido en:

```
backend/schema_postgres.sql
```

Ejecutar en consola:
```bash
psql -U postgres -d iglesia_restauracion -f schema_postgres.sql
```

---

## 5. Tablas y Estructura en PostgreSQL

| Tabla | Descripción | Clave Multi-Sede |
| :--- | :--- | :--- |
| `sedes` | Registro nacional de sedes (Caracas, Maracay, Maracaibo, etc.) | `id` (PK) |
| `users` | Superadmins, Administradores de Sede, Líderes y Miembros | `sede` ('TODAS' o sede_id) |
| `members` | Directorio de miembros independiente por congregación | `sede_id` (FK a sedes) |
| `announcements` | Boletines digitales (Nacionales o locales por sede) | `sede_id` ('TODAS' o sede_id) |
| `prayers` | Peticiones del Muro de Oración | `sede_id` |
| `sermons` | Prédicas y enseñanzas dominicales | `sede_id` |
| `donations` | Control de diezmos, ofrendas y pro-templo | `sede_id` |
| `discipleship_modules` | Módulos y lecciones doctrinales | Nivel doctrinal |
| `discipleship_submissions` | Evaluaciones de alumnos por sede | `sede_id` |

---

## 6. Verificación de Funcionamiento

Inicia el servidor backend en modo base de datos:

```bash
uvicorn app.main:app --reload --port 8000
```

Visita la documentación interactiva Swagger:
👉 [http://localhost:8000/docs](http://localhost:8000/docs)
