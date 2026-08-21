from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from database import get_db
from sql_models import Call, Evaluation, Coach
from schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    total_calls = db.execute(select(func.count()).select_from(Call)).scalar_one()
    evaluated = db.execute(select(func.count()).select_from(Call).where(Call.status == "evaluated")).scalar_one()
    pending = total_calls - evaluated
    avg_score = db.execute(select(func.avg(Evaluation.overall_score))).scalar_one()
    total_coaches = db.execute(select(func.count()).select_from(Coach)).scalar_one()
    return DashboardStats(total_calls=total_calls, evaluated=evaluated, pending=pending, avg_score=float(avg_score) if avg_score else None, total_coaches=total_coaches)
