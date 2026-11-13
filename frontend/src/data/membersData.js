// Directorio de miembros de la Iglesia Cristiana Restauración
// Los dos Superadministradores (Pastor Said Carrasquel y Luis Infante) tienen presencia permanente
// y potestad nacional sobre todas las sedes.

export const SUPERADMIN_MEMBERS = [
  {
    id: 1,
    full_name: "Pastor Said Carrasquel",
    username: "scarrasquel",
    email: "scarrasquel@restauracion.org",
    phone: "0412-0000001",
    phone_encrypted: true,
    phone_visible: true,
    birth_date: "1975-11-12",
    sede_id: "TODAS",
    sede_name: "Todas las Sedes (Nacional)",
    role: "SUPER_ADMIN",
    ministry: "Dirección General / Superadmin",
    baptism_status: "Bautizado",
    discipleship_status: "Graduado de Fundamentos",
    joined_at: "2026-01-01",
    created_by: "Superadministrador",
    allowed_modules: [
      "prayers", "members", "discipleship", "emotions", "bible",
      "sedes", "about", "announcements", "sermons", "donations"
    ]
  },
  {
    id: 100,
    full_name: "Ing. Luis Infante",
    username: "linfante",
    email: "linfante@restauracion.org",
    phone: "0412-0161906",
    phone_encrypted: true,
    phone_visible: true,
    birth_date: "1990-11-13",
    sede_id: "TODAS",
    sede_name: "Todas las Sedes (Nacional)",
    role: "SUPER_ADMIN",
    ministry: "Dirección General / Sistemas",
    baptism_status: "Bautizado",
    discipleship_status: "Graduado de Fundamentos",
    joined_at: "2026-01-01",
    created_by: "Superadministrador",
    allowed_modules: [
      "prayers", "members", "discipleship", "emotions", "bible",
      "sedes", "about", "announcements", "sermons", "donations"
    ]
  }
];

export const INITIAL_MEMBERS = [...SUPERADMIN_MEMBERS];

const LEGACY_KEYS = [
  "restauracion_members_v1",
  "restauracion_members_clean_v2",
  "restauracion_members_clean_v3",
  "restauracion_members_clean_v4"
];
const STORAGE_KEY = "restauracion_members_clean_v5";

// Purgar inmediatamente cualquier caché viejo en el navegador al cargar el módulo
try {
  if (typeof window !== "undefined" && window.localStorage) {
    LEGACY_KEYS.forEach((k) => window.localStorage.removeItem(k));
  }
} catch {
  // Ignore storage errors
}

function mergeSuperAdmins(list) {
  const safeList = Array.isArray(list) ? [...list] : [];
  SUPERADMIN_MEMBERS.forEach((sa) => {
    const idx = safeList.findIndex(
      (m) =>
        m.id === sa.id ||
        (m.username && m.username.toLowerCase() === sa.username.toLowerCase()) ||
        (m.email && m.email.toLowerCase() === sa.email.toLowerCase())
    );
    if (idx === -1) {
      safeList.unshift(sa);
    } else {
      safeList[idx] = {
        ...sa,
        ...safeList[idx],
        role: "SUPER_ADMIN",
        sede_id: "TODAS",
        sede_name: "Todas las Sedes (Nacional)"
      };
    }
  });
  return safeList;
}

export const getStoredMembers = () => {
  try {
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return mergeSuperAdmins(parsed);
      }
    }
  } catch (e) {
    console.error("Error reading stored members:", e);
  }
  const fallback = mergeSuperAdmins(INITIAL_MEMBERS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
  } catch {}
  return fallback;
};

export const saveStoredMembers = (members) => {
  try {
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
    const merged = mergeSuperAdmins(members);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("restauracion_members_updated", { detail: merged }));
    }
  } catch (e) {
    console.error("Error saving members to storage:", e);
  }
};

export const clearStoredMembers = () => {
  try {
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Error clearing stored members:", e);
  }
};
