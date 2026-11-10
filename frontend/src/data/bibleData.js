// Base de datos completa de los 66 libros de la Santa Biblia
// Incluye categorías oficiales, número de capítulos y descripciones exactas proporcionadas

export const BIBLE_VERSIONS = [
  {
    id: "RVR1960",
    name: "Reina-Valera 1960",
    shortName: "RVR1960",
    fullName: "Reina-Valera 1960 (RVR1960)",
    description: "Versión clásica tradicional y de referencia histórica para la iglesia evangélica hispana."
  },
  {
    id: "NVI",
    name: "Nueva Versión Internacional",
    shortName: "NVI",
    fullName: "Nueva Versión Internacional (NVI)",
    description: "Traducción contemporánea directa de los manuscritos hebreos, arameos y griegos con fluidez moderna."
  },
  {
    id: "NTV",
    name: "Nueva Traducción Viviente",
    shortName: "NTV",
    fullName: "Nueva Traducción Viviente (NTV)",
    description: "Traducción precisa en un lenguaje claro, dinámico y cálido para devocionales y comprensión inmediata."
  }
];

export const BIBLE_CATEGORIES = {
  // Antiguo Testamento
  PENTATEUCO: "Pentateuco (Libros de la Ley)",
  HISTORICOS_AT: "Libros Históricos",
  POETICOS: "Libros Poéticos y de Sabiduría",
  PROFETAS_MAYORES: "Profetas Mayores",
  PROFETAS_MENORES: "Profetas Menores",
  // Nuevo Testamento
  EVANGELIOS: "Evangelios (Vida y Ministerio de Jesús)",
  HISTORIA_NT: "Historia",
  EPISTOLAS_PAULINAS: "Epístolas Paulinas (Cartas del apóstol Pablo)",
  EPISTOLAS_GENERALES: "Epístolas Generales (De varios autores)",
  PROFECIA: "Profecía"
};

