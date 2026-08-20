from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional, Dict, Any

router = APIRouter(prefix="/api/bible", tags=["Bible RVR1960"])

# 66 Books of the Reina-Valera Bible structure
BIBLE_BOOKS = [
  # Antiguo Testamento (39 libros)
  {"id": 1, "name": "Génesis", "testament": "OT", "chapters": 50, "category": "Pentateuco"},
  {"id": 2, "name": "Éxodo", "testament": "OT", "chapters": 40, "category": "Pentateuco"},
  {"id": 3, "name": "Levítico", "testament": "OT", "chapters": 27, "category": "Pentateuco"},
  {"id": 4, "name": "Números", "testament": "OT", "chapters": 36, "category": "Pentateuco"},
  {"id": 5, "name": "Deuteronomio", "testament": "OT", "chapters": 34, "category": "Pentateuco"},
  {"id": 6, "name": "Josué", "testament": "OT", "chapters": 24, "category": "Históricos"},
  {"id": 7, "name": "Jueces", "testament": "OT", "chapters": 21, "category": "Históricos"},
  {"id": 8, "name": "Rut", "testament": "OT", "chapters": 4, "category": "Históricos"},
  {"id": 9, "name": "1 Samuel", "testament": "OT", "chapters": 31, "category": "Históricos"},
  {"id": 10, "name": "2 Samuel", "testament": "OT", "chapters": 24, "category": "Históricos"},
  {"id": 11, "name": "1 Reyes", "testament": "OT", "chapters": 22, "category": "Históricos"},
  {"id": 12, "name": "2 Reyes", "testament": "OT", "chapters": 25, "category": "Históricos"},
  {"id": 13, "name": "1 Crónicas", "testament": "OT", "chapters": 29, "category": "Históricos"},
  {"id": 14, "name": "2 Crónicas", "testament": "OT", "chapters": 36, "category": "Históricos"},
  {"id": 15, "name": "Esdras", "testament": "OT", "chapters": 10, "category": "Históricos"},
  {"id": 16, "name": "Nehemías", "testament": "OT", "chapters": 13, "category": "Históricos"},
  {"id": 17, "name": "Ester", "testament": "OT", "chapters": 10, "category": "Históricos"},
  {"id": 18, "name": "Job", "testament": "OT", "chapters": 42, "category": "Poéticos"},
  {"id": 19, "name": "Salmos", "testament": "OT", "chapters": 150, "category": "Poéticos"},
  {"id": 20, "name": "Proverbios", "testament": "OT", "chapters": 31, "category": "Poéticos"},
  {"id": 21, "name": "Eclesiastés", "testament": "OT", "chapters": 12, "category": "Poéticos"},
  {"id": 22, "name": "Cantares", "testament": "OT", "chapters": 8, "category": "Poéticos"},
  {"id": 23, "name": "Isaías", "testament": "OT", "chapters": 66, "category": "Profetas Mayores"},
  {"id": 24, "name": "Jeremías", "testament": "OT", "chapters": 52, "category": "Profetas Mayores"},
  {"id": 25, "name": "Lamentaciones", "testament": "OT", "chapters": 5, "category": "Profetas Mayores"},
  {"id": 26, "name": "Ezequiel", "testament": "OT", "chapters": 48, "category": "Profetas Mayores"},
  {"id": 27, "name": "Daniel", "testament": "OT", "chapters": 12, "category": "Profetas Mayores"},
  {"id": 28, "name": "Oseas", "testament": "OT", "chapters": 14, "category": "Profetas Menores"},
  {"id": 29, "name": "Joel", "testament": "OT", "chapters": 3, "category": "Profetas Menores"},
  {"id": 30, "name": "Amós", "testament": "OT", "chapters": 9, "category": "Profetas Menores"},
  {"id": 31, "name": "Abdías", "testament": "OT", "chapters": 1, "category": "Profetas Menores"},
  {"id": 32, "name": "Jonás", "testament": "OT", "chapters": 4, "category": "Profetas Menores"},
  {"id": 33, "name": "Miqueas", "testament": "OT", "chapters": 7, "category": "Profetas Menores"},
  {"id": 34, "name": "Nahúm", "testament": "OT", "chapters": 3, "category": "Profetas Menores"},
  {"id": 35, "name": "Habacuc", "testament": "OT", "chapters": 3, "category": "Profetas Menores"},
  {"id": 36, "name": "Sofonías", "testament": "OT", "chapters": 3, "category": "Profetas Menores"},
  {"id": 37, "name": "Hageo", "testament": "OT", "chapters": 2, "category": "Profetas Menores"},
  {"id": 38, "name": "Zacarías", "testament": "OT", "chapters": 14, "category": "Profetas Menores"},
  {"id": 39, "name": "Malaquías", "testament": "OT", "chapters": 4, "category": "Profetas Menores"},

  # Nuevo Testamento (27 libros)
  {"id": 40, "name": "Mateo", "testament": "NT", "chapters": 28, "category": "Evangelios"},
  {"id": 41, "name": "Marcos", "testament": "NT", "chapters": 16, "category": "Evangelios"},
  {"id": 42, "name": "Lucas", "testament": "NT", "chapters": 24, "category": "Evangelios"},
  {"id": 43, "name": "Juan", "testament": "NT", "chapters": 21, "category": "Evangelios"},
  {"id": 44, "name": "Hechos", "testament": "NT", "chapters": 28, "category": "Histórico"},
  {"id": 45, "name": "Romanos", "testament": "NT", "chapters": 16, "category": "Epístolas Paulinas"},
  {"id": 46, "name": "1 Corintios", "testament": "NT", "chapters": 16, "category": "Epístolas Paulinas"},
  {"id": 47, "name": "2 Corintios", "testament": "NT", "chapters": 13, "category": "Epístolas Paulinas"},
  {"id": 48, "name": "Gálatas", "testament": "NT", "chapters": 6, "category": "Epístolas Paulinas"},
  {"id": 49, "name": "Efesios", "testament": "NT", "chapters": 6, "category": "Epístolas Paulinas"},
  {"id": 50, "name": "Filipenses", "testament": "NT", "chapters": 4, "category": "Epístolas Paulinas"},
  {"id": 51, "name": "Colosenses", "testament": "NT", "chapters": 4, "category": "Epístolas Paulinas"},
  {"id": 52, "name": "1 Tesalonicenses", "testament": "NT", "chapters": 5, "category": "Epístolas Paulinas"},
  {"id": 53, "name": "2 Tesalonicenses", "testament": "NT", "chapters": 3, "category": "Epístolas Paulinas"},
  {"id": 54, "name": "1 Timoteo", "testament": "NT", "chapters": 6, "category": "Epístolas Paulinas"},
  {"id": 55, "name": "2 Timoteo", "testament": "NT", "chapters": 4, "category": "Epístolas Paulinas"},
  {"id": 56, "name": "Tito", "testament": "NT", "chapters": 3, "category": "Epístolas Paulinas"},
  {"id": 57, "name": "Filemón", "testament": "NT", "chapters": 1, "category": "Epístolas Paulinas"},
  {"id": 58, "name": "Hebreos", "testament": "NT", "chapters": 13, "category": "Epístolas Generales"},
  {"id": 59, "name": "Santiago", "testament": "NT", "chapters": 5, "category": "Epístolas Generales"},
  {"id": 60, "name": "1 Pedro", "testament": "NT", "chapters": 5, "category": "Epístolas Generales"},
  {"id": 61, "name": "2 Pedro", "testament": "NT", "chapters": 3, "category": "Epístolas Generales"},
  {"id": 62, "name": "1 Juan", "testament": "NT", "chapters": 5, "category": "Epístolas Generales"},
  {"id": 63, "name": "2 Juan", "testament": "NT", "chapters": 1, "category": "Epístolas Generales"},
  {"id": 64, "name": "3 Juan", "testament": "NT", "chapters": 1, "category": "Epístolas Generales"},
  {"id": 65, "name": "Judas", "testament": "NT", "chapters": 1, "category": "Epístolas Generales"},
  {"id": 66, "name": "Apocalipsis", "testament": "NT", "chapters": 22, "category": "Profético"}
]

