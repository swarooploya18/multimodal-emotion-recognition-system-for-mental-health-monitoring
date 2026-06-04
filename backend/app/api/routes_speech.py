from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.database.models import EmotionRecord
from app.services.speech_service import SpeechEmotionService
from loguru import logger
import random   # ✅ NEW

router = APIRouter()
speech_service = SpeechEmotionService()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------------
# 🔥 SMART SUPPORT GENERATOR
# -----------------------------
last_response = {}

def generate_support(emotion: str):
    emotion = emotion.lower()

    support_data = {

        "anger": [
            [
                "It sounds like there might be some frustration in your tone right now.",
                "Try taking a deep breath and give yourself a short pause before reacting.",
                "Staying calm will help you handle the situation more effectively."
            ],
            [
                "Your speech suggests some tension or irritation.",
                "Take a moment to relax, maybe step away or slow down your pace.",
                "You can manage this better by staying composed."
            ],
            [
                "It’s okay to feel upset sometimes.",
                "Try to calm your thoughts and not react immediately.",
                "Handling it patiently will give you better control."
            ]
        ],

        "sadness": [
            [
                "Your voice seems a bit low, which might mean you're feeling down.",
                "Take some time to rest or talk to someone you trust.",
                "This feeling won’t last forever, things will get better."
            ],
            [
                "It sounds like you might be feeling a bit heavy emotionally.",
                "Try doing something small that comforts you.",
                "You’ve been through tough times before and you’ll get through this too."
            ],
            [
                "There’s a sense of sadness in your tone.",
                "Give yourself a break and don’t push too hard right now.",
                "You are stronger than this moment."
            ]
        ],

        "fear": [
            [
                "Your speech suggests some anxiety or nervousness.",
                "Try to slow down and focus on your breathing.",
                "You don’t have to deal with everything at once — take it step by step."
            ],
            [
                "It sounds like you might be feeling worried.",
                "Break things into smaller parts and handle them one by one.",
                "You’ve handled challenges before, and you can do it again."
            ],
            [
                "There’s a hint of uncertainty in your voice.",
                "Focus only on what you can control right now.",
                "You are capable of getting through this."
            ]
        ],

        "happy": [
            [
                "Your voice sounds positive and energetic.",
                "Enjoy this moment and keep doing what makes you feel this way.",
                "You truly deserve this happiness."
            ],
            [
                "There’s a cheerful tone in your speech.",
                "Share this positive energy with others around you.",
                "Staying like this will help you grow further."
            ],
            [
                "You sound happy and relaxed.",
                "Take a moment to appreciate what’s going well.",
                "Keep nurturing this positivity."
            ]
        ],

        "neutral": [
            [
                "Your tone sounds calm and steady.",
                "This is a good time to stay focused on your tasks.",
                "Consistency will help you move forward."
            ],
            [
                "You seem to be in a balanced state right now.",
                "Try to use this time productively.",
                "Small steps will lead to progress."
            ],
            [
                "Your speech sounds stable and composed.",
                "Keep moving forward at your own pace.",
                "Steady progress is still progress."
            ]
        ],

        "surprise": [
            [
                "Your tone suggests something unexpected.",
                "Take a moment to process what just happened.",
                "Staying calm will help you respond better."
            ],
            [
                "There’s a sense of surprise in your voice.",
                "Pause and think before reacting.",
                "You can adapt to this situation."
            ],
            [
                "It sounds like something caught you off guard.",
                "Give yourself a moment to understand it.",
                "You’ll be able to handle it calmly."
            ]
        ],

        "disgust": [
            [
                "Your tone suggests discomfort or uneasiness.",
                "Try to step away from what’s causing it.",
                "You can regain your calm quickly."
            ],
            [
                "It sounds like something is bothering you.",
                "Take a short break and reset your mind.",
                "You are in control of your reactions."
            ],
            [
                "There’s a sense of discomfort in your voice.",
                "Shift your focus to something better.",
                "You’ll feel better once you move past it."
            ]
        ]
    }

    if emotion not in support_data:
        emotion = "neutral"

    options = support_data[emotion]
    prev = last_response.get(emotion)

    choice = random.choice(options)

    # 🔥 avoid repeat
    while choice == prev and len(options) > 1:
        choice = random.choice(options)

    last_response[emotion] = choice

    return " ".join(choice)


# -----------------------------
# Endpoint
# -----------------------------
@router.post("/analyze-speech")
async def analyze_speech(
    student_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        audio_bytes = await file.read()

        result = speech_service.analyze(audio_bytes)

        # ✅ FAST SUPPORT (NO ASYNC MODEL)
        support = generate_support(result["dominant_emotion"])

        record = EmotionRecord(
            student_id=student_id,
            modality="speech",
            dominant_emotion=result["dominant_emotion"],
            score=result["confidence"]
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        return {
            "student_id": student_id,
            "analysis": result,
            "support": support,
            "record_id": record.id
        }

    except Exception as e:
        logger.error(f"Speech analysis failed: {str(e)}")
        return {"error": str(e)}