export const BIBLE_BOOKS = [
  // ==========================================
  // ANTIGUO TESTAMENTO (39 LIBROS)
  // ==========================================

  // --- Pentateuco (Libros de la Ley) ---
  {
    id: 1,
    name: "Génesis",
    testament: "OT",
    category: "Pentateuco (Libros de la Ley)",
    chapters: 50,
    description: "Orígenes de la creación y del pueblo de Israel."
  },
  {
    id: 2,
    name: "Éxodo",
    testament: "OT",
    category: "Pentateuco (Libros de la Ley)",
    chapters: 40,
    description: "La salida de Egipto y la entrega de los Diez Mandamientos."
  },
  {
    id: 3,
    name: "Levítico",
    testament: "OT",
    category: "Pentateuco (Libros de la Ley)",
    chapters: 27,
    description: "Leyes rituales, ceremoniales y de santidad."
  },
  {
    id: 4,
    name: "Números",
    testament: "OT",
    category: "Pentateuco (Libros de la Ley)",
    chapters: 36,
    description: "El censo y el viaje del pueblo por el desierto."
  },
  {
    id: 5,
    name: "Deuteronomio",
    testament: "OT",
    category: "Pentateuco (Libros de la Ley)",
    chapters: 34,
    description: "Repetición y recordatorio de la Ley antes de entrar a la Tierra Prometida."
  },

  // --- Libros Históricos ---
  {
    id: 6,
    name: "Josué",
    testament: "OT",
    category: "Libros Históricos",
    chapters: 24,
    description: "La conquista y repartición de la Tierra Prometida."
  },
  {
    id: 7,
    name: "Jueces",
    testament: "OT",
    category: "Libros Históricos",
    chapters: 21,
    description: "El periodo de los líderes y defensores de Israel."
  },
  {
    id: 8,
    name: "Rut",
    testament: "OT",
    category: "Libros Históricos",
    chapters: 4,
    description: "Historia de fidelidad y redención de una mujer moabita."
  },
  {
    id: 9,
    name: "1 Samuel",
    testament: "OT",
    category: "Libros Históricos",
    chapters: 31,
    description: "El inicio de la monarquía y el reinado de Saúl."
  },
  {
    id: 10,
    name: "2 Samuel",
    testament: "OT",
    category: "Libros Históricos",
    chapters: 24,
    description: "El reinado de David."
  },
  {
    id: 11,
    name: "1 Reyes",
    testament: "OT",
    category: "Libros Históricos",
    chapters: 22,
    description: "El reinado de Salomón y la división del reino."
  },
  {
    id: 12,
    name: "2 Reyes",
    testament: "OT",
    category: "Libros Históricos",
    chapters: 25,
    description: "La historia de los reinos divididos y el exilio."
  },
  {
    id: 13,
    name: "1 Crónicas",
    testament: "OT",
    category: "Libros Históricos",
    chapters: 29,
    description: "Genealogías e historia espiritual del reinado de David."
  },
  {
    id: 14,
    name: "2 Crónicas",
    testament: "OT",
    category: "Libros Históricos",
    chapters: 36,
    description: "Historia desde Salomón hasta el decreto de regreso del exilio."
  },
  {
    id: 15,
    name: "Esdras",
    testament: "OT",
    category: "Libros Históricos",
    chapters: 10,
    description: "El retorno del exilio y la reconstrucción del Templo."
  },
  {
    id: 16,
    name: "Nehemías",
    testament: "OT",
    category: "Libros Históricos",
    chapters: 13,
    description: "La reconstrucción de las murallas de Jerusalén."
  },
  {
    id: 17,
    name: "Ester",
    testament: "OT",
    category: "Libros Históricos",
    chapters: 10,
    description: "La protección providencial de los judíos en Persia."
  },

  // --- Libros Poéticos y de Sabiduría ---
  {
    id: 18,
    name: "Job",
    testament: "OT",
    category: "Libros Poéticos y de Sabiduría",
    chapters: 42,
    description: "El sufrimiento del justo y la soberanía de Dios."
  },
  {
    id: 19,
    name: "Salmos",
    testament: "OT",
    category: "Libros Poéticos y de Sabiduría",
    chapters: 150,
    description: "Cantos, oraciones y alabanzas."
  },
  {
    id: 20,
    name: "Proverbios",
    testament: "OT",
    category: "Libros Poéticos y de Sabiduría",
    chapters: 31,
    description: "Sabiduría práctica para la vida diaria."
  },
  {
    id: 21,
    name: "Eclesiastés",
    testament: "OT",
    category: "Libros Poéticos y de Sabiduría",
    chapters: 12,
    description: "Reflexiones sobre el sentido de la vida."
  },
  {
    id: 22,
    name: "Cantares",
    testament: "OT",
    category: "Libros Poéticos y de Sabiduría",
    chapters: 8,
    description: "El canto al amor y al matrimonio."
  },

  // --- Profetas Mayores ---
  {
    id: 23,
    name: "Isaías",
    testament: "OT",
    category: "Profetas Mayores",
    chapters: 66,
    description: "Profecías sobre el juicio, el exilio y el Mesías prometido."
  },
  {
    id: 24,
    name: "Jeremías",
    testament: "OT",
    category: "Profetas Mayores",
    chapters: 52,
    description: "El profeta que advierte sobre la caída de Jerusalén."
  },
  {
    id: 25,
    name: "Lamentaciones",
    testament: "OT",
    category: "Profetas Mayores",
    chapters: 5,
    description: "Cantos fúnebres por la destrucción de Jerusalén."
  },
  {
    id: 26,
    name: "Ezequiel",
    testament: "OT",
    category: "Profetas Mayores",
    chapters: 48,
    description: "Visiones de la gloria de Dios y la restauración futura."
  },
  {
    id: 27,
    name: "Daniel",
    testament: "OT",
    category: "Profetas Mayores",
    chapters: 12,
    description: "Historias de fidelidad en Babilonia y visiones apocalípticas."
  },

  // --- Profetas Menores ---
  {
    id: 28,
    name: "Oseas",
    testament: "OT",
    category: "Profetas Menores",
    chapters: 14,
    description: "El amor fiel de Dios ilustrado a través de un matrimonio difícil."
  },
  {
    id: 29,
    name: "Joel",
    testament: "OT",
    category: "Profetas Menores",
    chapters: 3,
    description: "El Día de Jehová y la promesa del Espíritu Santo."
  },
  {
    id: 30,
    name: "Amós",
    testament: "OT",
    category: "Profetas Menores",
    chapters: 9,
    description: "Denuncia contra la injusticia social y la hipocresía religiosa."
  },
  {
    id: 31,
    name: "Abdías",
    testament: "OT",
    category: "Profetas Menores",
    chapters: 1,
    description: "Profecía de juicio contra la nación de Edom."
  },
  {
    id: 32,
    name: "Jonás",
    testament: "OT",
    category: "Profetas Menores",
    chapters: 4,
    description: "La misión del profeta desobediente a la ciudad de Nínive."
  },
  {
    id: 33,
    name: "Miqueas",
    testament: "OT",
    category: "Profetas Menores",
    chapters: 7,
    description: "Anuncio de juicio y la profecía sobre el nacimiento del Mesías en Belén."
  },
  {
    id: 34,
    name: "Nahúm",
    testament: "OT",
    category: "Profetas Menores",
    chapters: 3,
    description: "Profecía sobre la caída y destrucción de Nínive."
  },
  {
    id: 35,
    name: "Habacuc",
    testament: "OT",
    category: "Profetas Menores",
    chapters: 3,
    description: "Un diálogo con Dios sobre la justicia y la fe."
  },
  {
    id: 36,
    name: "Sofonías",
    testament: "OT",
    category: "Profetas Menores",
    chapters: 3,
    description: "Advertencia del juicio inminente y la restauración del remanente."
  },
  {
    id: 37,
    name: "Hageo",
    testament: "OT",
    category: "Profetas Menores",
    chapters: 2,
    description: "Exhortación a reconstruir el Templo de Dios."
  },
  {
    id: 38,
    name: "Zacarías",
    testament: "OT",
    category: "Profetas Menores",
    chapters: 14,
    description: "Visiones proféticas sobre la restauración y el Mesías."
  },
  {
    id: 39,
    name: "Malaquías",
    testament: "OT",
    category: "Profetas Menores",
    chapters: 4,
    description: "Llamado al arrepentimiento y fidelidad en los diezmos y ofrendas."
  },

  // ==========================================
  // NUEVO TESTAMENTO (27 LIBROS)
  // ==========================================

  // --- Evangelios (Vida y Ministerio de Jesús) ---
  {
    id: 40,
    name: "Mateo",
    testament: "NT",
    category: "Evangelios (Vida y Ministerio de Jesús)",
    chapters: 28,
    description: "Presenta a Jesús como el Rey y Mesías prometido a los judíos."
  },
  {
    id: 41,
    name: "Marcos",
    testament: "NT",
    category: "Evangelios (Vida y Ministerio de Jesús)",
    chapters: 16,
    description: "Muestra a Jesús como el Siervo sufriente y activo."
  },
  {
    id: 42,
    name: "Lucas",
    testament: "NT",
    category: "Evangelios (Vida y Ministerio de Jesús)",
    chapters: 24,
    description: "Destaca a Jesús como el Hijo del Hombre, Salvador de toda la humanidad."
  },
  {
    id: 43,
    name: "Juan",
    testament: "NT",
    category: "Evangelios (Vida y Ministerio de Jesús)",
    chapters: 21,
    description: "Enfatiza la deidad de Jesús como el Hijo de Dios."
  },

  // --- Historia ---
  {
    id: 44,
    name: "Hechos",
    testament: "NT",
    category: "Historia",
    chapters: 28,
    description: "El nacimiento de la iglesia y la expansión del evangelio por el Espíritu Santo."
  },

  // --- Epístolas Paulinas (Cartas del apóstol Pablo) ---
  {
    id: 45,
    name: "Romanos",
    testament: "NT",
    category: "Epístolas Paulinas (Cartas del apóstol Pablo)",
    chapters: 16,
    description: "Explicación profunda de la salvación por la fe y la gracia."
  },
  {
    id: 46,
    name: "1 Corintios",
    testament: "NT",
    category: "Epístolas Paulinas (Cartas del apóstol Pablo)",
    chapters: 16,
    description: "Instrucciones sobre el orden en la iglesia, dones y el amor."
  },
  {
    id: 47,
    name: "2 Corintios",
    testament: "NT",
    category: "Epístolas Paulinas (Cartas del apóstol Pablo)",
    chapters: 13,
    description: "Defensa del ministerio apostólico de Pablo y la reconciliación."
  },
  {
    id: 48,
    name: "Gálatas",
    testament: "NT",
    category: "Epístolas Paulinas (Cartas del apóstol Pablo)",
    chapters: 6,
    description: "Defensa de la libertad en Cristo frente al legalismo."
  },
  {
    id: 49,
    name: "Efesios",
    testament: "NT",
    category: "Epístolas Paulinas (Cartas del apóstol Pablo)",
    chapters: 6,
    description: "Las bendiciones espirituales y la iglesia como el cuerpo de Cristo."
  },
  {
    id: 50,
    name: "Filipenses",
    testament: "NT",
    category: "Epístolas Paulinas (Cartas del apóstol Pablo)",
    chapters: 4,
    description: "Carta sobre el gozo y el contentamiento en medio de las pruebas."
  },
  {
    id: 51,
    name: "Colosenses",
    testament: "NT",
    category: "Epístolas Paulinas (Cartas del apóstol Pablo)",
    chapters: 4,
    description: "La supremacía y suficiencia de Cristo sobre toda filosofía."
  },
  {
    id: 52,
    name: "1 Tesalonicenses",
    testament: "NT",
    category: "Epístolas Paulinas (Cartas del apóstol Pablo)",
    chapters: 5,
    description: "Consuelo e instrucciones sobre la segunda venida de Cristo."
  },
  {
    id: 53,
    name: "2 Tesalonicenses",
    testament: "NT",
    category: "Epístolas Paulinas (Cartas del apóstol Pablo)",
    chapters: 3,
    description: "Aclaraciones sobre el día del Señor y la constancia."
  },
  {
    id: 54,
    name: "1 Timoteo",
    testament: "NT",
    category: "Epístolas Paulinas (Cartas del apóstol Pablo)",
    chapters: 6,
    description: "Consejos prácticos a un joven pastor sobre el liderazgo eclesiástico."
  },
  {
    id: 55,
    name: "2 Timoteo",
    testament: "NT",
    category: "Epístolas Paulinas (Cartas del apóstol Pablo)",
    chapters: 4,
    description: "Última carta de Pablo, animando a la fidelidad en el ministerio."
  },
  {
    id: 56,
    name: "Tito",
    testament: "NT",
    category: "Epístolas Paulinas (Cartas del apóstol Pablo)",
    chapters: 3,
    description: "Pautas sobre la sana doctrina y las buenas obras en Creta."
  },
  {
    id: 57,
    name: "Filemón",
    testament: "NT",
    category: "Epístolas Paulinas (Cartas del apóstol Pablo)",
    chapters: 1,
    description: "Petición de perdón y hermandad para un esclavo fugitivo llamado Onésimo."
  },

  // --- Epístolas Generales (De varios autores) ---
  {
    id: 58,
    name: "Hebreos",
    testament: "NT",
    category: "Epístolas Generales (De varios autores)",
    chapters: 13,
    description: "Demuestra que Cristo es superior a los ángeles, a Moisés y al antiguo pacto."
  },
  {
    id: 59,
    name: "Santiago",
    testament: "NT",
    category: "Epístolas Generales (De varios autores)",
    chapters: 5,
    description: "La fe práctica demostrada a través de las obras."
  },
  {
    id: 60,
    name: "1 Pedro",
    testament: "NT",
    category: "Epístolas Generales (De varios autores)",
    chapters: 5,
    description: "Esperanza y fortaleza para los cristianos que sufren persecución."
  },
  {
    id: 61,
    name: "2 Pedro",
    testament: "NT",
    category: "Epístolas Generales (De varios autores)",
    chapters: 3,
    description: "Advertencia contra los falsos maestros y la promesa del regreso de Cristo."
  },
  {
    id: 62,
    name: "1 Juan",
    testament: "NT",
    category: "Epístolas Generales (De varios autores)",
    chapters: 5,
    description: "Seguridad de la salvación, el amor fraternal y la comunión con Dios."
  },
  {
    id: 63,
    name: "2 Juan",
    testament: "NT",
    category: "Epístolas Generales (De varios autores)",
    chapters: 1,
    description: "Advertencia contra los engañadores y un llamado a caminar en la verdad."
  },
  {
    id: 64,
    name: "3 Juan",
    testament: "NT",
    category: "Epístolas Generales (De varios autores)",
    chapters: 1,
    description: "Elogio a la hospitalidad cristiana y reprensión al orgullo."
  },
  {
    id: 65,
    name: "Judas",
    testament: "NT",
    category: "Epístolas Generales (De varios autores)",
    chapters: 1,
    description: "Exhortación a contender ardientemente por la fe ante la apostasía."
  },

  // --- Profecía ---
  {
    id: 66,
    name: "Apocalipsis",
    testament: "NT",
    category: "Profecía",
    chapters: 22,
    description: "Revelación de la victoria final de Jesucristo, el juicio y la nueva creación."
  }
];

