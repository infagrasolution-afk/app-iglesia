// Directorio de miembros limpio: los miembros son agregados únicamente por linfante (Superadmin) y los Administradores de cada Sede
export const INITIAL_MEMBERS = [];

const OLD_STORAGE_KEY = "restauracion_members_v1";
const STORAGE_KEY = "restauracion_members_clean_v2";

export const getStoredMembers = () => {
  try {
    // Limpiar caché antiguo de miembros de demostración si existía
    if (localStorage.getItem(OLD_STORAGE_KEY)) {
      localStorage.removeItem(OLD_STORAGE_KEY);
    }
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch (e) {
    console.error("Error saving members to storage:", e);
  }
};