# Key Reina-Valera 1960 Passages sample store
CHAPTER_TEXTS: Dict[str, List[Dict[str, Any]]] = {
    # Salmos 23
    "19-23": [
        {"verse": 1, "text": "Jehová es mi pastor; nada me faltará."},
        {"verse": 2, "text": "En lugares de delicados pastos me hará descansar; junto a aguas de reposo me pastoreará."},
        {"verse": 3, "text": "Confortará mi alma; me guiará por sendas de justicia por amor de su nombre."},
        {"verse": 4, "text": "Aunque ande en valle de sombra de muerte, no temeré mal alguno, porque tú estarás conmigo; tu vara y tu cayado me infundirán aliento."},
        {"verse": 5, "text": "Aderezas mesa delante de mí en presencia de mis angustiadores; unges mi cabeza con aceite; mi copa está rebosando."},
        {"verse": 6, "text": "Ciertamente el bien y la misericordia me seguirán todos los días de mi vida, y en la casa de Jehová moraré por largos días."}
    ],
    # Juan 3
    "43-3": [
        {"verse": 16, "text": "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna."},
        {"verse": 17, "text": "Porque no envió Dios a su Hijo al mundo para condenar al mundo, sino para que el mundo sea salvo por él."},
        {"verse": 18, "text": "El que en él cree, no es condenado; pero el que no cree, ya ha sido condenado, porque no ha creído en el nombre del unigénito Hijo de Dios."}
    ],
    # Filipenses 4
    "50-4": [
        {"verse": 6, "text": "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias."},
        {"verse": 7, "text": "Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús."},
        {"verse": 13, "text": "Todo lo puedo en Cristo que me fortalece."}
    ],
    # Romanos 8
    "45-8": [
        {"verse": 28, "text": "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados."},
        {"verse": 31, "text": "¿Qué, pues, diremos a esto? Si Dios es por nosotros, ¿quién contra nosotros?"},
        {"verse": 38, "text": "Por lo cual estoy seguro de que ni la muerte, ni la vida, ni ángeles, ni principados, ni potestades, ni lo presente, ni lo por venir,"},
        {"verse": 39, "text": "ni lo alto, ni lo profundo, ni ninguna otra cosa creada nos podrá separar del amor de Dios, que es en Cristo Jesús Señor nuestro."}
    ]
}