// Muestras auténticas de pasajes clave en las 3 versiones principales
export const MULTI_VERSION_PASSAGES = {
  // Salmos 23
  "19-23": {
    RVR1960: [
      { verse: 1, text: "Jehová es mi pastor; nada me faltará." },
      { verse: 2, text: "En lugares de delicados pastos me hará descansar; junto a aguas de reposo me pastoreará." },
      { verse: 3, text: "Confortará mi alma; me guiará por sendas de justicia por amor de su nombre." },
      { verse: 4, text: "Aunque ande en valle de sombra de muerte, no temeré mal alguno, porque tú estarás conmigo; tu vara y tu cayado me infundirán aliento." },
      { verse: 5, text: "Aderezas mesa delante de mí en presencia de mis angustiadores; unges mi cabeza con aceite; mi copa está rebosando." },
      { verse: 6, text: "Ciertamente el bien y la misericordia me seguirán todos los días de mi vida, y en la casa de Jehová moraré por largos días." }
    ],
    NVI: [
      { verse: 1, text: "El Señor es mi pastor, nada me falta." },
      { verse: 2, text: "En verdes pastos me hace descansar. Junto a tranquilas aguas me conduce;" },
      { verse: 3, text: "me infunde nuevas fuerzas. Me guía por sendas de justicia por amor a su nombre." },
      { verse: 4, text: "Aun si voy por valles tenebrosos, no temo peligro alguno porque tú estás a mi lado; tu vara de pastor me reconforta." },
      { verse: 5, text: "Dispones ante mí un banquete en presencia de mis enemigos. Has ungido con perfume mi cabeza; has llenado mi copa a rebosar." },
      { verse: 6, text: "La bondad y el amor me seguirán todos los días de mi vida; y en la casa del Señor habitaré para siempre." }
    ],
    NTV: [
      { verse: 1, text: "El Señor es mi pastor; tengo todo lo que necesito." },
      { verse: 2, text: "En verdes praderas me deja descansar; me conduce junto a arroyos tranquilos." },
      { verse: 3, text: "Él renueva mis fuerzas. Me guía por sendas correctas, y así da honra a su nombre." },
      { verse: 4, text: "Incluso cuando cruce por el oscuro valle de la muerte, no tendré miedo, pues tú estás a mi lado. Tu vara y tu cayado me protegen y me confortan." },
      { verse: 5, text: "Me preparas un banquete en presencia de mis enemigos. Me honras ungiendo mi cabeza con aceite; mi copa se desborda de bendiciones." },
      { verse: 6, text: "Ciertamente tu bondad y tu amor inagotable me seguirán todos los días de mi vida, y en la casa del Señor viviré por siempre." }
    ]
  },

  // Juan 3
  "43-3": {
    RVR1960: [
      { verse: 16, text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna." },
      { verse: 17, text: "Porque no envió Dios a su Hijo al mundo para condenar al mundo, sino para que el mundo sea salvo por él." },
      { verse: 18, text: "El que en él cree, no es condenado; pero el que no cree, ya ha sido condenado, porque no ha creído en el nombre del unigénito Hijo de Dios." }
    ],
    NVI: [
      { verse: 16, text: "Porque tanto amó Dios al mundo que dio a su Hijo unigénito, para que todo el que cree en él no se pierda, sino que tenga vida eterna." },
      { verse: 17, text: "Dios no envió a su Hijo al mundo para condenar al mundo, sino para salvarlo por medio de él." },
      { verse: 18, text: "El que cree en él no es condenado, pero el que no cree ya está condenado por no haber creído en el nombre del Hijo unigénito de Dios." }
    ],
    NTV: [
      { verse: 16, text: "Pues Dios amó tanto al mundo que dio a su único Hijo, para que todo el que crea en él no se pierda, sino que tenga vida eterna." },
      { verse: 17, text: "Dios no envió a su Hijo al mundo para condenar al mundo, sino para salvarlo por medio de él." },
      { verse: 18, text: "No hay condenación para todo el que cree en él, pero todo el que no cree en él ya ha sido condenado por no haber creído en el único Hijo de Dios." }
    ]
  },

  // Filipenses 4
  "50-4": {
    RVR1960: [
      { verse: 4, text: "Regocijaos en el Señor siempre. Otra vez digo: ¡Regocijaos!" },
      { verse: 6, text: "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias." },
      { verse: 7, text: "Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús." },
      { verse: 13, text: "Todo lo puedo en Cristo que me fortalece." }
    ],
    NVI: [
      { verse: 4, text: "Alégrense siempre en el Señor. Insisto: ¡Alégrense!" },
      { verse: 6, text: "No se inquieten por nada; más bien, en toda ocasión, con oración y ruego, presenten sus peticiones a Dios y denle gracias." },
      { verse: 7, text: "Y la paz de Dios, que sobrepasa todo entendimiento, cuidará sus corazones y sus pensamientos en Cristo Jesús." },
      { verse: 13, text: "Cristo me da fuerzas para enfrentarme a toda clase de situaciones." }
    ],
    NTV: [
      { verse: 4, text: "Alégrense siempre en el Señor. Insisto: ¡alégrense!" },
      { verse: 6, text: "No se preocupen por nada; en cambio, oren por todo. Díganle a Dios lo que necesitan y denle gracias por todo lo que él ha hecho." },
      { verse: 7, text: "Así experimentarán la paz de Dios, que supera todo lo que podemos entender. La paz de Dios cuidará su corazón y su mente mientras vivan en Cristo Jesús." },
      { verse: 13, text: "Pues todo lo puedo hacer por medio de Cristo, quien me da las fuerzas." }
    ]
  },

  // Romanos 8
  "45-8": {
    RVR1960: [
      { verse: 28, text: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados." },
      { verse: 31, text: "¿Qué, pues, diremos a esto? Si Dios es por nosotros, ¿quién contra nosotros?" },
      { verse: 38, text: "Por lo cual estoy seguro de que ni la muerte, ni la vida, ni ángeles, ni principados, ni potestades, ni lo presente, ni lo por venir," },
      { verse: 39, text: "ni lo alto, ni lo profundo, ni ninguna otra cosa creada nos podrá separar del amor de Dios, que es en Cristo Jesús Señor nuestro." }
    ],
    NVI: [
      { verse: 28, text: "Ahora bien, sabemos que Dios dispone todas las cosas para el bien de quienes lo aman, los que han sido llamados de acuerdo con su propósito." },
      { verse: 31, text: "¿Qué diremos frente a esto? Si Dios está de nuestra parte, ¿quién puede estar en contra nuestra?" },
      { verse: 38, text: "Pues estoy convencido de que ni la muerte ni la vida, ni los ángeles ni los demonios, ni lo presente ni lo por venir, ni los poderes," },
      { verse: 39, text: "ni lo alto ni lo profundo, ni cosa alguna en toda la creación podrá apartarnos del amor que Dios nos ha manifestado en Cristo Jesús, nuestro Señor." }
    ],
    NTV: [
      { verse: 28, text: "Y sabemos que Dios hace que todas las cosas cooperen para el bien de quienes lo aman y son llamados según su propósito para ellos." },
      { verse: 31, text: "¿Qué podemos decir acerca de cosas tan maravillosas como estas? Si Dios está a favor de nosotros, ¿quién podrá ponerse en nuestra contra?" },
      { verse: 38, text: "Y estoy convencido de que nada podrá jamás separarnos del amor de Dios. Ni la muerte, ni la vida, ni ángeles ni demonios, ni nuestros temores de hoy ni nuestras preocupaciones de mañana," },
      { verse: 39, text: "ni siquiera los poderes del infierno pueden separarnos del amor de Dios. Ningún poder en las alturas ni en las profundidades, de hecho, nada en toda la creación podrá jamás separarnos del amor de Dios que se encuentra en Cristo Jesús nuestro Señor." }
    ]
  },

  // Génesis 1
  "1-1": {
    RVR1960: [
      { verse: 1, text: "En el principio creó Dios los cielos y la tierra." },
      { verse: 2, text: "Y la tierra estaba desordenada y vacía, y las tinieblas estaban sobre la faz del abismo, y el Espíritu de Dios se movía sobre la faz de las aguas." },
      { verse: 3, text: "Y dijo Dios: Sea la luz; y fue la luz." }
    ],
    NVI: [
      { verse: 1, text: "En el principio, Dios creó los cielos y la tierra." },
      { verse: 2, text: "La tierra era un caos total, las tinieblas cubrían el abismo, y el Espíritu de Dios se movía sobre la superficie de las aguas." },
      { verse: 3, text: "Y dijo Dios: «¡Que exista la luz!» Y la luz llegó a existir." }
    ],
    NTV: [
      { verse: 1, text: "En el principio, Dios creó los cielos y la tierra." },
      { verse: 2, text: "La tierra no tenía forma y estaba vacía, y una densa oscuridad cubría las aguas profundas. Y el Espíritu de Dios se movía sobre la superficie de las aguas." },
      { verse: 3, text: "Entonces Dios dijo: «Que haya luz»; y hubo luz." }
    ]
  }
};

// Generador de versículos dinámicos para capítulos que no están en el muestrario
export function getVersesForChapter(bookId, chapter, version = "RVR1960") {
  const book = BIBLE_BOOKS.find((b) => b.id === Number(bookId));
  const bookName = book ? book.name : "Libro";
  const key = `${bookId}-${chapter}`;

  if (MULTI_VERSION_PASSAGES[key] && MULTI_VERSION_PASSAGES[key][version]) {
    return MULTI_VERSION_PASSAGES[key][version];
  }

  // Generador contextual con la versión seleccionada
  const versionName = version === "NVI" ? "Nueva Versión Internacional (NVI)" :
                      version === "NTV" ? "Nueva Traducción Viviente (NTV)" :
                      "Reina-Valera 1960 (RVR1960)";

  return Array.from({ length: 8 }, (_, i) => ({
    verse: i + 1,
    text: `Versículo ${i + 1} del capítulo ${chapter} de ${bookName} [${versionName}]. «Toda la Escritura es inspirada por Dios y útil para enseñar, reprender, corregir e instruir en justicia.»`
  }));
}
