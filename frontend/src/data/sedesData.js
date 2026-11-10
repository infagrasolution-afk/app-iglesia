// Datos oficiales extraídos de www.restauracionglobal.org
export const CHURCH_INFO = {
  name: "Iglesia Restauración Global",
  shortName: "Restauración Global",
  slogan: "Una comunidad de fe viva",
  founded: "7 de marzo de 2007",
  foundationCity: "Caracas, Venezuela",
  globalPastors: "Said Carrasquel y Yerutza Reyes de Carrasquel",
  ownerUser: "linfante",
  ownerName: "Ing. L. Infante (Dueño de la App)",
  website: "https://www.restauracionglobal.org",
  youtube: "https://www.youtube.com/@restauracionglobal",
  youtubeHandle: "@restauracionglobal",
  instagram: "https://www.instagram.com/restauracionglobal",
  instagramHandle: "@restauracionglobal",
  prayerTimes: "Lunes, Martes, Jueves y Viernes a las 8:00 pm vía Google Meet",
  denomination: "Pentecostal Bíblica",
  denominationDetails: "Fundamentada exclusivamente en las Sagradas Escrituras (Sola Scriptura), reconociendo al mismo tiempo la vigencia absoluta y el mover contemporáneo del Espíritu Santo en poder y dones, sin legalismos ni desorden.",
  mission: "«Ser discípulos que hacen discípulos que hagan discípulos.»",
  missionAxes: [
    { title: "Hacia Dios (Adoración)", description: "Levantar una comunidad de creyentes que adoren en espíritu y en verdad." },
    { title: "Hacia el individuo (Restauración y Discipulado)", description: "Sanar las heridas del corazón, reconstruir las familias y formar a cada creyente hasta la plenitud de Cristo." },
    { title: "Hacia la sociedad (Evangelismo y Servicio)", description: "Ser agentes de cambio social y espiritual en Venezuela, predicando el evangelio con hechos y verdad." }
  ],
  vision: "Ser una iglesia caracterizada por el crecimiento constante en la formación de líderes íntegros y la transformación de la cultura a través del fundamento de la palabra.",
  governance: "Equipo Ministerial Plural y Teocrático con Rendición de Cuentas (rechazo al autoritarismo y al desorden congregacional)."
};

