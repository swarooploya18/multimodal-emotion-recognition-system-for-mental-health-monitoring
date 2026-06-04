from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.database.db import Base

class EmotionRecord(Base):
    __tablename__ = "emotion_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, index=True)
    modality = Column(String)  # text, face, voice
    dominant_emotion = Column(String)
    score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
