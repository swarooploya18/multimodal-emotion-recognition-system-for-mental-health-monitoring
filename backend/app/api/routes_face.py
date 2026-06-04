from fastapi import APIRouter, UploadFile, File, Depends, Form
from sqlalchemy.orm import Session
from loguru import logger
import random

from app.database.db import SessionLocal
from app.database.models import EmotionRecord
from app.services.face_service import FaceEmotionService

router = APIRouter()
face_service = FaceEmotionService()


# -----------------------------
# Database Dependency
# -----------------------------
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
                "It looks like you're feeling frustrated right now, and that’s completely understandable.",
                "Try taking a slow deep breath and step away from the situation for a few minutes.",
                "You don’t have to react immediately — staying calm will help you handle this better."
            ],
            [
                "Feeling angry can be overwhelming when things don’t go as expected.",
                "Give yourself a short break, maybe walk around or drink some water.",
                "You are in control of your reactions, and calmness will always work in your favor."
            ],
            [
                "It’s okay to feel anger, but what matters is how you deal with it.",
                "Pause for a moment or write down what’s bothering you.",
                "Handling this with patience will make you feel more in control."
            ]
        ],

        "sadness": [
            [
                "It seems like you're feeling low, and that’s something everyone experiences sometimes.",
                "Try talking to someone you trust or doing something small that comforts you.",
                "This feeling is temporary, and things will slowly get better."
            ],
            [
                "Feeling sad can make everything feel heavier than usual.",
                "Give yourself permission to rest and take things slowly.",
                "You’ve come through difficult moments before, and you will again."
            ],
            [
                "It’s okay to not feel okay sometimes.",
                "Maybe listen to music or just take a quiet break.",
                "You are stronger than this moment, even if it doesn’t feel like it."
            ]
        ],

        "fear": [
            [
                "It seems like you're feeling anxious or worried about something.",
                "Try to focus on your breathing and stay present.",
                "You don’t have to solve everything at once — take it step by step."
            ],
            [
                "Fear can make situations feel bigger than they actually are.",
                "Break things into smaller steps and focus on what you can control.",
                "You’ve handled tough situations before, and you can handle this too."
            ],
            [
                "It’s natural to feel uncertain sometimes.",
                "Write down what’s worrying you and address it one piece at a time.",
                "You are capable of getting through this."
            ]
        ],

        "happy": [
            [
                "It’s great to see you feeling happy and positive.",
                "Enjoy this moment fully and maybe share it with someone close.",
                "You truly deserve this happiness."
            ],
            [
                "You seem to be in a really good state of mind.",
                "Keep doing what makes you feel this way.",
                "Staying positive like this helps you grow."
            ],
            [
                "Feeling happy is something to appreciate.",
                "Take a moment to reflect on what brought this feeling.",
                "Keep nurturing this positivity."
            ]
        ],

        "neutral": [
            [
                "You seem to be in a calm and balanced state right now.",
                "This is a good time to focus on your tasks and stay consistent.",
                "Small steady efforts will lead to progress."
            ],
            [
                "Things seem stable for you at the moment.",
                "Use this time to plan your next steps clearly.",
                "Consistency will take you forward."
            ],
            [
                "You’re maintaining a steady mindset, which is great.",
                "Keep moving forward at your own pace.",
                "Progress doesn’t have to be fast, just consistent."
            ]
        ],

        "surprise": [
            [
                "It seems like something unexpected just happened.",
                "Take a moment to understand the situation.",
                "Staying calm will help you respond better."
            ],
            [
                "Unexpected situations can feel confusing at first.",
                "Pause and think things through clearly.",
                "You’re capable of adapting to this."
            ],
            [
                "Surprises can catch us off guard.",
                "Give yourself a moment to process it.",
                "You’ll handle this with a clear mind."
            ]
        ],

        "disgust": [
            [
                "It looks like something made you uncomfortable.",
                "Try to shift your focus or step away from it.",
                "You can regain your calm quickly."
            ],
            [
                "That feeling can be unpleasant, and that’s okay.",
                "Take a short break and reset your mind.",
                "You are in control of how you respond."
            ],
            [
                "It’s okay to react this way sometimes.",
                "Distance yourself from what caused it.",
                "Refocusing will help you feel better."
            ]
        ]
    }

    if emotion not in support_data:
        emotion = "neutral"

    options = support_data[emotion]
    prev = last_response.get(emotion)

    choice = random.choice(options)

    # 🔥 Avoid repeating same response
    while choice == prev and len(options) > 1:
        choice = random.choice(options)

    last_response[emotion] = choice

    return " ".join(choice)


# -----------------------------
# Face Emotion Endpoint
# -----------------------------
@router.post("/analyze-face")
async def analyze_face(
    student_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        image_bytes = await file.read()

        result = face_service.analyze(image_bytes)

        # ✅ FAST + SMART SUPPORT
        support = generate_support(result["dominant_emotion"])

        record = EmotionRecord(
            student_id=student_id,
            modality="face",
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
        logger.error(f"Face analysis failed: {str(e)}")
        return {
            "error": "Face emotion analysis failed",
            "details": str(e)
        }