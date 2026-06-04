from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import random   # ✅ NEW

from app.database.db import SessionLocal
from app.database.models import EmotionRecord
from app.services.text_service import TextEmotionService

router = APIRouter()
service = TextEmotionService()


# -----------------------------
# Request schema
# -----------------------------
class TextRequest(BaseModel):
    student_id: str
    text: str


# -----------------------------
# DB Dependency
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

def generate_support(emotion: str, context: str):
    emotion = emotion.lower()
    context = context.lower()

    support_data = {

        "anger": [
            [
                "It looks like you're feeling frustrated right now, and that’s completely understandable.",
                "Try taking a deep breath and give yourself a short pause before reacting.",
                "Handling this calmly will help you stay in control and avoid making things worse."
            ],
            [
                "Feeling angry can happen when things don’t go your way.",
                "Take a small break, maybe step away or drink some water to reset your thoughts.",
                "You have control over your reactions, and staying calm will always help."
            ],
            [
                "It’s okay to feel anger, but reacting instantly may not help.",
                "Try writing down what’s bothering you or slowing down your thoughts.",
                "You can handle this situation in a better and more controlled way."
            ]
        ],

        "sadness": [
            [
                "It seems like you're feeling low right now, and that’s something many people go through.",
                "Try talking to someone you trust or doing something small that comforts you.",
                "This feeling is temporary, and things will gradually improve."
            ],
            [
                "Feeling sad can make everything feel heavier than usual.",
                "Give yourself some rest and don’t push yourself too hard today.",
                "You’ve handled tough moments before, and you will get through this too."
            ],
            [
                "It’s okay to not feel okay sometimes.",
                "Maybe listen to music, take a break, or just relax for a bit.",
                "You are stronger than this moment, even if it doesn’t feel like it."
            ]
        ],

        "fear": [
            [
                "It seems like you're feeling anxious or worried about something.",
                "Try to focus on your breathing and stay present instead of overthinking.",
                "You don’t need to solve everything at once — take it step by step."
            ],
            [
                "Fear can make situations feel more difficult than they actually are.",
                "Break your problem into smaller parts and handle them one by one.",
                "You’ve managed challenges before, and you can do it again."
            ],
            [
                "It’s natural to feel uncertain sometimes.",
                "Write down what you can control and focus only on that.",
                "You are capable of getting through this."
            ]
        ],

        "happy": [
            [
                "It’s great to see you feeling happy and positive.",
                "Enjoy this moment fully and maybe share it with someone close to you.",
                "You truly deserve this happiness."
            ],
            [
                "You seem to be in a really good state of mind right now.",
                "Keep doing what’s making you feel this way.",
                "Staying positive like this will help you grow even more."
            ],
            [
                "Feeling happy is something to appreciate.",
                "Take a moment to reflect on what made you feel this way.",
                "Keep nurturing this positivity in your life."
            ]
        ],

        "neutral": [
            [
                "You seem to be in a calm and stable state right now.",
                "This is a good time to focus on your tasks and stay consistent.",
                "Small steady efforts will lead to meaningful progress."
            ],
            [
                "Things seem balanced for you at the moment.",
                "Try to use this time productively and plan your next steps.",
                "Consistency will help you move forward."
            ],
            [
                "You’re maintaining a steady mindset, which is good.",
                "Keep moving forward at your own pace.",
                "Progress doesn’t have to be fast — just consistent."
            ]
        ],

        "surprise": [
            [
                "It seems like something unexpected just happened.",
                "Take a moment to understand the situation before reacting.",
                "Staying calm will help you respond better."
            ],
            [
                "Unexpected situations can feel confusing at first.",
                "Pause for a second and think things through clearly.",
                "You can adapt to this situation."
            ],
            [
                "Surprises can sometimes catch us off guard.",
                "Give yourself a moment to process what happened.",
                "You’ll be able to handle this calmly."
            ]
        ],

        "disgust": [
            [
                "It looks like something is making you uncomfortable.",
                "Try to shift your focus or step away from the situation.",
                "You can regain your calm by focusing on something better."
            ],
            [
                "That feeling can be unpleasant, and that’s okay.",
                "Take a short break and allow yourself to reset.",
                "You’re in control of how you respond."
            ],
            [
                "It’s okay to feel this way sometimes.",
                "Try to distance yourself from what’s causing it.",
                "Refocusing your mind will help you feel better."
            ]
        ]
    }

    # 🔥 SIMPLE CONTEXT BOOST
    if "exam" in context or "stress" in context:
        support_data["fear"].append([
            "It sounds like you're feeling pressure, possibly related to studies or responsibilities.",
            "Try to break your work into smaller tasks and avoid overloading yourself.",
            "You can handle this step by step, so don’t be too hard on yourself."
        ])

    if emotion not in support_data:
        emotion = "neutral"

    options = support_data[emotion]
    prev = last_response.get(emotion)

    choice = random.choice(options)

    # avoid repeat
    while choice == prev and len(options) > 1:
        choice = random.choice(options)

    last_response[emotion] = choice

    return " ".join(choice)


# -----------------------------
# Endpoint
# -----------------------------
@router.post("/analyze-text")
def analyze_text(request: TextRequest, db: Session = Depends(get_db)):

    result = service.analyze(request.text)

    # ✅ FAST SUPPORT (NO ASYNC)
    support = generate_support(
        result["dominant_emotion"],
        request.text
    )

    record = EmotionRecord(
        student_id=request.student_id,
        modality="text",
        dominant_emotion=result["dominant_emotion"],
        score=result["confidence"]
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "student_id": request.student_id,
        "analysis": result,
        "support": support,
        "record_id": record.id
    }