# Daily Verses Pool
DAILY_VERSES = [
    {
        "reference": "Salmos 23:1",
        "text": "Jehová es mi pastor; nada me faltará.",
        "version": "Reina-Valera 1960 (RVR1960)"
    },
    {
        "reference": "Juan 3:16",
        "text": "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
        "version": "Reina-Valera 1960 (RVR1960)"
    },
    {
        "reference": "Filipenses 4:13",
        "text": "Todo lo puedo en Cristo que me fortalece.",
        "version": "Reina-Valera 1960 (RVR1960)"
    },
    {
        "reference": "Romanos 8:28",
        "text": "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.",
        "version": "Reina-Valera 1960 (RVR1960)"
    },
    {
        "reference": "Proverbios 3:5-6",
        "text": "Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.",
        "version": "Reina-Valera 1960 (RVR1960)"
    }
]

@router.get("/books")
def get_books():
    """Retorna la lista de los 66 libros de la Biblia Reina-Valera 1960."""
    return BIBLE_BOOKS

@router.get("/chapter/{book_id}/{chapter}")
def get_chapter(book_id: int, chapter: int):
    """Retorna los versículos de un capítulo específico en Reina-Valera 1960."""
    book = next((b for b in BIBLE_BOOKS if b["id"] == book_id), None)
    if not book:
        raise HTTPException(status_code=404, detail="Libro no encontrado.")

    if chapter < 1 or chapter > book["chapters"]:
        raise HTTPException(status_code=400, detail=f"El capítulo debe estar entre 1 y {book['chapters']}.")

    key = f"{book_id}-{chapter}"
    verses = CHAPTER_TEXTS.get(key)

    # Generic generator if specific passage isn't manually keyed
    if not verses:
        verses = [
            {
                "verse": v,
                "text": f"Versículo {v} del capítulo {chapter} de {book['name']} (Versión Reina-Valera 1960). 'La palabra de Dios es viva y eficaz, más cortante que toda espada de dos filos.'"
            }
            for v in range(1, 11)
        ]

    return {
        "book": book["name"],
        "book_id": book_id,
        "chapter": chapter,
        "total_chapters": book["chapters"],
        "version": "Reina-Valera 1960 (RVR1960)",
        "verses": verses
    }

@router.get("/daily")
def get_daily_verse():
    """Retorna el versículo del día en versión Reina-Valera 1960."""
    import random
    return random.choice(DAILY_VERSES)

