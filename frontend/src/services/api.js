import { BIBLE_BOOKS, BIBLE_VERSIONS, getVersesForChapter } from '../data/bibleData';
import { EMOTIONS_DATA, THEME_HEADER, getRandomVerseByEmotion, getRandomVerseFromJar } from '../data/emotionsData';
import { INITIAL_DISCIPLESHIP_DATA } from '../data/discipleshipData';

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

// Bible API Endpoints (Reina-Valera 1960, NVI, NTV)
export const bibleAPI = {
  getBooks: async () => {
    try {
      const data = await fetchAPI('/bible/books');
      return data && data.length >= 66 ? data : BIBLE_BOOKS;
    } catch {
      return BIBLE_BOOKS;
    }
  },

  getVersions: () => BIBLE_VERSIONS,

  getChapter: async (bookId, chapter, version = 'RVR1960') => {
    try {
      return await fetchAPI(`/bible/chapter/${bookId}/${chapter}?version=${version}`);
    } catch {
      const book = BIBLE_BOOKS.find((b) => b.id === Number(bookId)) || { name: 'Salmos', chapters: 150 };
      const versionName = version === 'NVI' ? 'Nueva Versión Internacional (NVI)' :
                          version === 'NTV' ? 'Nueva Traducción Viviente (NTV)' :
                          'Reina-Valera 1960 (RVR1960)';
      return {
        book: book.name,
        book_id: bookId,
        chapter: chapter,
        total_chapters: book.chapters,
        version: versionName,
        version_code: version,
        description: book.description,
        category: book.category,
        verses: getVersesForChapter(bookId, chapter, version)
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

// Emotions API Endpoints (Frasco de Versículos según Emociones - RV1960)
export const emotionAPI = {
  getAll: async () => {
    try {
      return await fetchAPI('/emotions');
    } catch {
      return {
        header: THEME_HEADER,
        emotions: EMOTIONS_DATA.map((em) => ({
          id: em.id,
          name: em.name,
          color: em.color,
          bgColor: em.bgColor,
          borderColor: em.borderColor,
          textColor: em.textColor,
          accentColor: em.accentColor,
          description: em.description,
          prayer: em.prayer,
          verses_count: em.verses.length
        }))
      };
    }
  },

  getAllWithVerses: async () => {
    try {
      return await fetchAPI('/emotions/all');
    } catch {
      return {
        header: THEME_HEADER,
        emotions: EMOTIONS_DATA
      };
    }
  },

  getEmotion: async (emotionId) => {
    try {
      return await fetchAPI(`/emotions/${emotionId}`);
    } catch {
      const found = EMOTIONS_DATA.find((e) => e.id.toLowerCase() === emotionId.toLowerCase());
      if (!found) throw new Error(`Emoción '${emotionId}' no encontrada`);
      return found;
    }
  },

  getRandomVerse: async (emotionId) => {
    try {
      if (emotionId) {
        return await fetchAPI(`/emotions/${emotionId}/random`);
      }
      return await fetchAPI('/emotions/random');
    } catch {
      if (emotionId) {
        return getRandomVerseByEmotion(emotionId);
      }
      return getRandomVerseFromJar();
    }
  }
};

// Discipleship API Endpoints (Discipulado Bíblico Interactivo)
export const discipleshipAPI = {
  getAll: async () => {
    try {
      return await fetchAPI('/discipleship');
    } catch {
      // Local fallback with localStorage persistence
      try {
        const saved = localStorage.getItem('iglesia_discipleship_data');
        return saved ? JSON.parse(saved) : INITIAL_DISCIPLESHIP_DATA;
      } catch {
        return INITIAL_DISCIPLESHIP_DATA;
      }
    }
  },

  createLesson: async (lessonData) => {
    try {
      return await fetchAPI('/discipleship/lessons', {
        method: 'POST',
        body: JSON.stringify(lessonData)
      });
    } catch {
      return {
        id: `les-${lessonData.module_id}-${Date.now()}`,
        ...lessonData
      };
    }
  },

  submitActivity: async (submissionData) => {
    try {
      return await fetchAPI('/discipleship/submissions', {
        method: 'POST',
        body: JSON.stringify(submissionData)
      });
    } catch {
      return {
        id: `sub-${Date.now()}`,
        ...submissionData,
        submitted_at: new Date().toISOString(),
        status: 'PENDIENTE',
        evaluation: null
      };
    }
  },

  evaluateSubmission: async (submissionId, evalData) => {
    try {
      return await fetchAPI(`/discipleship/submissions/${submissionId}/evaluate`, {
        method: 'POST',
        body: JSON.stringify(evalData)
      });
    } catch {
      return {
        id: submissionId,
        status: evalData.status || 'APROBADO',
        evaluation: {
          ...evalData,
          evaluated_at: new Date().toISOString()
        }
      };
    }
  }
};

// Members API Endpoints
export const membersAPI = {
  getAll: async (sedeId = null) => {
    try {
      const query = sedeId && sedeId !== 'TODAS' ? `?sede_id=${sedeId}` : '';
      return await fetchAPI(`/members${query}`);
    } catch {
      const { getStoredMembers } = await import('../data/membersData');
      const all = getStoredMembers();
      if (sedeId && sedeId !== 'TODAS') {
        return all.filter(m => m.sede_id === sedeId);
      }
      return all;
    }
  },

  create: async (memberData) => {
    try {
      return await fetchAPI('/members', {
        method: 'POST',
        body: JSON.stringify(memberData)
      });
    } catch {
      const { getStoredMembers, saveStoredMembers } = await import('../data/membersData');
      const all = getStoredMembers();
      const newId = (all.length > 0 ? Math.max(...all.map(m => m.id)) : 0) + 1;
      const newMember = {
        id: newId,
        ...memberData,
        joined_at: new Date().toISOString().split('T')[0]
      };
      all.unshift(newMember);
      saveStoredMembers(all);
      return { success: true, member: newMember };
    }
  }
};




