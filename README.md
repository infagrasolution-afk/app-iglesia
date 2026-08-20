# ⛪ Aplicación Web y PWA de la Iglesia Restauración

Aplicación web completa y PWA móvil desarrollada para la **Iglesia Restauración**, con interfaz 100% basada en **Material UI**, backend FastAPI y persistencia JSON.

---

## 🚀 Características Principales

- **Muro de Oración (`/prayers`)**: Registro público y confidencial de peticiones, contador de apoyo de oración.
- **Biblia e IA Teológica (`/bible`)**: Lectura bíblica por libro/capítulo, control de tamaño de fuente y asistente IA.
- **Boletín y Anuncios (`/announcements`)**: Publicación, edición y filtrado por categoría de avisos pastorales.
- **Sermones y Podcasts (`/sermons`)**: Reproductor integrado de audio y descarga de bosquejos en PDF.
- **Galería Multimedia (`/gallery`)**: Visor Lightbox para fotos y videos de eventos ministeriales.
- **Donaciones y Ofrendas (`/donations`)**: Formulario interactivo con métodos de pago (Pago Móvil, Zelle, Transferencia).
- **Módulo Administrativo de Usuarios (`/admin/users`)**: 
  - Gestión de roles (Pastor Principal, Pastor Asistente, Líder, Miembro).
  - Selector de Código de País con banderas HD.
  - **Notificación por WhatsApp**: Envío de credenciales de acceso y enlace de la app a través de WhatsApp Web (`wa.me`).
- **Autenticación y Seguridad**: Inicio de sesión personalizado con logo oficial, botón de recordar sesión y cierre automático por inactividad.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React, Vite, Material UI (`@mui/material`), React Router DOM, Emotion, PWA.
- **Backend**: Python 3.11, FastAPI, Uvicorn, Pydantic, Passlib (Bcrypt).
- **Almacenamiento**: Persistencia de datos en JSON local.

---

## 💻 Instrucciones de Instalación y Ejecución

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8050
```

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 📄 Licencia

Desarrollado para la **Iglesia Restauración**.