export const INITIAL_SEDES_LIST = [
  {
    id: "plaza-venezuela",
    name: "Restauración Plaza Venezuela",
    shortName: "Plaza Venezuela",
    city: "Caracas",
    state: "Distrito Capital",
    type: "Sede Principal Nacional",
    location: "Centro de Caracas, Plaza Venezuela",
    pastors: "Said y Yerutza de Carrasquel",
    pastorsTitle: "Pastores Globales",
    team: "Alexander López y Yenileth Mijares (Apoyo en transición: Daniel Osorio y Dairis Medina)",
    schedule: "Domingos 10:00 AM",
    scheduleShort: "Dom 10:00 AM",
    description: "Ubicada en el centro de Caracas, Restauración Plaza Venezuela es la nueva Sede Principal del ministerio a nivel nacional. Un espacio de puertas abiertas y punto céntrico para toda la familia, con enfoque especial en recibir con amor y sin juicios para sanar, restaurar y alinear al diseño original de Dios.",
    sede_admin: {
      name: "Alexander López & Yenileth Mijares",
      username: "admin_plazavzla",
      email: "admin.plazavzla@restauracionglobal.org",
      phone: "0414-3172261",
      role: "ADMIN_SEDE",
      assignedBy: "Said Carrasquel & L. Infante",
      status: "Activo"
    },
    social: {
      instagram: "@restauracionglobal",
      instagramUrl: "https://www.instagram.com/restauracionglobal",
      pastor1: "@saidcarrasquel",
      pastor2: "@yerutzareyes",
      team1: "@ftyenilethmijares"
    },
    donation: {
      bank: "Banco Exterior",
      taxId: "V-18599632",
      phone: "0414-3172261",
      accountHolder: "Iglesia Restauración Global"
    },
    color: "#83050B",
    bgGradient: "linear-gradient(135deg, #83050B 0%, #1A0003 100%)",
    badge: "Sede Principal"
  },
  {
    id: "maracay",
    name: "Restauración Maracay",
    shortName: "Maracay",
    city: "Maracay",
    state: "Aragua",
    type: "Sede Urbana & Jóvenes",
    location: "C.C. Parque Aragua, Maracay",
    pastors: "Wilmer y Mariangel",
    pastorsTitle: "Pastores de Sede",
    team: "Bajo la mentoría directa de Said y Yerutza de Carrasquel",
    schedule: "Sábados 2:00 PM",
    scheduleShort: "Sáb 2:00 PM",
    description: "Con apenas 1 año de fundación, la sede Maracay se ha convertido en el epicentro de una generación vibrante en la ciudad. Ubicada estratégicamente en el C.C. Parque Aragua, es un punto de encuentro urbano diseñado para salir del estrés diario, construir relaciones de valor y recargar energías en fe y comunidad.",
    sede_admin: {
      name: "Pastor Wilmer",
      username: "admin_maracay",
      email: "admin.maracay@restauracionglobal.org",
      phone: "0414-3172261",
      role: "ADMIN_SEDE",
      assignedBy: "Said Carrasquel & L. Infante",
      status: "Activo"
    },
    social: {
      instagram: "@restauracionmaracay",
      instagramUrl: "https://www.instagram.com/restauracionmaracay"
    },
    donation: {
      bank: "Banplus",
      taxId: "V-18599632",
      phone: "0414-3172261",
      accountHolder: "Restauración Maracay"
    },
    color: "#1E40AF",
    bgGradient: "linear-gradient(135deg, #1E40AF 0%, #0B1E48 100%)",
    badge: "Jóvenes & Profesionales"
  },
  {
    id: "la-suiza",
    name: "Restauración La Suiza",
    shortName: "La Suiza",
    city: "Caracas / Miranda",
    state: "Miranda",
    type: "Sede de Artes y Alabanza",
    location: "Sector La Suiza, Caracas / Miranda",
    pastors: "Moisés Gómez y Angelin Gómez",
    pastorsTitle: "Pastores de Sede",
    team: "Ministerio de Música, Danza y Expresiones Creativas",
    schedule: "Domingos 10:00 AM",
    scheduleShort: "Dom 10:00 AM",
    description: "Con 10 años de trayectoria de fe, es un faro de luz en su comunidad. Caracterizada por un auge de crecimiento juvenil, ha hecho de las artes (la música que es el fuerte de la casa, danza y creatividad) su lenguaje para conectar a las nuevas generaciones con Dios. Madura en fundamentos, joven en espíritu.",
    sede_admin: {
      name: "Pastor Moisés Gómez",
      username: "admin_lasuiza",
      email: "admin.lasuiza@restauracionglobal.org",
      phone: "0424-2152572",
      role: "ADMIN_SEDE",
      assignedBy: "Said Carrasquel & L. Infante",
      status: "Activo"
    },
    social: {
      instagram: "@restauracionlasuiza",
      instagramUrl: "https://www.instagram.com/restauracionlasuiza",
      pastor1: "@moisesgomez9393"
    },
    donation: {
      bank: "Banesco",
      taxId: "V-24456844",
      phone: "0424-2152572",
      accountHolder: "Restauración La Suiza"
    },
    color: "#6D28D9",
    bgGradient: "linear-gradient(135deg, #6D28D9 0%, #1E0842 100%)",
    badge: "Música & Artes"
  },
  {
    id: "sucre",
    name: "Restauración Sucre",
    shortName: "Sucre (Petare)",
    city: "Petare, Caracas",
    state: "Miranda",
    type: "Sede Familiar & Refugio",
    location: "Municipio Sucre, Petare",
    pastors: "Ezequiel Carrasquel y Betty de Carrasquel",
    pastorsTitle: "Pastores de Sede",
    team: "Ministerio Familiar y Equipamiento",
    schedule: "Domingos 11:00 AM",
    scheduleShort: "Dom 11:00 AM",
    description: "7 años de trayectoria como un verdadero oasis espiritual donde el caos se detiene y la paz de Dios toma el control. Un refugio para abrazar la comunidad y sanar y equipar a cada integrante del hogar a través del Evangelio vivo.",
    sede_admin: {
      name: "Pastor Ezequiel Carrasquel",
      username: "admin_sucre",
      email: "admin.sucre@restauracionglobal.org",
      phone: "0424-1249299",
      role: "ADMIN_SEDE",
      assignedBy: "Said Carrasquel & L. Infante",
      status: "Activo"
    },
    social: {
      instagram: "@restauracioncaracas",
      instagramUrl: "https://instagram.com/restauracioncaracas",
      pastor1: "@ezequielcarrasquel_"
    },
    donation: {
      bank: "Mercantil",
      taxId: "V-26150993",
      phone: "0424-1249299",
      accountHolder: "Restauración Sucre"
    },
    color: "#047857",
    bgGradient: "linear-gradient(135deg, #047857 0%, #022C22 100%)",
    badge: "Refugio Familiar"
  },
  {
    id: "maracaibo",
    name: "Restauración Maracaibo",
    shortName: "Maracaibo",
    city: "Maracaibo",
    state: "Zulia",
    type: "Sede en Fundación & Expansión",
    location: "Cardonal Sur e Integración Comunal",
    pastors: "Daniel Osorio y Dairis de Osorio",
    pastorsTitle: "Pastores de Sede",
    team: "Bajo la mentoría directa de Said y Yerutza de Carrasquel",
    schedule: "Grupos de Conexión en comunidades",
    scheduleShort: "Grupos Conexión",
    description: "El amor de Dios no tiene fronteras. Restauración Maracaibo asienta bases firmes directamente en el corazón de las comunidades vulnerables (Cardonal Sur e Integración Comunal) transformando vidas de niños y adultos con Grupos de Conexión, con miras a la inauguración de su sede física.",
    sede_admin: {
      name: "Pastor Daniel Osorio",
      username: "admin_maracaibo",
      email: "admin.maracaibo@restauracionglobal.org",
      phone: "0426-2272658",
      role: "ADMIN_SEDE",
      assignedBy: "Said Carrasquel & L. Infante",
      status: "Activo"
    },
    social: {
      instagram: "@restauracionmaracaibo",
      instagramUrl: "https://www.instagram.com/restauracionmaracaibo",
      pastor1: "@danielosorio2019",
      pastor2: "@mdairys"
    },
    donation: {
      bank: "Banco de Venezuela",
      taxId: "V-25957210",
      phone: "0426-2272658",
      accountHolder: "Restauración Maracaibo"
    },
    color: "#B45309",
    bgGradient: "linear-gradient(135deg, #B45309 0%, #451A03 100%)",
    badge: "Grupos Comunitarios"
  }
];

// Helper to get sedes list with localStorage persistence
export const getSedesList = () => {
  try {
    const saved = localStorage.getItem('restauracion_sedes_list');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_SEDES_LIST;
};

// Helper to assign or update Sede Admin (used by admin principal / super admin)
export const assignSedeAdmin = (sedeId, newAdminData) => {
  const currentList = getSedesList();
  const updated = currentList.map((s) => {
    if (s.id === sedeId) {
      return {
        ...s,
        sede_admin: {
          ...s.sede_admin,
          ...newAdminData,
          assignedBy: newAdminData.assignedBy || "L. Infante / Pastor Principal",
          assignedAt: new Date().toISOString()
        }
      };
    }
    return s;
  });
  localStorage.setItem('restauracion_sedes_list', JSON.stringify(updated));
  return updated;
};

export const SEDES_LIST = getSedesList();

export const ALL_SEDES_OPTION = {
  id: "TODAS",
  name: "Todas las Sedes (Vista Global)",
  shortName: "Todas las Sedes",
  type: "Administración Global",
  badge: "Global"
};
