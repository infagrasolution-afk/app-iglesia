from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Dict, Any

router = APIRouter(prefix="/api/bible", tags=["Bible Multi-Version"])

# Las 3 versiones principales en el orden solicitado
BIBLE_VERSIONS = [
    {
        "id": "RVR1960",
        "name": "Reina-Valera 1960",
        "short_name": "RVR1960",
        "full_name": "Reina-Valera 1960 (RVR1960)",
        "description": "Versión clásica tradicional y de referencia histórica para la iglesia evangélica hispana."
    },
    {
        "id": "NVI",
        "name": "Nueva Versión Internacional",
        "short_name": "NVI",
        "full_name": "Nueva Versión Internacional (NVI)",
        "description": "Traducción contemporánea directa de los textos originales con fluidez moderna."
    },
    {
        "id": "NTV",
        "name": "Nueva Traducción Viviente",
        "short_name": "NTV",
        "full_name": "Nueva Traducción Viviente (NTV)",
        "description": "Traducción precisa en un lenguaje claro, dinámico y cálido para devocionales y comprensión inmediata."
    }
]

# 66 Libros completos con descripciones textuales proporcionadas por el usuario
BIBLE_BOOKS = [
    # ==========================================
    # ANTIGUO TESTAMENTO (39 LIBROS)
    # ==========================================
    # Pentateuco (Libros de la Ley)
    {"id": 1, "name": "Génesis", "testament": "OT", "category": "Pentateuco (Libros de la Ley)", "chapters": 50, "description": "Orígenes de la creación y del pueblo de Israel."},
    {"id": 2, "name": "Éxodo", "testament": "OT", "category": "Pentateuco (Libros de la Ley)", "chapters": 40, "description": "La salida de Egipto y la entrega de los Diez Mandamientos."},
    {"id": 3, "name": "Levítico", "testament": "OT", "category": "Pentateuco (Libros de la Ley)", "chapters": 27, "description": "Leyes rituales, ceremoniales y de santidad."},
    {"id": 4, "name": "Números", "testament": "OT", "category": "Pentateuco (Libros de la Ley)", "chapters": 36, "description": "El censo y el viaje del pueblo por el desierto."},
    {"id": 5, "name": "Deuteronomio", "testament": "OT", "category": "Pentateuco (Libros de la Ley)", "chapters": 34, "description": "Repetición y recordatorio de la Ley antes de entrar a la Tierra Prometida."},

    # Libros Históricos
    {"id": 6, "name": "Josué", "testament": "OT", "category": "Libros Históricos", "chapters": 24, "description": "La conquista y repartición de la Tierra Prometida."},
    {"id": 7, "name": "Jueces", "testament": "OT", "category": "Libros Históricos", "chapters": 21, "description": "El periodo de los líderes y defensores de Israel."},
    {"id": 8, "name": "Rut", "testament": "OT", "category": "Libros Históricos", "chapters": 4, "description": "Historia de fidelidad y redención de una mujer moabita."},
    {"id": 9, "name": "1 Samuel", "testament": "OT", "category": "Libros Históricos", "chapters": 31, "description": "El inicio de la monarquía y el reinado de Saúl."},
    {"id": 10, "name": "2 Samuel", "testament": "OT", "category": "Libros Históricos", "chapters": 24, "description": "El reinado de David."},
    {"id": 11, "name": "1 Reyes", "testament": "OT", "category": "Libros Históricos", "chapters": 22, "description": "El reinado de Salomón y la división del reino."},
    {"id": 12, "name": "2 Reyes", "testament": "OT", "category": "Libros Históricos", "chapters": 25, "description": "La historia de los reinos divididos y el exilio."},
    {"id": 13, "name": "1 Crónicas", "testament": "OT", "category": "Libros Históricos", "chapters": 29, "description": "Genealogías e historia espiritual del reinado de David."},
    {"id": 14, "name": "2 Crónicas", "testament": "OT", "category": "Libros Históricos", "chapters": 36, "description": "Historia desde Salomón hasta el decreto de regreso del exilio."},
    {"id": 15, "name": "Esdras", "testament": "OT", "category": "Libros Históricos", "chapters": 10, "description": "El retorno del exilio y la reconstrucción del Templo."},
    {"id": 16, "name": "Nehemías", "testament": "OT", "category": "Libros Históricos", "chapters": 13, "description": "La reconstrucción de las murallas de Jerusalén."},
    {"id": 17, "name": "Ester", "testament": "OT", "category": "Libros Históricos", "chapters": 10, "description": "La protección providencial de los judíos en Persia."},

    # Libros Poéticos y de Sabiduría
    {"id": 18, "name": "Job", "testament": "OT", "category": "Libros Poéticos y de Sabiduría", "chapters": 42, "description": "El sufrimiento del justo y la soberanía de Dios."},
    {"id": 19, "name": "Salmos", "testament": "OT", "category": "Libros Poéticos y de Sabiduría", "chapters": 150, "description": "Cantos, oraciones y alabanzas."},
    {"id": 20, "name": "Proverbios", "testament": "OT", "category": "Libros Poéticos y de Sabiduría", "chapters": 31, "description": "Sabiduría práctica para la vida diaria."},
    {"id": 21, "name": "Eclesiastés", "testament": "OT", "category": "Libros Poéticos y de Sabiduría", "chapters": 12, "description": "Reflexiones sobre el sentido de la vida."},
    {"id": 22, "name": "Cantares", "testament": "OT", "category": "Libros Poéticos y de Sabiduría", "chapters": 8, "description": "El canto al amor y al matrimonio."},

    # Profetas Mayores
    {"id": 23, "name": "Isaías", "testament": "OT", "category": "Profetas Mayores", "chapters": 66, "description": "Profecías sobre el juicio, el exilio y el Mesías prometido."},
    {"id": 24, "name": "Jeremías", "testament": "OT", "category": "Profetas Mayores", "chapters": 52, "description": "El profeta que advierte sobre la caída de Jerusalén."},
    {"id": 25, "name": "Lamentaciones", "testament": "OT", "category": "Profetas Mayores", "chapters": 5, "description": "Cantos fúnebres por la destrucción de Jerusalén."},
    {"id": 26, "name": "Ezequiel", "testament": "OT", "category": "Profetas Mayores", "chapters": 48, "description": "Visiones de la gloria de Dios y la restauración futura."},
    {"id": 27, "name": "Daniel", "testament": "OT", "category": "Profetas Mayores", "chapters": 12, "description": "Historias de fidelidad en Babilonia y visiones apocalípticas."},

    # Profetas Menores
    {"id": 28, "name": "Oseas", "testament": "OT", "category": "Profetas Menores", "chapters": 14, "description": "El amor fiel de Dios ilustrado a través de un matrimonio difícil."},
    {"id": 29, "name": "Joel", "testament": "OT", "category": "Profetas Menores", "chapters": 3, "description": "El Día de Jehová y la promesa del Espíritu Santo."},
    {"id": 30, "name": "Amós", "testament": "OT", "category": "Profetas Menores", "chapters": 9, "description": "Denuncia contra la injusticia social y la hipocresía religiosa."},
    {"id": 31, "name": "Abdías", "testament": "OT", "category": "Profetas Menores", "chapters": 1, "description": "Profecía de juicio contra la nación de Edom."},
    {"id": 32, "name": "Jonás", "testament": "OT", "category": "Profetas Menores", "chapters": 4, "description": "La misión del profeta desobediente a la ciudad de Nínive."},
    {"id": 33, "name": "Miqueas", "testament": "OT", "category": "Profetas Menores", "chapters": 7, "description": "Anuncio de juicio y la profecía sobre el nacimiento del Mesías en Belén."},
    {"id": 34, "name": "Nahúm", "testament": "OT", "category": "Profetas Menores", "chapters": 3, "description": "Profecía sobre la caída y destrucción de Nínive."},
    {"id": 35, "name": "Habacuc", "testament": "OT", "category": "Profetas Menores", "chapters": 3, "description": "Un diálogo con Dios sobre la justicia y la fe."},
    {"id": 36, "name": "Sofonías", "testament": "OT", "category": "Profetas Menores", "chapters": 3, "description": "Advertencia del juicio inminente y la restauración del remanente."},
    {"id": 37, "name": "Hageo", "testament": "OT", "category": "Profetas Menores", "chapters": 2, "description": "Exhortación a reconstruir el Templo de Dios."},
    {"id": 38, "name": "Zacarías", "testament": "OT", "category": "Profetas Menores", "chapters": 14, "description": "Visiones proféticas sobre la restauración y el Mesías."},
    {"id": 39, "name": "Malaquías", "testament": "OT", "category": "Profetas Menores", "chapters": 4, "description": "Llamado al arrepentimiento y fidelidad en los diezmos y ofrendas."},

    # ==========================================
    # NUEVO TESTAMENTO (27 LIBROS)
    # ==========================================
    # Evangelios (Vida y Ministerio de Jesús)
    {"id": 40, "name": "Mateo", "testament": "NT", "category": "Evangelios (Vida y Ministerio de Jesús)", "chapters": 28, "description": "Presenta a Jesús como el Rey y Mesías prometido a los judíos."},
    {"id": 41, "name": "Marcos", "testament": "NT", "category": "Evangelios (Vida y Ministerio de Jesús)", "chapters": 16, "description": "Muestra a Jesús como el Siervo sufriente y activo."},
    {"id": 42, "name": "Lucas", "testament": "NT", "category": "Evangelios (Vida y Ministerio de Jesús)", "chapters": 24, "description": "Destaca a Jesús como el Hijo del Hombre, Salvador de toda la humanidad."},
    {"id": 43, "name": "Juan", "testament": "NT", "category": "Evangelios (Vida y Ministerio de Jesús)", "chapters": 21, "description": "Enfatiza la deidad de Jesús como el Hijo de Dios."},

    # Historia
    {"id": 44, "name": "Hechos", "testament": "NT", "category": "Historia", "chapters": 28, "description": "El nacimiento de la iglesia y la expansión del evangelio por el Espíritu Santo."},

    # Epístolas Paulinas (Cartas del apóstol Pablo)
    {"id": 45, "name": "Romanos", "testament": "NT", "category": "Epístolas Paulinas (Cartas del apóstol Pablo)", "chapters": 16, "description": "Explicación profunda de la salvación por la fe y la gracia."},
    {"id": 46, "name": "1 Corintios", "testament": "NT", "category": "Epístolas Paulinas (Cartas del apóstol Pablo)", "chapters": 16, "description": "Instrucciones sobre el orden en la iglesia, dones y el amor."},
    {"id": 47, "name": "2 Corintios", "testament": "NT", "category": "Epístolas Paulinas (Cartas del apóstol Pablo)", "chapters": 13, "description": "Defensa del ministerio apostólico de Pablo y la reconciliación."},
    {"id": 48, "name": "Gálatas", "testament": "NT", "category": "Epístolas Paulinas (Cartas del apóstol Pablo)", "chapters": 6, "description": "Defensa de la libertad en Cristo frente al legalismo."},
    {"id": 49, "name": "Efesios", "testament": "NT", "category": "Epístolas Paulinas (Cartas del apóstol Pablo)", "chapters": 6, "description": "Las bendiciones espirituales y la iglesia como el cuerpo de Cristo."},
    {"id": 50, "name": "Filipenses", "testament": "NT", "category": "Epístolas Paulinas (Cartas del apóstol Pablo)", "chapters": 4, "description": "Carta sobre el gozo y el contentamiento en medio de las pruebas."},
    {"id": 51, "name": "Colosenses", "testament": "NT", "category": "Epístolas Paulinas (Cartas del apóstol Pablo)", "chapters": 4, "description": "La supremacía y suficiencia de Cristo sobre toda filosofía."},
    {"id": 52, "name": "1 Tesalonicenses", "testament": "NT", "category": "Epístolas Paulinas (Cartas del apóstol Pablo)", "chapters": 5, "description": "Consuelo e instrucciones sobre la segunda venida de Cristo."},
    {"id": 53, "name": "2 Tesalonicenses", "testament": "NT", "category": "Epístolas Paulinas (Cartas del apóstol Pablo)", "chapters": 3, "description": "Aclaraciones sobre el día del Señor y la constancia."},
    {"id": 54, "name": "1 Timoteo", "testament": "NT", "category": "Epístolas Paulinas (Cartas del apóstol Pablo)", "chapters": 6, "description": "Consejos prácticos a un joven pastor sobre el liderazgo eclesiástico."},
    {"id": 55, "name": "2 Timoteo", "testament": "NT", "category": "Epístolas Paulinas (Cartas del apóstol Pablo)", "chapters": 4, "description": "Última carta de Pablo, animando a la fidelidad en el ministerio."},
    {"id": 56, "name": "Tito", "testament": "NT", "category": "Epístolas Paulinas (Cartas del apóstol Pablo)", "chapters": 3, "description": "Pautas sobre la sana doctrina y las buenas obras en Creta."},
    {"id": 57, "name": "Filemón", "testament": "NT", "category": "Epístolas Paulinas (Cartas del apóstol Pablo)", "chapters": 1, "description": "Petición de perdón y hermandad para un esclavo fugitivo llamado Onésimo."},

    # Epístolas Generales (De varios autores)
    {"id": 58, "name": "Hebreos", "testament": "NT", "category": "Epístolas Generales (De varios autores)", "chapters": 13, "description": "Demuestra que Cristo es superior a los ángeles, a Moisés y al antiguo pacto."},
    {"id": 59, "name": "Santiago", "testament": "NT", "category": "Epístolas Generales (De varios autores)", "chapters": 5, "description": "La fe práctica demostrada a través de las obras."},
    {"id": 60, "name": "1 Pedro", "testament": "NT", "category": "Epístolas Generales (De varios autores)", "chapters": 5, "description": "Esperanza y fortaleza para los cristianos que sufren persecución."},
    {"id": 61, "name": "2 Pedro", "testament": "NT", "category": "Epístolas Generales (De varios autores)", "chapters": 3, "description": "Advertencia contra los falsos maestros y la promesa del regreso de Cristo."},
    {"id": 62, "name": "1 Juan", "testament": "NT", "category": "Epístolas Generales (De varios autores)", "chapters": 5, "description": "Seguridad de la salvación, el amor fraternal y la comunión con Dios."},
    {"id": 63, "name": "2 Juan", "testament": "NT", "category": "Epístolas Generales (De varios autores)", "chapters": 1, "description": "Advertencia contra los engañadores y un llamado a caminar en la verdad."},
    {"id": 64, "name": "3 Juan", "testament": "NT", "category": "Epístolas Generales (De varios autores)", "chapters": 1, "description": "Elogio a la hospitalidad cristiana y reprensión al orgullo."},
    {"id": 65, "name": "Judas", "testament": "NT", "category": "Epístolas Generales (De varios autores)", "chapters": 1, "description": "Exhortación a contender ardientemente por la fe ante la apostasía."},

    # Profecía
    {"id": 66, "name": "Apocalipsis", "testament": "NT", "category": "Profecía", "chapters": 22, "description": "Revelación de la victoria final de Jesucristo, el juicio y la nueva creación."}
]

