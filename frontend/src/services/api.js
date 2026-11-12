import { BIBLE_BOOKS, BIBLE_VERSIONS, getVersesForChapter } from '../data/bibleData';
import { EMOTIONS_DATA, THEME_HEADER, getRandomVerseByEmotion, getRandomVerseFromJar } from '../data/emotionsData';
import { INITIAL_DISCIPLESHIP_DATA } from '../data/discipleshipData';

const ENV_API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
  : '';

const API_BASE_URL = ENV_API_URL
  ? (ENV_API_URL.endsWith('/api') ? ENV_API_URL : `${ENV_API_URL}/api`)
  : '/api';

async function fetchAPI(endpoint, options = {}) {
  try {
    const token = localStorage.getItem('token');
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
    const reqInit = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers
      },
      ...options
    };

    let response = await fetch(`${API_BASE_URL}${endpoint}`, reqInit);
    const contentType = response.headers.get('content-type') || '';

    // Si en Render Static Site (/api) devuelve HTML o 404, intentar con el backend de Render
    if (
      API_BASE_URL === '/api' &&
      (!response.ok || contentType.includes('text/html')) &&
      typeof window !== 'undefined' &&
      window.location.hostname.includes('onrender.com')
    ) {
      response = await fetch(`https://app-iglesia-backend.onrender.com/api${endpoint}`, reqInit);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.detail || `Error HTTP: ${response.status}`;
      throw new Error(message);
    }

    const finalContentType = response.headers.get('content-type') || '';
    if (finalContentType.includes('text/html')) {
      throw new Error('Respuesta HTML recibida en lugar de JSON API');
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
  },

  changePassword: async (userId, newPassword, oldPassword = null) => {
    return await fetchAPI('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        new_password: newPassword,
        old_password: oldPassword
      })
    });
  },

  requestPasswordReset: async (identifier, phone = null, sedeId = null, fullName = null) => {
    return await fetchAPI('/auth/request-reset', {
      method: 'POST',
      body: JSON.stringify({
        identifier,
        phone,
        sede_id: sedeId,
        full_name: fullName
      })
    });
  },

  getResetRequests: async () => {
    try {
      return await fetchAPI('/auth/reset-requests');
    } catch {
      const saved = localStorage.getItem('restauracion_pwd_resets');
      return saved ? JSON.parse(saved) : [];
    }
  },

  approveResetRequest: async (requestId, status = 'APROBADO', temporaryPassword = '123') => {
    try {
      return await fetchAPI(`/auth/reset-requests/${requestId}/approve`, {
        method: 'POST',
        body: JSON.stringify({
          status,
          temporary_password: temporaryPassword
        })
      });
    } catch {
      return { success: true, status, temporary_password: temporaryPassword };
    }
  }
};





