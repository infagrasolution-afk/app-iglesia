const API_BASE_URL = '/api';

async function fetchAPI(endpoint, options = {}) {
  try {
    const token = localStorage.getItem('token');
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.detail || `Error HTTP: ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  } catch (error) {
    console.warn(`API call failed for ${endpoint}:`, error.message);
    throw error;
  }
}

export const authAPI = {
  login: async (credentials) => {
    return await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }
};




// Prayer API Endpoints
export const prayerAPI = {
  getAll: async (status = 'all', role = 'MIEMBRO') => {
    try {
      return await fetchAPI(`/prayers?filter_status=${status}&user_role=${role}`);
    } catch {
      // Fallback mock dataset if backend is offline
      return [
        {
          id: 1,
          title: 'Oración por restauración familiar y salud',
          description: 'Pedimos apoyo en oración por la recuperación física de nuestro hermano Roberto y fortaleza para toda su familia en este tiempo.',
          author_name: 'María González',
          is_anonymous: false,
          visibility: 'PUBLIC',
          status: 'active',
          prayer_count: 14,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Petición confidencial de dirección laboral',
          description: 'Pido sabiduría de lo alto para tomar una decisión importante en el área laboral y familiar. Dios guíe mis pasos.',
          author_name: 'Hermano(a) en Fe (Anónimo)',
          is_anonymous: true,
          visibility: 'PUBLIC',
          status: 'active',
          prayer_count: 8,
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Agradecimiento: ¡Sanidad en la rodilla completada!',
          description: 'Damos toda la gloria a Dios. La intervención quirúrgica fue un éxito y la rehabilitación avanza victoriosamente.',
          author_name: 'Familia Morales',
          is_anonymous: false,
          visibility: 'PUBLIC',
          status: 'answered',
          prayer_count: 22,
          created_at: new Date().toISOString()
        }
      ];
    }
  },

  create: async (prayerData) => {
    try {
      return await fetchAPI('/prayers', {
        method: 'POST',
        body: JSON.stringify(prayerData)
      });
    } catch {
      return {
        id: Date.now(),
        ...prayerData,
        author_name: prayerData.is_anonymous ? 'Hermano(a) en Fe (Anónimo)' : 'Miembro de la Iglesia',
        status: 'active',
        prayer_count: 1,
        created_at: new Date().toISOString()
      };
    }
  },

  pray: async (id) => {
    try {
      return await fetchAPI(`/prayers/${id}/pray`, { method: 'POST' });
    } catch {
      return { id, success: true };
    }
  },

  updateStatus: async (id, newStatus) => {
    try {
      return await fetchAPI(`/prayers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
    } catch {
      return { id, status: newStatus };
    }
  }
};