# Pasajes muestra en las 3 versiones
MULTI_VERSION_PASSAGES = {
    "19-23": {
        "RVR1960": [
            {"verse": 1, "text": "Jehová es mi pastor; nada me faltará."},
            {"verse": 2, "text": "En lugares de delicados pastos me hará descansar; junto a aguas de reposo me pastoreará."},
            {"verse": 3, "text": "Confortará mi alma; me guiará por sendas de justicia por amor de su nombre."},
            {"verse": 4, "text": "Aunque ande en valle de sombra de muerte, no temeré mal alguno, porque tú estarás conmigo; tu vara y tu cayado me infundirán aliento."},
            {"verse": 5, "text": "Aderezas mesa delante de mí en presencia de mis angustiadores; unges mi cabeza con aceite; mi copa está rebosando."},
            {"verse": 6, "text": "Ciertamente el bien y la misericordia me seguirán todos los días de mi vida, y en la casa de Jehová moraré por largos días."}
        ],
        "NVI": [
            {"verse": 1, "text": "El Señor es mi pastor, nada me falta."},
            {"verse": 2, "text": "En verdes pastos me hace descansar. Junto a tranquilas aguas me conduce;"},
            {"verse": 3, "text": "me infunde nuevas fuerzas. Me guía por sendas de justicia por amor a su nombre."},
            {"verse": 4, "text": "Aun si voy por valles tenebrosos, no temo peligro alguno porque tú estás a mi lado; tu vara de pastor me reconforta."},
            {"verse": 5, "text": "Dispones ante mí un banquete en presencia de mis enemigos. Has ungido con perfume mi cabeza; has llenado mi copa a rebosar."},
            {"verse": 6, "text": "La bondad y el amor me seguirán todos los días de mi vida; y en la casa del Señor habitaré para siempre."}
        ],
        "NTV": [
            {"verse": 1, "text": "El Señor es mi pastor; tengo todo lo que necesito."},
            {"verse": 2, "text": "En verdes praderas me deja descansar; me conduce junto a arroyos tranquilos."},
            {"verse": 3, "text": "Él renueva mis fuerzas. Me guía por sendas correctas, y así da honra a su nombre."},
            {"verse": 4, "text": "Incluso cuando cruce por el oscuro valle de la muerte, no tendré miedo, pues tú estás a mi lado. Tu vara y tu cayado me protegen y me confortan."},
            {"verse": 5, "text": "Me preparas un banquete en presencia de mis enemigos. Me honras ungiendo mi cabeza con aceite; mi copa se desborda de bendiciones."},
            {"verse": 6, "text": "Ciertamente tu bondad y tu amor inagotable me seguirán todos los días de mi vida, y en la casa del Señor viviré por siempre."}
        ]
    },
    "43-3": {
        "RVR1960": [
            {"verse": 16, "text": "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna."},
            {"verse": 17, "text": "Porque no envió Dios a su Hijo al mundo para condenar al mundo, sino para que el mundo sea salvo por él."},
            {"verse": 18, "text": "El que en él cree, no es condenado; pero el que no cree, ya ha sido condenado, porque no ha creído en el nombre del unigénito Hijo de Dios."}
        ],
        "NVI": [
            {"verse": 16, "text": "Porque tanto amó Dios al mundo que dio a su Hijo unigénito, para que todo el que cree en él no se pierda, sino que tenga vida eterna."},
            {"verse": 17, "text": "Dios no envió a su Hijo al mundo para condenar al mundo, sino para salvarlo por medio de él."},
            {"verse": 18, "text": "El que cree en él no es condenado, pero el que no cree ya está condenado por no haber creído en el nombre del Hijo unigénito de Dios."}
        ],
        "NTV": [
            {"verse": 16, "text": "Pues Dios amó tanto al mundo que dio a su único Hijo, para que todo el que crea en él no se pierda, sino que tenga vida eterna."},
            {"verse": 17, "text": "Dios no envió a su Hijo al mundo para condenar al mundo, sino para salvarlo por medio de él."},
            {"verse": 18, "text": "No hay condenación para todo el que cree en él, pero todo el que no cree en él ya ha sido condenado por no haber creído en el único Hijo de Dios."}
        ]
    },
    "50-4": {
        "RVR1960": [
            {"verse": 4, "text": "Regocijaos en el Señor siempre. Otra vez digo: ¡Regocijaos!"},
            {"verse": 6, "text": "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias."},
            {"verse": 7, "text": "Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús."},
            {"verse": 13, "text": "Todo lo puedo en Cristo que me fortalece."}
        ],
        "NVI": [
            {"verse": 4, "text": "Alégrense siempre en el Señor. Insisto: ¡Alégrense!"},
            {"verse": 6, "text": "No se inquieten por nada; más bien, en toda ocasión, con oración y ruego, presenten sus peticiones a Dios y denle gracias."},
            {"verse": 7, "text": "Y la paz de Dios, que sobrepasa todo entendimiento, cuidará sus corazones y sus pensamientos en Cristo Jesús."},
            {"verse": 13, "text": "Cristo me da fuerzas para enfrentarme a toda clase de situaciones."}
        ],
        "NTV": [
            {"verse": 4, "text": "Alégrense siempre en el Señor. Insisto: ¡alégrense!"},
            {"verse": 6, "text": "No se preocupen por nada; en cambio, oren por todo. Díganle a Dios lo que necesitan y denle gracias por todo lo que él ha hecho."},
            {"verse": 7, "text": "Así experimentarán la paz de Dios, que supera todo lo que podemos entender. La paz de Dios cuidará su corazón y su mente mientras vivan en Cristo Jesús."},
            {"verse": 13, "text": "Pues todo lo puedo hacer por medio de Cristo, quien me da las fuerzas."}
        ]
    }
}