// Prayer API Endpoints
export const prayerAPI = {
  getAll: async (status = 'all', role = 'MIEMBRO', sedeId = null) => {
    try {
      const sedeQuery = (sedeId && sedeId !== 'TODAS') ? `&sede_id=${sedeId}` : '';
      return await fetchAPI(`/prayers?filter_status=${status}&user_role=${role}${sedeQuery}`);
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
          sede_id: 'TODAS',
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
          sede_id: 'TODAS',
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
          sede_id: 'TODAS',
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
        author_name: prayerData.is_anonymous ? 'Hermano(a) en Fe (Anónimo)' : (prayerData.author_name || 'Miembro de la Iglesia'),
        status: 'active',
        prayer_count: 1,
        sede_id: prayerData.sede_id || 'TODAS',
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
  },

  delete: async (id) => {
    try {
      return await fetchAPI(`/prayers/${id}`, { method: 'DELETE' });
    } catch {
      return { success: true };
    }
  }
};

// Announcement API Endpoints
export const announcementAPI = {
  getAll: async (sedeId = null) => {
    try {
      const q = (sedeId && sedeId !== 'TODAS') ? `?sede_id=${sedeId}` : '';
      return await fetchAPI(`/announcements${q}`);
    } catch {
      const saved = localStorage.getItem('restauracion_announcements');
      const list = saved ? JSON.parse(saved) : [
        {
          id: 1,
          title: "Gran Retiro de Familias 2026: 'Edificados sobre la Roca'",
          content: "Te invitamos a inscribirte en nuestro retiro anual de familias del 15 al 17 de Octubre. Habrá plenarias, talleres para niños y matrimonios.",
          category: "Eventos",
          is_important: true,
          sede_id: "TODAS",
          sede_name: "Todas las Sedes (Nacional)",
          created_by: "Pastor Said Carrasquel (Super Admin)",
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: "Jornada General de Ayuno y Clamor por las Naciones",
          content: "Este sábado de 8:00 AM a 12:00 PM nos uniremos en el templo principal para interceder por las familias y nuestra comunidad.",
          category: "Ayunos",
          is_important: false,
          sede_id: "TODAS",
          sede_name: "Todas las Sedes (Nacional)",
          created_by: "Pastor Said Carrasquel (Super Admin)",
          created_at: new Date().toISOString()
        }
      ];
      if (sedeId && sedeId !== 'TODAS') {
        return list.filter(a => a.sede_id === sedeId || a.sede_id === 'TODAS' || !a.sede_id);
      }
      return list;
    }
  },
  create: async (data) => {
    try {
      return await fetchAPI('/announcements', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      const saved = localStorage.getItem('restauracion_announcements');
      const list = saved ? JSON.parse(saved) : [];
      const newAnnouncement = {
        id: Date.now(),
        ...data,
        created_at: new Date().toISOString()
      };
      list.unshift(newAnnouncement);
      localStorage.setItem('restauracion_announcements', JSON.stringify(list));
      return newAnnouncement;
    }
  },
  delete: async (id) => {
    try {
      return await fetchAPI(`/announcements/${id}`, { method: 'DELETE' });
    } catch {
      const saved = localStorage.getItem('restauracion_announcements');
      if (saved) {
        const list = JSON.parse(saved).filter(a => a.id !== id);
        localStorage.setItem('restauracion_announcements', JSON.stringify(list));
      }
      return { success: true };
    }
  }
};

// Sermon API Endpoints
export const sermonAPI = {
  getAll: async (sedeId = null) => {
    try {
      const q = (sedeId && sedeId !== 'TODAS') ? `?sede_id=${sedeId}` : '';
      return await fetchAPI(`/sermons${q}`);
    } catch {
      return [
        {
          id: 1,
          title: "Viviendo por Fe en Tiempos de Incertidumbre",
          series: "Serie: Fundamentos Inconmovibles",
          speaker: "Pastor Said Carrasquel",
          audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          sede_id: "TODAS",
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: "El Poder de la Oración Perseverante",
          series: "Serie: La Oración que Transforma",
          speaker: "Pastor Said Carrasquel",
          audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          sede_id: "TODAS",
          created_at: new Date().toISOString()
        }
      ];
    }
  },
  create: async (sermonData) => {
    try {
      return await fetchAPI('/sermons', {
        method: 'POST',
        body: JSON.stringify(sermonData)
      });
    } catch {
      return {
        id: Date.now(),
        ...sermonData,
        created_at: new Date().toISOString()
      };
    }
  },
  delete: async (id) => {
    try {
      return await fetchAPI(`/sermons/${id}`, { method: 'DELETE' });
    } catch {
      return { success: true };
    }
  }
};

// Donation API Endpoints
export const donationAPI = {
  getAll: async (sedeId = null) => {
    try {
      const q = (sedeId && sedeId !== 'TODAS') ? `?sede_id=${sedeId}` : '';
      return await fetchAPI(`/donations${q}`);
    } catch {
      return [
        {
          id: 101,
          donation_type: 'Diezmo',
          amount: 100.0,
          payment_method: 'Transferencia Bancaria',
          reference: 'REF-98124',
          sede_id: 'plaza-venezuela',
          donor_name: 'Miembro de la Congregación',
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
  getAll: async (sedeId = null, viewer = null) => {
    try {
      let currentUser = viewer;
      if (!currentUser && typeof window !== 'undefined') {
        try {
          const savedUser = localStorage.getItem('user') || localStorage.getItem('iglesia_auth_user');
          if (savedUser) currentUser = JSON.parse(savedUser);
        } catch {}
      }
      const params = new URLSearchParams();
      if (sedeId && sedeId !== 'TODAS') params.set('sede_id', sedeId);
      if (currentUser?.role) params.set('viewer_role', currentUser.role);
      if (currentUser?.sede) params.set('viewer_sede', currentUser.sede);
      if (currentUser?.username) params.set('viewer_username', currentUser.username);
      const query = params.toString() ? `?${params.toString()}` : '';
      const data = await fetchAPI(`/members${query}`);
      // Sincronizar caché local (con teléfonos protegidos en localStorage para evitar filtraciones)
      if (!sedeId || sedeId === 'TODAS') {
        const { saveStoredMembers } = await import('../data/membersData');
        const safeCache = Array.isArray(data)
          ? data.map((m) => ({
              ...m,
              phone: m.phone && m.phone !== 'No registrado' ? '🔒 Encriptado (Privado)' : 'No registrado'
            }))
          : [];
        saveStoredMembers(safeCache);
      }
      return data;
    } catch {
      const { getStoredMembers } = await import('../data/membersData');
      const all = getStoredMembers();
      if (sedeId && sedeId !== 'TODAS') {
        return all.filter(m => m.sede_id === sedeId || m.sede_id === 'TODAS');
      }
      return all;
    }
  },

  getBirthdays: async (month = null, sedeId = null) => {
    try {
      let currentUser = null;
      if (typeof window !== 'undefined') {
        try {
          const savedUser = localStorage.getItem('user') || localStorage.getItem('iglesia_auth_user');
          if (savedUser) currentUser = JSON.parse(savedUser);
        } catch {}
      }
      const params = new URLSearchParams();
      if (month) params.set('month', String(month));
      if (sedeId && sedeId !== 'TODAS') params.set('sede_id', sedeId);
      if (currentUser?.role) params.set('viewer_role', currentUser.role);
      if (currentUser?.sede) params.set('viewer_sede', currentUser.sede);
      if (currentUser?.username) params.set('viewer_username', currentUser.username);
      const query = params.toString() ? `?${params.toString()}` : '';
      return await fetchAPI(`/members/birthdays${query}`);
    } catch {
      return { month: month || (new Date().getMonth() + 1), count: 0, birthdays: [] };
    }
  },

  create: async (memberData) => {
    try {
      const res = await fetchAPI('/members', {
        method: 'POST',
        body: JSON.stringify(memberData)
      });
      if (res?.member) {
        const { getStoredMembers, saveStoredMembers } = await import('../data/membersData');
        const all = getStoredMembers().filter(m => m.id !== res.member.id);
        all.unshift(res.member);
        saveStoredMembers(all);
      }
      return res;
    } catch {
      const { getStoredMembers, saveStoredMembers } = await import('../data/membersData');
      const all = getStoredMembers();
      const newId = (all.length > 0 ? Math.max(...all.map(m => m.id)) : 0) + 1;
      const resolvedUsername = memberData.access_username || '';
      const newMember = {
        id: newId,
        ...memberData,
        username: resolvedUsername,
        joined_at: new Date().toISOString().split('T')[0]
      };
      all.unshift(newMember);
      saveStoredMembers(all);
      return {
        success: true,
        member: newMember,
        credentials: {
          username: resolvedUsername,
          email: memberData.email,
          initial_password: memberData.initial_password || '123',
          allowed_modules: memberData.allowed_modules
        }
      };
    }
  },

  update: async (memberId, memberData) => {
    const { getStoredMembers, saveStoredMembers } = await import('../data/membersData');
    const all = getStoredMembers().map(m => m.id === memberId ? { ...m, ...memberData } : m);
    saveStoredMembers(all);
    try {
      return await fetchAPI(`/members/${memberId}`, {
        method: 'PUT',
        body: JSON.stringify(memberData)
      });
    } catch {
      return { success: true };
    }
  },

  delete: async (memberId) => {
    const { getStoredMembers, saveStoredMembers } = await import('../data/membersData');
    const all = getStoredMembers().filter(m => m.id !== memberId);
    saveStoredMembers(all);
    try {
      return await fetchAPI(`/members/${memberId}`, {
        method: 'DELETE'
      });
    } catch {
      return { success: true };
    }
  }
};

// Sedes API Endpoints
export const sedesAPI = {
  getAll: async () => {
    try {
      return await fetchAPI('/sedes');
    } catch {
      const { getSedesList } = await import('../data/sedesData');
      return getSedesList();
    }
  },

  create: async (sedeData) => {
    try {
      return await fetchAPI('/sedes', {
        method: 'POST',
        body: JSON.stringify(sedeData)
      });
    } catch {
      const { createSedeInStorage } = await import('../data/sedesData');
      return createSedeInStorage(sedeData);
    }
  },

  assignAdmin: async (sedeId, adminData) => {
    try {
      return await fetchAPI(`/sedes/${sedeId}/admin`, {
        method: 'PUT',
        body: JSON.stringify(adminData)
      });
    } catch {
      return { success: true, sede_admin: adminData };
    }
  },

  delete: async (sedeId) => {
    try {
      return await fetchAPI(`/sedes/${sedeId}`, {
        method: 'DELETE'
      });
    } catch {
      const { deleteSedeFromStorage } = await import('../data/sedesData');
      return deleteSedeFromStorage(sedeId);
    }
  }
};




