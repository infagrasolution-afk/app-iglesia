// Directorio de miembros limpio: los miembros son agregados únicamente por linfante (Superadmin) y los Administradores de cada Sede
export const INITIAL_MEMBERS = [];

const LEGACY_KEYS = [
  "restauracion_members_v1",
  "restauracion_members_clean_v2"
];
const STORAGE_KEY = "restauracion_members_clean_v3";

// Purgar inmediatamente cualquier caché viejo en el navegador al cargar el módulo
try {
  if (typeof window !== "undefined" && window.localStorage) {
    LEGACY_KEYS.forEach((k) => window.localStorage.removeItem(k));
  }
} catch {
  // Ignore storage errors
}

export const getStoredMembers = () => {
  try {
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading stored members:", e);
  }
  return INITIAL_MEMBERS;
};

export const saveStoredMembers = (members) => {
  try {
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
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
