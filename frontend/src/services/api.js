const API_BASE_URL = (import.meta.env.VITE_API_URL || '') + '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function fetchAPI(endpoint, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      let errDetail = `HTTP error! Status: ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson.detail) errDetail = errJson.detail;
      } catch (e) {}
      throw new Error(errDetail);
    }

    return await response.json();
  } catch (error) {
    console.warn(`API call failed for ${endpoint}:`, error.message);
    throw error;
  }
}

// Authentication API Endpoints
export const authAPI = {
  login: async (email, password) => {
    return await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  getMe: async () => {
    return await fetchAPI('/auth/me');
  }
};

// Users Administration API Endpoints (Pastors, Leaders, Members)
export const userAPI = {
  getAll: async (role = '', search = '') => {
    try {
      let query = [];
      if (role) query.push(`role=${encodeURIComponent(role)}`);
      if (search) query.push(`search=${encodeURIComponent(search)}`);
      const qStr = query.length > 0 ? `?${query.join('&')}` : '';
      return await fetchAPI(`/users${qStr}`);
    } catch (err) {
      // Offline / LocalStorage fallback
      let saved = JSON.parse(localStorage.getItem('app_users') || '[]');
      if (saved.length === 0) {
        saved = [
          { id: 1, email: 'Linfante', full_name: 'Pastor Luis Infante', role: 'ADMIN', phone: '+58 414 1234567', status: 'Activo', created_at: new Date().toISOString() }
        ];
        localStorage.setItem('app_users', JSON.stringify(saved));
      }
      let filtered = saved;
      if (role) filtered = filtered.filter(u => u.role.toUpperCase() === role.toUpperCase());
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(u => u.full_name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
      }
      return filtered;
    }
  },

  create: async (userData) => {
    try {
      return await fetchAPI('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    } catch (err) {
      const saved = JSON.parse(localStorage.getItem('app_users') || '[]');
      const newUser = {
        id: Date.now(),
        ...userData,
        status: userData.status || 'Activo',
        created_at: new Date().toISOString()
      };
      saved.push(newUser);
      localStorage.setItem('app_users', JSON.stringify(saved));
      return newUser;
    }
  },

  update: async (userId, userData) => {
    try {
      return await fetchAPI(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    } catch (err) {
      let saved = JSON.parse(localStorage.getItem('app_users') || '[]');
      let updatedUser = null;
      saved = saved.map(u => {
        if (u.id === userId) {
          updatedUser = { ...u, ...userData };
          return updatedUser;
        }
        return u;
      });
      localStorage.setItem('app_users', JSON.stringify(saved));
      return updatedUser;
    }
  },

  delete: async (userId) => {
    try {
      return await fetchAPI(`/users/${userId}`, { method: 'DELETE' });
    } catch (err) {
      let saved = JSON.parse(localStorage.getItem('app_users') || '[]');
      saved = saved.filter(u => u.id !== userId);
      localStorage.setItem('app_users', JSON.stringify(saved));
    }
  }
};

// Media / Gallery API Endpoints (Photos & Videos)
export const mediaAPI = {
  getAll: async (mediaType = '', category = '') => {
    try {
      let query = [];
      if (mediaType) query.push(`media_type=${encodeURIComponent(mediaType)}`);
      if (category && category !== 'Todos') query.push(`category=${encodeURIComponent(category)}`);
      const qStr = query.length > 0 ? `?${query.join('&')}` : '';
      return await fetchAPI(`/media${qStr}`);
    } catch (err) {
      let saved = JSON.parse(localStorage.getItem('app_media') || '[]');
      let filtered = saved;
      if (mediaType) filtered = filtered.filter(m => m.media_type === mediaType);
      if (category && category !== 'Todos') filtered = filtered.filter(m => m.category === category);
      return filtered;
    }
  },

  create: async (mediaData) => {
    try {
      return await fetchAPI('/media', {
        method: 'POST',
        body: JSON.stringify(mediaData)
      });
    } catch (err) {
      const saved = JSON.parse(localStorage.getItem('app_media') || '[]');
      const newItem = {
        id: Date.now(),
        ...mediaData,
        created_at: new Date().toISOString()
      };
      saved.unshift(newItem);
      localStorage.setItem('app_media', JSON.stringify(saved));
      return newItem;
    }
  },

  update: async (mediaId, mediaData) => {
    try {
      return await fetchAPI(`/media/${mediaId}`, {
        method: 'PUT',
        body: JSON.stringify(mediaData)
      });
    } catch (err) {
      let saved = JSON.parse(localStorage.getItem('app_media') || '[]');
      let updated = null;
      saved = saved.map(m => {
        if (m.id === mediaId) {
          updated = { ...m, ...mediaData };
          return updated;
        }
        return m;
      });
      localStorage.setItem('app_media', JSON.stringify(saved));
      return updated;
    }
  },

  delete: async (mediaId) => {
    try {
      return await fetchAPI(`/media/${mediaId}`, { method: 'DELETE' });
    } catch (err) {
      let saved = JSON.parse(localStorage.getItem('app_media') || '[]');
      saved = saved.filter(m => m.id !== mediaId);
      localStorage.setItem('app_media', JSON.stringify(saved));
      return { message: 'Eliminado localmente', id: mediaId };
    }
  }
};

// Prayer API Endpoints
export const prayerAPI = {
  getAll: async (status = 'all', role = 'MIEMBRO') => {
    try {
      return await fetchAPI(`/prayers?filter_status=${status}&user_role=${role}`);
    } catch {
      let saved = JSON.parse(localStorage.getItem('app_prayers') || '[]');
      if (status !== 'all') {
        saved = saved.filter(p => p.status === status);
      }
      return saved;
    }
  },

  create: async (prayerData) => {
    try {
      return await fetchAPI('/prayers', {
        method: 'POST',
        body: JSON.stringify(prayerData)
      });
    } catch {
      const saved = JSON.parse(localStorage.getItem('app_prayers') || '[]');
      const newItem = {
        id: Date.now(),
        ...prayerData,
        author_name: prayerData.is_anonymous ? 'Hermano(a) en Fe (Anónimo)' : 'Miembro de la Iglesia',
        status: 'active',
        prayer_count: 1,
        created_at: new Date().toISOString()
      };
      saved.unshift(newItem);
      localStorage.setItem('app_prayers', JSON.stringify(saved));
      return newItem;
    }
  },

  pray: async (id) => {
    try {
      return await fetchAPI(`/prayers/${id}/pray`, { method: 'POST' });
    } catch {
      let saved = JSON.parse(localStorage.getItem('app_prayers') || '[]');
      saved = saved.map(p => p.id === id ? { ...p, prayer_count: (p.prayer_count || 0) + 1 } : p);
      localStorage.setItem('app_prayers', JSON.stringify(saved));
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
      let saved = JSON.parse(localStorage.getItem('app_prayers') || '[]');
      saved = saved.map(p => p.id === id ? { ...p, status: newStatus } : p);
      localStorage.setItem('app_prayers', JSON.stringify(saved));
      return { id, status: newStatus };
    }
  },

  delete: async (id) => {
    try {
      return await fetchAPI(`/prayers/${id}`, { method: 'DELETE' });
    } catch {
      let saved = JSON.parse(localStorage.getItem('app_prayers') || '[]');
      saved = saved.filter(p => p.id !== id);
      localStorage.setItem('app_prayers', JSON.stringify(saved));
      return { id, message: 'Eliminado localmente' };
    }
  }
};

// Announcement API Endpoints
export const announcementAPI = {
  getAll: async () => {
    try {
      return await fetchAPI('/announcements');
    } catch {
      return JSON.parse(localStorage.getItem('app_announcements') || '[]');
    }
  },

  create: async (data) => {
    try {
      return await fetchAPI('/announcements', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      const saved = JSON.parse(localStorage.getItem('app_announcements') || '[]');
      const newItem = { id: Date.now(), ...data, created_at: new Date().toISOString() };
      saved.unshift(newItem);
      localStorage.setItem('app_announcements', JSON.stringify(saved));
      return newItem;
    }
  },

  update: async (id, data) => {
    try {
      return await fetchAPI(`/announcements/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch {
      let saved = JSON.parse(localStorage.getItem('app_announcements') || '[]');
      let updated = null;
      saved = saved.map(a => {
        if (a.id === id) {
          updated = { ...a, ...data };
          return updated;
        }
        return a;
      });
      localStorage.setItem('app_announcements', JSON.stringify(saved));
      return updated;
    }
  },

  delete: async (id) => {
    try {
      return await fetchAPI(`/announcements/${id}`, { method: 'DELETE' });
    } catch {
      let saved = JSON.parse(localStorage.getItem('app_announcements') || '[]');
      saved = saved.filter(a => a.id !== id);
      localStorage.setItem('app_announcements', JSON.stringify(saved));
      return { id, message: 'Eliminado localmente' };
    }
  }
};

// Sermon API Endpoints
export const sermonAPI = {
  getAll: async () => {
    try {
      return await fetchAPI('/sermons');
    } catch {
      return JSON.parse(localStorage.getItem('app_sermons') || '[]');
    }
  },

  create: async (data) => {
    try {
      return await fetchAPI('/sermons', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      const saved = JSON.parse(localStorage.getItem('app_sermons') || '[]');
      const newItem = { id: Date.now(), ...data, created_at: new Date().toISOString() };
      saved.unshift(newItem);
      localStorage.setItem('app_sermons', JSON.stringify(saved));
      return newItem;
    }
  },

  update: async (id, data) => {
    try {
      return await fetchAPI(`/sermons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch {
      let saved = JSON.parse(localStorage.getItem('app_sermons') || '[]');
      let updated = null;
      saved = saved.map(s => {
        if (s.id === id) {
          updated = { ...s, ...data };
          return updated;
        }
        return s;
      });
      localStorage.setItem('app_sermons', JSON.stringify(saved));
      return updated;
    }
  },

  delete: async (id) => {
    try {
      return await fetchAPI(`/sermons/${id}`, { method: 'DELETE' });
    } catch {
      let saved = JSON.parse(localStorage.getItem('app_sermons') || '[]');
      saved = saved.filter(s => s.id !== id);
      localStorage.setItem('app_sermons', JSON.stringify(saved));
      return { id, message: 'Eliminado localmente' };
    }
  }
};

// Donation API Endpoints
export const donationAPI = {
  getAll: async () => {
    try {
      return await fetchAPI('/donations');
    } catch {
      return JSON.parse(localStorage.getItem('app_donations') || '[]');
    }
  },

  create: async (donationData) => {
    try {
      return await fetchAPI('/donations', {
        method: 'POST',
        body: JSON.stringify(donationData)
      });
    } catch {
      const saved = JSON.parse(localStorage.getItem('app_donations') || '[]');
      const newItem = { id: Date.now(), ...donationData, created_at: new Date().toISOString() };
      saved.unshift(newItem);
      localStorage.setItem('app_donations', JSON.stringify(saved));
      return newItem;
    }
  },

  delete: async (id) => {
    try {
      return await fetchAPI(`/donations/${id}`, { method: 'DELETE' });
    } catch {
      let saved = JSON.parse(localStorage.getItem('app_donations') || '[]');
      saved = saved.filter(d => d.id !== id);
      localStorage.setItem('app_donations', JSON.stringify(saved));
      return { id, message: 'Eliminado localmente' };
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