// Announcement API Endpoints
export const announcementAPI = {
  getAll: async () => {
    try {
      return await fetchAPI('/announcements');
    } catch {
      return [
        {
          id: 1,
          title: "Gran Retiro de Familias 2026: 'Edificados sobre la Roca'",
          content: "Te invitamos a inscribirte en nuestro retiro anual de familias del 15 al 17 de Octubre. Habrá plenarias, talleres para niños y matrimonios.",
          category: "Eventos",
          is_important: true,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: "Jornada General de Ayuno y Clamor por las Naciones",
          content: "Este sábado de 8:00 AM a 12:00 PM nos uniremos en el templo principal para interceder por las familias y nuestra comunidad.",
          category: "Ayunos",
          is_important: false,
          created_at: new Date().toISOString()
        }
      ];
    }
  },
  create: async (data) => {
    try {
      return await fetchAPI('/announcements', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      return { id: Date.now(), ...data, created_at: new Date().toISOString() };
    }
  }
};

// Sermon API Endpoints
export const sermonAPI = {
  getAll: async () => {
    try {
      return await fetchAPI('/sermons');
    } catch {
      return [
        {
          id: 1,
          title: "Viviendo por Fe en Tiempos de Incertidumbre",
          series: "Serie: Fundamentos Inconmovibles",
          speaker: "Pr. Alejandro Silva",
          audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: "El Poder de la Oración Perseverante",
          series: "Serie: La Oración que Transforma",
          speaker: "Pr. Alejandro Silva",
          audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          created_at: new Date().toISOString()
        }
      ];
    }
  }
};

// Donation API Endpoints
export const donationAPI = {
  getAll: async () => {
    try {
      return await fetchAPI('/donations');
    } catch {
      return [
        {
          id: 101,
          donation_type: 'Diezmo',
          amount: 100.0,
          payment_method: 'Transferencia Bancaria',
          reference: 'REF-98124',
          created_at: new Date().toISOString()
        }
      ];
    }
  },
  create: async (donationData) => {
    try {
      return await fetchAPI('/donations', {
        method: 'POST',
        body: JSON.stringify(donationData)
      });
    } catch {
      return { id: Date.now(), ...donationData, created_at: new Date().toISOString() };
    }
  }
};

// Bible API Endpoints (Reina-Valera 1960)
export const bibleAPI = {
  getBooks: async () => {
    try {
      return await fetchAPI('/bible/books');
    } catch {
      return [
        { id: 1, name: "Génesis", testament: "OT", chapters: 50, category: "Pentateuco" },
        { id: 19, name: "Salmos", testament: "OT", chapters: 150, category: "Poéticos" },
        { id: 20, name: "Proverbios", testament: "OT", chapters: 31, category: "Poéticos" },
        { id: 40, name: "Mateo", testament: "NT", chapters: 28, category: "Evangelios" },
        { id: 43, name: "Juan", testament: "NT", chapters: 21, category: "Evangelios" },
        { id: 45, name: "Romanos", testament: "NT", chapters: 16, category: "Epístolas Paulinas" },
        { id: 50, name: "Filipenses", testament: "NT", chapters: 4, category: "Epístolas Paulinas" },
        { id: 66, name: "Apocalipsis", testament: "NT", chapters: 22, category: "Profético" }
      ];
    }
  },

  getChapter: async (bookId, chapter) => {
    try {
      return await fetchAPI(`/bible/chapter/${bookId}/${chapter}`);
    } catch {
      return {
        book: "Salmos",
        book_id: bookId,
        chapter: chapter,
        total_chapters: 150,
        version: "Reina-Valera 1960 (RVR1960)",
        verses: [
          { verse: 1, text: "Jehová es mi pastor; nada me faltará." },
          { verse: 2, text: "En lugares de delicados pastos me hará descansar; junto a aguas de reposo me pastoreará." },
          { verse: 3, text: "Confortará mi alma; me guiará por sendas de justicia por amor de su nombre." },
          { verse: 4, text: "Aunque ande en valle de sombra de muerte, no temeré mal alguno, porque tú estarás conmigo; tu vara y tu cayado me infundirán aliento." },
          { verse: 5, text: "Aderezas mesa delante de mí en presencia de mis angustiadores; unges mi cabeza con aceite; mi copa está rebosando." },
          { verse: 6, text: "Ciertamente el bien y la misericordia me seguirán todos los días de mi vida, y en la casa de Jehová moraré por largos días." }
        ]
      };
    }
  },

  getDailyVerse: async () => {
    try {
      return await fetchAPI('/bible/daily');
    } catch {
      return {
        reference: "Filipenses 4:13",
        text: "Todo lo puedo en Cristo que me fortalece.",
        version: "Reina-Valera 1960 (RVR1960)"
      };
    }
  },

  getAIDailyDevotional: async () => {
    try {
      return await fetchAPI('/bible/ai-daily');
    } catch {
      return {
        id: 1,
        date: new Date().toISOString().split('T')[0],
        reference: "Filipenses 4:6-7",
        text: "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias...",
        version: "Reina-Valera 1960 (RVR1960)",
        ai_title: "La Paz que Gobierna en la Tormenta",
        ai_reflection: "El apóstol Pablo nos enseña que el afán y la ansiedad no se vencen guardando silencio, sino depositando cada preocupación en el altar de Dios. Cuando transformamos nuestras cargas en peticiones de oración acompañadas de gratitud, la paz divina activa un escudo celestial sobre nuestras emociones y pensamientos.",
        ai_application: "Hoy, identifica el pensamiento que más inquieta tu corazón. Tómate 3 minutos, entrégalo en oración y da gracias a Dios por la respuesta que Él ya está preparando.",
        ai_prayer: "Señor Dios, deposito en tus manos todas mis ansiedades. Llenas mi mente con tu paz incalculable y guardas mi corazón en Cristo Jesús. Amén."
      };
    }
  },

  generateAIReflection: async (topic) => {
    try {
      return await fetchAPI('/bible/ai-reflection', {
        method: 'POST',
        body: JSON.stringify({ topic })
      });
    } catch {
      return {
        topic: topic || "Esperanza y Fe",
        reference: "Isaías 40:31 (RVR1960)",
        verse_text: "Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.",
        ai_generated_reflection: `Reflexión IA inspirada en '${topic}': Cuando colocamos nuestras expectativas en Dios, recibimos un flujo sobrenatural de fortaleza. La esperanza bíblica es una expectativa gozosa fundamentada en las promesas divinas.`,
        ai_guided_prayer: "Señor, renueva mis fuerzas como las águilas y enséñame a esperar pacientemente en tu tiempo perfecto. Amén."
      };
    }
  },

  search: async (query) => {
    try {
      return await fetchAPI(`/bible/search?query=${encodeURIComponent(query)}`);
    } catch {
      return [
        {
          book: "Salmos",
          chapter: 23,
          verse: 1,
          reference: "Salmos 23:1",
          text: "Jehová es mi pastor; nada me faltará.",
          version: "RVR1960"
        }
      ];
    }
  }
};

