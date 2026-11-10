import json
import random
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/emotions", tags=["Emotions"])

DATA_FILE = Path(__file__).parent.parent.parent / "data" / "emotions.json"

def load_emotions_data():
    if not DATA_FILE.exists():
        return {"header": {}, "emotions": []}
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("")
def get_all_emotions():
    data = load_emotions_data()
    # Return emotions list with summary metadata
    emotions_summary = []
    for em in data.get("emotions", []):
        emotions_summary.append({
            "id": em["id"],
            "name": em["name"],
            "color": em["color"],
            "bgColor": em.get("bgColor"),
            "borderColor": em.get("borderColor"),
            "textColor": em.get("textColor"),
            "accentColor": em.get("accentColor"),
            "description": em.get("description"),
            "prayer": em.get("prayer"),
            "verses_count": len(em.get("verses", []))
        })
    return {
        "header": data.get("header", {}),
        "emotions": emotions_summary
    }

@router.get("/all")
def get_all_emotions_with_verses():
    return load_emotions_data()

@router.get("/random")
def get_random_verse_from_any():
    data = load_emotions_data()
    emotions = data.get("emotions", [])
    if not emotions:
        raise HTTPException(status_code=404, detail="No hay emociones registradas")
    chosen_emotion = random.choice(emotions)
    verses = chosen_emotion.get("verses", [])
    if not verses:
        raise HTTPException(status_code=404, detail="No hay versículos disponibles")
    verse = random.choice(verses)
    return {
        **verse,
        "emotionId": chosen_emotion["id"],
        "emotionName": chosen_emotion["name"],
        "color": chosen_emotion["color"],
        "bgColor": chosen_emotion.get("bgColor"),
        "borderColor": chosen_emotion.get("borderColor"),
        "textColor": chosen_emotion.get("textColor"),
        "prayer": chosen_emotion.get("prayer")
    }

@router.get("/{emotion_id}")
def get_emotion_by_id(emotion_id: str):
    data = load_emotions_data()
    for em in data.get("emotions", []):
        if em["id"].lower() == emotion_id.lower():
            return em
    raise HTTPException(status_code=404, detail=f"Emoción '{emotion_id}' no encontrada")

@router.get("/{emotion_id}/random")
def get_random_verse_by_emotion(emotion_id: str):
    data = load_emotions_data()
    for em in data.get("emotions", []):
        if em["id"].lower() == emotion_id.lower():
            verses = em.get("verses", [])
            if not verses:
                raise HTTPException(status_code=404, detail="No hay versículos para esta emoción")
            verse = random.choice(verses)
            return {
                **verse,
                "emotionId": em["id"],
                "emotionName": em["name"],
                "color": em["color"],
                "bgColor": em.get("bgColor"),
                "borderColor": em.get("borderColor"),
                "textColor": em.get("textColor"),
                "prayer": em.get("prayer")
            }
    raise HTTPException(status_code=404, detail=f"Emoción '{emotion_id}' no encontrada")
