from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.db import SessionLocal
from app.services.risk_service import RiskService

router = APIRouter()
risk_service = RiskService()


class RiskRequest(BaseModel):
    student_id: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/analyze-risk")
async def analyze_risk(request: RiskRequest, db: Session = Depends(get_db)):

    result = risk_service.calculate_risk(request.student_id, db)

    return result
