// Initial dataset of members distributed across the 5 official sedes of Restauración
export const INITIAL_MEMBERS = [
  {
    id: 1,
    full_name: "Carlos Martínez",
    email: "carlos.martinez@email.com",
    phone: "0412-1112233",
    sede_id: "maracay",
    sede_name: "Restauración Maracay",
    role: "MIEMBRO",
    ministry: "Grupo de Jóvenes & Conexión",
    baptism_status: "Bautizado",
    discipleship_status: "En formación (Nivel 2)",
    joined_at: "2026-02-15",
    created_by: "Pastor Wilmer (Admin Sede Maracay)"
  },
  {
    id: 2,
    full_name: "Gabriela Rivas",
    email: "gabriela.rivas@email.com",
    phone: "0414-9988776",
    sede_id: "maracay",
    sede_name: "Restauración Maracay",
    role: "SERVIDOR",
    ministry: "Protocolo y Bienvenida",
    baptism_status: "Bautizado",
    discipleship_status: "Graduado de Fundamentos",
    joined_at: "2026-03-10",
    created_by: "Pastor Wilmer (Admin Sede Maracay)"
  },
  {
    id: 3,
    full_name: "Marcos Andrade",
    email: "marcos.andrade@email.com",
    phone: "0424-3322110",
    sede_id: "plaza-venezuela",
    sede_name: "Restauración Plaza Venezuela",
    role: "MIEMBRO",
    ministry: "Consolidación",
    baptism_status: "Bautizado",
    discipleship_status: "En formación (Nivel 1)",
    joined_at: "2026-01-20",
    created_by: "Alexander López (Admin Plaza Venezuela)"
  },
  {
    id: 4,
    full_name: "Sofía Valentina Lugo",
    email: "sofia.lugo@email.com",
    phone: "0416-5544332",
    sede_id: "plaza-venezuela",
    sede_name: "Restauración Plaza Venezuela",
    role: "NUEVO_CREYENTE",
    ministry: "Integración",
    baptism_status: "Por bautizar",
    discipleship_status: "Iniciando Discipulado",
    joined_at: "2026-10-01",
    created_by: "Said Carrasquel / L. Infante"
  },
  {
    id: 5,
    full_name: "David José Morales",
    email: "david.morales@email.com",
    phone: "0424-7766554",
    sede_id: "la-suiza",
    sede_name: "Restauración La Suiza",
    role: "SERVIDOR",
    ministry: "Ministerio de Alabanza (Guitarra)",
    baptism_status: "Bautizado",
    discipleship_status: "Líder en formación",
    joined_at: "2025-08-12",
    created_by: "Pastor Moisés Gómez"
  },
  {
    id: 6,
    full_name: "Elena Patricia Silva",
    email: "elena.silva@email.com",
    phone: "0414-2233445",
    sede_id: "sucre",
    sede_name: "Restauración Sucre",
    role: "MIEMBRO",
    ministry: "Ministerio Familiar y Niños",
    baptism_status: "Bautizado",
    discipleship_status: "Graduado",
    joined_at: "2024-11-05",
    created_by: "Pastor Ezequiel Carrasquel"
  },
  {
    id: 7,
    full_name: "Javier Alejandro Ruiz",
    email: "javier.ruiz@email.com",
    phone: "0426-8877665",
    sede_id: "maracaibo",
    sede_name: "Restauración Maracaibo",
    role: "MIEMBRO",
    ministry: "Grupos de Conexión Cardonal Sur",
    baptism_status: "Bautizado",
    discipleship_status: "En formación",
    joined_at: "2026-06-18",
    created_by: "Pastor Daniel Osorio"
  }
];

const STORAGE_KEY = "restauracion_members_v1";

export const getStoredMembers = () => {
  try {
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