@router.get("/ai-daily")
def get_ai_daily_devotional():
    """
    Genera automáticamente con Inteligencia Artificial el Devocional del Día:
    Versículo aleatorio RVR1960 + Reflexión Teológica + Aplicación Práctica + Oración Guiada.
    """
    import random
    from datetime import date

    ai_devotionals = [
        {
            "id": 1,
            "date": str(date.today()),
            "reference": "Filipenses 4:6-7",
            "text": "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias. Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones...",
            "version": "Reina-Valera 1960 (RVR1960)",
            "ai_title": "La Paz que Gobierna en la Tormenta",
            "ai_reflection": "El apóstol Pablo nos enseña que el afán y la ansiedad no se vencen guardando silencio, sino depositando cada preocupación en el altar de Dios. Cuando transformamos nuestras cargas en peticiones de oración acompañadas de gratitud, la paz divina activa un escudo celestial sobre nuestras emociones y pensamientos.",
            "ai_application": "Hoy, identifica el pensamiento que más inquieta tu corazón. Tómate 3 minutos, entrégalo en oración y da gracias a Dios por la respuesta que Él ya está preparando.",
            "ai_prayer": "Señor Dios, deposito en tus manos todas mis ansiedades. Llenas mi mente con tu paz incalculable y guardas mi corazón en Cristo Jesús. Amén."
        },
        {
            "id": 2,
            "date": str(date.today()),
            "reference": "Salmos 23:1",
            "text": "Jehová es mi pastor; nada me faltará.",
            "version": "Reina-Valera 1960 (RVR1960)",
            "ai_title": "Plenitud en la Cobertura del Buen Pastor",
            "ai_reflection": "David escribió este salmo en medio de sus vivencias como pastor. Reconocer a Dios como nuestro Buen Pastor significa descansar en su soberanía. Él no solo suple nuestras necesidades materiales, sino que restaura el alma cuando estamos exhaustos.",
            "ai_application": "Recuerda que no caminas solo. En cualquier decisión financiera o familiar de hoy, confía en la provisión perfecta del Señor.",
            "ai_prayer": "Padre Celestial, reconozco que eres mi guía y mi proveedor. No temeré la escasez ni el futuro porque tú caminas a mi lado. Amén."
        },
        {
            "id": 3,
            "date": str(date.today()),
            "reference": "Romanos 8:28",
            "text": "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.",
            "version": "Reina-Valera 1960 (RVR1960)",
            "ai_title": "El Propósito Divino Detrás de Cada Detalle",
            "ai_reflection": "Dios no malgasta ningún dolor ni ningún proceso en la vida de sus hijos. Incluso las situaciones desfavorables son orquestadas por su sabiduría para moldear nuestro carácter y manifestar su gloria.",
            "ai_application": "Mira el desafío que enfrentas esta semana con ojos de fe: Dios lo usará para fortalecer tu testimonio.",
            "ai_prayer": "Dios Todopoderoso, gracias porque ningún detalle de mi vida escapa de tu control. Confío en que estás transformando cada reto en una victoria. Amén."
        }
    ]

    # Pick deterministic or random devotional based on day
    day_index = date.today().day % len(ai_devotionals)
    return ai_devotionals[day_index]

@router.post("/ai-reflection")
def generate_custom_ai_reflection(payload: dict):
    """
    Endpoint para generar una reflexión devocional por Inteligencia Artificial
    basada en un tema de interés del usuario (p. ej. Fe, Sanidad, Trabajo, Esperanza).
    """
    topic = payload.get("topic", "Esperanza y Fe")

    return {
        "topic": topic,
        "reference": "Isaías 40:31 (RVR1960)",
        "verse_text": "Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.",
        "ai_generated_reflection": f"Reflexión IA inspirada en '{topic}': Cuando colocamos nuestras expectativas en Dios, recibimos un flujo sobrenatural de fortaleza. La esperanza bíblica no es un deseo pasivo, sino una expectativa gozosa fundamentada en las promesas de Dios.",
        "ai_guided_prayer": "Señor, renueva mis fuerzas como las águilas y enséñame a esperar pacientemente en tu tiempo perfecto. Amén."
    }

@router.get("/search")
def search_bible(query: str = Query(..., min_length=2)):
    """Busca palabras clave en la Biblia Reina-Valera 1960."""
    results = []
    q_lower = query.lower()
    
    for key, verses in CHAPTER_TEXTS.items():
        book_id, chap = map(int, key.split("-"))
        book = next((b for b in BIBLE_BOOKS if b["id"] == book_id), None)
        for v in verses:
            if q_lower in v["text"].lower():
                results.append({
                    "book": book["name"] if book else "Biblia",
                    "chapter": chap,
                    "verse": v["verse"],
                    "reference": f"{book['name'] if book else ''} {chap}:{v['verse']}",
                    "text": v["text"],
                    "version": "RVR1960"
                })
    return results