@router.get("/versions")
def get_versions():
    """Retorna las 3 versiones principales de la Biblia en el orden solicitado."""
    return BIBLE_VERSIONS

@router.get("/books")
def get_books():
    """Retorna la lista completa de los 66 libros de la Biblia con descripciones y categorías."""
    return BIBLE_BOOKS

@router.get("/chapter/{book_id}/{chapter}")
def get_chapter(book_id: int, chapter: int, version: str = Query("RVR1960")):
    """Retorna los versículos de un capítulo específico en la versión seleccionada (RVR1960, NVI, NTV)."""
    book = next((b for b in BIBLE_BOOKS if b["id"] == book_id), None)
    if not book:
        raise HTTPException(status_code=404, detail="Libro no encontrado.")

    if chapter < 1 or chapter > book["chapters"]:
        raise HTTPException(status_code=400, detail=f"El capítulo debe estar entre 1 y {book['chapters']}.")

    key = f"{book_id}-{chapter}"
    version_key = version.upper()
    if version_key not in ["RVR1960", "NVI", "NTV"]:
        version_key = "RVR1960"

    version_obj = next((v for v in BIBLE_VERSIONS if v["id"] == version_key), BIBLE_VERSIONS[0])

    if key in MULTI_VERSION_PASSAGES and version_key in MULTI_VERSION_PASSAGES[key]:
        verses = MULTI_VERSION_PASSAGES[key][version_key]
    else:
        verses = [
            {
                "verse": v,
                "text": f"Versículo {v} del capítulo {chapter} de {book['name']} [{version_obj['full_name']}]. 'Toda la Escritura es inspirada por Dios y útil para enseñar, redargüir, corregir e instruir en justicia.'"
            }
            for v in range(1, 9)
        ]

    return {
        "book": book["name"],
        "book_id": book_id,
        "chapter": chapter,
        "total_chapters": book["chapters"],
        "version": version_obj["full_name"],
        "version_code": version_key,
        "category": book["category"],
        "description": book["description"],
        "verses": verses
    }

