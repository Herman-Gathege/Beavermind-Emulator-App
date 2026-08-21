from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Optional, List
from database import get_db
from sql_models import Coach
from schemas import Coach as CoachSchema

router = APIRouter(prefix="/coaches", tags=["coaches"])

@router.get("", response_model=List[CoachSchema])
def list_coaches(search: Optional[str] = Query(None), db: Session = Depends(get_db)):
    stmt = select(Coach)
    if search:
        stmt = stmt.where(Coach.name.ilike(f"%{search}%"))
    return db.execute(stmt).scalars().all()

@router.get("/{coach_id}", response_model=CoachSchema)
def get_coach(coach_id: str, db: Session = Depends(get_db)):
    coach = db.get(Coach, coach_id)
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")
    return coach
