from sqlalchemy.orm import Session
from app.database.models import EmotionRecord


class RiskService:

    EMOTION_WEIGHTS = {
        "sadness": 0.8,
        "fear": 0.7,
        "anger": 0.6,
        "surprise": 0.3,
        "neutral": 0.1,
        "joy": 0.0,
        "disgust": 0.6
    }

    def calculate_risk(self, student_id: str, db: Session):

        records = (
            db.query(EmotionRecord)
            .filter(EmotionRecord.student_id == student_id)
            .order_by(EmotionRecord.created_at.desc())
            .limit(7)
            .all()
        )

        if not records:
            return {
                "score": 0,
                "risk_level": "LOW",
                "dominant_emotion": None,
                "recommendation": "No emotional records found.",
                "interpretation": "System requires emotion data to calculate risk."
            }

        total_weight = 0
        dominant_emotion = records[0].dominant_emotion

        for record in records:
            weight = self.EMOTION_WEIGHTS.get(record.dominant_emotion, 0.2)
            total_weight += weight * record.score

        risk_score = total_weight / len(records)

        if risk_score > 0.6:
            level = "HIGH"
            recommendation = "Immediate attention recommended."
            interpretation = "Consistent negative emotional signals detected."
        elif risk_score > 0.3:
            level = "MEDIUM"
            recommendation = "Monitor emotional patterns."
            interpretation = "Moderate emotional fluctuation observed."
        else:
            level = "LOW"
            recommendation = "Stable emotional state."
            interpretation = "Emotional metrics within healthy range."

        return {
            "score": round(risk_score, 3),
            "risk_level": level,
            "dominant_emotion": dominant_emotion,
            "recommendation": recommendation,
            "interpretation": interpretation
        }