@router.get("/daily")
def get_daily_verse():
    """Retorna el versículo del día."""
    return {
        "reference": "Filipenses 4:13",
        "text": "Todo lo puedo en Cristo que me fortalece.",
        "version": "Reina-Valera 1960 (RVR1960)"
    }

@router.get("/ai-daily")
def get_ai_daily_devotional():
    from datetime import date
    return {
        "id": 1,
        "date": str(date.today()),
        "reference": "Filipenses 4:6-7",
        "text": "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias...",
        "version": "Reina-Valera 1960 (RVR1960)",
        "ai_title": "La Paz que Gobierna en la Tormenta",
        "ai_reflection": "El apóstol Pablo nos enseña que el afán y la ansiedad no se vencen guardando silencio, sino depositando cada preocupación en el altar de Dios. Cuando transformamos nuestras cargas en peticiones de oración acompañadas de gratitud, la paz divina activa un escudo celestial sobre nuestras emociones y pensamientos.",
        "ai_application": "Hoy, identifica el pensamiento que más inquieta tu corazón. Tómate 3 minutos, entrégalo en oración y da gracias a Dios por la respuesta que Él ya está preparando.",
        "ai_prayer": "Señor Dios, deposito en tus manos todas mis ansiedades. Llenas mi mente con tu paz incalculable y guardas mi corazón en Cristo Jesús. Amén."
    }

@router.post("/ai-reflection")
def generate_ai_reflection(body: Dict[str, Any]):
    topic = body.get("topic", "Esperanza y Fe")
    return {
        "topic": topic,
        "reference": "Isaías 40:31 (RVR1960)",
        "verse_text": "Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.",
        "ai_generated_reflection": f"Reflexión inspirada en '{topic}': Cuando colocamos nuestras expectativas en Dios, recibimos un flujo sobrenatural de fortaleza. La esperanza bíblica es una expectativa gozosa fundamentada en las promesas divinas.",
        "ai_guided_prayer": "Señor, renueva mis fuerzas como las águilas y enséñame a esperar pacientemente en tu tiempo perfecto. Amén."
    }

@router.get("/search")
def search_bible(query: str = Query(...)):
    results = []
    q = query.lower()
    for book in BIBLE_BOOKS:
        if q in book["name"].lower() or q in book["description"].lower():
            results.append({
                "book": book["name"],
                "chapter": 1,
                "verse": 1,
                "reference": f"{book['name']} 1:1",
                "text": f"{book['name']}: {book['description']}",
                "version": "RVR1960"
            })
    return results[:20]
